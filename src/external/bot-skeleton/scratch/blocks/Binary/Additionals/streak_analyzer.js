import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.streak_analyzer = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Has streak of %1 for last %2 ticks', [
                '%1',
                '%2',
            ]),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'STREAK_TYPE',
                    options: [
                        [localize('Even Digits'), 'EVEN'],
                        [localize('Odd Digits'), 'ODD'],
                        [localize('Over 4 Digits'), 'OVER4'],
                        [localize('Under 5 Digits'), 'UNDER5'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'LOOKBACK',
                    check: 'Number',
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours?.Base?.colour || '#4c5270',
            colourSecondary: window.Blockly.Colours?.Base?.colourSecondary || '#3b4059',
            colourTertiary: window.Blockly.Colours?.Base?.colourTertiary || '#2b2f42',
            tooltip: localize('Returns true if the last N consecutive ticks satisfy the selected streak rule.'),
            category: window.Blockly.Categories?.Tick_Analysis || 'Tick Analysis',
        };
    },
    meta() {
        return {
            display_name: localize('Streak Analyzer'),
            description: localize('Detects consecutive pattern streaks in recent tick history.'),
        };
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.streak_analyzer = block => {
    const streakType = block.getFieldValue('STREAK_TYPE');
    const lookback = window.Blockly.JavaScript.javascriptGenerator.valueToCode(block, 'LOOKBACK', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC) || '5';

    const code = `(function() {
        var digits = Bot.getLastDigitList();
        var reqCount = Math.max(1, Number(${lookback}));
        if (!digits || digits.length < reqCount) return false;
        var slice = digits.slice(-reqCount);
        for (var i = 0; i < slice.length; i++) {
            var d = Number(slice[i]);
            if ('${streakType}' === 'EVEN' && d % 2 !== 0) return false;
            if ('${streakType}' === 'ODD' && d % 2 === 0) return false;
            if ('${streakType}' === 'OVER4' && d <= 4) return false;
            if ('${streakType}' === 'UNDER5' && d >= 5) return false;
        }
        return true;
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};
