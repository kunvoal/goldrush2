import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.frequency_analyzer = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Frequency of digit %1 in last %2 ticks', [
                '%1',
                '%2',
            ]),
            args0: [
                {
                    type: 'input_value',
                    name: 'TARGET_DIGIT',
                    check: 'Number',
                },
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
            tooltip: localize('Returns the occurrence count of a target digit over the specified lookback window.'),
            category: window.Blockly.Categories?.Tick_Analysis || 'Tick Analysis',
        };
    },
    meta() {
        return {
            display_name: localize('Digit Frequency Analyzer'),
            description: localize('Counts how many times a digit occurred in the recent tick history.'),
        };
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.frequency_analyzer = block => {
    const targetDigit = window.Blockly.JavaScript.javascriptGenerator.valueToCode(block, 'TARGET_DIGIT', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC) || '0';
    const lookback = window.Blockly.JavaScript.javascriptGenerator.valueToCode(block, 'LOOKBACK', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC) || '30';

    const code = `(function() {
        var digits = Bot.getLastDigitList();
        if (!digits || !digits.length) return 0;
        var slice = digits.slice(-Math.min(${lookback}, digits.length));
        var target = Number(${targetDigit});
        var count = 0;
        for (var i = 0; i < slice.length; i++) {
            if (Number(slice[i]) === target) count++;
        }
        return count;
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};
