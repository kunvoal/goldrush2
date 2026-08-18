import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.slt_strategy_executor = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('SLT Strategy: %1 | Initial Stake: %2 | Stop Loss: %3 | Take Profit: %4', [
                '%1',
                '%2',
                '%3',
                '%4',
            ]),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'MODE',
                    options: [
                        [localize('Matches SLT'), 'MATCHES_SLT'],
                        [localize('Over/Under Combos SLT'), 'OVER_UNDER_SLT'],
                        [localize('Even/Odd Streak SLT'), 'EVEN_ODD_SLT'],
                        [localize('Multiplier Squeeze SLT'), 'MULTIPLIER_SLT'],
                    ],
                },
                {
                    type: 'input_value',
                    name: 'STAKE',
                    check: 'Number',
                },
                {
                    type: 'input_value',
                    name: 'STOP_LOSS',
                    check: 'Number',
                },
                {
                    type: 'input_value',
                    name: 'TAKE_PROFIT',
                    check: 'Number',
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours?.Special2?.colour || '#e6a100',
            colourSecondary: window.Blockly.Colours?.Special2?.colourSecondary || '#c28800',
            colourTertiary: window.Blockly.Colours?.Special2?.colourTertiary || '#996c00',
            tooltip: localize('Smart Stop-Loss & Take-Profit manager. Evaluates current profit against parameters and returns true if trading should continue.'),
            category: window.Blockly.Categories?.After_Purchase || 'After Purchase',
        };
    },
    meta() {
        return {
            display_name: localize('Smart SLT Executor'),
            description: localize('Handles Stop Loss and Take Profit evaluation across trading modes.'),
        };
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.slt_strategy_executor = block => {
    const mode = block.getFieldValue('MODE');
    const stake = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'STAKE',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '1';
    const stopLoss = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'STOP_LOSS',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '50';
    const takeProfit = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'TAKE_PROFIT',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '50';

    const code = `(function() {
        var totalProfit = Bot.getTotalProfit();
        var tp = Number(${takeProfit});
        if (tp > 0 && totalProfit >= tp) {
            Bot.notify({ message: 'PROFIT: +' + totalProfit.toFixed(2) + ' USD', className: 'success' });
            return false;
        }
        var sl = Number(${stopLoss});
        if (sl > 0 && totalProfit <= -Math.abs(sl)) {
            Bot.notify({ message: 'STOP', className: 'error' });
            return false;
        }
        return true;
    })()`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_FUNCTION_CALL];
};
