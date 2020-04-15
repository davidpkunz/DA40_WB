function drawCG(newData, userInput, modelData, colors){
    image = new Image();
    image.src = 'grid.png';
    var c = document.getElementById("cgCanvas");
    var ctx = c.getContext("2d");

    ctx.clearRect(0,0,c.width, c.height);


    /*place Grid*/
    image.onload = function() {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";

        cgObj = drawEnvelope(c, ctx, modelData, newData);

        /*draw CG points*/

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cgObj.takeoff.x, cgObj.takeoff.y, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = colors.takeoff;
        ctx.stroke();

        var square = 12;
        ctx.beginPath();
        ctx.rect(cgObj.landing.x - (.5 * square), cgObj.landing.y - (.5 * square), square, square)
        ctx.strokeStyle = colors.landing;
        ctx.stroke();

        var diamond = Math.sqrt(((square / 2) ** 2) + ((square / 2) ** 2));

        ctx.beginPath();
        ctx.moveTo(cgObj.zero.x - diamond, cgObj.zero.y);
        ctx.lineTo(cgObj.zero.x, cgObj.zero.y - diamond);
        ctx.lineTo(cgObj.zero.x + diamond, cgObj.zero.y);
        ctx.lineTo(cgObj.zero.x, cgObj.zero.y + diamond);
        ctx.lineTo(cgObj.zero.x - diamond, cgObj.zero.y);
        ctx.strokeStyle = colors.zero;
        ctx.stroke();

        /*draw CG lines*/

        ctx.beginPath();
        ctx.moveTo(cgObj.takeoff.x, cgObj.takeoff.y);
        ctx.lineTo(cgObj.landing.x, cgObj.landing.y);
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cgObj.landing.x, cgObj.landing.y);
        ctx.lineTo(cgObj.zero.x, cgObj.zero.y);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = "grey";
        ctx.stroke();

        /*draw legend and text*/
        ctx.font = "15px Arial";

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(20, 20, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = colors.takeoff;
        ctx.stroke();
        ctx.fillText("takeoff", 33, 26);


        ctx.beginPath();
        ctx.rect(20 - (.5 * square), 40 - (.5 * square), square, square)
        ctx.strokeStyle = colors.landing;
        ctx.stroke();
        ctx.fillText("landing", 33, 40 + (.5 * square));

        ctx.beginPath();
        ctx.moveTo(20 - diamond, 60);
        ctx.lineTo(20, 60 - diamond);
        ctx.lineTo(20 + diamond, 60);
        ctx.lineTo(20, 60 + diamond);
        ctx.lineTo(20 - diamond, 60);
        ctx.strokeStyle = colors.zero;
        ctx.stroke();
        ctx.fillText("zero fuel", 33, 66);



    }
}

function drawEnvelope(c, ctx, modelData, newData){
    if (!(modelData.model === "DA42")) {
        var DA40Borders = {maxx : 104, maxy : 2800, minx : 92.5, miny : 1500}
        var pnt1 = convertCoordinates(c, modelData.cgRange.minFwd, modelData.cgRange.minWgt, DA40Borders);
        ctx.beginPath();
        ctx.moveTo(pnt1.x, pnt1.y);
        var pnt2 = convertCoordinates(c, modelData.cgRange.midFwd, modelData.cgRange.midWgt, DA40Borders);
        ctx.lineTo(pnt2.x, pnt2.y)
        var pnt3 = convertCoordinates(c, modelData.cgRange.maxFwd, modelData.cgRange.maxWgt, DA40Borders);
        ctx.lineTo(pnt3.x, pnt3.y);
        var pnt4 = convertCoordinates(c, modelData.cgRange.maxAft, modelData.cgRange.maxWgt, DA40Borders);
        ctx.lineTo(pnt4.x, pnt4.y);
        var pnt5 = convertCoordinates(c, modelData.cgRange.minAft, modelData.cgRange.minWgt, DA40Borders);
        ctx.lineTo(pnt5.x, pnt5.y);
        ctx.lineTo(pnt1.x, pnt1.y);
        ctx.stroke();

        ctx.font = "15px Arial";
        ctx.fillText("fwd", pnt1.x, pnt1.y + 20);
        ctx.textAlign = "right";
        ctx.fillText("aft", pnt5.x, pnt5.y + 20);

        var takeoff_cg = convertCoordinates(c, newData.takeoffCG, newData.takeOffWeight, DA40Borders);
        var landing_cg = convertCoordinates(c, newData.landingCG, newData.landingWeight, DA40Borders);
        var zero_cg = convertCoordinates(c, newData.zeroFuelCG, newData.zeroFuelWeight, DA40Borders);
    }
    else{
        var DA42Borders = {maxx : 98.5, maxy : 4100, minx : 91.5, miny : 2400}
        pnt1 = convertCoordinates(c, modelData.cgRange.minFwd, modelData.cgRange.minWgt, DA42Borders);
        ctx.beginPath();
        ctx.moveTo(pnt1.x, pnt1.y);
        pnt2 = convertCoordinates(c, modelData.cgRange.midFwd, modelData.cgRange.midWgtFwd, DA42Borders);
        ctx.lineTo(pnt2.x, pnt2.y)
        pnt3 = convertCoordinates(c, modelData.cgRange.maxFwd, modelData.cgRange.maxWgt, DA42Borders);
        ctx.lineTo(pnt3.x, pnt3.y);
        pnt4 = convertCoordinates(c, modelData.cgRange.maxAft, modelData.cgRange.maxWgt, DA42Borders);
        ctx.lineTo(pnt4.x, pnt4.y);
        pnt5 = convertCoordinates(c, modelData.cgRange.midAft, modelData.cgRange.midWgtAft, DA42Borders);
        ctx.lineTo(pnt5.x, pnt5.y);
        var pnt6 = convertCoordinates(c, modelData.cgRange.minAft, modelData.cgRange.minWgt, DA42Borders);
        ctx.lineTo(pnt6.x, pnt6.y);
        ctx.lineTo(pnt1.x, pnt1.y);
        ctx.stroke();

        ctx.font = "15px Arial";
        ctx.fillText("fwd", pnt1.x, pnt1.y + 20);
        ctx.textAlign = "right";
        ctx.fillText("aft", pnt6.x + 50, pnt6.y + 20);

        takeoff_cg = convertCoordinates(c, newData.takeoffCG, newData.takeOffWeight, DA42Borders);
        landing_cg = convertCoordinates(c, newData.landingCG, newData.landingWeight, DA42Borders);
        zero_cg = convertCoordinates(c, newData.zeroFuelCG, newData.zeroFuelWeight, DA42Borders);
    }

    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CG", c.width / 2, c.height - 20);
    ctx.save();
    ctx.rotate(-90 * Math.PI / 180);
    ctx.fillText("Weight", -c.height / 2, 50);
    ctx.restore();
    ctx.textAlign = "left";
    return {
        takeoff : takeoff_cg,
        landing : landing_cg,
        zero : zero_cg
    };
}



function convertCoordinates(canvas, x, y, borders){
    /**Takes a coordinate given from a CG and weight
     * and translates onto the canvas given the min and max x/y borders
     * returns: [x,y] point on the canvas
     **/
    var width = canvas.width;
    var height = canvas.height;
    var xscale = width/(borders.maxx-borders.minx);
    var yscale = height/(borders.maxy-borders.miny);
    var newx = (x-borders.minx)*xscale;
    var newy = height - ((y-borders.miny)*yscale);
    return {x : newx, y : newy};
}
