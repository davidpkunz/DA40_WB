
function fillData(){
    /**Main call to fetch all data from local or session storage and call all the fill functions**/

    var userData = JSON.parse(localStorage.getItem("userInput"));
    var weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
    var weatherTAF = JSON.parse(sessionStorage.getItem("weatherTAF"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var performanceData = JSON.parse(sessionStorage.getItem("performanceData"));
    var resultCG = JSON.parse(localStorage.getItem("CG"));
    var colors = JSON.parse(localStorage.getItem("colors"));
    var tailNumber = userData.tail;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber);
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    document.getElementById("title").innerHTML = tailNumber + " Summary";
    fillWB(computedData, userData, resultCG.fwdCG, resultCG.validCG, false);
    drawCG(computedData, userData, modelData, colors);
    fillWeather(weatherData, weatherTAF, false);
    fillPerformance(performanceData, false, tailNumber);
}

function fillPrintData() {
    /**Call to fetch all data from local or session storage and call all the print fills**/
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
    var weatherTAF = JSON.parse(sessionStorage.getItem("weatherTAF"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var performanceData = JSON.parse(sessionStorage.getItem("performanceData"));
    var resultCG = JSON.parse(localStorage.getItem("CG"));
    var colors = JSON.parse(localStorage.getItem("colors"));
    var tailNumber = userData.tail;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber);
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    document.getElementById("title").innerHTML = tailNumber + " Print Summary";
    fillWB(computedData, userData, resultCG.fwdCG, resultCG.validCG, true);
    drawCG(computedData, userData, modelData, colors);
    fillWeather(weatherData, weatherTAF,true);
    fillPerformance(performanceData, true, tailNumber);
    fillVSpeeds(computedData, modelData);
    document.getElementById("acType").innerHTML += " " + aircraftObj.model;
    document.getElementById("acTail").innerHTML += " " + tailNumber;
    var obsTime = new Date();
    document.getElementById("date").innerHTML += obsTime.toDateString();
    if (aircraftObj.model !== "DA42"){
        document.getElementById("fuelOnboard").innerHTML += " " + userData.fuelWeight/6.0 + " gal";
    }
    else
    {
        document.getElementById("fuelOnboard").innerHTML += " " + userData.fuelWeight/6.75;
    }
}

function fillWeather(weatherData, weatherTAF, isPrint){
    /**Fills HTML elements with weather data**/
    if (!("raw_text" in weatherData)){
        var temp = parseFloat(weatherData.temp_c);
        document.getElementById("wWind").innerHTML = weatherData.wind_dir_degrees + " @ " + weatherData.wind_speed_kt + " kts";
        document.getElementById("wTemp").innerHTML = temp + " &degC";
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
    else {
        if (isPrint){
            document.getElementById("wLocation").innerHTML = weatherData.station_id + " Weather";
            temp = parseFloat(weatherData.temp_c);
            var dewpoint = parseFloat(weatherData.dewpoint_c);
            document.getElementById("wTemp").innerHTML = temp + "/" + dewpoint + " &degC";
        }
        else{
            document.getElementById("wRaw").innerHTML = weatherData.raw_text;
            temp = parseFloat(weatherData.temp_c);
            dewpoint = parseFloat(weatherData.dewpoint_c);
            document.getElementById("wTemp").innerHTML = temp + " &degC";
            document.getElementById("wDewpoint").innerHTML = dewpoint + " &degC";
        }

        var obsTime = new Date(weatherData.observation_time);
        document.getElementById("wTime").innerHTML = obsTime.getHours() + ":" + obsTime.getMinutes()
            + " (UTC " + -(obsTime.getTimezoneOffset() / 60) + ")";
        var windDir = "";
        if ((weatherData.wind_dir_degrees === "0") && (weatherData.wind_speed_kt === "0")) {
            windDir = "Calm";
            document.getElementById("wWind").innerHTML = windDir;
        } else {
            if (weatherData.wind_dir_degrees === "0") {
                windDir = "Variable";
            } else {
                windDir = parseFloat(weatherData.wind_dir_degrees);
                if (windDir < 100) {
                    windDir = "0" + windDir.toFixed(0).toString() + "&deg";
                } else {
                    windDir = windDir.toFixed(0).toString() + "&deg";
                }
            }
            if ("wind_gust_kt" in weatherData) {
                document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt
                    + " kts G " + weatherData.wind_gust_kt + " kts";
            } else {
                document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt + " kts";
            }
        }
        document.getElementById("wVisibility").innerHTML = parseFloat(weatherData.visibility_statute_mi) + " sm";
        var rawCeilings = weatherData.sky_condition;
        var ceilingString = "";
        if (Array.isArray(rawCeilings)) {
            for (var i = 0; i < rawCeilings.length; i++) {
                var ceilingAttribute = rawCeilings[i]["@attributes"];
                ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
            }
        } else {
            ceilingAttribute = rawCeilings["@attributes"];
            if (ceilingAttribute["sky_cover"] === "CLR") {
                ceilingString = "Clear";
            } else {
                ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ "
                    + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
            }
        }

        document.getElementById("wCeilings").innerHTML = ceilingString;
        document.getElementById("wAltimeter").innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
        fldAlt = parseFloat(weatherData.elevation_m) * 3.281;
        pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg)) * 1000);
        altimeterHg = parseFloat(weatherData.altim_in_hg);
        /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
        stationPressure = ((altimeterHg ** 0.1903) - (.00001313 * fldAlt)) ** 5.255;
        tempRankine = ((9 / 5) * (temp + 273.15));
        densityAlt = (145442.16 * (1 - ((17.326 * stationPressure) / (tempRankine)) ** 0.235));
        document.getElementById("wPressureAlt").innerHTML = pressureAlt.toFixed(0) + " ft";
        document.getElementById("wDensityAlt").innerHTML = densityAlt.toFixed(0) + " ft";

        /*TAF*/
        if (weatherTAF !== null){
            setTAF(weatherTAF);
        }
        else{
            document.getElementById("TAF").innerHTML = "No TAF Available";
        }
    }
}

function setTAF(weatherTAF){
    /*TAF*/
    var rawTAF = weatherTAF.raw_text;
    var nLines = weatherTAF.forecast.length;
    var index = 0;
    var line = "";
    var newLines = [];
    var indicator = weatherTAF.forecast[1].change_indicator;
    index = rawTAF.indexOf(indicator);
    newLines.push(rawTAF.slice(0, index));
    line = rawTAF.slice(index);
    for (i = 1; i < nLines; i++){
        var tempLine = line.slice(indicator.length);
        if (i+1 === nLines){
            newLines.push(indicator+tempLine);
        }
        else{
            var nextIndicator = weatherTAF.forecast[i+1].change_indicator;
            index = tempLine.indexOf(nextIndicator);
            newLines.push(indicator+tempLine.slice(0,index));
            indicator = nextIndicator;
            line = tempLine.slice(index);
        }
    }
    var now = new Date()
    document.getElementById("TAF").innerHTML = "Current Time: " + now.toUTCString() + "<br>";
    for (i=0; i < newLines.length; i++){
        document.getElementById("TAF").innerHTML += newLines[i] + "<br>"
    }
}

function fillPerformance(performanceData, isPrint, tailNumber) {
    /**Fills HTML elements with performance data**/
    if (tailNumber !== performanceData.tail){
        if (!isPrint){
            document.getElementById("runwayHdg").innerHTML = "Please recompute performance data using new Tail #";
        }
        else{
            document.getElementById("perfInfo").innerHTML = "Performance Data not valid. Recompute using new Tail #";
        }
        return;
    }
    runway = (performanceData.runwayHdg/10).toFixed(0);
    if (runway == 0){
        runway = 36;
    }
    if (!isPrint){
        document.getElementById("runwayHdg").innerHTML = "Runway " + runway;
    }
    else{

    }

    document.getElementById("headWind").innerHTML = performanceData.headWind.toFixed(0);
    if (performanceData.crossWind < 0){
        document.getElementById("xWind").innerHTML = -performanceData.crossWind.toFixed(0) + " (Right)";
    }
    else if (performanceData.crossWind === 0){
        document.getElementById("xWind").innerHTML = performanceData.crossWind.toFixed(0);
    }
    else{
        document.getElementById("xWind").innerHTML = performanceData.crossWind.toFixed(0) + " (Left)";
    }

    document.getElementById("TODistance").innerHTML = "Ground Roll: "
        + (performanceData.takeoffDistance/10).toFixed(0)*10 + " ft";
    document.getElementById("TO50Distance").innerHTML = "Over 50': "
        + (performanceData.takeoff50Distance/10).toFixed(0)*10 + " ft";
    document.getElementById("LDGDistance").innerHTML = "Ground Roll: "
        + (performanceData.landingDistance/10).toFixed(0)*10 + " ft";
    document.getElementById("LDG50Distance").innerHTML = "Over 50': "
        + (performanceData.landing50Distance/10).toFixed(0)*10 + " ft";
    document.getElementById("climbFPM").innerHTML = (performanceData.climbPerf/10).toFixed(0)*10 + " FPM";
    document.getElementById("tgDistance").innerHTML = ((performanceData.takeoffDistance + performanceData.landingDistance)/10).toFixed(0)*10 + " ft";

}

function fillWB(computedData, userInput, fwdCG, validCG, isPrint){
    /**Fill HTML elements with weight and balance data**/

    var tailNumber = userInput.tail;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber);
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);

    if (!validCG){
        document.getElementById("auditTitle").innerHTML = tailNumber + " NOT WITHIN LIMITS!!";
        document.getElementById("auditTitle").classList.add("text-danger");
    }
    else {
        document.getElementById("auditTitle").innerHTML = tailNumber + " is within limits!";
        document.getElementById("auditTitle").classList.add("text-success");
    }

    document.getElementById("empty_wt_td").innerHTML = aircraftObj.emptyWeight;
    document.getElementById("empty_cg_td").innerHTML = aircraftObj.aircraftArm;
    document.getElementById("empty_mnt_td").innerHTML = computedData.emptyMoment;

    document.getElementById("front_wt_td").innerHTML = userInput.frontStationWeight;
    document.getElementById("front_cg_td").innerHTML = modelData.frontStationCG;
    document.getElementById("front_mnt_td").innerHTML = computedData.frontMoment;

    document.getElementById("rear_wt_td").innerHTML = userInput.rearStationWeight;
    document.getElementById("rear_cg_td").innerHTML = modelData.rearStationCG;
    document.getElementById("rear_mnt_td").innerHTML = computedData.rearMoment;

    document.getElementById("zero_wt_td").innerHTML = computedData.zeroFuelWeight;
    document.getElementById("zero_cg_td").innerHTML = computedData.zeroFuelCG;
    document.getElementById("zero_mnt_td").innerHTML = computedData.zeroFuelMoment.toFixed(2);

    document.getElementById("fuel_wt_td").innerHTML = userInput.fuelWeight;
    document.getElementById("fuel_cg_td").innerHTML = modelData.fuelStationCG;
    document.getElementById("fuel_mnt_td").innerHTML = computedData.fuelMoment;

    document.getElementById("takeoff_wt_td").innerHTML = computedData.takeOffWeight;
    document.getElementById("takeoff_cg_td").innerHTML = computedData.takeoffCG;
    document.getElementById("takeoff_mnt_td").innerHTML = computedData.takeOffMoment.toFixed(2);;

    document.getElementById("burn_wt_td").innerHTML = userInput.fuelBurnWeight;
    document.getElementById("burn_cg_td").innerHTML = modelData.fuelStationCG;
    document.getElementById("burn_mnt_td").innerHTML = computedData.fuelBurnMoment;

    document.getElementById("landing_wt_td").innerHTML = computedData.landingWeight;
    document.getElementById("landing_cg_td").innerHTML = computedData.landingCG;
    document.getElementById("landing_mnt_td").innerHTML = computedData.landingMoment;

    document.getElementById("fwd_cg").innerHTML = fwdCG;
    document.getElementById("act_cg").innerHTML = computedData.takeoffCG;
    document.getElementById("aft_cg").innerHTML = modelData.cgRange.midAft;

    document.getElementById("bag_wt_td").innerHTML = userInput.baggage1Weight;
    document.getElementById("bag_cg_td").innerHTML = modelData.baggageStationCG;
    document.getElementById("bag_mnt_td").innerHTML = computedData.baggageMoment;

    if (aircraftObj.model === "DA42") {
        document.getElementById("nose_wt_td").innerHTML = userInput.noseWeight;
        document.getElementById("nose_cg_td").innerHTML = modelData.noseBagStationCG;
        document.getElementById("nose_mnt_td").innerHTML = computedData.noseBagMoment;

        document.getElementById("deIce_wt_td").innerHTML = userInput.deIceWeight;
        document.getElementById("deIce_cg_td").innerHTML = modelData.deIceStationCG;
        document.getElementById("deIce_mnt_td").innerHTML = computedData.deIceMoment;

        document.getElementById("aux_wt_td").innerHTML = userInput.auxFuelWeight;
        document.getElementById("aux_cg_td").innerHTML = modelData.auxStationCG;
        document.getElementById("aux_mnt_td").innerHTML = computedData.auxFuelMoment;

        document.getElementById("bag2_tr").style.display = "";
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;

        document.getElementById("max_wt_td").innerHTML = aircraftObj.maxTOWeight;

    }
    else {
        document.getElementById("max_wt_td").innerHTML = aircraftObj.maxWeight;
        if (!isPrint){
            document.getElementById("bag2_tr").style.display = "none";
        }
        document.getElementById("nose_wt_td").innerHTML = "-";
        document.getElementById("nose_cg_td").innerHTML = "-";
        document.getElementById("nose_mnt_td").innerHTML = "-";

        document.getElementById("deIce_wt_td").innerHTML = "-";
        document.getElementById("deIce_cg_td").innerHTML = "-";
        document.getElementById("deIce_mnt_td").innerHTML = "-";

        document.getElementById("aux_wt_td").innerHTML = "-";
        document.getElementById("aux_cg_td").innerHTML = "-";
        document.getElementById("aux_mnt_td").innerHTML = "-";

        document.getElementById("bag2_wt_td").innerHTML = "-";
        document.getElementById("bag2_cg_td").innerHTML = "-";
        document.getElementById("bag2_mnt_td").innerHTML = "-";

    }

    if (aircraftObj.model === "DA40XL") {
        if (!isPrint){
            document.getElementById("bag2_tr").style.display = "";
        }
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;
    }
}

function fillVSpeeds(computedData, modelData) {
    document.getElementById("Vr").innerHTML = modelData.vSpeeds.vr;
    document.getElementById("Vx").innerHTML = modelData.vSpeeds.vx;
    document.getElementById("Vy").innerHTML = modelData.vSpeeds.vy;
    document.getElementById("Vg").innerHTML = modelData.vSpeeds.vg;
    vaSpeeds = Object.keys(modelData.vSpeeds.va);
    if (modelData.model === "DA42"){
        document.getElementById("Vyse").innerHTML = modelData.vSpeeds.vyse;
        document.getElementById("Vmc").innerHTML = modelData.vSpeeds.vmc;
    }
    else{
        document.getElementById("Vyse").innerHTML = "-";
        document.getElementById("Vmc").innerHTML = "-";
    }
    for (i=0; i < vaSpeeds.length; i++){
        if (computedData.takeOffWeight <= parseFloat(vaSpeeds[i])){
            document.getElementById("Va").innerHTML = modelData.vSpeeds.va[vaSpeeds[i]];
            return;
        }
    }

}

function printResults(){
    /**Called when user clicks print button**/
    window.open("print.html");
}

function emailResults(){
    /**Called when user clicks email button (not implemented)
     * We will open a mailto link with the subject and body filled in with info
     * Still need to come up with body text to send. Can't send the canvas image or tables, only text**/

    var userData = JSON.parse(localStorage.getItem("userInput"));
    var weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var performanceData = JSON.parse(sessionStorage.getItem("performanceData"));
    var resultCG = JSON.parse(localStorage.getItem("CG"));
    var tailNumber = userData.tail;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber);

    var bodyString = "";
    if (!resultCG.validCG){
        bodyString += "!!!!CG NOT VALID. CHECK VALUES.!!!!"
    }
    else {
        var now = new Date();
        bodyString += "Prepared on " + now + "%0d%0A %0d%0A";
        bodyString += "Weight and Balance %0d%0A";
        bodyString += "Empty: " + aircraftObj.emptyWeight + " lbs | CG: " + aircraftObj.aircraftArm + "%0d%0A";
        if (aircraftObj.model === "DA42"){
            bodyString += "Nose Baggage: " + userData.noseWeight + " lbs %0d%0A";
            if (aircraftObj.deIce){
                bodyString += "De-icing Fluid: " + userData.deIceWeight + " lbs%0d%0A";
            }
        }
        bodyString += "Front: " + userData.frontStationWeight + " lbs %0d%0ARear: " + userData.rearStationWeight + " lbs %0d%0A";
        bodyString += "Baggage: " + userData.baggage1Weight + " lbs %0d%0A";
        if ((aircraftObj.model === "DA40XL") || aircraftObj.model === "DA42"){
            bodyString += "Baggage 2: " + userData.baggage2Weight + " lbs %0d%0A";
        }
        bodyString += "Zero Fuel: " + computedData.zeroFuelWeight + " lbs | CG: " + computedData.zeroFuelCG + " %0d%0A";
        bodyString += "Fuel: " + userData.fuelWeight + " lbs %0d%0A";
        if (aircraftObj.auxTanks) {
            bodyString += "Aux Fuel: " + userData.auxFuelWeight + " lbs %0d%0A";
        }
        bodyString += "Takeoff Weight: " + computedData.takeOffWeight + " lbs | Takeoff CG: " + computedData.takeoffCG +  "%0d%0A";
        bodyString += "Allowed CG Range: " + resultCG.fwdCG + " - " + resultCG.aftCG + "%0d%0A";
        bodyString += "Fuel Burn: " + userData.fuelBurnWeight + " lbs %0d%0A";
        bodyString += "Landing Weight: " + computedData.landingWeight + " lbs | Landing CG: " + computedData.landingCG +  "%0d%0A %0d%0A";

        if (sessionStorage.getItem("weatherData") !== null){
            if ("raw_text" in weatherData){
                bodyString += "Weather %0d%0A" + weatherData.raw_text + "%0d%0A %0d%0A";
            }
            else{
                bodyString += "Weather not available (user inputted).%0d%0A %0d%0A";
            }
        }
        else{
            bodyString += "Weather not available%0d%0A %0d%0A";
        }

        if (sessionStorage.getItem("performanceData") !== null){
            if(userData.tail !== performanceData.tail){
                bodyString += "Performance data needs to be recomputed. See Weather & Performance Tab."
            }
            else{
                bodyString += "Performance Data%0d%0ARunway Heading: " + performanceData.runwayHdg + "%0d%0A";
                bodyString += "Head Wind: " + performanceData.headWind.toFixed(0) + "%0d%0A";
                bodyString += "Cross Wind: " + performanceData.crossWind.toFixed(0) + "%0d%0A";
                bodyString += "Takeoff: Ground Roll: " + performanceData.takeoffDistance.toFixed(0) + " ft. Over 50': " + performanceData.takeoff50Distance.toFixed(0) + " ft.%0d%0A";
                bodyString += "Landing: Ground Roll: " + performanceData.landingDistance.toFixed(0) + " ft. Over 50': " + performanceData.landing50Distance.toFixed(0) + " ft.%0d%0A";
                bodyString += "Rate of Climb: " + performanceData.climbPerf.toFixed(0) + " FPM %0d%0A";
            }
        }
        else{
            bodyString += "Performance data not available"
        }
    }
    window.open('mailto:dispatchusu@gmail.com?subject=' + userData.tail + ' Weight and Balance&body=' +
        bodyString);
}