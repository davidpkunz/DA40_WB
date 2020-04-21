<?php
    $q=$_GET["q"];
    $url= "https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecent=true&stationString=";
    $xml = simplexml_load_file($url.$q);
    $metar = $xml->data[0]->children();
    echo json_encode($metar[0]);
?>