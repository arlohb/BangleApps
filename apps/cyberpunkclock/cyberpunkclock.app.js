(function () {
    require("Font5x7Numeric7Seg").add(Graphics);
    require("Font7x11Numeric7Seg").add(Graphics);
    var red = function () { return g.setColor(1, 0, 0); };
    var cyan = function () { return g.setColor(0, 1, 1); };
    var width = g.getWidth();
    var height = g.getHeight();
    var drawTimeout;
    var drawLine = function (points, thickness, color, debug) {
        g.reset();
        if (debug)
            debug();
        points.unshift([
            points[0][0] + points[0][0] - points[1][0],
            points[0][1] + points[0][1] - points[1][1],
        ]);
        points.push([
            points[points.length - 1][0] + points[points.length - 1][0] - points[points.length - 2][0],
            points[points.length - 1][1] + points[points.length - 1][1] - points[points.length - 2][1],
        ]);
        var sideA = [];
        var sideB = [];
        for (var i = 0; i < points.length; i++) {
            var p0 = points[i - 1];
            if (!p0)
                continue;
            var x0 = p0[0], y0 = p0[1];
            var p1 = points[i];
            var x1 = p1[0], y1 = p1[1];
            var p2 = points[i + 1];
            if (!p2)
                continue;
            var x2 = p2[0], y2 = p2[1];
            var dxa = x1 - x0;
            var dya = y1 - y0;
            var dxb = x2 - x1;
            var dyb = y2 - y1;
            var px = -(dya + dyb);
            var py = dxa + dxb;
            var len = Math.sqrt(px * px + py * py);
            px *= thickness / len;
            py *= thickness / len;
            sideA.push(x1 - px, y1 - py);
            sideB.push(y1 + py, x1 + px);
            if (debug) {
                g.fillCircle(x1 - px * 2, y1 - py * 2, 1);
                g.fillCircle(x1 + px * 2, y1 + py * 2, 1);
            }
        }
        var polyPoints = [];
        for (var i = 0; i < sideA.length; i++)
            polyPoints.push(sideA[i]);
        for (var i = sideB.length - 1; i >= 0; i--)
            polyPoints.push(sideB[i]);
        color();
        g.fillPoly(polyPoints);
    };
    var drawBackground = function () {
        g.reset();
        g.drawImage({
            width: 34, height: 38, bpp: 1,
            transparent: 1,
            palette: new Uint16Array([2047, 65535]),
            buffer: atob("/D//D/wH/4D+AP/AH4Af4AfAB/gA4AH+ADgAPwAGAA/AAYAD8ABAAPwAAAA/AAAAD8AAAAPwAAAA/AAAAD8AAAAPwAAAB/gAAAH+AAgAf4AGAB/gAYAH+ABgA/8AHAH/4A/////////////////////////////AD/wA4AH+ABgAf4AGAB/gAYAH+ABwA/8APAD/wA8AP/AD4B/+Af4P/8Hw"),
        }, width * 0.33, 32, {
            scale: 0.4,
        });
        g.drawImage({
            width: 28, height: 40, bpp: 1,
            transparent: 0,
            palette: new Uint16Array([65535, 2047]),
            buffer: atob("AB//wAH//AA//8AD//gAf/8AB//wAP/+AB//4AH//AA//8AD//gAf/8AB//wAP///g////H///8f///j///8f///h///8P///g///8D///gAD/8AAP/gAB/8AAH/gAA/8AAD/gAAP8AAB/gAAH8AAA/gAAD8AAAPgAAB8AAAHgAAA+AAADwAAAOAAAA=")
        }, width - 28 * 0.4 - 2, 60 - 40 * 0.4 / 2, {
            scale: 0.4,
        });
        drawLine([
            [0, 26],
            [width, 26],
        ], 2, red);
        drawLine([
            [0, 34],
            [width * 0.2, 34],
            [width * 0.35, 52],
            [width * 0.65, 52],
            [width * 0.8, 34],
            [width, 34],
        ], 2, red);
        drawLine([
            [0, 42],
            [width * 0.2 - 4, 42],
            [width * 0.35 - 4, 60],
            [width * 0.35 - 4, height],
        ], 2, red);
        drawLine([
            [width, 42],
            [width * 0.8 + 4, 42],
            [width * 0.65 + 4, 60],
            [width * 0.35 + 7, 60],
            [width * 0.35 + 6, 61],
            [width * 0.35 + 6, height],
        ], 2, red);
        drawLine([
            [width * 0.65 + 4, 60],
            [width * 0.8 + 4, 78],
            [width, 78],
        ], 2, red);
    };
    var drawSteps = function () {
        g.reset();
        var steps = 0;
        require("health").readDay(new Date(), function (h) { return steps += h.steps; });
        g.setFont("5x7Numeric7Seg", 2);
        g.setFontAlign(1, 0);
        cyan();
        g.drawString(steps.toString(), width * 0.67, (25 + 55) / 2, true);
    };
    var drawTime = function () {
        g.reset();
        var date = new Date();
        var hours = date.getHours().toString().padStart(2, "0");
        var mins = date.getMinutes().toString().padStart(2, "0");
        g.setFont("7x11Numeric7Seg", 3);
        g.setFontAlign(-1, -1);
        cyan();
        g.drawString(hours, 4, 60, true);
        g.drawString(mins, 4, 95, true);
    };
    var drawBattery = function () {
        g.reset();
        var battery = E.getBattery().toString().padStart(2, "0");
        g.setFont("5x7Numeric7Seg", 2);
        g.setFontAlign(-1, 0);
        cyan();
        g.drawString(battery, width * 0.8, 60, true);
    };
    var draw = function () {
        drawTime();
        drawSteps();
        drawBattery();
        if (drawTimeout)
            clearTimeout(drawTimeout);
        drawTimeout = setTimeout(function () {
            drawTimeout = null;
            draw();
        }, 60000 - (Date.now() % 60000));
    };
    g.clear();
    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    drawBackground();
    draw();
})();
