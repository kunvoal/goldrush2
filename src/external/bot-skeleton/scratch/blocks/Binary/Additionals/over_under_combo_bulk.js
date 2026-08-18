import { localize } from '@deriv-com/translations';

window.Blockly.Blocks.over_under_combo_bulk = {
    init() {
        this.jsonInit(this.definition());
        this.setNextStatement(false);
    },
    definition() {
        return {
            message0: localize('Bulk Parallel Over/Under Combo: %1', [
                '%1',
            ]),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'COMBO',
                    options: [
                        [localize('1. Apex Over 2 / Under 7 / Over 4 (3-Leg)'), 'AUDITED_APEX_OVER2_UNDER7_OVER4'],
                        [localize('2. Tri-Wedge Yield Escalator (3-Leg | 70% Win)'), 'AUDITED_TRI_WEDGE_ESCALATOR'],
                        [localize('3. Symmetrical Over 3 / Under 6 / Over 4 (3-Leg)'), 'AUDITED_SYMMETRICAL_OV3_UN6_OV4'],
                        [localize('4. Quad-Sniper High-Yield Matrix (4-Leg)'), 'AUDITED_QUAD_SNIPER_MATRIX'],
                        [localize('5. High-Yield Parabolic Barricade (3-Leg)'), 'AUDITED_PARABOLIC_BARRICADE'],
                        [localize('6. Bimodal Diamond Cross (4-Leg)'), 'AUDITED_BIMODAL_DIAMOND_CROSS'],
                        [localize('7. Apex Twin-Tower (2-Leg)'), 'AUDITED_APEX_TWIN_TOWER'],
                        [localize('8. Asymmetrical Low-Digit Wedge (3-Leg)'), 'AUDITED_LOW_DIGIT_WEDGE'],
                        [localize('9. Parabolic High-Digit Spike (3-Leg)'), 'AUDITED_HIGH_DIGIT_SPIKE'],
                        [localize('10. Zero-Deadzone Fortress (3-Leg)'), 'AUDITED_ZERO_DEADZONE_FORTRESS'],
                        [localize('11. Quantum Core Double-Leg (2-Leg)'), 'AUDITED_QUANTUM_CORE_DOUBLE'],
                        [localize('12. Over 4 / Under 5 Twin 1.96x (2-Leg | Zero Risk)'), 'AUDITED_TWIN_196X_ZERO_RISK'],
                        [localize('13. Over 2 / Under 5 Bracket (2-Leg)'), 'AUDITED_OVER2_UNDER5_BRACKET'],
                        [localize('14. Over 4 / Under 7 Bracket (2-Leg)'), 'AUDITED_OVER4_UNDER7_BRACKET'],
                        [localize('15. Triple 1.96x Super Squeeze (3-Leg)'), 'AUDITED_TRIPLE_196X_SQUEEZE'],
                        [localize('16. Over 3 / Under 5 Squeeze (2-Leg)'), 'AUDITED_OVER3_UNDER5_SQUEEZE'],
                        [localize('17. Over 4 / Under 6 Squeeze (2-Leg)'), 'AUDITED_OVER4_UNDER6_SQUEEZE'],
                        [localize('18. Over 2 / Under 6 Compounder (2-Leg)'), 'AUDITED_OVER2_UNDER6_COMPOUNDER'],
                        [localize('19. Omni-Spectrum Fortress (8-Leg Heavy)'), 'AUDITED_OMNI_SPECTRUM_FORTRESS'],
                        [localize('20. Centroid Core Heavy-Stack (7-Leg Heavy)'), 'AUDITED_CENTROID_CORE_STACK'],
                        [localize('21. Parabolic Upper-Tier Cascade (7-Leg Heavy)'), 'AUDITED_PARABOLIC_UPPER_CASCADE'],
                        [localize('22. Lower-Tier Heavy Barricade (7-Leg Heavy)'), 'AUDITED_LOWER_TIER_BARRICADE'],
                        [localize('23. Bimodal Double-Prism Trap (8-Leg Heavy)'), 'AUDITED_BIMODAL_DOUBLE_PRISM'],
                        [localize('24. Linear Multi-Leg Step Compounder (7-Leg Heavy)'), 'AUDITED_LINEAR_MULTILEG_COMPOUNDER'],
                        [localize('25. Heavy Dual-Squeeze Multiplier (7-Leg Heavy)'), 'AUDITED_DUAL_SQUEEZE_MULTIPLIER'],
                        [localize('26. Hyper-Symmetrical Quad-Peak (8-Leg Heavy)'), 'AUDITED_HYPER_QUAD_PEAK'],
                        [localize('27. Apex Tri-Sector Power Vault (7-Leg Heavy)'), 'AUDITED_APEX_TRI_SECTOR_VAULT'],
                        [localize('28. Quantum 1.96x Super-Shield (8-Leg Heavy)'), 'AUDITED_QUANTUM_SUPER_SHIELD'],
                        [localize('29. Ultra 2.45x Apex Quad-Leg Surge (8-Leg Heavy)'), 'AUDITED_ULTRA_245X_QUAD_SURGE'],
                        [localize('30. Triple 1.96x Double-Lock Vault (8-Leg Heavy)'), 'AUDITED_TRIPLE_196X_DOUBLE_LOCK'],
                        [localize('31. Hyper-Linear Multi-Leg Escalator (7-Leg Heavy)'), 'AUDITED_HYPER_LINEAR_ESCALATOR'],
                        [localize('32. Deca-Tier Asymmetrical Sweep (7-Leg Heavy)'), 'AUDITED_DECA_TIER_SWEEP'],
                        [localize('33. Prism 1.41x Fortress-Stack (8-Leg Heavy)'), 'AUDITED_PRISM_141X_FORTRESS'],
                        [localize('34. Over 3 / Under 6 Dual Spike (Power Combo)'), 'POWER_OVER3_UNDER6_DUAL_SPIKE'],
                        [localize('35. Over 2 / Under 7 Velocity Shield (Power Combo)'), 'POWER_OVER2_UNDER7_VELOCITY_SHIELD'],
                        [localize('36. Dual-Apex Over 3 / Under 6 Vault (Power Blend)'), 'POWER_DUAL_APEX_OVER3_UNDER6'],
                        [localize('37. Over 4 / Under 5 Parity Squeeze (Power Combo)'), 'POWER_OVER4_UNDER5_PARITY_SQUEEZE'],
                        [localize('38. Triple-Point Over 4 / Under 5 Fortress (Power Multi)'), 'POWER_TRIPLE_POINT_OVER4_UNDER5'],
                        [localize('39. Over 2 Alpha Shield (Power Compounder)'), 'POWER_OVER2_ALPHA_SHIELD'],
                    ],
                },
            ],
            previousStatement: null,
            colour: window.Blockly.Colours?.Special1?.colour || '#2a3052',
            colourSecondary: window.Blockly.Colours?.Special1?.colourSecondary || '#1f2440',
            colourTertiary: window.Blockly.Colours?.Special1?.colourTertiary || '#15182c',
            tooltip: localize('Executes a parallel double purchase for Over and Under legs simultaneously with selectable combo hedging presets.'),
            category: window.Blockly.Categories?.Before_Purchase || 'Before Purchase',
        };
    },
    meta() {
        return {
            display_name: localize('Over/Under Combo Bulk Purchase'),
            description: localize('Purchases Over and Under contract pairs in parallel.'),
        };
    },
    restricted_parents: ['before_purchase'],
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.over_under_combo_bulk = block => {
    const combo = block.getFieldValue('COMBO') || 'OV3_UN6';
    const code = `Bot.bulkComboPurchase('${combo}');\n`;
    return code;
};
