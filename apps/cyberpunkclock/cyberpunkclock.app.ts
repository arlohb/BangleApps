type Color = () => void;

(() => {
  require("Font5x7Numeric7Seg").add(Graphics);
  require("Font7x11Numeric7Seg").add(Graphics);

  const red: Color = () => g.setColor(1, 0, 0);
  const cyan: Color = () => g.setColor(0, 1, 1);

  const width = g.getWidth();
  const height = g.getHeight();

  let drawTimeout: TimeoutId | null;

  const drawLine = (points: [number, number][], thickness: number, color: Color, debug?: Color) => {
    g.reset();
    if (debug) debug();
    
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

    color();
    g.fillPoly(polyPoints);
  };

  const drawBackground = () => {
    g.reset();

    // Steps
    g.drawImage(
      {
        width: 34, height: 38, bpp: 1,
        transparent: 1,
        palette: new Uint16Array([2047,65535]),
        buffer: atob("/D//D/wH/4D+AP/AH4Af4AfAB/gA4AH+ADgAPwAGAA/AAYAD8ABAAPwAAAA/AAAAD8AAAAPwAAAA/AAAAD8AAAAPwAAAB/gAAAH+AAgAf4AGAB/gAYAH+ABgA/8AHAH/4A/////////////////////////////AD/wA4AH+ABgAf4AGAB/gAYAH+ABwA/8APAD/wA8AP/AD4B/+Af4P/8Hw"),
      },
      width * 0.33,
      32,
      {
        scale: 0.4,
      },
    );

    // Battery
    g.drawImage(
      {
        width : 28, height : 40, bpp : 1,
        transparent : 0,
        palette : new Uint16Array([65535,2047]),
        buffer : atob("AB//wAH//AA//8AD//gAf/8AB//wAP/+AB//4AH//AA//8AD//gAf/8AB//wAP///g////H///8f///j///8f///h///8P///g///8D///gAD/8AAP/gAB/8AAH/gAA/8AAD/gAAP8AAB/gAAH8AAA/gAAD8AAAPgAAB8AAAHgAAA+AAADwAAAOAAAA=")
      },
      width - 28 * 0.4 - 2,
      60 - 40 * 0.4 / 2,
      {
        scale: 0.4,
      },
    );

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

  const drawSteps = () => {
    g.reset();

    let steps = 0;
    require("health").readDay(new Date(), (h: { steps: number }) => steps += h.steps);

    g.setFont("5x7Numeric7Seg", 2);
    g.setFontAlign(1, 0);
    cyan();
    g.drawString(
      steps.toString(),
      width * 0.67,
      (25 + 55) / 2,
      true,
    );
  };

  const drawTime = () => {
    g.reset();

    const date = new Date();
    const hours = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");

    g.setFont("7x11Numeric7Seg", 3);
    g.setFontAlign(-1, -1);
    cyan();
    g.drawString(hours, 4, 60, true);
    g.drawString(mins, 4, 95, true);
  };

  const drawBattery = () => {
    g.reset();

    const battery = E.getBattery().toString().padStart(2, "0");

    g.setFont("5x7Numeric7Seg", 2);
    g.setFontAlign(-1, 0);
    cyan();
    g.drawString(
      battery,
      width * 0.8,
      60,
      true,
    );
  }

  const draw = () => {
    drawTime();
    drawSteps();
    drawBattery();

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

  const clockInfo = require("clock_info");
  const clockInfoMenu = clockInfo.load();
  const clockInfoHeight = 22;

  for (let i = 0; i < 3; i++) {
    clockInfo.addInteractive(
      clockInfoMenu,
      {
        app: "cyberpunkclock",
        x: width - 80 - 8, y: 86 + i * (clockInfoHeight + 8),
        w: 80, h: clockInfoHeight,
        draw: (_item, info, options) => {
          let { x, y, w, h } = options;

          g.reset();
          g.setBgColor(0.25, 0, 0);
          g.clearRect(x, y, x + w, y + h);

          if (options.focus) cyan(); else red();

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
            cyan();
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
