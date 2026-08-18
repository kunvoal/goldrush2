import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.top_common_predictor = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Most frequent digit in last %1 ticks', [
                '%1',
            ]),
            args0: [
                {
                    type: 'input_value',
                    name: 'LOOKBACK',
                    check: 'Number',
                },
            ],
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours?.Base?.colour || '#4c5270',
            colourSecondary: window.Blockly.Colours?.Base?.colourSecondary || '#3b4059',
            colourTertiary: window.Blockly.Colours?.Base?.colourTertiary || '#2b2f42',
            tooltip: localize('Returns the most frequently occurring digit in recent tick history.'),
            category: window.Blockly.Categories?.Tick_Analysis || 'Tick Analysis',
        };
    },
    meta() {
        return {
            display_name: localize('Top Common Digit Predictor'),
            description: localize('Returns the single digit with highest frequency over lookback window.'),
        };
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.top_common_predictor = block => {
    const lookback = window.Blockly.JavaScript.javascriptGenerator.valueToCode(block, 'LOOKBACK', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC) || '30';

    const code = `(function() {
        var digits = Bot.getLastDigitList();
        if (!digits || !digits.length) return 5;
        var slice = digits.slice(-Math.min(${lookback}, digits.length));
        var counts = {};
        for (var i = 0; i <= 9; i++) counts[i] = 0;
        for (var k = 0; k < slice.length; k++) {
            var d = Number(slice[k]);
            counts[d] = (counts[d] || 0) + 1;
        }
        var maxDigit = 5;
        var maxCount = -1;
        for (var digit = 0; digit <= 9; digit++) {
            if (counts[digit] > maxCount) {
                maxCount = counts[digit];
                maxDigit = digit;
            }
        }
        return maxDigit;
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};
