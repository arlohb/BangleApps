(() => {
  require("Font5x7Numeric7Seg").add(Graphics);
  require("Font7x11Numeric7Seg").add(Graphics);
  require("Font8x12").add(Graphics);

  const rawColors = {
    red1: g.toColor(0.25, 0, 0),
    red2: g.toColor(0.5, 0, 0),
    red3: g.toColor(0.75, 0, 0),
    red: g.toColor(1, 0, 0),

    cyan: g.toColor(0, 1, 1),
    yellow: g.toColor(0.5, 1, 0),
    pink: g.toColor(1, 0, 0.5),
  };

  const colors = {
    bg: rawColors.red1,
    bg2: rawColors.red2,

    fg: rawColors.cyan,
    highlight: rawColors.yellow,

    lines: rawColors.red3,
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

  const clockBackground = () => {
    const x1 = width * 0.55;
    const x2 = width - 8;
    const y1 = 47;
    const y2 = height * 0.75;

    const trRadius = 16;
    const blDepth = 8;
    const blLen = 24;
    const notchY1 = y1 + (y2 - y1) * 0.20;
    const notchY2 = y1 + (y2 - y1) * 0.60;
    const notchDepth = 4;

    const shape = [
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

  const drawBackground = () => {
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
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");

    g.reset();
    g.setFont("7x11Numeric7Seg", 2.5);
    g.setFontAlign(1, -1);
    g.setColor(colors.fg);
    g.setBgColor(colors.bg2);
    g.drawString(hours, width - 8 - 12, 47 + 18, true);
    g.drawString(mins, width - 8 - 12, 47 + 18 + 32, true);

    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      [date.getDay()];
    const dayNum = date.getDate();
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      [date.getMonth()];

    g.reset();
    g.setFont("8x12", 1);
    g.setFontAlign(-1, 1, 1);
    g.setColor(colors.fg);
    g.setBgColor(colors.bg2);
    g.drawString(`${day} ${dayNum} ${month}`, width * 0.55 + 8, 47 + 14, true)
  };

  const draw = () => {
    drawTime();

    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(() => {
      drawTimeout = null;
      draw();
    }, 10_000 - (Date.now() % 10_000));
  };

  // ClockInfo.Info is missing some optional properties
  type ClockInfoInfo = {
    text: string,
    short?: string,
    img?: string,
    color?: string,
    v?: number,
    min?: number,
    max?: number,
  };

  const createClockInfo = (
    draw: (item: ClockInfo.MenuItem, info: ClockInfoInfo, options: ClockInfo.InteractiveOptions) => void
  ) => (
    x: number, y: number, w: number, h: number
  ): ClockInfo.Options => ({
    app: "cyberpunkclock",
    x, y, w, h,
    draw: (item, _info, options) => {
      // Properly type info
      const info = _info as ClockInfoInfo;

      draw(item, info, options);
    },
  });

  const basicClockInfo = createClockInfo((_item, info, options) => {
    const lineGap = 4;
    let { x, y, w, h } = options;
    x += lineGap;
    y += lineGap;
    w -= lineGap * 2;
    h -= lineGap * 2;

    g.reset();

    const tlRadius = 10;
    const tlBLen = 4;
    const tlRLen = options.focus ? w * 0.8 - tlRadius : 16;
    const tlAdj = 2;

    const brRadius = 6;
    const brLLen = options.focus ? w * 0.6  - brRadius: 12;
    const brTLen = 6;
    const brAdj = 1;

    g.setBgColor(colors.bg);
    g.clearRect(x - lineGap, y - lineGap, x + w + lineGap, y + h + lineGap);

    const shape = [
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

    if (options.focus) g.setColor(colors.highlight); else g.setColor(colors.fg);

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

    const imageScale = 0.75;
    const imageSize = 24 * imageScale;
    const imagePad = 9;
    const textPad = 6;

    if (info.img) {
      g.setColor(colors.fg);
      g.drawImage(info.img, x + imagePad, y + h / 2 - imageSize / 2, { scale: imageScale });
    }

    const text = info.v?.toString()
      ?? info.short
      ?? info.text;

    g.setFont("5x7Numeric7Seg", 2);
    g.setFontAlign(-1, 0);
    g.drawString(text, x + imagePad + imageSize + textPad, y + h / 2);
  });

  const rangeClockInfo = createClockInfo((_item, info, options) => {
    const { x, y, w, h } = options;

    const boxW = 24;
    const boxBlRadius = 8;
    const boxTrRadius = 4;

    const sliderX1 = x + boxW;
    const sliderX2 = x + w;
    const sliderCut = 8;
    const sliderY1 = y + boxTrRadius + 6;
    const sliderY2 = y + h * 0.70;

    const accentX1 = sliderX1;
    const accentX2 = sliderX1 + (sliderX2 - sliderX1) * 0.45;
    const accentX3 = accentX2 - 4;
    const accentY1 = sliderY2;
    const accentY2 = sliderY2 + 3;

    const boxShape = [
      x, y,
      x + boxW - boxTrRadius, y,
      x + boxW, y + boxTrRadius,
      x + boxW, y + h,
      x + boxBlRadius, y + h,
      x, y + h - boxBlRadius,
      x, y,
    ];

    g.reset();
    g.setColor(options.focus ? colors.fg : colors.bg2);
    g.fillPoly(boxShape);
    g.setColor(options.focus ? colors.bg2 : colors.fg);
    g.drawPoly(boxShape);

    const text = info.v?.toString()
      ?? info.short
      ?? info.text;

    g.setFont("7x11Numeric7Seg", 1);
    g.setFontAlign(1, 0);
    g.drawString(text, x + boxW - 2, y + h / 2);

    const sliderShape = [
      sliderX1, sliderY1,
      sliderX2, sliderY1,
      sliderX2 - sliderCut, sliderY2,
      sliderX1, sliderY2,
      sliderX1, sliderY1,
    ];

    g.reset();
    g.setColor(colors.bg2);
    g.fillPoly(sliderShape);
    g.setColor(colors.fg);
    g.drawPoly(sliderShape);

    if (info.v !== undefined && info.min !== undefined && info.max !== undefined) {
      // Just in case this isn't done already
      const v = E.clip(info.v, info.min, info.max);
      const percent = (v - info.min) / (info.max - info.min);

      const filledSliderShape = [
        sliderX1, sliderY1,
        sliderX1 + (w - boxW) * percent, sliderY1,
        Math.max(sliderX1 + (w - boxW) * percent - sliderCut, sliderX1), sliderY2,
        sliderX1, sliderY2,
        sliderX1, sliderY1,
      ];

      g.reset();
      g.setColor(colors.fg);
      g.fillPoly(filledSliderShape);
    }

    const accentShape = [
      accentX1, accentY1,
      accentX2, accentY1,
      accentX3, accentY2,
      accentX1, accentY2,
      accentX1, accentY1,
    ];

    g.reset();
    g.setColor(colors.fg);
    g.fillPoly(accentShape);
  });

  g.clear();
  Bangle.setUI("clock");
  Bangle.loadWidgets();
  Bangle.drawWidgets();

  g.setColor(colors.bg);
  g.fillRect(0, 24, 176, 176);

  drawBackground();

  const clockInfo = require("clock_info");
  const clockInfoMenu = clockInfo.load();
  const clockInfoHeight = 26;

  for (let i = 0; i < 4; i++) {
    clockInfo.addInteractive(
      clockInfoMenu,
      basicClockInfo(8, 43 + i * (clockInfoHeight + 4), 80, clockInfoHeight),
    );
  }

  // Position based on clockBackground
  clockInfo.addInteractive(
    clockInfoMenu,
    rangeClockInfo(
      width * 0.55,
      height * 0.75 - 1,
      width - (width * 0.55 + 8),
      height - (height * 0.75 + 8) - 14,
    ),
  );

  draw();
})();
