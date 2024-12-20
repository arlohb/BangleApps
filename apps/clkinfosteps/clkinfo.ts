(function() {
  const storage = require("Storage");
  const json = storage.readJSON("health.json", true) as { stepGoal: number } | undefined;
  const stepGoal = json?.stepGoal ?? 10000;

  const getSteps = (): number => {
    let steps = 0;
    require("health").readDay(new Date(), (h: { steps: number }) => steps += h.steps);
    return steps;
  };

  return {
    name: "Steps",
    items: [
      {
        name: "Steps",
        get: () => {
          const steps = getSteps();
          const stepsStr = steps.toString();

          return {
            text: stepsStr,
            short: stepsStr,
            img: atob("GBiBAAcAAA+AAA/AAA/AAB/AAB/gAA/g4A/h8A/j8A/D8A/D+AfH+AAH8AHn8APj8APj8AHj4AHg4AADAAAHwAAHwAAHgAAHgAADAA=="),
            v: steps,
            min: 0,
            max: stepGoal,
          } as ClockInfo.RangeItem;
        },
        show: function() {},
        hide: function() {},
        run: function() {},
        focus: function() {},
        blur: function() {},
      }
    ]
  };
})
