import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.strictly_2tick_momentum_engine = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Strictly 2-Tick Momentum Engine | Mode: %1 | Sensitivity: %2', [
                '%1',
                '%2',
            ]),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'MODE',
                    options: [
                        [localize('Dual IF/ELSE (Both Up & Down)'), 'BOTH'],
                        [localize('Only Ups Impulse (RUNHIGH)'), 'ONLY_UPS'],
                        [localize('Only Downs Impulse (RUNLOW)'), 'ONLY_DOWNS'],
                        [localize('Mean Reversion Switcher (Both)'), 'MEAN_REVERT_BOTH'],
                        [localize('Micro-Breakout Channel (Both)'), 'BREAKOUT_BOTH'],
                        [localize('Step-Ladder Acceleration (Both)'), 'STEP_HYBRID'],
                    ],
                },
                {
                    type: 'field_dropdown',
                    name: 'SENSITIVITY',
                    options: [
                        [localize('Normal (+-0.05)'), 'NORMAL'],
                        [localize('High-Speed (+-0.03)'), 'HIGH'],
                        [localize('Ultra-Impulse (+-0.08)'), 'ULTRA'],
                    ],
                },
            ],
            colour: window.Blockly.Colours?.Special1?.colour || '#2a3052',
            colourSecondary: window.Blockly.Colours?.Special1?.colourSecondary || '#1f2440',
            colourTertiary: window.Blockly.Colours?.Special1?.colourTertiary || '#15182c',
            tooltip: localize('Calculates 2-tick price velocity, slope acceleration, and displacement to execute 2-tick Only Ups (RUNHIGH) or Only Downs (RUNLOW) trades dynamically.'),
            previousStatement: null,
            nextStatement: null,
            category: window.Blockly.Categories?.Before_Purchase || 'Before Purchase',
        };
    },
    meta() {
        return {
            display_name: localize('Strictly 2-Tick Momentum Engine'),
            description: localize('High-precision 2-tick real-time momentum engine using price velocity and slope step logic.'),
        };
    },
    restricted_parents: ['before_purchase'],
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.strictly_2tick_momentum_engine = block => {
    const mode = block.getFieldValue('MODE') || 'BOTH';
    const sensitivity = block.getFieldValue('SENSITIVITY') || 'NORMAL';

    let threshold = 0.05;
    if (sensitivity === 'HIGH') threshold = 0.03;
    if (sensitivity === 'ULTRA') threshold = 0.08;

    return `(function() {
    var ticks = Bot.getTicks();
    if (!ticks || ticks.length < 3) return;

    var current = ticks[ticks.length - 1];
    var tick1 = ticks[ticks.length - 2];
    var tick2 = ticks[ticks.length - 3];

    var diff2 = current - tick2;
    var accel = (current - tick1) - (tick1 - tick2);
    var mode = '${mode}';
    var thresh = ${threshold};

    if (mode === 'BOTH') {
        if (diff2 > thresh) {
            Bot.purchase('RUNHIGH');
        } else if (diff2 < -thresh) {
            Bot.purchase('RUNLOW');
        }
    } else if (mode === 'ONLY_UPS') {
        if (diff2 > thresh) {
            Bot.purchase('RUNHIGH');
        }
    } else if (mode === 'ONLY_DOWNS') {
        if (diff2 < -thresh) {
            Bot.purchase('RUNLOW');
        }
    } else if (mode === 'MEAN_REVERT_BOTH') {
        if (diff2 > thresh * 1.5) {
            Bot.purchase('RUNLOW');
        } else if (diff2 < -thresh * 1.5) {
            Bot.purchase('RUNHIGH');
        }
    } else if (mode === 'BREAKOUT_BOTH') {
        var highest = Math.max(tick1, tick2);
        var lowest = Math.min(tick1, tick2);
        if (current > highest) {
            Bot.purchase('RUNHIGH');
        } else if (current < lowest) {
            Bot.purchase('RUNLOW');
        }
    } else if (mode === 'STEP_HYBRID') {
        if (accel > 0 && diff2 > 0) {
            Bot.purchase('RUNHIGH');
        } else if (accel < 0 && diff2 < 0) {
            Bot.purchase('RUNLOW');
        }
    }
})();
`;
};
