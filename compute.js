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
    if (aircraftObj.model === "DA40XL"){
        userInput["baggage2Weight"] = parseFloat(document.getElementById("baggageStation2").value);
    }
    /*If DA42 we have to compute w/ JetA density*/
    if (aircraftObj.model === "DA42"){
        userInput["noseWeight"] = parseFloat(document.getElementById("noseStation").value);
        userInput["deIceWeight"] = parseFloat(document.getElementById("deIceStation").value) * 9.125;
        userInput["baggage2Weight"] = parseFloat(document.getElementById("baggageStation2").value);
        userInput["fuelWeight"] = parseFloat(document.getElementById("fuelStation").value) * 6.75;
        userInput["auxFuelWeight"] = parseFloat(document.getElementById("auxFuelStation").value) * 6.75;
        userInput["fuelBurnWeight"] = parseFloat(document.getElementById("fuelBurn").value) * 6.75;
    }/*Otherwise just use avgas/100LL density*/
    else{
        userInput["fuelWeight"] = parseFloat(document.getElementById("fuelStation").value) * 6.0;
        userInput["fuelBurnWeight"] = parseFloat(document.getElementById("fuelBurn").value) * 6.0;
    }

    var cgValid = true;
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);

    /*check input validation. Checking ranges of input values. */
    var validInputString = checkInputConstraints(modelData, userInput);
    if (!(validInputString === "")){
        clearResults();
        resultWarning(validInputString);
        return;
    }

    /*computes all weights/CGs/Moments and returns dict with values*/
    var newData = computeWB(aircraftObj, userInput);
    var colors = {takeoff : "green", landing : "green", zero : "grey"};

    /*We now validate the results based on CG limits and output the results*/

    /*First make sure takoff weight(heaviest of the 3) is not over max*/
    if (newData.takeOffWeight > aircraftObj.maxWeight){
        resultWarning("Takeoff weight exceeds " + aircraftObj.maxWeight + " lbs.");
        colors["takeoff"] = "red";
        cgValid = false;
    }
    var zeroFwdCG;
    var toFwdCG;
    var ldgFwdCG;

        /*Now check if DA40 is within CG*/
        if (aircraftObj.model !== "DA42"){
            /*Light takeoff weight under 2161 lbs*/
            if (newData.takeOffWeight <= parseFloat(modelData.cgRange.midWgt)) {
                toFwdCG = modelData.cgRange.minFwd;
                if (!((parseFloat(modelData.cgRange.midFwd) <= newData.takeoffCG) &&
                    (newData.takeoffCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Takeoff CG out of limits.");
                    colors["takeoff"] = "red";
                    cgValid = false;
                }
            }
            /*Heavier takeoff weight over 2161 lbs where the fwd CG is sloped line*/
            else if (newData.takeOffWeight > parseFloat(modelData.cgRange.midWgt)){
                var lineX = lineEquation(newData.takeOffWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                                        modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
                toFwdCG = lineX;
                if(!((lineX <= newData.takeoffCG) && (newData.takeoffCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Takeoff CG out of limits.");
                    colors["takeoff"] = "red";
                    cgValid = false;
                }
            }
            /*Light zero fuel weight*/
            if (newData.zeroFuelWeight <= parseFloat(modelData.cgRange.midWgt)) {
                zeroFwdCG = parseFloat(modelData.cgRange.midFwd);
                if (!((parseFloat(modelData.cgRange.midFwd) <= newData.zeroFuelCG) &&
                    (newData.zeroFuelCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Zero Fuel CG out of limits.");
                    colors["zero"] = "red";
                    cgValid = false;
                }
            }
            /*Heavier zero fuel weight over 2161 lbs where the fwd CG is sloped line*/
            else if (newData.zeroFuelWeight > parseFloat(modelData.cgRange.midWgt)){
                lineX = lineEquation(newData.zeroFuelWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                    modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
                zeroFwdCG = lineX;
                if(!((lineX <= newData.zeroFuelCG) && (newData.zeroFuelCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Zero Fuel CG out of limits.");
                    colors["zero"] = "red";
                    cgValid = false;
                }

            }
            /*Light landing weight*/
            if (newData.landingWeight <= parseFloat(modelData.cgRange.midWgt)) {
                ldgFwdCG = modelData.cgRange.midFwd;
            }
            /*Heavier landing weight over 2161 lbs where the fwd CG is sloped line*/
            else if (newData.landingWeight > parseFloat(modelData.cgRange.midWgt)){
                lineX = lineEquation(newData.landingWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                    modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
                ldgFwdCG = lineX;
                if(!((lineX <= newData.landingCG) && (newData.landingCG <= parseFloat(modelData.cgRange.midAft)))) {
                    resultWarning("Landing CG out of limits.");
                    colors["landing"] = "red";
                    cgValid = false;
                }
            }


            /*We want to display results regardless of in/out of CG so the user can see and troubleshoot CG
            * but we don't want to display if some values are empty/NaN
            * */
            if (!isNaN(newData.zeroFuelWeight && newData.takeOffWeight && newData.landingWeight)){
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
            else{
                cgValid = false
            }
            /*We are within CG!*/
            if (cgValid) {
                resultSuccess();
            }
    }
    else {
        /*DA42 CG Check*/
    }
    drawCG(newData, userInput, modelData, colors);
    return [newData, userInput, toFwdCG];
}

function checkInputConstraints(modelData, userInput){
    /**Input validation for user input using model data
     * returns: string with error text
     * returns: empty string if no errors
     **/

    if (modelData.model === "DA40F" || modelData.model === "DA40CS"){
        if (userInput.fuelWeight > modelData.maxFuel*6.0){
            return "Max fuel exceeded."
        }
        if (userInput.baggage1Weight > modelData.maxBaggage){
            return "Max baggage exceeded."
        }
        if (userInput.fuelBurnWeight > userInput.fuelWeight){
            return "Fuel burn exceeds fuel available."
        }
    }
    else if (modelData.model === "DA40XL"){
        if (userInput.fuelWeight > modelData.maxFuel*6.0){
            return "Max fuel exceeded."
        }
        if (userInput.baggage1Weight > modelData.maxBaggage1){
            return "Max baggage exceeded."
        }
        if (userInput.baggage2Weight > modelData.maxBaggage2){
            return "Max extension baggage exceeded."
        }
        if ((userInput.baggage1Weight + userInput.baggage2Weight) > modelData.maxBaggage){
            return "Max combined baggage exceeded."
        }
        if (userInput.fuelBurnWeight > userInput.fuelWeight){
            return "Fuel burn exceeds fuel available."
        }

    }
    else if (modelData.model === "DA42"){
        if (userInput.fuelWeight > modelData.maxFuel*6.75){
            return "Max fuel exceeded."
        }
        if (userInput.auxFuelWeight > modelData.maxAuxFuel*6.75){
            return "Max aux fuel exceeded."
        }
        if (userInput.deIceWeight > modelData.maxDeIce*9.125){
            return "Max de-ice exceeded."
        }
        if (userInput.noseWeight > modelData.maxNoseBaggage){
            return "Max nose baggage exceeded."
        }
        if (userInput.baggage2Weight > modelData.maxBaggage2){
            return "Max extension baggage exceeded."
        }
        if ((userInput.baggage1Weight + userInput.baggage2Weight) > modelData.maxBaggage){
            return "Max combined baggage exceeded."
        }
        if (userInput.fuelBurnWeight > (userInput.fuelWeight + userInput.auxFuelWeight)){
            return "Fuel burn exceeds fuel available."
        }
    }
    return ""
}

function lineEquation(yValue,y,y1,x,x1){
    /**We take the yValue(aircraft weight) and two points on the line (x,y),(x1,y1)
     * We then find the slope of the line (m) and the y-intercept (b)
     * This allows us to get a line in y=mx+b form so we can solve for x using our yValue
     *
     **/
    var m = (y-y1)/(x-x1)
    var b = (m*-x1) + y1
    /*round to two decimal places*/
    return Math.round(((yValue-b)/m + Number.EPSILON) * 100) / 100;

}

function computeWB(aircraftObj, userInput){
    /**Takes the aircraft object and user input object.
     * Computes all Moments, CGs, and Weights
     * returns: A new dict/object with the computed data
     *  **/
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    var computedData = {};
    /*Multiply all weights and arms(CG) to get moments*/
    computedData["emptyMoment"] = Math.round((parseFloat(aircraftObj.emptyWeight) * parseFloat(aircraftObj.aircraftArm) + Number.EPSILON) * 100) / 100;
    computedData["frontMoment"] = Math.round((parseFloat(modelData.frontStationCG) * userInput.frontStationWeight + Number.EPSILON) * 100) / 100;
    computedData["rearMoment"] = Math.round((parseFloat(modelData.rearStationCG) * userInput.rearStationWeight + Number.EPSILON) * 100) / 100;
    computedData["baggageMoment"] = Math.round((parseFloat(modelData.baggageStationCG) * userInput.baggage1Weight + Number.EPSILON) * 100) / 100;

    computedData["fuelMoment"] = Math.round((parseFloat(modelData.fuelStationCG) * userInput.fuelWeight + Number.EPSILON) * 100) / 100;
    computedData["fuelBurnMoment"] = Math.round((parseFloat(modelData.fuelStationCG) * userInput.fuelBurnWeight + Number.EPSILON) * 100) / 100;

    /*DA42 needs more computations for nose baggage, aux fuel, de-ice*/
    if (aircraftObj.model === "DA42") {
        computedData["noseBagMoment"] = Math.round((parseFloat(modelData.noseBagStationCG) * userInput.noseWeight + Number.EPSILON) * 100) / 100;
        computedData["auxFuelMoment"] = Math.round((parseFloat(modelData.auxStationCG) * userInput.auxFuelWeight + Number.EPSILON) * 100) / 100;
        computedData["deIceMoment"] = Math.round((parseFloat(modelData.deIceStationCG) * userInput.deIceWeight + Number.EPSILON) * 100) / 100;
        computedData["baggage2Moment"] = Math.round((parseFloat(modelData.baggageStation2CG) * userInput.baggage2Weight + Number.EPSILON) * 100) / 100;
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.noseBagMoment +
            computedData.deIceMoment + computedData.frontMoment + computedData.rearMoment +
            computedData.baggageMoment + computedData.baggage2Moment;
        computedData["zeroFuelWeight"] = aircraftObj.emptyWeight + userInput.noseWeight + userInput.deIceWeight +
            userInput.frontStationWeight + userInput.rearStationWeight +
            userInput.baggage1Weight + userInput.baggage2Weight;

        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment + computedData.auxFuelMoment;
        computedData["takeOffWeight"] = computedData.zeroFuelWeight + userInput.fuelWeight + userInput.auxFuelWeight;
    }
    /*XL for the second baggage area*/
    else if(aircraftObj.model === "DA40XL"){
        computedData["baggage2Moment"] = Math.round((parseFloat(modelData.baggageStation2CG) * userInput.baggage2Weight + Number.EPSILON) * 100) / 100;
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.frontMoment
            + computedData.rearMoment + computedData.baggageMoment + computedData.baggage2Moment;
        computedData["zeroFuelWeight"] = aircraftObj.emptyWeight + userInput.frontStationWeight
            + userInput.rearStationWeight + userInput.baggage1Weight +userInput.baggage2Weight;
        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment
        computedData["takeOffWeight"] = computedData.zeroFuelWeight + userInput.fuelWeight;

    }
    /*DA40 base computations*/
    else{
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.frontMoment
            + computedData.rearMoment + computedData.baggageMoment;
        computedData["zeroFuelWeight"] = aircraftObj.emptyWeight + userInput.frontStationWeight
            + userInput.rearStationWeight + userInput.baggage1Weight;
        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment;
        computedData["takeOffWeight"] = computedData.zeroFuelWeight + userInput.fuelWeight;
    }
    /*Back to what all aircraft need computed*/
    computedData["zeroFuelCG"] = Math.round((computedData.zeroFuelMoment / computedData.zeroFuelWeight + Number.EPSILON) * 100) / 100;
    computedData["takeoffCG"] = Math.round((computedData.takeOffMoment / computedData.takeOffWeight + Number.EPSILON) * 100) / 100;
    computedData["landingWeight"] = computedData.takeOffWeight - userInput.fuelBurnWeight;
    computedData["landingMoment"] = Math.round((computedData.takeOffMoment - computedData.fuelBurnMoment + Number.EPSILON) * 100) / 100;
    computedData["landingCG"] = Math.round((computedData.landingMoment / computedData.landingWeight + Number.EPSILON) * 100) / 100;
    return computedData;
}

function clearResults(){
    /**Clears out the results section HTML when reset is hit**/
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

function auditMode(){
    /**Show detailed view in table format**/

    if(!(document.getElementById("auditDiv").style.display === "none")){
        document.getElementById("auditDiv").style.display = "none";
    }
    else {
        const data = reCompute();
        const computedData = data[0]
        const userInput = data[1]
        var tailNumber = document.getElementById('aircraftSelect').value;
        var aircraftObj = aircraft.find(x => x.tail === tailNumber);
        var modelData = aircraftModels.find(x => x.model === aircraftObj.model);

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
        document.getElementById("zero_mnt_td").innerHTML = computedData.zeroFuelMoment;

        document.getElementById("fuel_wt_td").innerHTML = userInput.fuelWeight;
        document.getElementById("fuel_cg_td").innerHTML = modelData.fuelStationCG;
        document.getElementById("fuel_mnt_td").innerHTML = computedData.fuelMoment;

        document.getElementById("takeoff_wt_td").innerHTML = computedData.takeOffWeight;
        document.getElementById("takeoff_cg_td").innerHTML = computedData.takeoffCG;
        document.getElementById("takeoff_mnt_td").innerHTML = computedData.takeOffMoment;

        document.getElementById("burn_wt_td").innerHTML = userInput.fuelBurnWeight;
        document.getElementById("burn_cg_td").innerHTML = modelData.fuelStationCG;
        document.getElementById("burn_mnt_td").innerHTML = computedData.fuelBurnMoment;

        document.getElementById("landing_wt_td").innerHTML = computedData.landingWeight;
        document.getElementById("landing_cg_td").innerHTML = computedData.landingCG;
        document.getElementById("landing_mnt_td").innerHTML = computedData.landingMoment;

        document.getElementById("max_wt_td").innerHTML = aircraftObj.maxWeight;

        document.getElementById("fwd_cg").innerHTML = data[2];
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
        } else {

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

        document.getElementById("auditDiv").style.display = "block";
    }
}



function resultWarning(warningText){
    /**Sets top result HTML to red and displays warning text**/
    if (document.getElementById("overall_result").classList.contains("list-group-item-success")){
        document.getElementById("overall_result").classList.remove("list-group-item-success");
    }
    if (!document.getElementById("overall_result").classList.contains("list-group-item-danger")){
        document.getElementById("overall_result").classList.add("list-group-item-danger");
    }
    document.getElementById("overall_result").innerHTML = "Not within limits. " + warningText;
}

function resultSuccess(){
    /**Sets top result HTML to green**/
    if (document.getElementById("overall_result").classList.contains("list-group-item-danger")){
        document.getElementById("overall_result").classList.remove("list-group-item-danger");
    }
    if (!document.getElementById("overall_result").classList.contains("list-group-item-success")){
        document.getElementById("overall_result").classList.add("list-group-item-success");
    }
    document.getElementById("overall_result").innerHTML = "Aircraft within limits.";
}


/*call to fill in the dropdown selector with tail numbers*/
fillData()