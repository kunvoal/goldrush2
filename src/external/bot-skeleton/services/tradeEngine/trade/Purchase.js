import { LogTypes } from '../../../constants/messages';
import { api_base } from '../../api/api-base';
import { contractStatus, info, log } from '../utils/broadcast';
import { doUntilDone, getUUID, recoverFromError, tradeOptionToBuy } from '../utils/helpers';
import { purchaseSuccessful } from './state/actions';
import { BEFORE_PURCHASE } from './state/constants';

let delayIndex = 0;
let purchase_reference;

export default Engine =>
    class Purchase extends Engine {
        purchase(contract_type) {
            // Prevent calling purchase twice
            if (this.store.getState().scope !== BEFORE_PURCHASE) {
                return Promise.resolve();
            }

            const onSuccess = response => {
                // Don't unnecessarily send a forget request for a purchased contract.
                const { buy } = response;

                contractStatus({
                    id: 'contract.purchase_received',
                    data: buy.transaction_id,
                    buy,
                });

                this.contractId = buy.contract_id;
                this.store.dispatch(purchaseSuccessful());

                if (this.is_proposal_subscription_required) {
                    this.renewProposalsOnPurchase();
                }

                delayIndex = 0;
                log(LogTypes.PURCHASE, { transaction_id: buy.transaction_id });
                info({
                    accountID: this.accountInfo.loginid,
                    totalRuns: this.updateAndReturnTotalRuns(),
                    transaction_ids: { buy: buy.transaction_id },
                    contract_type,
                    buy_price: buy.buy_price,
                });
            };

            if (this.is_proposal_subscription_required) {
                const { id, askPrice } = this.selectProposal(contract_type);

                const action = () => api_base.api.send({ buy: id, price: askPrice });

                this.isSold = false;

                contractStatus({
                    id: 'contract.purchase_sent',
                    data: askPrice,
                });

                if (!this.options.timeMachineEnabled) {
                    return doUntilDone(action).then(onSuccess);
                }

                return recoverFromError(
                    action,
                    (errorCode, makeDelay) => {
                        // if disconnected no need to resubscription (handled by live-api)
                        if (errorCode !== 'DisconnectError') {
                            this.renewProposalsOnPurchase();
                        } else {
                            this.clearProposals();
                        }

                        const unsubscribe = this.store.subscribe(() => {
                            const { scope, proposalsReady } = this.store.getState();
                            if (scope === BEFORE_PURCHASE && proposalsReady) {
                                makeDelay().then(() => this.observer.emit('REVERT', 'before'));
                                unsubscribe();
                            }
                        });
                    },
                    ['PriceMoved', 'InvalidContractProposal'],
                    delayIndex++
                ).then(onSuccess);
            }
            const trade_option = tradeOptionToBuy(contract_type, this.tradeOptions);
            const action = () => api_base.api.send(trade_option);

            this.isSold = false;

            contractStatus({
                id: 'contract.purchase_sent',
                data: this.tradeOptions.amount,
            });

            if (!this.options.timeMachineEnabled) {
                return doUntilDone(action).then(onSuccess);
            }

            return recoverFromError(
                action,
                (errorCode, makeDelay) => {
                    if (errorCode === 'DisconnectError') {
                        this.clearProposals();
                    }
                    const unsubscribe = this.store.subscribe(() => {
                        const { scope } = this.store.getState();
                        if (scope === BEFORE_PURCHASE) {
                            makeDelay().then(() => this.observer.emit('REVERT', 'before'));
                            unsubscribe();
                        }
                    });
                },
                ['PriceMoved', 'InvalidContractProposal'],
                delayIndex++
            ).then(onSuccess);
        }
        getPurchaseReference = () => purchase_reference;
        regeneratePurchaseReference = () => {
            purchase_reference = getUUID();
        };

        bulkPurchase(contract_type, targets, disableStacking = false) {
            if (this.store.getState().scope !== BEFORE_PURCHASE) {
                return Promise.resolve();
            }

            const rawList = Array.isArray(targets) ? targets : [targets];
            if (!rawList || !rawList.length) return Promise.resolve();

            if (!this.contractIds) this.contractIds = [];

            const tradeOptions = this.tradeOptions || {};
            const baseAmount = tradeOptions.amount || 1;
            const symbol = tradeOptions.symbol || '1HZ100V';
            const currency = tradeOptions.currency || 'USD';
            const duration = tradeOptions.duration || 1;
            const duration_unit = tradeOptions.duration_unit || 't';
            const basis = tradeOptions.basis || 'stake';

            this.isSold = false;

            const buyPromises = rawList.map((targetVal, idx) => {
                const stakeMultiplier = (!disableStacking && idx < 3) ? 3 : 1;
                const stake = baseAmount * stakeMultiplier;

                const buyPayload = {
                    buy: '1',
                    price: stake,
                    parameters: {
                        amount: stake,
                        basis,
                        contract_type,
                        currency,
                        duration,
                        duration_unit,
                        underlying_symbol: symbol,
                    },
                };
                if (targetVal !== undefined) {
                    buyPayload.parameters.barrier = String(targetVal);
                    buyPayload.parameters.selected_tick = String(targetVal);
                }

                contractStatus({
                    id: 'contract.purchase_sent',
                    data: stake,
                });

                const action = () => api_base.api.send(buyPayload);

                return doUntilDone(action).then(response => {
                    const { buy } = response;
                    this.contractId = buy.contract_id;
                    this.contractIds.push(buy.contract_id);

                    contractStatus({
                        id: 'contract.purchase_received',
                        data: buy.transaction_id,
                        buy,
                    });

                    log(LogTypes.PURCHASE, { transaction_id: buy.transaction_id });
                    info({
                        accountID: this.accountInfo ? this.accountInfo.loginid : '',
                        totalRuns: this.updateAndReturnTotalRuns(),
                        transaction_ids: { buy: buy.transaction_id },
                        contract_type,
                        buy_price: buy.buy_price,
                    });

                    api_base.api.send({ proposal_open_contract: 1, contract_id: buy.contract_id, subscribe: 1 });
                    return buy;
                });
            });

            return Promise.all(buyPromises).then(() => {
                this.store.dispatch(purchaseSuccessful());
            });
        }

        bulkComboPurchase(comboType) {
            if (this.store.getState().scope !== BEFORE_PURCHASE) {
                return Promise.resolve();
            }

            const comboMap = {
                AUDITED_APEX_OVER2_UNDER7_OVER4: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                ],
                AUDITED_TRI_WEDGE_ESCALATOR: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                ],
                AUDITED_SYMMETRICAL_OV3_UN6_OV4: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                ],
                AUDITED_QUAD_SNIPER_MATRIX: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                ],
                AUDITED_PARABOLIC_BARRICADE: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                ],
                AUDITED_BIMODAL_DIAMOND_CROSS: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                AUDITED_APEX_TWIN_TOWER: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                AUDITED_LOW_DIGIT_WEDGE: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_HIGH_DIGIT_SPIKE: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                ],
                AUDITED_ZERO_DEADZONE_FORTRESS: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                ],
                AUDITED_QUANTUM_CORE_DOUBLE: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                AUDITED_TWIN_196X_ZERO_RISK: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_OVER2_UNDER5_BRACKET: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_OVER4_UNDER7_BRACKET: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                AUDITED_TRIPLE_196X_SQUEEZE: [
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                ],
                AUDITED_OVER3_UNDER5_SQUEEZE: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_OVER4_UNDER6_SQUEEZE: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                AUDITED_OVER2_UNDER6_COMPOUNDER: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                AUDITED_OMNI_SPECTRUM_FORTRESS: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                ],
                AUDITED_CENTROID_CORE_STACK: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_PARABOLIC_UPPER_CASCADE: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                ],
                AUDITED_LOWER_TIER_BARRICADE: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                ],
                AUDITED_BIMODAL_DOUBLE_PRISM: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                ],
                AUDITED_LINEAR_MULTILEG_COMPOUNDER: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_DUAL_SQUEEZE_MULTIPLIER: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                ],
                AUDITED_HYPER_QUAD_PEAK: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_APEX_TRI_SECTOR_VAULT: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                ],
                AUDITED_QUANTUM_SUPER_SHIELD: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                AUDITED_ULTRA_245X_QUAD_SURGE: [
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                AUDITED_TRIPLE_196X_DOUBLE_LOCK: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                AUDITED_HYPER_LINEAR_ESCALATOR: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                ],
                AUDITED_DECA_TIER_SWEEP: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                AUDITED_PRISM_141X_FORTRESS: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                POWER_OVER3_UNDER6_DUAL_SPIKE: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                POWER_OVER2_UNDER7_VELOCITY_SHIELD: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                POWER_DUAL_APEX_OVER3_UNDER6: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                POWER_OVER4_UNDER5_PARITY_SQUEEZE: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                POWER_TRIPLE_POINT_OVER4_UNDER5: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                ],
                POWER_OVER2_ALPHA_SHIELD: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                ],
                OV3_UN6: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                OV2_UN7: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                OV4_UN5: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                OV1_UN8: [
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 1 },
                ],
                OV3_UN5: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
                OV4_UN6: [
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                OV2_UN6: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                OV3_UN7: [
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                ],
                V5_IMPERVIOUS_QUADRANT_TRAP: [
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 2 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 2 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                ],
                V5_ASYMMETRICAL_MULTIPLIER_ARBITRAGE: [
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 5 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 5 },
                    { contract_type: 'DIGITOVER', barrier: '6', weight: 1 },
                ],
                V5_SINGULARITY_CROSSFIRE: [
                    { contract_type: 'DIGITOVER', barrier: '0', weight: 4.5 },
                    { contract_type: 'DIGITUNDER', barrier: '9', weight: 4.5 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 2 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 2 },
                    { contract_type: 'DIGITOVER', barrier: '8', weight: 0.5 },
                    { contract_type: 'DIGITUNDER', barrier: '1', weight: 0.5 },
                ],
                V5_KINETIC_FREQUENCY_SHIFT: [
                    { contract_type: 'DIGITOVER', barrier: '0', weight: 2 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1.5 },
                    { contract_type: 'DIGITOVER', barrier: '5', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 1 },
                ],
                V5_INFINITY_LADDER: [
                    { contract_type: 'DIGITOVER', barrier: '0', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 2 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 2 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 0.5 },
                ],
                V5_COLD_DIGIT_EVACUATION: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1.5 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '9', weight: 1 },
                ],
                SUPER_APEX_MULTIPLIER_ARBITRAGE: [
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 0.5 },
                ],
                SUPER_SOVEREIGN_TIERED_PRISM: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 0.5 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 0.5 },
                ],
                SUPER_9X_EXTREME_SNIPER_GUARD: [
                    { contract_type: 'DIGITUNDER', barrier: '9', weight: 9 },
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 9 },
                    { contract_type: 'DIGITOVER', barrier: '8', weight: 1 },
                ],
                SUPER_CENTROID_VORTEX: [
                    { contract_type: 'DIGITOVER', barrier: '0', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '9', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 0.5 },
                ],
                SUPER_QUANTUM_SHIELD_COMPOUNDER: [
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 2.5 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 2.5 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                ],
                NOVEL_ZERO_DEADZONE_FORTRESS: [
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1 },
                ],
                NOVEL_ASYMMETRICAL_BARRICADE: [
                    { contract_type: 'DIGITOVER', barrier: '0', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '9', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1.5 },
                ],
                NOVEL_QUADRANT_BELL_CURVE: [
                    { contract_type: 'DIGITOVER', barrier: '1', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '3', weight: 1.5 },
                    { contract_type: 'DIGITUNDER', barrier: '6', weight: 1.5 },
                ],
                NOVEL_DYNAMIC_MEAN_SHIFT: [
                    { contract_type: 'DIGITOVER', barrier: '0', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 2 },
                    { contract_type: 'DIGITUNDER', barrier: '8', weight: 1 },
                ],
                NOVEL_CORNER_CROSSFIRE: [
                    { contract_type: 'DIGITOVER', barrier: '2', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '7', weight: 1 },
                    { contract_type: 'DIGITOVER', barrier: '4', weight: 1 },
                    { contract_type: 'DIGITUNDER', barrier: '5', weight: 1 },
                ],
            };

            const legs = comboMap[comboType] || comboMap.OV3_UN6;
            if (!this.contractIds) this.contractIds = [];

            const tradeOptions = this.tradeOptions || {};
            const baseAmount = tradeOptions.amount || 0.35;
            const symbol = tradeOptions.symbol || '1HZ100V';
            const currency = tradeOptions.currency || 'USD';
            const duration = tradeOptions.duration || 1;
            const duration_unit = tradeOptions.duration_unit || 't';
            const basis = tradeOptions.basis || 'stake';

            this.isSold = false;

            const buyPromises = legs.map(leg => {
                const legStake = Math.max(0.35, Math.round(baseAmount * (leg.weight || 1) * 100) / 100);
                const buyPayload = {
                    buy: '1',
                    price: legStake,
                    parameters: {
                        amount: legStake,
                        basis,
                        contract_type: leg.contract_type,
                        currency,
                        duration,
                        duration_unit,
                        underlying_symbol: symbol,
                        barrier: String(leg.barrier),
                    },
                };

                contractStatus({
                    id: 'contract.purchase_sent',
                    data: legStake,
                });

                const action = () => api_base.api.send(buyPayload);

                return doUntilDone(action).then(response => {
                    const { buy } = response;
                    this.contractId = buy.contract_id;
                    this.contractIds.push(buy.contract_id);

                    contractStatus({
                        id: 'contract.purchase_received',
                        data: buy.transaction_id,
                        buy,
                    });

                    log(LogTypes.PURCHASE, { transaction_id: buy.transaction_id });
                    info({
                        accountID: this.accountInfo ? this.accountInfo.loginid : '',
                        totalRuns: this.updateAndReturnTotalRuns(),
                        transaction_ids: { buy: buy.transaction_id },
                        contract_type: leg.contract_type,
                        buy_price: buy.buy_price,
                    });

                    api_base.api.send({ proposal_open_contract: 1, contract_id: buy.contract_id, subscribe: 1 });
                    return buy;
                });
            });

            return Promise.all(buyPromises).then(() => {
                this.store.dispatch(purchaseSuccessful());
            });
        }
    };
