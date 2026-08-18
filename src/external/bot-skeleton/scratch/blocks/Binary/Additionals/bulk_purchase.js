import { localize } from '@deriv-com/translations';
import { getContractTypeOptions } from '../../../shared';
import { excludeOptionFromContextMenu, modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.bulk_purchase = {
    init() {
        this.jsonInit(this.definition());
        this.setNextStatement(false);
    },
    definition() {
        return {
            message0: localize('Bulk Parallel Purchase %1 Targets: %2 (3x Stake Top 3: %3)', [
                '%1',
                '%2',
                '%3',
            ]),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PURCHASE_LIST',
                    options: [['', '']],
                },
                {
                    type: 'input_value',
                    name: 'TARGETS',
                },
                {
                    type: 'field_checkbox',
                    name: 'STACK_TOP3',
                    checked: false,
                },
            ],
            previousStatement: null,
            colour: window.Blockly.Colours?.Special1?.colour || '#2a3052',
            colourSecondary: window.Blockly.Colours?.Special1?.colourSecondary || '#1f2440',
            colourTertiary: window.Blockly.Colours?.Special1?.colourTertiary || '#15182c',
            tooltip: localize('Purchases N contracts in parallel per tick for all targets in an array (e.g. Top 4-7). Check 3x Stake Top 3 for SLT multiplier.'),
            category: window.Blockly.Categories?.Before_Purchase || 'Before Purchase',
        };
    },
    meta() {
        return {
            display_name: localize('Bulk Parallel Purchase'),
            description: localize('Purchases N contracts in parallel per tick based on dynamic target array.'),
            key_words: localize('buy, bulk, parallel'),
        };
    },
    onchange(event) {
        if (!this.workspace || window.Blockly?.derivWorkspace?.isFlyoutVisible || this.workspace.isDragging()) {
            return;
        }

        if (event.type === window.Blockly.Events.BLOCK_CREATE && event.ids.includes(this.id)) {
            this.populatePurchaseList(event);
        } else if (event.type === window.Blockly.Events.BLOCK_CHANGE) {
            if (event.name === 'TYPE_LIST' || event.name === 'TRADETYPE_LIST') {
                this.populatePurchaseList(event);
            }
        } else if (event.type === window.Blockly.Events.BLOCK_DRAG && !event.isStart && event.blockId === this.id) {
            const purchase_type_list = this.getField('PURCHASE_LIST');
            if (purchase_type_list) {
                const purchase_options = purchase_type_list.menuGenerator_;
                if (purchase_options && purchase_options[0] && purchase_options[0][0] === '') {
                    this.populatePurchaseList(event);
                }
            }
        }
    },
    populatePurchaseList(event) {
        const trade_definition_block = this.workspace.getTradeDefinitionBlock();
        if (trade_definition_block) {
            const trade_type_block = trade_definition_block.getChildByType('trade_definition_tradetype');
            const trade_type = trade_type_block ? trade_type_block.getFieldValue('TRADETYPE_LIST') : 'matchesdiffers';
            const contract_type_block = trade_definition_block.getChildByType('trade_definition_contracttype');
            const contract_type = contract_type_block ? contract_type_block.getFieldValue('TYPE_LIST') : 'both';
            const purchase_type_list = this.getField('PURCHASE_LIST');
            if (purchase_type_list) {
                const purchase_type = purchase_type_list.getValue();
                const contract_type_options = getContractTypeOptions(contract_type, trade_type);
                purchase_type_list.updateOptions(contract_type_options, {
                    default_value: purchase_type || (contract_type_options[0] ? contract_type_options[0][1] : 'DIGITMATCH'),
                    event_group: event?.group,
                    should_pretend_empty: true,
                });
            }
        }
    },
    customContextMenu(menu) {
        const menu_items = [localize('Enable Block'), localize('Disable Block')];
        excludeOptionFromContextMenu(menu, menu_items);
        modifyContextMenu(menu);
    },
    restricted_parents: ['before_purchase'],
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.bulk_purchase = block => {
    const purchaseList = block.getFieldValue('PURCHASE_LIST') || 'DIGITMATCH';
    const targets = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block,
        'TARGETS',
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '1';
    const stackTop3 = block.getFieldValue('STACK_TOP3') === 'TRUE';
    const disableStacking = !stackTop3;

    const code = `Bot.bulkPurchase('${purchaseList}', ${targets}, ${disableStacking});\n`;
    return code;
};
