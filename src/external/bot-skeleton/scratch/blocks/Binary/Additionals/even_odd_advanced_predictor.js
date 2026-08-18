import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.even_odd_advanced_predictor = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Even/Odd Predictor Algorithm: %1 Lookback: %2', [
                '%1',
                '%2',
            ]),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'ALGORITHM',
                    options: [
                        [localize('Density Imbalance Bias'), 'DENSITY_BIAS'],
                        [localize('Random Alternate Switch'), 'RANDOM_ALTERNATE'],
                        [localize('Markov Chain Transition Matrix'), 'MARKOV_CHAIN'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'LOOKBACK',
                    check: 'Number',
                },
            ],
            output: 'String',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours?.Base?.colour || '#4c5270',
            colourSecondary: window.Blockly.Colours?.Base?.colourSecondary || '#3b4059',
            colourTertiary: window.Blockly.Colours?.Base?.colourTertiary || '#2b2f42',
            tooltip: localize('Predicts DIGITEVEN or DIGITODD using Density Imbalance, Random Alternate, or Markov Chain Transition Probability.'),
            category: window.Blockly.Categories?.Tick_Analysis || 'Tick Analysis',
        };
    },
    meta() {
        return {
            display_name: localize('Even/Odd Advanced Predictor'),
            description: localize('Provides Density, Random, and Markov Chain predictive choices for Even/Odd contracts.'),
        };
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.even_odd_advanced_predictor = block => {
    const algorithm = block.getFieldValue('ALGORITHM') || 'DENSITY_BIAS';
    const lookback = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'LOOKBACK',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '30';

    const code = `(function() {
        var digits = Bot.getLastDigitList();
        if (!digits || !digits.length) return 'DIGITEVEN';
        var slice = digits.slice(-Math.min(${lookback}, digits.length));
        var algo = '${algorithm}';

        if (algo === 'RANDOM_ALTERNATE') {
            return Math.random() > 0.5 ? 'DIGITEVEN' : 'DIGITODD';
        }

        if (algo === 'DENSITY_BIAS') {
            var evenCount = 0;
            for (var i = 0; i < slice.length; i++) {
                if (Number(slice[i]) % 2 === 0) evenCount++;
            }
            var oddCount = slice.length - evenCount;
            // Mean reversion: predict the minority state
            return evenCount <= oddCount ? 'DIGITEVEN' : 'DIGITODD';
        }

        if (algo === 'MARKOV_CHAIN') {
            // Build 1st-order Markov Transition Matrix for Even (0) -> Odd (1)
            var transitions = { 'E_to_E': 0, 'E_to_O': 0, 'O_to_E': 0, 'O_to_O': 0 };
            for (var k = 0; k < slice.length - 1; k++) {
                var curr = Number(slice[k]) % 2 === 0 ? 'E' : 'O';
                var next = Number(slice[k + 1]) % 2 === 0 ? 'E' : 'O';
                transitions[curr + '_to_' + next]++;
            }
            var lastState = Number(slice[slice.length - 1]) % 2 === 0 ? 'E' : 'O';
            if (lastState === 'E') {
                return transitions['E_to_E'] >= transitions['E_to_O'] ? 'DIGITEVEN' : 'DIGITODD';
            } else {
                return transitions['O_to_E'] >= transitions['O_to_O'] ? 'DIGITEVEN' : 'DIGITODD';
            }
        }

        return 'DIGITEVEN';
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};

