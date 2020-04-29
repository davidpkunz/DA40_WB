function getWeather(){
    /**Called when submit button is clicked
     * tries to retieve AWS METAR for the provided Station ID
     * Uses PHP backend to get the XML weather and return it as JSON format**/
    var stationID = document.getElementById("weatherID").value;
    if (stationID===""){
        return;
    }
    /*Section retrieves weather from aviationweather.gov using simple PHP backend.
    * Won't work if no PHP server setup*/
    if (window.XMLHttpRequest){
        var request = new XMLHttpRequest();
    }
    else{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.onreadystatechange=function(){
        if (this.readyState===4 && this.status===200){
            var weatherData = JSON.parse(this.responseText);
            setWeather(weatherData);
            sessionStorage.setItem("weatherData", JSON.stringify(weatherData));
            runwayChange(document.getElementById("runwayHdg").value);
        }
    }
    request.open("GET", "server.php?q="+stationID,true);
    request.send();
}

function loadStoredWeather(){
    /**If previously stored weather is available, retrieve it.**/
    if (sessionStorage.getItem("weatherData") !== null){
        return JSON.parse(sessionStorage.getItem("weatherData"));
    }
}

function setWeather(weatherData) {
    /**Fills the weather table with retrieved weather data**/
    document.getElementById("weatherData").style.display = "block";
    document.getElementById("wRaw").innerHTML = weatherData.raw_text;
    var obsTime = new Date(weatherData.observation_time);
    document.getElementById("wTime").innerHTML = obsTime.getHours() + ":" + obsTime.getMinutes()
        + " (UTC " + -(obsTime.getTimezoneOffset()/60) + ")";
    var windDir = "";
    if ((weatherData.wind_dir_degrees === "0") && (weatherData.wind_speed_kt === "0")){
        windDir = "Calm";
        document.getElementById("wWind").innerHTML = windDir;
    }
    else{
        if (weatherData.wind_dir_degrees === "0"){
            windDir = "Variable";
        }
        else{
            windDir = parseFloat(weatherData.wind_dir_degrees);
            if (windDir < 100){
                windDir = "0" + windDir.toFixed(0).toString() + "&deg";
            }
            else{
                windDir = windDir.toFixed(0).toString() + "&deg";
            }
        }
        if ("wind_gust_kt" in weatherData){
            document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt
                + " kts G " + weatherData.wind_gust_kt + " kts";
        }
        else {
            document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt + " kts";
        }
    }
    document.getElementById("wVisibility").innerHTML = parseFloat(weatherData.visibility_statute_mi) + " sm";
    var rawCeilings = weatherData.sky_condition;
    var ceilingString = "";
    if (Array.isArray(rawCeilings)){
        for (var i = 0; i < rawCeilings.length; i++){
            var ceilingAttribute = rawCeilings[i]["@attributes"];
            ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
        }
    }
    else{
        ceilingAttribute = rawCeilings["@attributes"];
        if (ceilingAttribute["sky_cover"] === "CLR"){
            ceilingString = "Clear";
        }
        else{
            ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ "
                + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
        }
    }

    document.getElementById("wCeilings").innerHTML = ceilingString;
    var temp = parseFloat(weatherData.temp_c);
    var dewpoint = parseFloat(weatherData.dewpoint_c);
    document.getElementById("wTemp").innerHTML = temp + " &degC";
    document.getElementById("wDewpoint").innerHTML = dewpoint + " &degC";
    document.getElementById("wAltimeter").innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
    var fldAlt = parseFloat(weatherData.elevation_m)*3.281;
    var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg))*1000);
    var altimeterHg = parseFloat(weatherData.altim_in_hg);
    /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
    var stationPressure = ((altimeterHg**0.1903)-(.00001313*fldAlt))**5.255;
    var tempRankine = ((9/5)*(temp+273.15));
    var densityAlt = (145442.16*(1-((17.326*stationPressure)/(tempRankine))**0.235));
    document.getElementById("wPressureAlt").innerHTML = pressureAlt.toFixed(0) + " ft";
    document.getElementById("wDensityAlt").innerHTML = densityAlt.toFixed(0) + " ft";
}

function runwayChange(str){
    /**Called when the runway heading input changes,
     * it then calls the compute functions to recalculate distances**/
    if (str === ""){
        return;
    }
    heading = parseFloat(str);
    if ((heading > 360) || (heading < 1)){
        document.getElementById("xWind").innerHTML = "";
        document.getElementById("headWind").innerHTML = "";
        heading = "";
        return;
    }
    var weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
    winds = windComponents(heading, weatherData["wind_dir_degrees"], weatherData["wind_speed_kt"]);
    document.getElementById("headWind").innerHTML = winds.hWind.toFixed(0);
    if (winds.xWind < 0){
        document.getElementById("xWind").innerHTML = -winds.xWind.toFixed(0) + " (Right)";
    }
    else if (winds.xWind === 0){
        document.getElementById("xWind").innerHTML = winds.xWind.toFixed(0);
    }
    else{
        document.getElementById("xWind").innerHTML = winds.xWind.toFixed(0) + " (Left)";
    }
    performanceCompute(winds, heading);
}

function windComponents(heading, windDir, windSpeed){
    /**Takes the runway heading, wind direction, and wind speed in kts
     * Returns the cross wind and head wind components for the given runway **/
    var diffAngle = heading - parseFloat(windDir);
    var radAngle = diffAngle*Math.PI/180;
    var xWindSpd = Math.sin(radAngle)*parseFloat(windSpeed);
    var hWindSpd = Math.cos(radAngle)*parseFloat(windSpeed);
    return {xWind : xWindSpd, hWind : hWindSpd};
}

function performanceCompute(winds, heading){
    /**Takes wind data, then imports weight data, weather data, aircraft data from local storage
     * Uses stored data to compute takeoff/landing/climb performance values depending on aircraft model**/
    if (localStorage.getItem("userInput") == null){
        return;
    }
    else if (localStorage.getItem("computedData") == null){
        return;
    }
    else if (sessionStorage.getItem("weatherData") == null){
        return;
    }
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var weatherData = JSON.parse(sessionStorage.getItem("weatherData"));

    var aircraftObj = aircraft.find(x => x.tail === userData.tail);
    var takeoffWeight = computedData.takeOffWeight;
    var landingWeight = computedData.landingWeight;
    var temp = parseFloat(weatherData.temp_c);
    var fldAlt = parseFloat(weatherData.elevation_m)*3.281;
    var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg))*1000);

    var takeoffDistance = getPerformanceNumbers(aircraftObj.model, "takeoff", pressureAlt,
        temp, takeoffWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("TODistance").innerHTML = "Ground Roll: "
        + (takeoffDistance/10).toFixed(0)*10 + " ft";
    var takeoff50Distance = getPerformanceNumbers(aircraftObj.model, "takeoff50", pressureAlt,
        temp, takeoffWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("TO50Distance").innerHTML = "Over 50': "
        + (takeoff50Distance/10).toFixed(0)*10 + " ft";
    var landingDistance = getPerformanceNumbers(aircraftObj.model, "landing", pressureAlt,
        temp, landingWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("LDGDistance").innerHTML = "Ground Roll: "
        + (landingDistance/10).toFixed(0)*10 + " ft";
    var landing50Distance = getPerformanceNumbers(aircraftObj.model, "landing50", pressureAlt,
        temp, landingWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("LDG50Distance").innerHTML = "Over 50': "
        + (landing50Distance/10).toFixed(0)*10 + " ft";
    var climbPerf = getPerformanceNumbers(aircraftObj.model, "climb", pressureAlt, temp,
        takeoffWeight, winds.hWind, aircraftObj.maxWeight);
    document.getElementById("climbFPM").innerHTML = (climbPerf/10).toFixed(0)*10 + " FPM";
    if (aircraftObj.model !== "DA42"){
        document.getElementById("climbNM").innerHTML = ((climbPerf/1.1)/10).toFixed(0)*10 + " FT/NM";
    }
    else {
        document.getElementById("climbNM").innerHTML = ((climbPerf/1.1)/10).toFixed(0)*10 + " FT/NM";
    }
    document.getElementById("tgDistance").innerHTML = ((takeoffDistance + landingDistance)/10).toFixed(0)*10 + " ft";
    const performanceData = {
        "takeoffDistance" : takeoffDistance,
        "takeoff50Distance" : takeoff50Distance,
        "landingDistance" : landingDistance,
        "landing50Distance" : landing50Distance,
        "climbPerf" : climbPerf,
        "pressureAlt" : pressureAlt,
        "headWind" : winds.hWind,
        "crossWind" : winds.xWind,
        "runwayHdg" : heading
    }
    document.getElementById("perfTable").style.display = "block";
    sessionStorage.setItem("performanceData", JSON.stringify(performanceData));
}

function getPerformanceNumbers(modelString, typeString, pressureAlt, temp, weight, hWind, maxWeight){
    /**
     * Takes data from perfdata.js. The function name is the type of aircraft.
     * The first value passed is one of:
     * "takeoff","takeoff50","landing","landing50"
     * The second value passed is one of:
     * "DA" -> this is for the first portion of the chart that computes the density altitude
     * "weight" -> the weight portion of the chart
     * "hwind"/"twind" -> the wind portion of the chart
     *
     * **/
    if (modelString === "DA40F"){
        var last_result;
        if (typeString === "climb"){
            DA_Result = densityAltitudeChart(DA40FP(typeString, "DA"), pressureAlt, temp);
            last_result = weightChart(DA40FP(typeString, "weight"), DA_Result, weight, maxWeight);
        }
        else {
            var DA_Result = densityAltitudeChart(DA40FP(typeString, "DA"),pressureAlt, temp);
            var weight_Result = weightChart(DA40FP(typeString, "weight"), DA_Result, weight, maxWeight);

            if (hWind > 0){
                last_result = windChart(DA40FP(typeString, "hwind"), weight_Result, hWind);
            }
            else if (hWind < 0){
                last_result = windChart(DA40FP(typeString, "twind"), weight_Result, Math.abs(hWind));
            }
            else if (hWind === 0){
                last_result = weight_Result;
            }
        }
        var scale = DA40FP(typeString, "scale");
        return last_result*(parseFloat(scale.max) - parseFloat(scale.min))/100 + parseFloat(scale.min);
    }
    else if ((modelString === "DA40CS") || (modelString === "DA40XL")){

    }
    else if (modelString === "DA42"){

    }
}

function  densityAltitudeChart(PA_lines, pressureAlt, temp){
    /**Takes pressure Altitude and OAT and outputs first part of landing chart**/
    const PA_Values = Object.keys(PA_lines);
    for (i = 0; i < PA_Values.length; i++) {
        bottomPA = parseFloat(PA_Values[i]);
        var useExp = false;
        if ("e" in PA_lines[bottomPA]){
            useExp = true;
        }
        if (i + 1 >= PA_Values.length) {
            /*We have reached the end of lines but haven't found our value, so just use top line*/
            if (useExp){
                return parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
            }
            else{
                return parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
            }
        }
        else {
            topPA = parseFloat(PA_Values[i + 1]);
            if (pressureAlt < bottomPA) {
                /*if less than 0 PA just use 0 PA*/
                if (useExp){
                    return parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
                }
                else {
                    return parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
                }

            } else if ((pressureAlt >= bottomPA) && (pressureAlt < topPA)) {
                /*Between two lines (usually we use this) */
                skew = (pressureAlt - bottomPA) / (topPA - bottomPA);
                if ("e" in PA_lines[topPA]){
                    topValue = parseFloat(PA_lines[topPA].b) * Math.E ** (parseFloat(PA_lines[topPA].e) * temp);
                    bottomValue = parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
                }
                else{
                    topValue = parseFloat(PA_lines[topPA].m) * temp + parseFloat(PA_lines[topPA].b);
                    bottomValue = parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
                }
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}

function weightChart(lines, DA_Result, weight, maxWeight){
    /**Takes the result from the first portion of the chart(DA_Result) and landing weight to find the next section**/

    for (i=0; i < lines.length; i++){
        var useExp = false;
        var useLog = false;
        if ("e" in lines[i]){
            useExp = true;
            bottomIntercept = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * maxWeight);
        }
        else if ("c" in lines[i]){
            useLog = true;
            bottomIntercept = parseFloat(lines[i].c) * Math.log(maxWeight) + parseFloat(lines[i].b);
        }
        else {
            bottomIntercept = parseFloat(lines[i].m) * maxWeight + parseFloat(lines[i].b);
        }
        if (i+1 >= lines.length) {
            /*We have reached the end of lines but haven't found our value, so use top line and add a skew*/
            if (useExp) {
                return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight)) + (DA_Result - bottomIntercept);
            }
            else if (useLog){
                return parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b) + (DA_Result - bottomIntercept);
            }
            else {
                return parseFloat(lines[i].m) * weight + parseFloat(lines[i].b) + (DA_Result - bottomIntercept);
            }
        }
        else {
            var useExp1 = false;
            var useLog1 = false;
            if("e" in lines[i+1]){
                useExp1 = true;
                topIntercept = parseFloat(lines[i+1].b) * Math.E ** (parseFloat(lines[i+1].e) * maxWeight);
            }
            else if ("c" in lines[i+1]){
                useLog1 = true;
                topIntercept =  parseFloat(lines[i+1].c) * Math.log(maxWeight) + parseFloat(lines[i+1].b);
            }
            else{
                topIntercept = parseFloat(lines[i+1].m) * maxWeight + parseFloat(lines[i+1].b);
            }
            /*We are below bottom line so just use bottom line with some skew*/
            if (DA_Result < bottomIntercept){
                if (useExp){
                    return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight)) - (bottomIntercept - DA_Result);
                }
                else if (useLog){
                    return (parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b)) - (bottomIntercept - DA_Result);
                }
                else{
                    return parseFloat(lines[i].m) * weight + parseFloat(lines[i].b) - (bottomIntercept - DA_Result);
                }
            }
            else if ((DA_Result >= bottomIntercept) && (DA_Result < topIntercept)){
                /*Between two lines (usually we use this) */
                skew = (DA_Result - bottomIntercept)/(topIntercept-bottomIntercept);
                if (useExp1){
                    topValue = parseFloat(lines[i+1].b) * Math.E ** (parseFloat(lines[i+1].e) * weight);
                }
                else if (useLog1){
                    topValue = parseFloat(lines[i+1].c) * Math.log(weight) + parseFloat(lines[i+1].b);
                }
                else{
                    topValue = parseFloat(lines[i+1].m) * weight + parseFloat(lines[i+1].b);
                }
                if (useExp){
                    bottomValue = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight);
                }
                else if (useLog){
                    bottomValue = parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b);
                }
                else{
                    bottomValue = parseFloat(lines[i].m) * weight + parseFloat(lines[i].b);
                }
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}

function windChart(lines, weight_Result, hwind){
    /**Interpolates the wind lines section of the landing data. Could technically use for any winds.**/
    for (i=0; i < lines.length; i++){
        bottomIntercept = parseFloat(lines[i].b);
        if (i+1 >= lines.length){
            /*We have reached the end of lines but haven't found our value, so use top line and add a skew*/
            return parseFloat(lines[i].m) * hwind + parseFloat(lines[i].b) + (weight_Result - bottomIntercept);
        }
        else {
            topIntercept = parseFloat(lines[i+1].b);
            /*We are below bottom line so just use bottom line with some skew*/
            if (weight_Result < bottomIntercept){
                return parseFloat(lines[i].m) * hwind + parseFloat(lines[i].b) - (bottomIntercept - weight_Result);
            }
            else if ((weight_Result >= bottomIntercept) && (weight_Result < topIntercept)){
                /*Between two lines (usually we use this) */
                skew = (weight_Result - bottomIntercept)/(topIntercept-bottomIntercept);
                topValue = parseFloat(lines[i+1].m) * hwind + parseFloat(lines[i+1].b);
                bottomValue = parseFloat(lines[i].m) * hwind + parseFloat(lines[i].b);
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}


function obstacleChart(toDistance, height = 50) {
    /**Given takeoff distance in meters and obstacle height, use table to convert to takeoff over obstacle
     * This uses the chart in the DA40CS POH.
     * Returns takeoff over 50 ft distance in meters by default**/
    const lines = {
        /*y intercept : slope(m)*/
        138.57 : 2.4851,
        225.7 : 2.5519,
        315.52 : 2.7423,
        392.03 : 3.5998,
        469.22 : 4.3267,
        517.52 : 5.3505,
        617.45 : 5.5147,
        722.18 : 6.8121,
        942.59 : 7.8029
    }
    const lineIntercepts = Object.keys(lines);
    for (i = 0; i < lineIntercepts.length; i++){
        bottomIntercept = parseFloat(lineIntercepts[i]);
        if (i+1 >= lineIntercepts.length){
            /*This means we are on the last(top) line, so we should only be here if takeoff distance is at or above line*/
            if (toDistance >= bottomIntercept){
                return parseFloat(lines[lineIntercepts[i]]) * height + bottomIntercept + (toDistance - bottomIntercept);
            }
            else{
                /*Hopefully will never get here*/
                return 0;
            }
        }
        else{
            topIntercept = parseFloat(lineIntercepts[i+1]);
        }
        /*Should only get it when takeoff distance is below the lowest line*/
        if (toDistance < bottomIntercept){
            return parseFloat(lines[lineIntercepts[i]]) * height + bottomIntercept - (bottomIntercept-toDistance);
        }
        /*Most should fall in this statement, being between 2 lines*/
        else if ((toDistance >= bottomIntercept) && (toDistance < topIntercept)){
            skew = (toDistance - bottomIntercept)/(topIntercept-bottomIntercept);
            topValue = parseFloat(lines[lineIntercepts[i+1]]) * height + topIntercept;
            bottomValue = parseFloat(lines[lineIntercepts[i]]) * height + bottomIntercept;
            return ((topValue - bottomValue) * skew) + bottomValue;
        }
    }
}