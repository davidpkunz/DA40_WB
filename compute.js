function fillData(){
    /**We run this initially to import the aircraft from aircraft.js and populate the dropdown(select) menu
     **/
    for (i = 0; i < aircraft.length; i++){
        document.getElementById("aircraftSelect").innerHTML += "<option>"+aircraft[i].tail+"</option>";
    }
}

function aircraftSelection(){
    /**When the user selects a tail number from the dropdown menu, we then populate the proper user input fields
     **/
    var tailNumber = document.getElementById('aircraftSelect').value;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber)

    document.getElementById("emptyAircraftInfo").innerHTML=
        "Empty: " + aircraftObj.emptyWeight + " lbs, CG: " + aircraftObj.aircraftArm;

    /*We need to hide or show different input fields based on aircraft type/model*/
    switch (aircraftObj.model) {
        case "DA40F":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("baggageStation2Div").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "66";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 66 lbs";
            document.getElementById("fuelStation").max = "40";
            document.getElementById("fuelMaxNote").innerHTML = "Max 40 Gallons";
            break;
        case "DA40CS":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("baggageStation2Div").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "66";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 66 lbs";
            document.getElementById("fuelStation").max = "40";
            document.getElementById("fuelMaxNote").innerHTML = "Max 40 Gallons";
            break;
        case "DA40XL":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "100";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 100 lbs";
            document.getElementById("baggageStation2Div").style.display = "flex";
            document.getElementById("baggage2MaxNote").innerHTML = "Max 40 lbs. Max 100 lbs Combined.";
            document.getElementById("fuelStation").max = "50";
            document.getElementById("fuelMaxNote").innerHTML = "Max 50 Gallons";
            document.getElementById("fuelBurn").max = "50";
            break;
        case "DA42":
            document.getElementById("noseStationDiv").style.display = "flex";
            if (aircraftObj.auxTanks){
                document.getElementById("auxFuelStationDiv").style.display = "flex";
            }
            if (aircraftObj.deIce){
                document.getElementById("deIceStationDiv").style.display = "flex";
            }
            document.getElementById("fuelStation").max = "50";
            document.getElementById("fuelMaxNote").innerHTML = "Max 50 Gallons";
            document.getElementById("baggageStation1").max = "100";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 100 lbs";
            document.getElementById("baggageStation2Div").style.display = "flex";
            document.getElementById("baggage2MaxNote").innerHTML = "Max 40 lbs. Max 100 lbs Combined.";
            break;
    }
    reCompute();
}

function reCompute(){
    /**Runs when a change in the user input is detected, this keeps the results updated with having to submit
     *
     **/
    var tailNumber = document.getElementById('aircraftSelect').value;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber)
    var userInput = {tail : aircraftObj.tail}
    /*Collect all user input and put into dict/object */
    userInput["frontStationWeight"] = parseFloat(document.getElementById("frontStation").value);
    userInput["rearStationWeight"] = parseFloat(document.getElementById("rearStation").value);
    userInput["baggage1Weight"] = parseFloat(document.getElementById("baggageStation1").value);
    if (!isNaN(document.getElementById("baggageStation2"))){
        userInput["baggage2Weight"] = parseFloat(document.getElementById("baggageStation2").value);
    }
    else {
        userInput["baggage2Weight"] = 0;
    }

    /*If DA42 we have to compute w/ JetA density*/
    if (aircraftObj.model === "DA42"){
        userInput["noseWeight"] = parseFloat(document.getElementById("noseStation").value);
        userInput["deIceWeight"] = parseFloat(document.getElementById("deIceStation").value) * 9.125;
        userInput["fuelWeight"] = parseFloat(document.getElementById("fuelStation").value) * 6.75;
        userInput["auxFuelWeight"] = parseFloat(document.getElementById("auxFuelStation").value) * 6.75;
        userInput["fuelBurnWeight"] = parseFloat(document.getElementById("fuelBurn").value) * 6.75;
    }/*Otherwise just use avgas/100LL density*/
    else{
        userInput["fuelWeight"] = parseFloat(document.getElementById("fuelStation").value) * 6.0;
        userInput["fuelBurnWeight"] = parseFloat(document.getElementById("fuelBurn").value) * 6.0;
    }
    /*computes all weights/CGs/Moments and returns dict with values*/
    var newData = computeWB(aircraftObj, userInput);
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);

    /*We now validate the results based on CG limits and output the results*/
    var cgValid = true;

    if (newData.takeOffWeight > aircraftObj.maxWeight){
        resultWarning("Takeoff weight exceeds " + aircraftObj.maxWeight + " lbs.");
        invalid = true;
    }
    var zeroFwdCG;
    var toFwdCG;
    var ldgFwdCG;

        if (aircraftObj.model !== "DA42"){
            if (newData.takeOffWeight <= parseFloat(modelData.cgRange.midWgt)) {
                toFwdCG = modelData.cgRange.minFwd;
                if (!((parseFloat(modelData.cgRange.midFwd) <= newData.takeoffCG) &&
                    (newData.takeoffCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Takeoff CG out of limits.");
                    cgValid = false;
                }
            }
            else if (newData.takeOffWeight > parseFloat(modelData.cgRange.midWgt)){
                var lineX = lineEquation(newData.takeOffWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                                        modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
                toFwdCG = lineX;
                if(!((lineX <= newData.takeoffCG) && (newData.takeoffCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Takeoff CG out of limits.");
                    cgValid = false;
                }
            }
            if (newData.zeroFuelWeight <= parseFloat(modelData.cgRange.midWgt)) {
                zeroFwdCG = parseFloat(modelData.cgRange.midFwd);
                if (!((parseFloat(modelData.cgRange.midFwd) <= newData.zeroFuelCG) &&
                    (newData.zeroFuelCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Zero Fuel CG out of limits.");
                    cgValid = false;
                }
            }
            else if (newData.zeroFuelWeight > parseFloat(modelData.cgRange.midWgt)){
                var lineX = lineEquation(newData.zeroFuelWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                    modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
                zeroFwdCG = lineX;
                if(!((lineX <= newData.zeroFuelCG) && (newData.zeroFuelCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Zero Fuel CG out of limits.");
                    cgValid = false;
                }

            }
            if (newData.landingWeight <= parseFloat(modelData.cgRange.midWgt)) {
                ldgFwdCG = modelData.cgRange.midFwd;
            }
            else if (newData.landingWeight > parseFloat(modelData.cgRange.midWgt)){
                var lineX = lineEquation(newData.landingWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                    modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
                ldgFwdCG = lineX;
                if(!((lineX <= newData.landingCG) && (newData.landingCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Landing CG out of limits.");
                    cgValid = false;
                }
            }

            if (cgValid) {
                resultSuccess();
            }
            document.getElementById("result_zero").innerHTML = "Zero Fuel: " + newData.zeroFuelWeight +
                " lbs | CG Range: " + zeroFwdCG + " - " + parseFloat(modelData.cgRange.minAft) +
                " | CG Actual: " + newData.zeroFuelCG;
            document.getElementById("result_takeoff").innerHTML = "Takeoff: " + newData.takeOffWeight +
                " lbs | CG Range: " + toFwdCG + " - " + parseFloat(modelData.cgRange.maxAft) +
                " | CG Actual: " + newData.takeoffCG;
            document.getElementById("result_landing").innerHTML = "Landing: " + newData.landingWeight +
                " lbs | CG Range: " + ldgFwdCG + " - " + parseFloat(modelData.cgRange.midAft) +
                " | CG Actual: " + newData.landingCG;
    }
    else {
        /*DA42*/
    }
}

function lineEquation(yValue,y,y1,x,x1){
    var m = (y-y1)/(x-x1)
    var b = (m*-x1) + y1
    var xValue = Math.round(((yValue-b)/m + Number.EPSILON) * 100) / 100;
    console.log(xValue)
    return xValue
}

function computeWB(aircraftObj, userInput){
    /**Takes the aircraft object and user input object.
     * Computes all Moments, CGs, and Weights
     * returns: A new dict/object with the computed data
     *  **/
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    var computedData = {};
    /*Multiply all weights and arms(CG) to get moments*/
    computedData["emptyMoment"] = parseFloat(aircraftObj.emptyWeight) * parseFloat(aircraftObj.aircraftArm);
    computedData["frontMoment"] = parseFloat(modelData.frontStationCG) * userInput.frontStationWeight;
    computedData["rearMoment"] = parseFloat(modelData.rearStationCG) * userInput.rearStationWeight;
    computedData["baggageMoment"] = parseFloat(modelData.baggageStationCG) * userInput.baggage1Weight;

    computedData["fuelMoment"] = parseFloat(modelData.fuelStationCG) * userInput.fuelWeight;
    computedData["fuelBurnMoment"] = parseFloat(modelData.fuelStationCG) * userInput.fuelBurnWeight;

    /*DA42 needs more computations for nose baggage, aux fuel, de-ice*/
    if (aircraftObj.model === "DA42") {
        computedData["noseBagMoment"] = parseFloat(modelData.noseBagStationCG) * userInput.noseWeight;
        computedData["auxFuelMoment"] = parseFloat(modelData.auxStationCG) * userInput.auxFuelWeight;
        computedData["deIceMoment"] = parseFloat(modelData.deIceStationCG) * userInput.deIceWeight;
        computedData["baggage2Moment"] = parseFloat(modelData.baggageStation2CG) * userInput.baggage2Weight;
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.noseBagMoment +
            computedData.deIceMoment + computedData.frontMoment + computedData.rearMoment +
            computedData.baggageMoment + computedData.baggage2Moment;
        computedData["zeroFuelWeight"] = aircraftObj.emptyWeight + userInput.noseWeight + userInput.deIceWeight +
            userInput.frontStationWeight + userInput.rearStationWeight +
            userInput.baggage1Weight + userInput.baggage2Weight;

        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment + computedData.auxFuelMoment
        computedData["takeOffWeight"] = computedData.zeroFuelWeight + userInput.fuelWeight + userInput.auxFuelWeight
    }
    /*DA40 base computations*/
    else{
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.frontMoment
            + computedData.rearMoment + computedData.baggageMoment;
        computedData["zeroFuelWeight"] = aircraftObj.emptyWeight + userInput.frontStationWeight
            + userInput.rearStationWeight + userInput.baggage1Weight;
        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment
        computedData["takeOffWeight"] = computedData.zeroFuelWeight + userInput.fuelWeight
    }
    /*Back to what all aircraft need computed*/
    computedData["zeroFuelCG"] = Math.round((computedData.zeroFuelMoment / computedData.zeroFuelWeight + Number.EPSILON) * 100) / 100;
    computedData["takeoffCG"] = Math.round((computedData.takeOffMoment / computedData.takeOffWeight + Number.EPSILON) * 100) / 100;
    computedData["landingWeight"] = computedData.takeOffWeight - userInput.fuelBurnWeight;
    computedData["landingMoment"] = computedData.takeOffMoment - computedData.fuelBurnMoment;
    computedData["landingCG"] = Math.round((computedData.landingMoment / computedData.landingWeight + Number.EPSILON) * 100) / 100;
    return computedData;
}

function clearResults(){
    document.getElementById("overall_result").innerHTML = "Limits:";
    if (document.getElementById("overall_result").classList.contains("list-group-item-success")){
        document.getElementById("overall_result").classList.remove("list-group-item-success");
    }
    if (document.getElementById("overall_result").classList.contains("list-group-item-danger")){
        document.getElementById("overall_result").classList.remove("list-group-item-danger");
    }
    document.getElementById("result_zero").innerHTML = "Zero Fuel:";
    document.getElementById("result_takeoff").innerHTML = "Takeoff:";
    document.getElementById("result_landing").innerHTML = "Landing:";
}

function resultWarning(warningText){
    if (document.getElementById("overall_result").classList.contains("list-group-item-success")){
        document.getElementById("overall_result").classList.remove("list-group-item-success");
    }
    if (!document.getElementById("overall_result").classList.contains("list-group-item-danger")){
        document.getElementById("overall_result").classList.add("list-group-item-danger");
    }
    document.getElementById("overall_result").innerHTML = "Not within limits. " + warningText;
}

function resultSuccess(){
    if (document.getElementById("overall_result").classList.contains("list-group-item-danger")){
        document.getElementById("overall_result").classList.remove("list-group-item-danger");
    }
    if (!document.getElementById("overall_result").classList.contains("list-group-item-success")){
        document.getElementById("overall_result").classList.add("list-group-item-success");
    }
    document.getElementById("overall_result").innerHTML = "Aircraft within limits.";
}



fillData()