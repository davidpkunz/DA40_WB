function getWeather(){
    var stationID = document.getElementById("weatherID").value;
    var url = "http://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=" + stationID;
    if (stationID===""){
        return;
    }

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
}

function windComponents(heading, windDir, windSpeed){
    var diffAngle = heading - parseFloat(windDir);
    var radAngle = diffAngle*Math.PI/180;
    var xWindSpd = Math.sin(radAngle)*parseFloat(windSpeed);
    var hWindSpd = Math.cos(radAngle)*parseFloat(windSpeed);
    return {xWind : xWindSpd, hWind : hWindSpd};
}

function performanceCompute(){
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var weatherData = JSON.parse(localStorage.getItem("weatherData"));
}