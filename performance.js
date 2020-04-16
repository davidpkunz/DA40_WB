function getWeather(){
    var stationID = document.getElementById("weatherID").value;
    var request = new XMLHttpRequest();
    var url = "http://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=" + stationID;
    request.open("GET", url);
    request.send();

}