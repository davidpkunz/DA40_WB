function getWeather(){
    /**Called when submit button is clicked
     * tries to retieve AWS METAR for the provided Station ID
     * Uses PHP backend to get the XML weather and return it as JSON format**/
    var stationID = document.getElementById("weatherID").value;
    var url = "http://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=" + stationID;
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
            localStorage.setItem("weatherData", JSON.stringify(weatherData));
            runwayChange(document.getElementById("runwayHdg").value);
        }
    }
    request.open("GET", "server.php?q="+stationID,true);
    request.send();
}

function runwayChange(str){
    /**Called when the runway heading input changes,
     * it then calls the compute functions to recalculate distances**/
    heading = parseFloat(str);
    if ((heading > 360)|| (heading < 1)){
        document.getElementById("xWind").innerHTML = "";
        document.getElementById("headWind").innerHTML = "";
        return;
    }
    var weatherData = JSON.parse(localStorage.getItem("weatherData"));
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
    performanceCompute(winds)
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

function performanceCompute(winds){
    /**Takes wind data, then imports weight data, weather data, aircraft data from local storage
     * Uses stored data to compute takeoff/landing/climb performance values depending on aircraft model**/
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var weatherData = JSON.parse(localStorage.getItem("weatherData"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var aircraftObj = aircraft.find(x => x.tail === userData.tail);
    var takeoffWeight = computedData.takeOffWeight;
    var landingWeight = computedData.landingWeight;
    var temp = parseFloat(weatherData.temp_c);
    var fldAlt = parseFloat(weatherData.elevation_m)*3.281;
    var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg))*1000);
    if (aircraftObj.model === "DA40F"){
        var takeoffDistance = takeoffDA40FP(pressureAlt, temp, takeoffWeight, winds.hWind)*3.281;
        document.getElementById("TODistance").innerHTML = "Ground Roll: " + (takeoffDistance/10).toFixed(0)*10 + " ft";
        var takeoff50 = takeoffOver50(takeoffDistance/3.281)*3.281;
        document.getElementById("TO50Distance").innerHTML = "Over 50': " + (takeoff50/10).toFixed(0)*10 + " ft";
    }
}

function takeoffDA40FP(pressureAlt, temp, takeoffWeight, hWind){
    /**Takes pressure altitude, temperature, takeoff Weight, and head wind
     * Computes takeoff distance using DA40F AFM chart for Takeoff distance gnd roll, see readme for more info
     * Returns the takeoff distance ground roll in meters**/
    var DA_result;
    var skew;
    /*Need to adapt this section to be more like 50ft obstacle function -> too much redundant code, need to set object
    * to hold all the line data.*/

    /*First section uses DA40 chart that takes OAT and pressure altitude to give result*/
    if(pressureAlt<=0) {
        /*Use 0ft line*/
        DA_result = 0.1227*temp + 33.047;
    }
    if((pressureAlt>0) && (pressureAlt<=2000)) {
        skew = pressureAlt / 2000;
        topValue = 0.1614 * temp + 38.683;
        bottomValue = 0.1227 * temp + 33.047;
        DA_result = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((pressureAlt>2000) && (pressureAlt<=4000)) {
        skew = (pressureAlt - 2000) / 2000;
        topValue = 0.2189 * temp + 46.131;
        bottomValue = 0.1614 * temp + 38.683;
        DA_result = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((pressureAlt>4000) && (pressureAlt<=6000)) {
        skew = (pressureAlt - 4000) / 2000;
        topValue = 0.3023 * temp + 56.14;
        bottomValue = 0.2189 * temp + 46.131;
        DA_result = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((pressureAlt>6000) && (pressureAlt<=8000)) {
        skew = (pressureAlt - 6000) / 2000;
        topValue = 68.827 * Math.E ** (0.006 * temp);
        bottomValue = 0.3023 * temp + 56.14;
        DA_result = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((pressureAlt>8000) && (pressureAlt<=10000)) {
        skew = (pressureAlt - 8000) / 2000;
        topValue = 0.5501 * temp + 88.008;
        bottomValue = 68.827 * Math.E ** (0.006 * temp);
        DA_result = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if(pressureAlt>10000) {
        if (temp > 20) {
            /*We are off the chart and T/O not allowed*/
        } else {
            DA_result = 0.5501 * temp + 88.008;
            DA_result += ((pressureAlt - 10000) / 100);
        }
    }
    /*We now have the value from the first portion of the chart,
     * so now we take aircraft takeoff weight and find next value*/
    var weightResult;
    if (DA_result <= 29.05) {
        weightResult = 0.0069 * takeoffWeight + 11.557;
    }
    else if((DA_result > 29.05) && (DA_result <= 33.4)) {
        skew = (DA_result - 29.05) / (33.4 - 29.05);
        topValue = 0.0088 * takeoffWeight + 11.092;
        bottomValue = 0.0069 * takeoffWeight + 11.557;
        weightResult = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((DA_result > 33.4) && (DA_result <= 37.806)) {
        skew = (DA_result - 33.4) / (37.806 - 33.4);
        topValue = 0.0105 * takeoffWeight + 11.188;
        bottomValue = 0.0088 * takeoffWeight + 11.092;
        weightResult = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((DA_result > 37.806) && (DA_result <= 45.391)) {
        skew = (DA_result - 37.806) / (45.391 - 37.806);
        topValue = 0.014 * takeoffWeight + 9.901;
        bottomValue = 0.0105 * takeoffWeight + 11.188;
        weightResult = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((DA_result > 45.391) && (DA_result <= 55.049)) {
        skew = (DA_result - 45.391) / (55.049 - 45.391);
        topValue = 0.0183 * takeoffWeight + 8.658;
        bottomValue = 0.014 * takeoffWeight + 9.901;
        weightResult = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((DA_result > 55.049) && (DA_result <= 68.645)) {
        skew = (DA_result - 55.049) / (68.645 - 55.049);
        topValue = 0.0246 * takeoffWeight + 6.284;
        bottomValue = 0.0183 * takeoffWeight + 8.658;
        weightResult = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if ((DA_result > 68.645) && (DA_result <= 87.185)) {
        skew = (DA_result - 68.645) / (87.185 - 68.645);
        topValue = 0.0335 * takeoffWeight + 2.263;
        bottomValue = 0.0246 * takeoffWeight + 6.284;
        weightResult = ((topValue - bottomValue) * skew) + bottomValue;
    }
    else if((DA_result > 87.185) && (DA_result <= 114.385)) {
        skew = (DA_result - 87.185) / (114.385 - 87.185);
        topValue = 0.0461 * takeoffWeight - 2.478;
        bottomValue = 0.0335 * takeoffWeight + 2.263;
        weightResult = ((topValue - bottomValue) * skew) + bottomValue;
    }

    /*Now we have value from weight portion of table and so we compute wind portion*/
    var windResult;
    if (!(hWind === 0)){
        /*This is if we have a headwind*/
        if(hWind > 0) {
            if (weightResult <= 26.89) {
                windResult = -0.1966 * hWind + 26.89;
            }
            else if ((weightResult > 26.89) && (weightResult <= 29.87)) {
                skew = (weightResult - 26.89) / (29.87 - 26.89);
                topValue = -0.2273 * hWind + 29.87;
                bottomValue = -0.1966 * hWind + 26.89;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 29.87) && (weightResult <= 34.865)) {
                skew = (weightResult - 29.87) / (34.865 - 29.87);
                topValue = -0.2968 * hWind + 34.865;
                bottomValue = -0.2273 * hWind + 29.87;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 34.865) && (weightResult <= 40.074)) {
                skew = (weightResult - 34.865) / (40.074 - 34.865);
                topValue = -0.3432 * hWind + 40.074;
                bottomValue = -0.2968 * hWind + 34.865;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 40.074) && (weightResult <= 47.127)) {
                skew = (weightResult - 40.074) / (47.127 - 40.074);
                topValue = -0.4051 * hWind + 47.127;
                bottomValue = -0.3432 * hWind + 40.074;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 47.127) && (weightResult <= 56.817)) {
                skew = (weightResult-47.127)/(56.817-47.127);
                topValue = -0.5423*hWind + 56.817;
                bottomValue = -0.4051*hWind + 47.127;
                windResult = ((topValue-bottomValue)*skew)+bottomValue;
                }
            else if ((weightResult > 56.817) && (weightResult <= 68.371)) {
                skew = (weightResult - 56.817) / (68.371 - 56.817);
                topValue = -0.6477 * hWind + 68.371;
                bottomValue = -0.5423 * hWind + 56.817;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
                }
            else if ((weightResult > 68.371) && (weightResult <= 84.633)) {
                skew = (weightResult - 68.371) / (84.633 - 68.371);
                topValue = -0.8103 * hWind + 84.633;
                bottomValue = -0.6477 * hWind + 68.371;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if (weightResult > 84.633) {
                skew = weightResult - 84.633;
                windResult = -0.8103 * hWind + 84.633 + skew;
            }
        }
        else if(hWind < 0){
            /*If we have a tail wind*/
            hWind = Math.abs(hWind);
            if (weightResult <= 26.58) {
                windResult = .6829 * hWind + 26.58;
            }
            else if ((weightResult > 26.58) && (weightResult <= 30.057)) {
                skew = (weightResult - 26.58) / (30.057 - 26.58);
                topValue = 0.8055 * hWind + 30.057;
                bottomValue = .6829 * hWind + 26.58;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 30.057) && (weightResult <= 34.918)) {
                skew = (weightResult - 30.057) / (34.918 - 30.057);
                topValue = 1.0687 * hWind + 34.918;
                bottomValue = 0.8055 * hWind + 30.057;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 34.918) && (weightResult <= 40.052)) {
                skew = (weightResult - 34.918) / (40.052 - 34.918);
                topValue = 1.1517 * hWind + 40.052;
                bottomValue = 1.0687 * hWind + 34.918;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 40.052) && (weightResult <= 47.032)) {
                skew = (weightResult - 40.052) / (47.032 - 40.052);
                topValue = 1.3759 * hWind + 47.032;
                bottomValue = 1.1517 * hWind + 40.052;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 47.032) && (weightResult <= 56.6)) {
                skew = (weightResult-47.032)/(56.6-47.032);
                topValue = 1.8477 * hWind + 56.6;
                bottomValue = 1.3759 * hWind + 47.032;
                windResult = ((topValue-bottomValue)*skew)+bottomValue;
            }
            else if ((weightResult > 56.6) && (weightResult <= 68.379)) {
                skew = (weightResult - 56.6) / (68.379 - 56.6);
                topValue = 2.253 * hWind + 68.379;
                bottomValue = 1.3759 * hWind + 56.6;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if ((weightResult > 68.379) && (weightResult <= 84.863)) {
                skew = (weightResult - 68.379) / (84.863- 68.379);
                topValue = 2.6908 * hWind + 84.863;
                bottomValue = 2.253 * hWind + 68.379;
                windResult = ((topValue - bottomValue) * skew) + bottomValue;
            }
            else if (weightResult > 68.379) {
                skew = weightResult - 68.379;
                windResult = 2.6908 * hWind + 84.863 + skew;
            }
        }
    }
    else{
        /*If we have no wind we just go straight across the chart*/
        windResult = weightResult;
    }
    /*We now convert to the output scale (-200 to 1400m) and convert to feet*/
    return (windResult*16 - 200);
}
function interpolateLines(topLine, bottomLine, xValue, yValue) {

}

function takeoffOver50(toDistance) {
    /**Given takeoff distance in meters, use table to convert to takeoff over 50 feet
     * This uses the chart in the DA40CS POH, the values are representive of the DA40FP standalone 50ft chart.
     * This means we can use it for all DA40 type aircraft.
     * Returns takeoff over 50 ft distance in meters**/
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
                return parseFloat(lines[lineIntercepts[i]]) * 50 + bottomIntercept + (toDistance - bottomIntercept);
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
            return parseFloat(lines[lineIntercepts[i]]) * 50 + bottomIntercept - (bottomIntercept-toDistance);
        }
        /*Most should fall in this statement, being between 2 lines*/
        else if ((toDistance >= bottomIntercept) && (toDistance < topIntercept)){
            skew = (toDistance - bottomIntercept)/(topIntercept-bottomIntercept);
            topValue = parseFloat(lines[lineIntercepts[i+1]]) * 50 + topIntercept;
            bottomValue = parseFloat(lines[lineIntercepts[i]]) * 50 + bottomIntercept;
            return ((topValue - bottomValue) * skew) + bottomValue;
        }
    }
}
