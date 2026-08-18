import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.updown_gap_predictor = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Up/Down Dynamic Gap Predictor | Tick Range: %1 | Mode: %2', [
                '%1',
                '%2',
            ]),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'TICK_RANGE',
                    options: [
                        [localize('2 Ticks'), '2'],
                        [localize('3 Ticks (Default)'), '3'],
                        [localize('4 Ticks'), '4'],
                        [localize('5 Ticks'), '5'],
                    ],
                },
                {
                    type: 'field_dropdown',
                    name: 'STRATEGY',
                    options: [
                        [localize('Gap Trend Follower'), 'GAP_FOLLOW'],
                        [localize('Gap Mean Reversion'), 'GAP_REVERT'],
                    ],
                },
            ],
            output: 'String',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours?.Special1?.colour || '#2a3052',
            colourSecondary: window.Blockly.Colours?.Special1?.colourSecondary || '#1f2440',
            colourTertiary: window.Blockly.Colours?.Special1?.colourTertiary || '#15182c',
            tooltip: localize('Analyzes price gap history over selected tick range (2, 3, 4, or 5 ticks) to decide CALL or PUT.'),
            category: window.Blockly.Categories?.Before_Purchase || 'Before Purchase',
        };
    },
    meta() {
        return {
            display_name: localize('Up/Down Dynamic Gap Predictor'),
            description: localize('Predicts Up or Down direction using price gap momentum over 2-5 ticks.'),
        };
    },
    restricted_parents: ['before_purchase'],
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.updown_gap_predictor = block => {
    const tickRange = block.getFieldValue('TICK_RANGE') || '3';
    const strategy = block.getFieldValue('STRATEGY') || 'GAP_FOLLOW';

    const code = `(function() {
        var N = Number(${tickRange});
        var ticks = Bot.getTicks();
        if (!ticks || ticks.length < N + 1) return 'CALL';
        var current = ticks[ticks.length - 1];
        var past = ticks[ticks.length - 1 - N];
        var gap = current - past;
        if ('${strategy}' === 'GAP_REVERT') {
            return gap > 0 ? 'PUT' : 'CALL';
        }
        return gap >= 0 ? 'CALL' : 'PUT';
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};
