(() => {
  require("Font5x7Numeric7Seg").add(Graphics);
  require("Font7x11Numeric7Seg").add(Graphics);

  const rawColors = {
    red1: g.toColor(0.25, 0, 0),
    red2: g.toColor(0.5, 0, 0),
    red3: g.toColor(0.75, 0, 0),
    red: g.toColor(1, 0, 0),

    cyan: g.toColor(0, 1, 1),
    yellow: g.toColor(1, 1, 0),
    pink: g.toColor(1, 0, 0.5),
  };

  const colors = {
    fg: rawColors.cyan,
    bg: rawColors.red1,
    lines: rawColors.red,
  };

  const width = g.getWidth();
  const height = g.getHeight();

  let drawTimeout: TimeoutId | null;

  const drawLine = (points: [number, number][], thickness: number, color: number, debug?: number) => {
    g.reset();
    if (debug) g.setColor(debug);
    
    points.unshift([
      points[0]![0] + points[0]![0] - points[1]![0],
      points[0]![1] + points[0]![1] - points[1]![1],
    ]);
    
    points.push([
      points[points.length - 1]![0] + points[points.length - 1]![0] - points[points.length - 2]![0],
      points[points.length - 1]![1] + points[points.length - 1]![1] - points[points.length - 2]![1],
    ]);

    const sideA = [];
    const sideB = [];

    for (let i = 0; i < points.length; i++) {
      const p0 = points[i - 1];
      if (!p0) continue;
      const [x0, y0] = p0;

      const p1 = points[i]!;
      const [x1, y1] = p1;

      const p2 = points[i + 1];
      if (!p2) continue;
      const [x2, y2] = p2;

      const dxa = x1 - x0;
      const dya = y1 - y0;

      const dxb = x2 - x1;
      const dyb = y2 - y1;

      let px = -(dya + dyb);
      let py = dxa + dxb;
      const len = Math.sqrt(px * px + py * py);
      px *= thickness / len;
      py *= thickness / len;

      sideA.push(x1 - px, y1 - py);
      // This is going to be reversed
      sideB.push(y1 + py, x1 + px);

      if (debug) {
        g.fillCircle(x1 - px * 2, y1 - py * 2, 1);
        g.fillCircle(x1 + px * 2, y1 + py * 2, 1);
      }
    }

    const polyPoints = [];

    for (let i = 0; i < sideA.length; i++)
      polyPoints.push(sideA[i]!);

    for (let i = sideB.length - 1; i >= 0; i--)
      polyPoints.push(sideB[i]!);

    g.setColor(color);
    g.fillPoly(polyPoints);
  };

  const drawBackground = () => {
    g.reset();
    
    drawLine([
      [0, 27],
      [width, 27],
    ], 3, colors.lines);
    
    drawLine([
      [0, height - 3],
      [width, height - 3],
    ], 3, colors.lines);

    const corner = (x1: number, x2: number, y1: number, y2: number) => {
      g.setColor(colors.lines);
      const gapX = width * 0.07;

      g.fillPoly([
        x1, y1,
        x1 + gapX, y2,
        x2 - gapX, y2,
        x2, y1,
      ]);

      const circleRadius = 2;
      const circles = [
        x1 + width * 0.09,
        (x1 + x2) / 2,
        x2 - width * 0.09,
      ];
      const circleY = y2 > y1 ? y1 + 2 : y1 - 2;

      g.setColor(colors.bg);
      for (const x of circles) {
        g.fillCircle(x, circleY, circleRadius);
      }
    };

    corner(width * 0.08, width * 0.42, 30, 39);
    corner(width * 0.58, width * 0.92, 30, 39);
    corner(width * 0.08, width * 0.42, height - 6, height - 15);
    corner(width * 0.58, width * 0.92, height - 6, height - 15);
  };

  const drawTime = () => {
    g.reset();

    const date = new Date();
    const hours = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");

    g.setFont("7x11Numeric7Seg", 3);
    g.setFontAlign(-1, -1);
    g.setColor(colors.fg);
    g.setBgColor(colors.bg);
    g.drawString(hours, 4, 60, true);
    g.drawString(mins, 4, 95, true);
  };

  const draw = () => {
    drawTime();

    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(() => {
      drawTimeout = null;
      draw();
    }, 60_000 - (Date.now() % 60_000));
  };

  g.clear();
  Bangle.setUI("clock");
  Bangle.loadWidgets();
  Bangle.drawWidgets();

  g.setColor(colors.bg);
  g.fillRect(0, 24, 176, 176);

  const clockInfo = require("clock_info");
  const clockInfoMenu = clockInfo.load();
  const clockInfoHeight = 22;

  for (let i = 0; i < 3; i++) {
    clockInfo.addInteractive(
      clockInfoMenu,
      {
        app: "cyberpunkclock",
        x: width - 80 - 8, y: 50 + i * (clockInfoHeight + 8),
        w: 80, h: clockInfoHeight,
        draw: (_item, info, options) => {
          let { x, y, w, h } = options;

          g.reset();
          g.setBgColor(rawColors.red2);
          g.clearRect(x, y, x + w, y + h);

          if (options.focus) g.setColor(colors.fg); else g.setColor(rawColors.red);

          const gap = 4;
          const length = 6;

          // TL
          g.drawPoly([
            x - gap, y + length,
            x - gap, y - gap,
            x + length, y - gap,
          ]);

          // TR
          g.drawPoly([
            x + w - length, y - gap,
            x + w + gap, y - gap,
            x + w + gap, y + length,
          ]);

          // BL
          g.drawPoly([
            x - gap, y + h - length,
            x - gap, y + h + gap,
            x + length, y + h + gap,
          ]);

          // BR
          g.drawPoly([
            x + w - length, y + h + gap,
            x + w + gap, y + h + gap,
            x + w + gap, y + h - length,
          ]);

          const imageSize = 24;
          const imageScale = 0.75;
          let padding = 4;

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
      },
    );
  }

  drawBackground();

  draw();
})();
