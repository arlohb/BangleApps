(function () {
    require("Font5x7Numeric7Seg").add(Graphics);
    require("Font7x11Numeric7Seg").add(Graphics);
    var rawColors = {
        red1: g.toColor(0.25, 0, 0),
        red2: g.toColor(0.5, 0, 0),
        red3: g.toColor(0.75, 0, 0),
        red: g.toColor(1, 0, 0),
        cyan: g.toColor(0, 1, 1),
        yellow: g.toColor(1, 1, 0),
        pink: g.toColor(1, 0, 0.5),
    };
    var colors = {
        fg: rawColors.cyan,
        bg: rawColors.red1,
        lines: rawColors.red,
    };
    var width = g.getWidth();
    var height = g.getHeight();
    var drawTimeout;
    var drawLine = function (points, thickness, color, debug) {
        g.reset();
        if (debug)
            g.setColor(debug);
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
        g.setColor(color);
        g.fillPoly(polyPoints);
    };
    var drawBackground = function () {
        g.reset();
        drawLine([
            [0, 27],
            [width, 27],
        ], 3, colors.lines);
        drawLine([
            [0, height - 3],
            [width, height - 3],
        ], 3, colors.lines);
        var corner = function (x1, x2, y1, y2) {
            g.setColor(colors.lines);
            var gapX = width * 0.07;
            g.fillPoly([
                x1, y1,
                x1 + gapX, y2,
                x2 - gapX, y2,
                x2, y1,
            ]);
            var circleRadius = 2;
            var circles = [
                x1 + width * 0.09,
                (x1 + x2) / 2,
                x2 - width * 0.09,
            ];
            var circleY = y2 > y1 ? y1 + 2 : y1 - 2;
            g.setColor(colors.bg);
            for (var _i = 0, circles_1 = circles; _i < circles_1.length; _i++) {
                var x = circles_1[_i];
                g.fillCircle(x, circleY, circleRadius);
            }
        };
        corner(width * 0.08, width * 0.42, 30, 39);
        corner(width * 0.58, width * 0.92, 30, 39);
        corner(width * 0.08, width * 0.42, height - 6, height - 15);
        corner(width * 0.58, width * 0.92, height - 6, height - 15);
    };
    var drawTime = function () {
        g.reset();
        var date = new Date();
        var hours = date.getHours().toString().padStart(2, "0");
        var mins = date.getMinutes().toString().padStart(2, "0");
        g.setFont("7x11Numeric7Seg", 3);
        g.setFontAlign(-1, -1);
        g.setColor(colors.fg);
        g.setBgColor(colors.bg);
        g.drawString(hours, 4, 60, true);
        g.drawString(mins, 4, 95, true);
    };
    var draw = function () {
        drawTime();
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
    g.setColor(colors.bg);
    g.fillRect(0, 24, 176, 176);
    var clockInfo = require("clock_info");
    var clockInfoMenu = clockInfo.load();
    var clockInfoHeight = 22;
    for (var i = 0; i < 3; i++) {
        clockInfo.addInteractive(clockInfoMenu, {
            app: "cyberpunkclock",
            x: width - 80 - 8, y: 50 + i * (clockInfoHeight + 8),
            w: 80, h: clockInfoHeight,
            draw: function (_item, info, options) {
                var x = options.x, y = options.y, w = options.w, h = options.h;
                g.reset();
                g.setBgColor(rawColors.red2);
                g.clearRect(x, y, x + w, y + h);
                if (options.focus)
                    g.setColor(colors.fg);
                else
                    g.setColor(rawColors.red);
                var gap = 4;
                var length = 6;
                g.drawPoly([
                    x - gap, y + length,
                    x - gap, y - gap,
                    x + length, y - gap,
                ]);
                g.drawPoly([
                    x + w - length, y - gap,
                    x + w + gap, y - gap,
                    x + w + gap, y + length,
                ]);
                g.drawPoly([
                    x - gap, y + h - length,
                    x - gap, y + h + gap,
                    x + length, y + h + gap,
                ]);
                g.drawPoly([
                    x + w - length, y + h + gap,
                    x + w + gap, y + h + gap,
                    x + w + gap, y + h - length,
                ]);
                var imageSize = 24;
                var imageScale = 0.75;
                var padding = 4;
                if (info.img) {
                    g.setColor(colors.fg);
                    padding = (h - imageSize * imageScale) / 2;
                    g.drawImage(info.img, x + padding, y + padding, { scale: imageScale });
                    padding += imageSize * imageScale + padding;
                }
                g.setFont("5x7Numeric7Seg", 2);
                g.setFontAlign(-1, 0);
                g.drawString(info.text, x + padding, y + h / 2);
            },
        });
    }
    drawBackground();
    draw();
})();
