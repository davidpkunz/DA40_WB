function drawCG(newData, userInput, modelData, colors){
    var c = document.getElementById("cgCanvas");
    var ctx = c.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.clearRect(0,0,c.width, c.height);
    var DA40Borders = {maxx : 104, maxy : 2800, minx : 92.5, miny : 1500}
    if (!(modelData.model === "DA42")) {
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

        var takeoff_cg = convertCoordinates(c, newData.takeoffCG, newData.takeOffWeight, DA40Borders);
        var landing_cg = convertCoordinates(c, newData.landingCG, newData.landingWeight, DA40Borders);
        var zero_cg = convertCoordinates(c, newData.zeroFuelCG, newData.zeroFuelWeight, DA40Borders);
    }

    /*draw Grid*/

    for (var i=0; i <= c.width; i += 40){
        ctx.moveTo(i,0);
        ctx.lineTo(i,c.length);

    }
    for (var j=0; j <= c.length; j += 40){
        ctx.moveTo(0, j);
        ctx.lineTo(c.width, j);

    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();

    /*draw CG points*/

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(takeoff_cg.x,takeoff_cg.y,6,0,2*Math.PI);
    ctx.strokeStyle = colors.takeoff;
    ctx.stroke();

    var square = 12;
    ctx.beginPath();
    ctx.rect(landing_cg.x-(.5*square), landing_cg.y-(.5*square),square,square)
    ctx.strokeStyle = colors.landing;
    ctx.stroke();

    var diamond = Math.sqrt(((square/2)**2)+((square/2)**2));

    ctx.beginPath();
    ctx.moveTo(zero_cg.x-diamond, zero_cg.y);
    ctx.lineTo(zero_cg.x, zero_cg.y-diamond);
    ctx.lineTo(zero_cg.x+diamond,zero_cg.y);
    ctx.lineTo(zero_cg.x,zero_cg.y+diamond);
    ctx.lineTo(zero_cg.x-diamond, zero_cg.y);
    ctx.strokeStyle = colors.zero;
    ctx.stroke();

    /*draw CG lines*/

    ctx.beginPath();
    ctx.moveTo(takeoff_cg.x,takeoff_cg.y);
    ctx.lineTo(landing_cg.x,landing_cg.y);
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(landing_cg.x,landing_cg.y);
    ctx.lineTo(zero_cg.x,zero_cg.y);
    ctx.setLineDash([2,2]);
    ctx.strokeStyle = "grey";
    ctx.stroke();

    /*draw legend and text*/
    ctx.font = "15px Arial";

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(20, 20,6,0,2*Math.PI);
    ctx.strokeStyle = colors.takeoff;
    ctx.stroke();
    ctx.fillText("takeoff", 33, 26);


    ctx.beginPath();
    ctx.rect(20-(.5*square), 40-(.5*square),square,square)
    ctx.strokeStyle = colors.landing;
    ctx.stroke();
    ctx.fillText("landing", 33, 40+(.5*square));

    ctx.beginPath();
    ctx.moveTo(20-diamond, 60);
    ctx.lineTo(20, 60-diamond);
    ctx.lineTo(20+diamond,60);
    ctx.lineTo(20,60+diamond);
    ctx.lineTo(20-diamond, 60);
    ctx.strokeStyle = colors.zero;
    ctx.stroke();
    ctx.fillText("zero fuel", 33, 66);


    ctx.font = "15px Arial";
    ctx.fillText("fwd", pnt1.x, pnt1.y+20);
    ctx.textAlign = "right";
    ctx.fillText("aft", pnt5.x, pnt5.y+20);
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CG", c.width/2, c.height-20);
    ctx.save();
    ctx.rotate(-90 * Math.PI / 180);
    ctx.fillText("Weight", -c.height/2, 50);
    ctx.restore();
    ctx.textAlign = "left";



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
