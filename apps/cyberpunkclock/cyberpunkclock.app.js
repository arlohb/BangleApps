(function () {
    require("Font5x7Numeric7Seg").add(Graphics);
    require("Font7x11Numeric7Seg").add(Graphics);
    var rawColors = {
        red1: g.toColor(0.25, 0, 0),
        red2: g.toColor(0.5, 0, 0),
        red3: g.toColor(0.75, 0, 0),
        red: g.toColor(1, 0, 0),
        cyan: g.toColor(0, 1, 1),
        yellow: g.toColor(0.5, 1, 0),
        pink: g.toColor(1, 0, 0.5),
    };
    var colors = {
        bg: rawColors.red1,
        bg2: rawColors.red2,
        fg: rawColors.cyan,
        highlight: rawColors.yellow,
        lines: rawColors.red3,
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
    var clockBackground = function () {
        var x1 = width * 0.55;
        var x2 = width - 8;
        var y1 = 47;
        var y2 = height * 0.75;
        var trRadius = 16;
        var blDepth = 8;
        var blLen = 24;
        var notchY1 = y1 + (y2 - y1) * 0.20;
        var notchY2 = y1 + (y2 - y1) * 0.60;
        var notchDepth = 4;
        var shape = [
            x1, y1,
            x2 - trRadius, y1,
            x2, y1 + trRadius,
            x2, y2 - blDepth,
            x2 - blDepth, y2,
            x1 + blLen + blDepth, y2,
            x1 + blLen, y2 - blDepth,
            x1, y2 - blDepth,
            x1, notchY2,
            x1 + notchDepth, notchY2 - notchDepth,
            x1 + notchDepth, notchY1 + notchDepth,
            x1, notchY1,
            x1, y1,
        ];
        g.reset();
        g.setColor(colors.bg2);
        g.fillPoly(shape);
        g.setColor(colors.fg);
        g.drawPoly(shape);
    };
    var drawBackground = function () {
        clockBackground();
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
        g.setFont("7x11Numeric7Seg", 2.5);
        g.setFontAlign(0, -1);
        g.setColor(colors.fg);
        g.setBgColor(colors.bg2);
        g.drawString(hours, (width * 0.55 + width - 8) / 2, 47 + 12, true);
        g.drawString(mins, (width * 0.55 + width - 8) / 2, 47 + 12 + 32, true);
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
    var clockInfoHeight = 26;
    for (var i = 0; i < 4; i++) {
        clockInfo.addInteractive(clockInfoMenu, {
            app: "cyberpunkclock",
            x: 8, y: 43 + i * (clockInfoHeight + 4),
            w: 80, h: clockInfoHeight,
            draw: function (_item, _info, options) {
                var _a, _b, _c;
                var info = _info;
                var lineGap = 4;
                var x = options.x, y = options.y, w = options.w, h = options.h;
                x += lineGap;
                y += lineGap;
                w -= lineGap * 2;
                h -= lineGap * 2;
                g.reset();
                var tlRadius = 10;
                var tlBLen = 4;
                var tlRLen = options.focus ? w * 0.8 - tlRadius : 16;
                var tlAdj = 2;
                var brRadius = 6;
                var brLLen = options.focus ? w * 0.6 - brRadius : 12;
                var brTLen = 6;
                var brAdj = 1;
                g.setBgColor(colors.bg);
                g.clearRect(x - lineGap, y - lineGap, x + w + lineGap, y + h + lineGap);
                var shape = [
                    x + tlRadius, y,
                    x + w, y,
                    x + w, y + h - brRadius,
                    x + w - brRadius, y + h,
                    x, y + h,
                    x, y + tlRadius,
                    x + tlRadius, y,
                ];
                g.setColor(colors.bg2);
                g.fillPoly(shape);
                g.setColor(colors.lines);
                g.drawPoly(shape);
                if (options.focus)
                    g.setColor(colors.highlight);
                else
                    g.setColor(colors.fg);
                g.drawPoly([
                    x - lineGap, y + tlRadius + tlBLen,
                    x - lineGap, y + tlRadius - tlAdj,
                    x + tlRadius - tlAdj, y - lineGap,
                    x + tlRadius + tlRLen, y - lineGap,
                ]);
                g.drawPoly([
                    x + w - brRadius - brLLen, y + h + lineGap,
                    x + w - brRadius + brAdj, y + h + lineGap,
                    x + w + lineGap, y + h - brRadius + brAdj,
                    x + w + lineGap, y + h - brRadius - brTLen,
                ]);
                var imageScale = 0.75;
                var imageSize = 24 * imageScale;
                var imagePad = 9;
                var textPad = 6;
                if (info.img) {
                    g.setColor(colors.fg);
                    g.drawImage(info.img, x + imagePad, y + h / 2 - imageSize / 2, { scale: imageScale });
                }
                var text = (_c = (_b = (_a = info.v) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : info.short) !== null && _c !== void 0 ? _c : info.text;
                g.setFont("5x7Numeric7Seg", 2);
                g.setFontAlign(-1, 0);
                g.drawString(text, x + imagePad + imageSize + textPad, y + h / 2);
            },
        });
    }
    drawBackground();
    draw();
})();
