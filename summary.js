
function fillData(){
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var weatherData = JSON.parse(localStorage.getItem("weatherData"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var performanceData = JSON.parse(localStorage.getItem("performanceData"));
    var fwdCG = parseFloat(localStorage.getItem("fwdCG"));
    var colors = JSON.parse(localStorage.getItem("colors"));
    var tailNumber = userData.tail;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber);
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    fillWB(computedData, userData, fwdCG);
    drawCG(computedData, userData, modelData, colors);
    fillWeather(weatherData);
    fillPerformance(performanceData);
}

function fillWeather(weatherData){
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

function fillPerformance(performanceData) {
    runway = (performanceData.runwayHdg/10).toFixed(0);
    if (runway == 0){
        runway = 36;
    }
    document.getElementById("runwayHdg").innerHTML = "Runway " + runway;
    document.getElementById("xWind").innerHTML = performanceData.crossWind;
    document.getElementById("headWind").innerHTML = performanceData.headWind;
    document.getElementById("TODistance").innerHTML = "Ground Roll: "
        + (performanceData.takeoffDistance/10).toFixed(0)*10 + " ft";
    document.getElementById("TO50Distance").innerHTML = "Over 50': "
        + (performanceData.takeoff50Distance/10).toFixed(0)*10 + " ft";
    document.getElementById("LDGDistance").innerHTML = "Ground Roll: "
        + (performanceData.landingDistance/10).toFixed(0)*10 + " ft";
    document.getElementById("LDG50Distance").innerHTML = "Over 50': "
        + (performanceData.landing50Distance/10).toFixed(0)*10 + " ft";
    document.getElementById("climbFPM").innerHTML = (performanceData.climbPerf/10).toFixed(0)*10 + " FPM";
    document.getElementById("climbNM").innerHTML = ((performanceData.climbPerf/1.1)/10).toFixed(0)*10 + " FT/NM"
    document.getElementById("tgDistance").innerHTML = ((performanceData.takeoffDistance + performanceData.landingDistance)/10).toFixed(0)*10 + " ft";

}

function fillWB(computedData, userInput, fwdCG){
    /**Show detailed view in table format**/

    var tailNumber = userInput.tail;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber);
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);

    document.getElementById("auditTitle").innerHTML = tailNumber + " Weight and Balance";

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
        document.getElementById("bag2_tr").style.display = "none";

        document.getElementById("nose_wt_td").innerHTML = "-";
        document.getElementById("nose_cg_td").innerHTML = "-";
        document.getElementById("nose_mnt_td").innerHTML = "-";

        document.getElementById("deIce_wt_td").innerHTML = "-";
        document.getElementById("deIce_cg_td").innerHTML = "-";
        document.getElementById("deIce_mnt_td").innerHTML = "-";

        document.getElementById("aux_wt_td").innerHTML = "-";
        document.getElementById("aux_cg_td").innerHTML = "-";
        document.getElementById("aux_mnt_td").innerHTML = "-";
    }

    if (aircraftObj.model === "DA40XL") {
        document.getElementById("bag2_tr").style.display = "";
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;
    }
}

fillData();