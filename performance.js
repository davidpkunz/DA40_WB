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
                    windDir = weatherData.wind_dir_degrees + "&deg";
                }
                if ("wind_gust_kt" in weatherData){
                    document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt
                                                                         + "kt G " + weatherData.wind_gust_kt + "kt";
                }
                else {
                    document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt + "kt";
                }
            }
            document.getElementById("wVisibility").innerHTML = parseFloat(weatherData.visibility_statute_mi) + " sm";
            var temp = parseFloat(weatherData.temp_c);
            var dewpoint = parseFloat(weatherData.dewpoint_c);
            document.getElementById("wTemp").innerHTML = temp + " &degC";
            document.getElementById("wDewpoint").innerHTML = dewpoint + " &degC";
            document.getElementById("wAltimeter").innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
            var fldAlt = parseFloat(weatherData.elevation_m)*3.281;
            var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg))*1000);
            var isa = 15 - ((pressureAlt/500));
            var densityAlt = pressureAlt + (120*(temp - isa));
            document.getElementById("wPressureAlt").innerHTML = pressureAlt.toFixed(0) + " ft";
            document.getElementById("wDensityAlt").innerHTML = densityAlt.toFixed(0) + " ft";








        }
    }
    request.open("GET", "server.php?q="+stationID,true);
    request.send();



}