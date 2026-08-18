import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.top_n_common_digits = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Top %1 most frequent digits in last %2 ticks | Mode: %3', [
                '%1',
                '%2',
                '%3',
            ]),
            args0: [
                {
                    type: 'input_value',
                    name: 'N_COUNT',
                    check: 'Number',
                },
                {
                    type: 'input_value',
                    name: 'LOOKBACK',
                    check: 'Number',
                },
                {
                    type: 'field_dropdown',
                    name: 'RANDOM_MODE',
                    options: [
                        [localize('Strategy Mode'), 'FALSE'],
                        [localize('Random Mode'), 'TRUE'],
                    ],
                },
            ],
            output: 'Array',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours?.Base?.colour || '#4c5270',
            colourSecondary: window.Blockly.Colours?.Base?.colourSecondary || '#3b4059',
            colourTertiary: window.Blockly.Colours?.Base?.colourTertiary || '#2b2f42',
            tooltip: localize('Returns a list of the Top N digits (Strategy mode) or random digits (Random mode) for bulk purchase.'),
            category: window.Blockly.Categories?.Tick_Analysis || 'Tick Analysis',
        };
    },
    meta() {
        return {
            display_name: localize('Top N Common Digits Predictor'),
            description: localize('Returns array of Top N digits sorted by frequency (or random digits when Random Mode is enabled).'),
        };
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.top_n_common_digits = block => {
    const nCount = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'N_COUNT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '4';
    const lookback = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'LOOKBACK',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '30';
    const isRandomMode = block.getFieldValue('RANDOM_MODE') === 'TRUE';

    const code = `(function() {
        var n = Number(${nCount}) || 4;
        if (${isRandomMode}) {
            var pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            pool.sort(function() { return 0.5 - Math.random(); });
            return pool.slice(0, Math.min(n, 10));
        }
        var digits = Bot.getLastDigitList();
        if (!digits || !digits.length) return [0, 1, 2, 3];
        var slice = digits.slice(-Math.min(${lookback}, digits.length));
        var counts = {};
        for (var i = 0; i <= 9; i++) counts[i] = 0;
        for (var k = 0; k < slice.length; k++) {
            var d = Number(slice[k]);
            counts[d] = (counts[d] || 0) + 1;
        }
        var arr = [];
        for (var digit = 0; digit <= 9; digit++) {
            arr.push({ digit: digit, count: counts[digit] });
        }
        arr.sort(function(a, b) { return b.count - a.count; });
        return arr.slice(0, Math.min(n, 10)).map(function(item) { return item.digit; });
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};
