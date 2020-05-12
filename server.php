<?php
    $q=$_GET["q"];
    $url= "https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=";
    $TAFurl = "https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&stationString=";
    $xml = simplexml_load_file($url.$q);
    $TAFxml = simplexml_load_file($TAFurl.$q."&hoursBeforeNow=0&timeType=valid");
    $metar = $xml->data[0]->children();
    $TAF = $TAFxml->data[0]->children();
    $results = array(
        "metar" => $metar[0],
        "taf" => $TAF[0],
    );
    echo json_encode($results);
?>