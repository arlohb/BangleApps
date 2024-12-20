(function () {
    var _a;
    var storage = require("Storage");
    var json = storage.readJSON("health.json", true);
    var stepGoal = (_a = json === null || json === void 0 ? void 0 : json.stepGoal) !== null && _a !== void 0 ? _a : 10000;
    var getSteps = function () {
        var steps = 0;
        require("health").readDay(new Date(), function (h) { return steps += h.steps; });
        return steps;
    };
    return {
        name: "Steps",
        items: [
            {
                name: "Steps",
                get: function () {
                    var steps = getSteps();
                    var stepsStr = steps.toString();
                    return {
                        text: stepsStr,
                        short: stepsStr,
                        img: atob("GBiBAAcAAA+AAA/AAA/AAB/AAB/gAA/g4A/h8A/j8A/D8A/D+AfH+AAH8AHn8APj8APj8AHj4AHg4AADAAAHwAAHwAAHgAAHgAADAA=="),
                        v: steps,
                        min: 0,
                        max: stepGoal,
                    };
                },
                show: function () { },
                hide: function () { },
                run: function () { },
                focus: function () { },
                blur: function () { },
            }
        ]
    };
});
