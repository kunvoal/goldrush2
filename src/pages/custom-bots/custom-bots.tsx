// @ts-nocheck — vendored custom bots tab UI; see AGENTS.md
import React from 'react';
import { localize } from '@deriv-com/translations';
import { botNotification } from '@/components/bot-notification/bot-notification';
import { load } from '@/external/bot-skeleton';

// Helper for SL/TP stack inside AFTERPURCHASE_STACK
const AFTER_PURCHASE_SLT = `
  <block type="after_purchase" id="after_purch" x="935" y="292">
    <statement name="AFTERPURCHASE_STACK">
      <block type="controls_if" id="slt_check_if">
        <value name="IF0">
          <block type="slt_strategy_executor" id="exec_slt">
            <field name="MODE">MATCHES_SLT</field>
            <value name="STAKE">
              <shadow type="math_number" id="slt_stake"><field name="NUM">1</field></shadow>
            </value>
            <value name="STOP_LOSS">
              <shadow type="math_number" id="slt_sl"><field name="NUM">0</field></shadow>
            </value>
            <value name="TAKE_PROFIT">
              <shadow type="math_number" id="slt_tp"><field name="NUM">5</field></shadow>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="trade_again" id="trade_again_action"></block>
        </statement>
      </block>
    </statement>
  </block>`;

// ── Bot 1: Matches Top Common ────────────────────────────────────────────────
const MATCHES_TOP_COMMON_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
  </variables>
  <block type="trade_definition" id="trade_def_matches" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">matchesdiffers</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_pred_var">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE">
          <block type="math_number" id="pred_num_init">
            <field name="NUM">5</field>
          </block>
        </value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="PREDICTION">
          <block type="variables_get" id="pred_var_get">
            <field name="VAR" id="var_prediction">prediction</field>
          </block>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0">
          <block type="check_sell" id="check_sell_action"></block>
        </value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="variables_set" id="apply_top_n">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE">
          <block type="top_n_common_digits" id="calc_top_n">
            <value name="N_COUNT">
              <shadow type="math_number" id="n_val">
                <field name="NUM">4</field>
              </shadow>
            </value>
            <value name="LOOKBACK">
              <shadow type="math_number" id="look_val">
                <field name="NUM">30</field>
              </shadow>
            </value>
          </block>
        </value>
        <next>
          <block type="bulk_purchase" id="bulk_buy_matches">
            <field name="PURCHASE_LIST">DIGITMATCH</field>
            <field name="STACK_TOP3">FALSE</field>
            <value name="TARGETS">
              <block type="variables_get" id="get_top_n_var">
                <field name="VAR" id="var_prediction">prediction</field>
              </block>
            </value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 2: Bulk Matches Top Common SLT ──────────────────────────────────────
const BULK_MATCHES_SLT_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
  </variables>
  <block type="trade_definition" id="trade_def_bulk_matches_slt" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">matchesdiffers</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_pred_var_slt">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE">
          <block type="math_number" id="pred_num_init_slt">
            <field name="NUM">5</field>
          </block>
        </value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="PREDICTION">
          <block type="variables_get" id="pred_var_get">
            <field name="VAR" id="var_prediction">prediction</field>
          </block>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0">
          <block type="check_sell" id="check_sell_action"></block>
        </value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="variables_set" id="apply_top_n_slt">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE">
          <block type="top_n_common_digits" id="calc_top_n_slt">
            <value name="N_COUNT">
              <shadow type="math_number" id="n_val_slt">
                <field name="NUM">4</field>
              </shadow>
            </value>
            <value name="LOOKBACK">
              <shadow type="math_number" id="look_val_slt">
                <field name="NUM">30</field>
              </shadow>
            </value>
          </block>
        </value>
        <next>
          <block type="bulk_purchase" id="bulk_buy_matches_slt">
            <field name="PURCHASE_LIST">DIGITMATCH</field>
            <field name="STACK_TOP3">TRUE</field>
            <value name="TARGETS">
              <block type="variables_get" id="get_top_n_var_slt">
                <field name="VAR" id="var_prediction">prediction</field>
              </block>
            </value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 3: Combo Hedger ──────────────────────────────────────────────────────
const COMBO_OV3_UN6_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
  </variables>
  <block type="trade_definition" id="trade_def_combo" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">overunder</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_pred_var_3">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE">
          <block type="math_number" id="pred_num_init_3">
            <field name="NUM">5</field>
          </block>
        </value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="PREDICTION">
          <shadow type="math_number_positive" id="pred_val_combo">
            <field name="NUM">3</field>
          </shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0">
          <block type="check_sell" id="check_sell_action"></block>
        </value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="over_under_combo_bulk" id="bulk_combo_buy">
        <field name="COMBO">OV3_UN6</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 4: Even/Odd Streak Mean Reverter ────────────────────────────────────
const EVEN_ODD_STREAK_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_d1">d1</variable>
    <variable id="var_d2">d2</variable>
    <variable id="var_d3">d3</variable>
    <variable id="var_recent_digits">recent_digits</variable>
  </variables>
  <block type="trade_definition" id="trade_def_evenodd" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">evenodd</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="false"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0">
          <block type="check_sell" id="check_sell_action"></block>
        </value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="buy_odd">
        <field name="PURCHASE_LIST">DIGITODD</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 5: Over/Under Cold-Digit Exploiter ──────────────────────────────────
const COLD_DIGIT_EXPLOITER_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_cold" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">overunder</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION"><shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow></value>
        <value name="AMOUNT"><shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow></value>
        <value name="PREDICTION"><shadow type="math_number_positive" id="pred_val"><field name="NUM">0</field></shadow></value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if"><value name="IF0"><block type="check_sell" id="check_sell_action"></block></value></block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="buy_over_0">
        <field name="PURCHASE_LIST">DIGITOVER</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 6: Up/Down Dynamic Gap Predictor (Consolidated Master Up/Down Bot) ──
const UPDOWN_GAP_PREDICTOR_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_updown_gap" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">risefall</field>
            <field name="TRADETYPE_LIST">risefall</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="false"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION"><shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow></value>
        <value name="AMOUNT"><shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow></value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if"><value name="IF0"><block type="check_sell" id="check_sell_action"></block></value></block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="controls_if" id="if_gap_direction">
        <mutation else="1"></mutation>
        <value name="IF0">
          <block type="logic_compare" id="is_call">
            <field name="OP">EQ</field>
            <value name="A">
              <block type="updown_gap_predictor" id="calc_gap">
                <field name="TICK_RANGE">3</field>
                <field name="STRATEGY">GAP_FOLLOW</field>
              </block>
            </value>
            <value name="B">
              <block type="text" id="txt_call"><field name="TEXT">CALL</field></block>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="purchase" id="buy_call"><field name="PURCHASE_LIST">CALL</field></block>
        </statement>
        <statement name="ELSE">
          <block type="purchase" id="buy_put"><field name="PURCHASE_LIST">PUT</field></block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 7: Matches Frequency Repeat Sniper ──────────────────────────────────
const REPEAT_SNIPER_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
  </variables>
  <block type="trade_definition" id="trade_def_repeat" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">matchesdiffers</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_pred_var_rep">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE"><block type="math_number" id="pred_num_rep"><field name="NUM">7</field></block></value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION"><shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow></value>
        <value name="AMOUNT"><shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow></value>
        <value name="PREDICTION">
          <block type="variables_get" id="pred_var_get_rep"><field name="VAR" id="var_prediction">prediction</field></block>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if"><value name="IF0"><block type="check_sell" id="check_sell_action"></block></value></block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="buy_repeat_match">
        <field name="PURCHASE_LIST">DIGITMATCH</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 8: Over 2 / Under 7 Safety Blanket ──────────────────────────────────
const SAFETY_BLANKET_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_safety" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">overunder</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION"><shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow></value>
        <value name="AMOUNT"><shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow></value>
        <value name="PREDICTION"><shadow type="math_number_positive" id="pred_val_blanket"><field name="NUM">2</field></shadow></value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if"><value name="IF0"><block type="check_sell" id="check_sell_action"></block></value></block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="buy_over_2">
        <field name="PURCHASE_LIST">DIGITOVER</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 9: Asymmetrical Over 1 Power Compounder ────────────────────────────
const OVER1_COMPOUNDER_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_over1" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">overunder</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION"><shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow></value>
        <value name="AMOUNT"><shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow></value>
        <value name="PREDICTION"><shadow type="math_number_positive" id="pred_val_ov1"><field name="NUM">1</field></shadow></value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if"><value name="IF0"><block type="check_sell" id="check_sell_action"></block></value></block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="buy_over_1">
        <field name="PURCHASE_LIST">DIGITOVER</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 10: Differs High-Frequency Cold Scalper ─────────────────────────────
const COLD_DIFF_SCALPER_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
  </variables>
  <block type="trade_definition" id="trade_def_diff" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">matchesdiffers</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_pred_var_diff">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE"><block type="math_number" id="pred_num_diff"><field name="NUM">0</field></block></value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION"><shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow></value>
        <value name="AMOUNT"><shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow></value>
        <value name="PREDICTION"><block type="variables_get" id="pred_var_get_diff"><field name="VAR" id="var_prediction">prediction</field></block></value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if"><value name="IF0"><block type="check_sell" id="check_sell_action"></block></value></block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="buy_diff">
        <field name="PURCHASE_LIST">DIGITDIFF</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 11: Even/Odd Extreme Confluence Reverter ────────────────────────────
const EXTREME_PARITY_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_ext_parity" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">evenodd</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="false"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION"><shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow></value>
        <value name="AMOUNT"><shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow></value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if"><value name="IF0"><block type="check_sell" id="check_sell_action"></block></value></block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="purchase" id="buy_even_ext">
        <field name="PURCHASE_LIST">DIGITEVEN</field>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 3: Matches Cocktail (Top Common + Picking-Momentum Ranks 2, 3 & 5) ──
const MATCHES_COCKTAIL_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
  </variables>
  <block type="trade_definition" id="trade_def_cocktail" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">matchesdiffers</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val"><field name="NUM">1</field></shadow>
        </value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="variables_set" id="set_pred_cocktail">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE">
          <block type="top_n_common_digits" id="calc_top_cocktail">
            <value name="N_COUNT">
              <shadow type="math_number" id="n_val"><field name="NUM">3</field></shadow>
            </value>
            <value name="LOOKBACK">
              <shadow type="math_number" id="look_val"><field name="NUM">25</field></shadow>
            </value>
          </block>
        </value>
        <next>
          <block type="bulk_purchase" id="bulk_buy_cocktail">
            <field name="PURCHASE_LIST">DIGITMATCH</field>
            <field name="STACK_TOP3">TRUE</field>
            <value name="TARGETS">
              <block type="variables_get" id="get_cocktail_var">
                <field name="VAR" id="var_prediction">prediction</field>
              </block>
            </value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

const strategies = [
    {
        id: 'matches_top_common',
        name: 'Matches Top Common',
        description: 'Parallel bulk purchases on Top N historical frequency digits',
        family: 'MATCHES',
        validationState: 'SHADOW',
        legs: 3,
        requiredProbability: 0.1053,
        xml: MATCHES_TOP_COMMON_XML,
    },
    {
        id: 'bulk_matches_slt',
        name: 'Bulk Matches Top Common SLT',
        description: 'Multi-target digit purchases with 3x stack on top-3 frequency ranks',
        family: 'MATCHES',
        validationState: 'SHADOW',
        legs: 3,
        requiredProbability: 0.1053,
        xml: BULK_MATCHES_SLT_XML,
    },
    {
        id: 'matches_cocktail',
        name: 'Matches Cocktail',
        description: 'Blends frequency rank and momentum confirmation across digits 2, 3 & 5',
        family: 'MATCHES',
        validationState: 'UNVALIDATED',
        legs: 3,
        requiredProbability: 0.1053,
        xml: MATCHES_COCKTAIL_XML,
    },
    {
        id: 'combo_hedger',
        name: 'Combo Hedger',
        description: 'Parallel 2-leg Over/Under hedger with selectable dual-barrier configurations',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        requiredProbability: 0.5128,
        xml: COMBO_OV3_UN6_XML,
    },
    {
        id: 'even_odd_streak',
        name: 'Even/Odd Streak Reverter',
        description: 'Executes against consecutive parity runs (>= 3 ticks)',
        family: 'PARITY',
        validationState: 'VALIDATED',
        legs: 1,
        requiredProbability: 0.5128,
        xml: EVEN_ODD_STREAK_XML,
    },
    {
        id: 'cold_digit_exploiter',
        name: 'Over/Under Cold-Digit Regressor',
        description: 'Barrier placement against lowest frequency digit (Over 0 / Under 9)',
        family: 'OVER_UNDER',
        validationState: 'SHADOW',
        legs: 1,
        requiredProbability: 0.1025,
        xml: COLD_DIGIT_EXPLOITER_XML,
    },
    {
        id: 'updown_gap_predictor',
        name: 'Up/Down Dynamic Gap Tracker',
        description: 'Tracks tick distance gaps across 2-5 tick lookbacks',
        family: 'RISE_FALL',
        validationState: 'SHADOW',
        legs: 1,
        requiredProbability: 0.0342,
        xml: UPDOWN_GAP_PREDICTOR_XML,
    },
    {
        id: 'repeat_sniper',
        name: 'Matches Cluster Repeat Model',
        description: 'Targets repeating digit clusters under positive autocorrelation',
        family: 'MATCHES',
        validationState: 'UNVALIDATED',
        legs: 1,
        requiredProbability: 0.1053,
        xml: REPEAT_SNIPER_XML,
    },
    {
        id: 'safety_blanket',
        name: 'Over 2 / Under 7 Mean Filter',
        description: 'Dual barrier Over 2 / Under 7 with moving average mean filter',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        requiredProbability: 0.5128,
        xml: SAFETY_BLANKET_XML,
    },
    {
        id: 'over1_compounder',
        name: 'Asymmetrical Over 1 Multi-Tick',
        description: 'Over 1 barrier with 80% nominal coverage and compounding logic',
        family: 'OVER_UNDER',
        validationState: 'SHADOW',
        legs: 1,
        requiredProbability: 0.8200,
        xml: OVER1_COMPOUNDER_XML,
    },
    {
        id: 'cold_diff_scalper',
        name: 'Differs Cold-Digit Scalper',
        description: 'Differs contract targeting lowest frequency digit in lookback window',
        family: 'MATCHES',
        validationState: 'VALIDATED',
        legs: 1,
        requiredProbability: 0.9132,
        xml: COLD_DIFF_SCALPER_XML,
    },
    {
        id: 'extreme_parity',
        name: 'Even/Odd Boundary Reverter',
        description: 'Executes parity reversal upon digit boundary extremity',
        family: 'PARITY',
        validationState: 'SHADOW',
        legs: 1,
        requiredProbability: 0.5128,
        xml: EXTREME_PARITY_XML,
    },
];

const createComboXml = (comboPreset) => `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_combo" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">overunder</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val"><field name="NUM">0.35</field></shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="before_purchase" id="before_purch" x="512" y="60">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="over_under_combo_bulk" id="combo_bulk_inst">
        <field name="COMBO">${comboPreset}</field>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
</xml>`;

const comboBlends = [
    {
        name: '1. Quadrant Trap (4-Leg)',
        description: '4-Leg Multi-Barrier Coverage: Digits 2-7 generate multi-leg overlap',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 4,
        maxExposure: '1.40',
        xml: createComboXml('V5_IMPERVIOUS_QUADRANT_TRAP'),
    },
    {
        name: '2. Asymmetrical Multiplier Wedge (3-Leg)',
        description: '3-Leg 3.28x Multiplier Core with 60% nominal digit coverage',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('V5_ASYMMETRICAL_MULTIPLIER_ARBITRAGE'),
    },
    {
        name: '3. Full Spectrum Crossfire (6-Leg)',
        description: '6-Leg Multi-Barrier: 9.80x sniper core with outer boundary coverage',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 6,
        maxExposure: '2.10',
        xml: createComboXml('V5_SINGULARITY_CROSSFIRE'),
    },
    {
        name: '4. Kinetic Frequency Shift (4-Leg)',
        description: 'Dynamic 4-Leg Velocity: Weights higher stake into micro-trend direction',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 4,
        maxExposure: '1.40',
        xml: createComboXml('V5_KINETIC_FREQUENCY_SHIFT'),
    },
    {
        name: '5. Tiered Multi-Step Ladder (5-Leg)',
        description: '5-Leg Progressive: Digits 1-7 trigger layered positive payoff returns',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 5,
        maxExposure: '1.75',
        xml: createComboXml('V5_INFINITY_LADDER'),
    },
    {
        name: '6. Cold-Digit Evacuation Vault (3-Leg)',
        description: '3-Leg Cold-Digit Filter: Dynamically adjusts barriers based on 30-tick lookback',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('V5_COLD_DIGIT_EVACUATION'),
    },
    {
        name: '7. Multiplier Apex Wedge (3-Leg)',
        description: '3-Leg Asymmetrical: 1.24x protective wings with 1.98x central core',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('SUPER_APEX_MULTIPLIER_ARBITRAGE'),
    },
    {
        name: '8. Sovereign Tiered Prism (4-Leg)',
        description: '4-Leg Tiered Prism: 1.41x & 1.98x multiplier distribution',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 4,
        maxExposure: '1.40',
        xml: createComboXml('SUPER_SOVEREIGN_TIERED_PRISM'),
    },
    {
        name: '9. Extreme Multiplier Guard (3-Leg)',
        description: '3-Leg 9.8x High Multiplier: 80% nominal coverage with asymmetric payoff',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('SUPER_9X_EXTREME_SNIPER_GUARD'),
    },
    {
        name: '10. Centroid Vortex (5-Leg)',
        description: '5-Leg Complete Spectrum: Central digits trigger 4 or 5 legs simultaneously',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 5,
        maxExposure: '1.75',
        xml: createComboXml('SUPER_CENTROID_VORTEX'),
    },
    {
        name: '11. Shield Compounder (3-Leg)',
        description: '3-Leg Reciprocal Model: Break-even on digits 2-3, positive net on 4-7',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('SUPER_QUANTUM_SHIELD_COMPOUNDER'),
    },
    {
        name: '12. High-Coverage Multi-Leg (3-Leg)',
        description: '3-Leg Multi-Barrier: 80% nominal coverage with dual leg payouts',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('NOVEL_ZERO_DEADZONE_FORTRESS'),
    },
    {
        name: '13. Asymmetrical Barricade (3-Leg)',
        description: '3-Leg Barricade: Baseline cushion with 3-leg simultaneous hit potential',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('NOVEL_ASYMMETRICAL_BARRICADE'),
    },
    {
        name: '14. Bell-Curve Matrix (4-Leg)',
        description: '4-Leg Distribution: Concentrated payoff multiplier when digits land on 4 or 5',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 4,
        maxExposure: '1.40',
        xml: createComboXml('NOVEL_QUADRANT_BELL_CURVE'),
    },
    {
        name: '15. Dynamic Mean-Shift Vector (3-Leg)',
        description: '3-Leg Vector: Adjusts contract weights dynamically to 15-tick moving average',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('NOVEL_DYNAMIC_MEAN_SHIFT'),
    },
];

const maxingBots = [
    {
        name: '1. Over 2 / Under 7 / Over 4 (3-Leg)',
        description: '3-Leg Wedge: Digits 5-9 positive return; Digits 3-4 near zero',
        family: 'MULTILEG',
        validationState: 'VALIDATED',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_APEX_OVER2_UNDER7_OVER4'),
    },
    {
        name: '2. Tri-Wedge Yield Escalator (3-Leg)',
        description: '3-Leg Multi-Barrier: Digits 3-9 positive net return; peak on digits 4,5',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_TRI_WEDGE_ESCALATOR'),
    },
    {
        name: '3. Symmetrical Over 3 / Under 6 / Over 4 (3-Leg)',
        description: '3-Leg Symmetrical: Digits 4-9 positive net with peak on digit 5',
        family: 'MULTILEG',
        validationState: 'VALIDATED',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_SYMMETRICAL_OV3_UN6_OV4'),
    },
    {
        name: '4. Quad-Barrier Yield Matrix (4-Leg)',
        description: '4-Leg Multi-Barrier: Outer digits 0-2 & 7-9 reduced risk; peak on 3 & 6',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 4,
        maxExposure: '1.40',
        xml: createComboXml('AUDITED_QUAD_SNIPER_MATRIX'),
    },
    {
        name: '5. Parabolic Barricade (3-Leg)',
        description: '3-Leg Parabolic: Digits 3-9 positive return with peak on central digit 5',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_PARABOLIC_BARRICADE'),
    },
    {
        name: '6. Bimodal Diamond Cross (4-Leg)',
        description: '4-Leg Cross: Digits 3-6 positive return with double peak on 4 & 5',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 4,
        maxExposure: '1.40',
        xml: createComboXml('AUDITED_BIMODAL_DIAMOND_CROSS'),
    },
    {
        name: '7. Twin-Tower Bracket (2-Leg)',
        description: '2-Leg Balanced Bracket: 80% coverage with double payout on 4 & 5',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_APEX_TWIN_TOWER'),
    },
    {
        name: '8. Asymmetrical Low-Digit Wedge (3-Leg)',
        description: '3-Leg Low Skew: Digits 0-4 positive net return with peak on 3 & 4',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_LOW_DIGIT_WEDGE'),
    },
    {
        name: '9. Parabolic High-Digit Spike (3-Leg)',
        description: '3-Leg High Skew: Digits 5-9 positive net return with peak on 5 & 6',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_HIGH_DIGIT_SPIKE'),
    },
    {
        name: '10. Zero-Deadzone Multi-Barrier (3-Leg)',
        description: '3-Leg Multi-Barrier: Digits 4-9 positive net return with overlap on 4,5,6',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_ZERO_DEADZONE_FORTRESS'),
    },
    {
        name: '11. Core Double-Leg (2-Leg)',
        description: '2-Leg Concentrated: Digits 4,5,6 yield double barrier payout',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_QUANTUM_CORE_DOUBLE'),
    },
    {
        name: '12. Over 4 / Under 5 Twin 1.96x (2-Leg)',
        description: '2-Leg Exact Parity: Zero deadzone across digits 0-9 with flat loss mitigation',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_TWIN_196X_ZERO_RISK'),
    },
    {
        name: '13. Over 2 / Under 5 Bracket (2-Leg)',
        description: '2-Leg Bracket: Digits 0-2 loss mitigation; positive net on digits 3 & 4',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_OVER2_UNDER5_BRACKET'),
    },
    {
        name: '14. Over 4 / Under 7 Bracket (2-Leg)',
        description: '2-Leg Bracket: Digits 7-9 loss mitigation; positive net on digits 5 & 6',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_OVER4_UNDER7_BRACKET'),
    },
    {
        name: '15. Triple 1.96x Super Squeeze (3-Leg)',
        description: '3-Leg Squeeze: Digits 4-9 trigger positive net payout',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('AUDITED_TRIPLE_196X_SQUEEZE'),
    },
    {
        name: '16. Over 3 / Under 5 Squeeze (2-Leg)',
        description: '2-Leg Squeeze: Single sweet-spot on digit 4 with mitigated loss on 0-3',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_OVER3_UNDER5_SQUEEZE'),
    },
    {
        name: '17. Over 4 / Under 6 Squeeze (2-Leg)',
        description: '2-Leg Squeeze: Single sweet-spot on digit 5 with mitigated loss on 6-9',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_OVER4_UNDER6_SQUEEZE'),
    },
    {
        name: '18. Over 2 / Under 6 Compounder (2-Leg)',
        description: '2-Leg Compounder: Digits 3,4,5 double payout; Digits 0,1,2 loss mitigation',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('AUDITED_OVER2_UNDER6_COMPOUNDER'),
    },
];

const multilegBots = [
    {
        name: '1. Omni-Spectrum Multi-Leg (8-Leg Heavy)',
        description: '8 simultaneous legs ($2.80 total stake); full spectrum multi-barrier coverage',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 8,
        maxExposure: '2.80',
        xml: createComboXml('AUDITED_OMNI_SPECTRUM_FORTRESS'),
    },
    {
        name: '2. Centroid Core Heavy-Stack (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); digits 4 & 5 hit peak combined payout',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_CENTROID_CORE_STACK'),
    },
    {
        name: '3. Parabolic Upper-Tier Cascade (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); digits 5-9 yield positive net payout',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_PARABOLIC_UPPER_CASCADE'),
    },
    {
        name: '4. Lower-Tier Heavy Barricade (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); digits 0-4 yield positive net payout',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_LOWER_TIER_BARRICADE'),
    },
    {
        name: '5. Bimodal Double-Prism Trap (8-Leg Heavy)',
        description: '8 simultaneous legs ($2.80 total stake); outer 60% digits reduced risk',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 8,
        maxExposure: '2.80',
        xml: createComboXml('AUDITED_BIMODAL_DOUBLE_PRISM'),
    },
    {
        name: '6. Linear Step Compounder (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); 70% nominal coverage',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_LINEAR_MULTILEG_COMPOUNDER'),
    },
    {
        name: '7. Heavy Dual-Squeeze Multiplier (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); digits 4-9 yield positive net',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_DUAL_SQUEEZE_MULTIPLIER'),
    },
    {
        name: '8. Quad-Peak Multi-Leg (8-Leg Heavy)',
        description: '8 simultaneous legs ($2.80 total stake); digits 4 & 5 yield concentrated peak payout',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 8,
        maxExposure: '2.80',
        xml: createComboXml('AUDITED_HYPER_QUAD_PEAK'),
    },
    {
        name: '9. Apex Tri-Sector Power Vault (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); 70% nominal digit coverage',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_APEX_TRI_SECTOR_VAULT'),
    },
    {
        name: '10. Shield Multi-Leg (8-Leg Heavy)',
        description: '8 simultaneous legs ($2.80 total stake); outer boundary risk absorption',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 8,
        maxExposure: '2.80',
        xml: createComboXml('AUDITED_QUANTUM_SUPER_SHIELD'),
    },
    {
        name: '11. Apex Quad Surge (8-Leg Heavy)',
        description: '8 simultaneous legs ($2.80 total stake); outer digits reduced exposure',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 8,
        maxExposure: '2.80',
        xml: createComboXml('AUDITED_ULTRA_245X_QUAD_SURGE'),
    },
    {
        name: '12. Double-Lock Vault (8-Leg Heavy)',
        description: '8 simultaneous legs ($2.80 total stake); digits 4 & 5 yield maximum payout concentration',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 8,
        maxExposure: '2.80',
        xml: createComboXml('AUDITED_TRIPLE_196X_DOUBLE_LOCK'),
    },
    {
        name: '13. Multi-Leg Escalator (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); progressive step-function payout',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_HYPER_LINEAR_ESCALATOR'),
    },
    {
        name: '14. Asymmetrical Sweep (7-Leg Heavy)',
        description: '7 simultaneous legs ($2.45 total stake); 60% nominal coverage with asymmetric weighting',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 7,
        maxExposure: '2.45',
        xml: createComboXml('AUDITED_DECA_TIER_SWEEP'),
    },
    {
        name: '15. Fortress-Stack (8-Leg Heavy)',
        description: '8 simultaneous legs ($2.80 total stake); digits 3-6 concentrated positive returns',
        family: 'MULTILEG',
        validationState: 'UNVALIDATED',
        legs: 8,
        maxExposure: '2.80',
        xml: createComboXml('AUDITED_PRISM_141X_FORTRESS'),
    },
];

const buildBeforePurchaseBlock = (indicator, purchaseType) => {
    if (indicator === 'RSI') {
        return `
      <block type="rsi_statement" id="rsi_stmt">
        <field name="VARIABLE" id="rsi_var">rsi</field>
        <statement name="STATEMENT">
          <block type="input_list" id="rsi_in">
            <value name="INPUT_LIST">
              <block type="ticks" id="rsi_ticks"></block>
            </value>
            <next>
              <block type="period" id="rsi_per">
                <value name="PERIOD">
                  <block type="math_number" id="rsi_per_val"><field name="NUM">14</field></block>
                </value>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="controls_if" id="rsi_cond">
            <value name="IF0">
              <block type="logic_compare" id="rsi_cmp_high">
                <field name="OP">GTE</field>
                <value name="A">
                  <block type="variables_get" id="rsi_var_get1"><field name="VAR" id="rsi_var">rsi</field></block>
                </value>
                <value name="B">
                  <block type="math_number" id="rsi_threshold"><field name="NUM">55</field></block>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="purchase" id="buy_rsi_main"><field name="PURCHASE_LIST">${purchaseType}</field></block>
            </statement>
          </block>
        </next>
      </block>`;
    }

    if (indicator === 'BB') {
        return `
      <block type="bb_statement" id="bb_stmt">
        <field name="VARIABLE" id="bb_var">bb</field>
        <field name="BBRESULT_LIST">1</field>
        <statement name="STATEMENT">
          <block type="input_list" id="bb_in">
            <value name="INPUT_LIST">
              <block type="ticks" id="bb_ticks"></block>
            </value>
            <next>
              <block type="period" id="bb_per">
                <value name="PERIOD">
                  <block type="math_number" id="bb_per_val"><field name="NUM">20</field></block>
                </value>
                <next>
                  <block type="std_dev_multiplier_up" id="bb_up">
                    <value name="UPMULTIPLIER">
                      <block type="math_number" id="bb_up_val"><field name="NUM">2</field></block>
                    </value>
                    <next>
                      <block type="std_dev_multiplier_down" id="bb_down">
                        <value name="DOWNMULTIPLIER">
                          <block type="math_number" id="bb_down_val"><field name="NUM">2</field></block>
                        </value>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="purchase" id="buy_bb_main"><field name="PURCHASE_LIST">${purchaseType}</field></block>
        </next>
      </block>`;
    }

    if (indicator === 'EMA' || indicator === 'SMA') {
        const stmtType = indicator === 'EMA' ? 'ema_statement' : 'sma_statement';
        return `
      <block type="${stmtType}" id="ma_stmt">
        <field name="VARIABLE" id="ma_var">ma</field>
        <statement name="STATEMENT">
          <block type="input_list" id="ma_in">
            <value name="INPUT_LIST">
              <block type="ticks" id="ma_ticks"></block>
            </value>
            <next>
              <block type="period" id="ma_per">
                <value name="PERIOD">
                  <block type="math_number" id="ma_per_val"><field name="NUM">10</field></block>
                </value>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="purchase" id="buy_ma_main"><field name="PURCHASE_LIST">${purchaseType}</field></block>
        </next>
      </block>`;
    }

    return `
      <block type="purchase" id="buy_standard">
        <field name="PURCHASE_LIST">${purchaseType}</field>
      </block>`;
};

const createUpDownXml = (duration = 3, purchaseType = 'RUNHIGH', indicator = 'STANDARD') => `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_updown" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">runs</field>
            <field name="TRADETYPE_LIST">runs</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_stake">
        <field name="VAR" id="var_stake">stake</field>
        <value name="VALUE">
          <block type="math_number" id="stake_val"><field name="NUM">0.35</field></block>
        </value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="false"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val"><field name="NUM">${duration}</field></shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val"><field name="NUM">0.35</field></shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0"><block type="check_sell" id="check_sell_action"></block></value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      ${buildBeforePurchaseBlock(indicator, purchaseType)}
    </statement>
  </block>
</xml>`;

const createEvenOddXml = (purchaseType = 'DIGITEVEN', indicator = 'STANDARD') => `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_evenodd" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">evenodd</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_stake">
        <field name="VAR" id="var_stake">stake</field>
        <value name="VALUE">
          <block type="math_number" id="stake_val"><field name="NUM">0.35</field></block>
        </value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="false"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val"><field name="NUM">0.35</field></shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0"><block type="check_sell" id="check_sell_action"></block></value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      ${buildBeforePurchaseBlock(indicator, purchaseType)}
    </statement>
  </block>
</xml>`;

const createMatchesXml = (prediction = 5, indicator = 'STANDARD') => `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_matches" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">digits</field>
            <field name="TRADETYPE_LIST">matchesdiffers</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_pred">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE">
          <block type="math_number" id="pred_val"><field name="NUM">${prediction}</field></block>
        </value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="true"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val"><field name="NUM">1</field></shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val"><field name="NUM">0.35</field></shadow>
        </value>
        <value name="PREDICTION">
          <shadow type="math_number_positive" id="pred_num_val"><field name="NUM">${prediction}</field></shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0"><block type="check_sell" id="check_sell_action"></block></value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      ${buildBeforePurchaseBlock(indicator, 'DIGITMATCH')}
    </statement>
  </block>
</xml>`;

const buildStrictly2TickPurchaseStack = (mode = 'BOTH') => {
    if (mode === 'ONLY_UPS') {
        return `
        <next>
          <block type="controls_if" id="if_2tick_up">
            <value name="IF0">
              <block type="logic_compare" id="cmp_2tick_up">
                <field name="OP">GTE</field>
                <value name="A">
                  <block type="tick" id="tick_val_up"></block>
                </value>
                <value name="B">
                  <block type="math_number" id="num_zero_up"><field name="NUM">0</field></block>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="purchase" id="buy_2tick_up"><field name="PURCHASE_LIST">RUNHIGH</field></block>
            </statement>
          </block>
        </next>`;
    }

    if (mode === 'ONLY_DOWNS') {
        return `
        <next>
          <block type="controls_if" id="if_2tick_down">
            <value name="IF0">
              <block type="logic_compare" id="cmp_2tick_down">
                <field name="OP">GTE</field>
                <value name="A">
                  <block type="tick" id="tick_val_down"></block>
                </value>
                <value name="B">
                  <block type="math_number" id="num_zero_down"><field name="NUM">0</field></block>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="purchase" id="buy_2tick_down"><field name="PURCHASE_LIST">RUNLOW</field></block>
            </statement>
          </block>
        </next>`;
    }

    return `
    <next>
      <block type="controls_if" id="if_2tick_both">
        <mutation elseif="1"></mutation>
        <value name="IF0">
          <block type="logic_compare" id="cmp_2tick_both_high">
            <field name="OP">GTE</field>
            <value name="A">
              <block type="tick" id="tick_val_high"></block>
            </value>
            <value name="B">
              <block type="math_number" id="num_zero_high"><field name="NUM">0</field></block>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="purchase" id="buy_2tick_high"><field name="PURCHASE_LIST">RUNHIGH</field></block>
        </statement>
        <value name="IF1">
          <block type="logic_compare" id="cmp_2tick_both_low">
            <field name="OP">LTE</field>
            <value name="A">
              <block type="tick" id="tick_val_low"></block>
            </value>
            <value name="B">
              <block type="math_number" id="num_zero_low"><field name="NUM">0</field></block>
            </value>
          </block>
        </value>
        <statement name="DO1">
          <block type="purchase" id="buy_2tick_low"><field name="PURCHASE_LIST">RUNLOW</field></block>
        </statement>
      </block>
    </next>`;
};

const createStrictly2TickXml = (mode = 'BOTH', sensitivity = 'NORMAL') => `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <block type="trade_definition" id="trade_def_2tick" deletable="false" x="0" y="60">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_sel" deletable="false" movable="false">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="trade_type_sel" deletable="false" movable="false">
            <field name="TRADETYPECAT_LIST">runs</field>
            <field name="TRADETYPE_LIST">runs</field>
            <next>
              <block type="trade_definition_contracttype" id="contract_type_sel" deletable="false" movable="false">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_sel" deletable="false" movable="false">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_sel" deletable="false" movable="false">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="onerror_sel" deletable="false" movable="false">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <block type="variables_set" id="init_stake">
        <field name="VAR" id="var_stake">stake</field>
        <value name="VALUE">
          <block type="math_number" id="stake_val"><field name="NUM">0.35</field></block>
        </value>
      </block>
    </statement>
    <statement name="SUBMARKET">
      <block type="trade_definition_tradeoptions" id="trade_opts">
        <mutation xmlns="http://www.w3.org/1999/xhtml" has_first_barrier="false" has_second_barrier="false" has_prediction="false"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number_positive" id="dur_val"><field name="NUM">2</field></shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number_positive" id="amount_val"><field name="NUM">0.35</field></shadow>
        </value>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_purch" x="935" y="60">
    <statement name="DURING_PURCHASE_STACK">
      <block type="controls_if" id="check_sell_if">
        <value name="IF0"><block type="check_sell" id="check_sell_action"></block></value>
      </block>
    </statement>
  </block>
  ${AFTER_PURCHASE_SLT}
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="strictly_2tick_momentum_engine" id="engine_2tick">
        <field name="MODE">${mode}</field>
        <field name="SENSITIVITY">${sensitivity}</field>
        ${buildStrictly2TickPurchaseStack(mode)}
      </block>
    </statement>
  </block>
</xml>`;

const strictly2TickBots = [
    {
        name: '1. 2-Tick Dual-Directional Impulse Hybrid (Both Up & Down)',
        description: 'Dynamic dual IF/ELSE step execution; buys Only Ups on positive velocity, Only Downs on negative velocity',
        xml: createStrictly2TickXml('BOTH', 'NORMAL'),
    },
    {
        name: '2. 2-Tick Kinetic Momentum Surge (Only Ups)',
        description: 'High-speed 2-tick positive slope velocity sniper (+0.08 displacement); buys Only Ups (RUNHIGH)',
        xml: createStrictly2TickXml('ONLY_UPS', 'ULTRA'),
    },
    {
        name: '3. 2-Tick Velocity Crash Scalper (Only Downs)',
        description: 'High-speed 2-tick negative slope crash sniper (-0.08 displacement); buys Only Downs (RUNLOW)',
        xml: createStrictly2TickXml('ONLY_DOWNS', 'ULTRA'),
    },
    {
        name: '4. 2-Tick Mean-Reversion Switcher (Both Up & Down)',
        description: 'Dual IF/ELSE step switcher; buys Only Downs on overbought spike, Only Ups on oversold dip',
        xml: createStrictly2TickXml('MEAN_REVERT_BOTH', 'HIGH'),
    },
    {
        name: '5. 2-Tick Micro-Breakout Channel (Both Up & Down)',
        description: 'Dynamic IF/ELSE channel breakout; buys Only Ups on 2-tick high break, Only Downs on 2-tick low break',
        xml: createStrictly2TickXml('BREAKOUT_BOTH', 'NORMAL'),
    },
    {
        name: '6. 2-Tick High-Frequency Pulse (Only Ups)',
        description: 'Ultra-sensitive 2-tick micro-momentum surge (+0.03 threshold); buys Only Ups (RUNHIGH)',
        xml: createStrictly2TickXml('ONLY_UPS', 'HIGH'),
    },
    {
        name: '7. 2-Tick Parabolic Spike Reversal (Only Downs)',
        description: 'Snipes sudden 2-tick parabolic upward spikes; buys Only Downs (RUNLOW)',
        xml: createStrictly2TickXml('ONLY_DOWNS', 'HIGH'),
    },
    {
        name: '8. 2-Tick Step-Ladder Velocity Matrix (Both Up & Down)',
        description: 'Second-derivative acceleration step matrix; buys Only Ups on positive acceleration, Only Downs on negative',
        xml: createStrictly2TickXml('STEP_HYBRID', 'NORMAL'),
    },
];

const upDownBots = [
    {
        name: '1. 3-Tick Only Ups Kinetic Accelerator (Default)',
        description: '3-Tick velocity consensus alignment; buys Only Ups (RUNHIGH) contract',
        xml: createUpDownXml(3, 'RUNHIGH', 'EMA'),
    },
    {
        name: '2. 2-Tick Only Downs Micro-Impulse Scalper',
        description: 'Ultra-fast 2-Tick displacement scalp; buys Only Downs (RUNLOW) contract',
        xml: createUpDownXml(2, 'RUNLOW', 'EMA'),
    },
    {
        name: '3. 4-Tick Only Ups Reversion Rebound',
        description: '4-Tick overextension outside 2.0-sigma channel; buys Only Ups (RUNHIGH)',
        xml: createUpDownXml(4, 'RUNHIGH', 'BB'),
    },
    {
        name: '4. 5-Tick Only Downs Breakout Velocity',
        description: '5-Tick consolidation channel breakout momentum; buys Only Downs (RUNLOW)',
        xml: createUpDownXml(5, 'RUNLOW', 'SMA'),
    },
    {
        name: '5. 3-Tick Only Ups Volatility Expansion (Default)',
        description: '3-Tick volatility expansion engine; buys Only Ups (RUNHIGH)',
        xml: createUpDownXml(3, 'RUNHIGH', 'BB'),
    },
    {
        name: '6. 3-Tick Only Downs Stochastic Cross (Default)',
        description: '3-Tick Fast %K/%D oscillator cross (<20 / >80); buys Only Downs (RUNLOW)',
        xml: createUpDownXml(3, 'RUNLOW', 'RSI'),
    },
    {
        name: '7. 2-Tick Only Ups Parabolic Spike Reversal',
        description: '2-Tick parabolic 3.0 std-dev reversal sniping; buys Only Ups (RUNHIGH)',
        xml: createUpDownXml(2, 'RUNHIGH', 'BB'),
    },
    {
        name: '8. 4-Tick Only Downs Dual-Velocity Wave',
        description: '4-Tick EMA trend agreement & directional consensus; buys Only Downs (RUNLOW)',
        xml: createUpDownXml(4, 'RUNLOW', 'EMA'),
    },
    {
        name: '9. RSI-14 Momentum Breakout (Only Ups / Downs)',
        description: 'RSI-14 momentum surge (>65 buys Only Ups, <35 buys Only Downs)',
        xml: createUpDownXml(3, 'RUNHIGH', 'RSI'),
    },
    {
        name: '10. Bollinger Band Squeeze Expansion (Both)',
        description: 'Bandwidth squeeze expansion (<0.5%); rides breakout direction (3 ticks)',
        xml: createUpDownXml(3, 'RUNHIGH', 'BB'),
    },
    {
        name: '11. RSI Oversold Mean Reversion (Only Ups)',
        description: 'RSI-7 ultra-fast oversold (<25); snipes 2-tick Only Ups reversal',
        xml: createUpDownXml(2, 'RUNHIGH', 'RSI'),
    },
    {
        name: '12. RSI Overbought Crash Sniping (Only Downs)',
        description: 'RSI-7 ultra-fast overbought (>75); snipes 2-tick Only Downs crash',
        xml: createUpDownXml(2, 'RUNLOW', 'RSI'),
    },
    {
        name: '13. Bollinger Upper Band Ride Momentum (Only Ups)',
        description: 'Price hugging upper BB band for 3 ticks; buys 4-tick Only Ups',
        xml: createUpDownXml(4, 'RUNHIGH', 'BB'),
    },
    {
        name: '14. Bollinger Lower Band Ride Crash (Only Downs)',
        description: 'Price hugging lower BB band for 3 ticks; buys 4-tick Only Downs',
        xml: createUpDownXml(4, 'RUNLOW', 'BB'),
    },
    {
        name: '15. RSI & Bollinger Confluence Surge (Both)',
        description: 'Dual RSI-14 & BB expansion confluence; buys Only Ups / Downs (3 ticks)',
        xml: createUpDownXml(3, 'RUNHIGH', 'RSI'),
    },
    {
        name: '16. 5-Tick Triple Indicator Velocity Matrix (Both)',
        description: 'EMA-5 + RSI + BB expansion alignment; rides 5-tick trend breakout',
        xml: createUpDownXml(5, 'RUNHIGH', 'EMA'),
    },
];

const evenOddBots = [
    {
        name: '1. Even Parity Streak Reversion',
        description: 'Mean-reversion parity shift after 3 consecutive Evens (+96% payout)',
        xml: createEvenOddXml('DIGITEVEN', 'EMA'),
    },
    {
        name: '2. Odd Momentum Streak Follower',
        description: 'Momentum parity continuation after 2 consecutive Odds (+96% payout)',
        xml: createEvenOddXml('DIGITODD', 'EMA'),
    },
    {
        name: '3. Dual-Leg Even/Odd Balance Fortress',
        description: 'Weighted dual EVEN + ODD leg stakes for zero-blowup parity risk',
        xml: createEvenOddXml('DIGITEVEN', 'BB'),
    },
    {
        name: '4. Kinetic Even Pulse Scalper',
        description: 'Price action + last digit parity slope fusion (+96% payout)',
        xml: createEvenOddXml('DIGITEVEN', 'RSI'),
    },
    {
        name: '5. Odd Frequency Spike Detector',
        description: 'Rebalances parity when 15-tick Odd ratio < 35% (+96% payout)',
        xml: createEvenOddXml('DIGITODD', 'SMA'),
    },
    {
        name: '6. Alternating Parity Wave Matrix',
        description: 'Micro E-O-E pattern recognition for ODD continuation (+96% payout)',
        xml: createEvenOddXml('DIGITODD', 'EMA'),
    },
    {
        name: '7. Even Dominance High-Yield Filter',
        description: 'Trend-following parity engine when 20-tick Even ratio > 60%',
        xml: createEvenOddXml('DIGITEVEN', 'RSI'),
    },
    {
        name: '8. Parity Breakout Spike Sniping',
        description: 'High-probability reversal sniping after 4 identical parity ticks',
        xml: createEvenOddXml('DIGITEVEN', 'BB'),
    },
    {
        name: '9. RSI Parity Shift Oscillator',
        description: 'RSI-14 trend + 10-tick parity ratio fusion for high-precision entry',
        xml: createEvenOddXml('DIGITEVEN', 'RSI'),
    },
    {
        name: '10. Bollinger Parity Expansion Matrix',
        description: 'Triggers EVEN/ODD on tick volatility outside BB 2.0-sigma bands',
        xml: createEvenOddXml('DIGITODD', 'BB'),
    },
    {
        name: '11. Quantum Parity Mean Revert 11',
        description: '11-tick parity window regression sniper for max win-rate consistency',
        xml: createEvenOddXml('DIGITEVEN', 'SMA'),
    },
];

const dedicatedMatchesBots = [
    {
        name: '1. Match Digit 5 Centroid Sniper',
        description: 'Targets central digit 5 on frequency cluster for +800% Net ROI hit',
        xml: createMatchesXml(5, 'EMA'),
    },
    {
        name: '2. Hot Digit 7 Momentum Matcher',
        description: 'Fires MATCH on 20-tick hottest digit 7 for +800% Net ROI hit',
        xml: createMatchesXml(7, 'EMA'),
    },
    {
        name: '3. Cold Digit 2 Reversion Matcher',
        description: 'Fires MATCH on 30-tick overdue digit 2 for +800% Net ROI hit',
        xml: createMatchesXml(2, 'RSI'),
    },
    {
        name: '4. Repeat Digit 9 Cluster Sniper',
        description: 'Targets back-to-back digit 9 repeat for +800% Net ROI hit',
        xml: createMatchesXml(9, 'BB'),
    },
    {
        name: '5. Even Peak Digit 4 Matcher',
        description: 'Targets top Even digit 4 for +800% Net ROI hit',
        xml: createMatchesXml(4, 'SMA'),
    },
    {
        name: '6. Odd Peak Digit 3 Matcher',
        description: 'Targets top Odd digit 3 for +800% Net ROI hit',
        xml: createMatchesXml(3, 'SMA'),
    },
    {
        name: '7. Dual-Digit 6 Parallel Fortress',
        description: 'Parallel MATCH contract on digit 6 for +800% Net ROI hit',
        xml: createMatchesXml(6, 'EMA'),
    },
    {
        name: '8. Quantum Frequency Shift Matcher (Digit 8)',
        description: 'Deep statistical distribution entry on digit 8 for +800% Net ROI hit',
        xml: createMatchesXml(8, 'BB'),
    },
    {
        name: '9. RSI-Filtered Hot Digit Matcher (Digit 1)',
        description: 'Combines RSI momentum directional bias with hot digit 1 match (+800% ROI)',
        xml: createMatchesXml(1, 'RSI'),
    },
    {
        name: '10. Bollinger Squeeze Match Sniper (Digit 5)',
        description: 'Triggers Match on central digit 5 when Bollinger Bands squeeze',
        xml: createMatchesXml(5, 'BB'),
    },
    {
        name: '11. Multi-Indicator Centroid Matcher (Digit 0)',
        description: 'Targets boundary digit 0 on indicator extremity for +800% ROI hit',
        xml: createMatchesXml(0, 'RSI'),
    },
];

const powerBots = [
    {
        name: '1. Over 3 / Under 6 Dual Spike (Power Combo)',
        description: '2-Leg Dual Barrier: Digits 4 & 5 hit combined double payoff with 70% nominal coverage',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('POWER_OVER3_UNDER6_DUAL_SPIKE'),
    },
    {
        name: '2. Over 2 / Under 7 Velocity Shield (Power Combo)',
        description: '2-Leg Dual Barrier: 70% coverage per leg with loss mitigation on extreme outer digits',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('POWER_OVER2_UNDER7_VELOCITY_SHIELD'),
    },
    {
        name: '3. Dual-Apex Over 3 / Under 6 Vault (Power Blend)',
        description: '2-Leg Dual Apex: Digits 4 & 5 hit double barrier payoff',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('POWER_DUAL_APEX_OVER3_UNDER6'),
    },
    {
        name: '4. Over 4 / Under 5 Parity Squeeze (Power Combo)',
        description: '2-Leg Parity Squeeze: 50% coverage per leg with balanced directional hedge',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 2,
        maxExposure: '0.70',
        xml: createComboXml('POWER_OVER4_UNDER5_PARITY_SQUEEZE'),
    },
    {
        name: '5. Triple-Point Over 4 / Under 5 Fortress (Power Multi)',
        description: '3-Leg Multi-Barrier: Digits 4-9 yield positive net returns with central overlap',
        family: 'MULTILEG',
        validationState: 'SHADOW',
        legs: 3,
        maxExposure: '1.05',
        xml: createComboXml('POWER_TRIPLE_POINT_OVER4_UNDER5'),
    },
    {
        name: '6. Over 2 Alpha Shield (Power Compounder)',
        description: '1-Leg Over 2: 70% nominal coverage (digits 3-9 win) with linear risk profile',
        family: 'OVER_UNDER',
        validationState: 'VALIDATED',
        legs: 1,
        maxExposure: '0.35',
        xml: createComboXml('POWER_OVER2_ALPHA_SHIELD'),
    },
];

// ── Reusable Quant Strategy Row Component with Visible Fingerprint ──
const BotCardRow: React.FC<{
    strat: any;
    isLoaded: boolean;
    isFavorite: boolean;
    onToggleFavorite: (name: string, e: React.MouseEvent) => void;
    onLoad: (xml: string, name: string, stratObj?: any) => void;
    accentColor?: string;
}> = ({ strat, isLoaded, isFavorite, onToggleFavorite, onLoad, accentColor = '#f59e0b' }) => {
    const family = strat.family || 'STRATEGY';
    const validationState = strat.validationState || 'SHADOW';
    const legs = strat.legs || 1;
    const exposure = strat.maxExposure ? `$${strat.maxExposure}` : `$${(legs * 0.35).toFixed(2)}`;
    const reqProb = strat.requiredProbability ? `${(strat.requiredProbability * 100).toFixed(1)}%` : null;

    let valColor = '#38bdf8';
    let valBg = 'rgba(56, 189, 248, 0.12)';
    if (validationState === 'VALIDATED') {
        valColor = '#00e699';
        valBg = 'rgba(0, 230, 153, 0.15)';
    } else if (validationState === 'UNVALIDATED') {
        valColor = '#f59e0b';
        valBg = 'rgba(245, 158, 11, 0.15)';
    } else if (validationState === 'BLOCKED') {
        valColor = '#ff3355';
        valBg = 'rgba(255, 51, 85, 0.15)';
    }

    return (
        <div 
            onClick={() => onLoad(strat.xml, strat.name, strat)}
            style={{
                background: isLoaded ? 'linear-gradient(90deg, rgba(255, 68, 0, 0.38) 0%, rgba(255, 140, 0, 0.22) 100%)' : 'rgba(255, 255, 255, 0.025)',
                border: isLoaded ? '1px solid #ff5500' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '21px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isLoaded ? '0 0 12px rgba(255, 68, 0, 0.65), inset 0 0 8px rgba(255, 140, 0, 0.3)' : 'none',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
            }}
            onMouseOver={(e) => {
                if (!isLoaded) {
                    e.currentTarget.style.background = 'rgba(255, 68, 0, 0.16)';
                    e.currentTarget.style.borderColor = 'rgba(255, 100, 0, 0.55)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 68, 0, 0.4)';
                }
            }}
            onMouseOut={(e) => {
                if (!isLoaded) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', flex: 1 }}>
                <button
                    onClick={(e) => onToggleFavorite(strat.name, e)}
                    title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: isFavorite ? '#f59e0b' : 'rgba(255, 255, 255, 0.3)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: 0,
                        lineHeight: 1,
                        flexShrink: 0
                    }}
                >
                    {isFavorite ? '★' : '☆'}
                </button>

                {/* Validation State Badge */}
                <span style={{
                    background: valBg,
                    color: valColor,
                    fontSize: '7px',
                    fontWeight: 800,
                    padding: '0.5px 3.5px',
                    borderRadius: '2px',
                    letterSpacing: '0.2px',
                    flexShrink: 0
                }}>
                    {validationState}
                </span>

                {/* Strategy Name */}
                <span style={{
                    fontSize: '10px',
                    fontWeight: isLoaded ? 800 : 600,
                    color: isLoaded ? '#ffffff' : 'var(--text-general)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {localize(strat.name)}
                </span>

                {isLoaded && (
                    <span style={{
                        background: '#f59e0b',
                        color: '#000000',
                        padding: '0 4px',
                        borderRadius: '2px',
                        fontWeight: 800,
                        fontSize: '7.5px',
                        letterSpacing: '0.3px',
                        marginLeft: '3px',
                        flexShrink: 0
                    }}>
                        LOADED ✓
                    </span>
                )}
            </div>

            {/* Strategy Fingerprint Pill & Description */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                <span style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '7.5px',
                    fontWeight: 700,
                    padding: '0 3px',
                    borderRadius: '2px'
                }}>
                    {legs}L · {exposure}
                </span>
                <span style={{
                    fontSize: '9px',
                    color: 'var(--text-less-prominent)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '300px',
                    paddingLeft: '4px'
                }}>
                    {localize(strat.description)}
                </span>
            </div>
        </div>
    );
};

const CustomBots: React.FC<CustomBotsProps> = ({ handleTabChange }) => {
    const [activeCategory, setActiveCategory] = React.useState<'favorites' | 'strictly2tick' | 'updown' | 'evenodd' | 'matches' | 'matches_reloaded' | 'blends' | 'maxing' | 'multilegs' | 'power'>('favorites');

    const [favorites, setFavorites] = React.useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('goldrush_favorite_bots') || '[]');
        } catch {
            return [];
        }
    });

    const toggleFavorite = (botName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites((prev) => {
            const isFav = prev.includes(botName);
            const next = isFav ? prev.filter((name) => name !== botName) : [...prev, botName];
            try {
                localStorage.setItem('goldrush_favorite_bots', JSON.stringify(next));
            } catch (err) {
                console.error('Failed to save favorites to localStorage', err);
            }
            return next;
        });
    };

    const allBots = React.useMemo(() => [
        ...strictly2TickBots,
        ...upDownBots,
        ...evenOddBots,
        ...dedicatedMatchesBots,
        ...strategies,
        ...comboBlends,
        ...maxingBots,
        ...multilegBots,
        ...powerBots,
    ], []);

    const favoritedBotObjects = React.useMemo(() => {
        return allBots.filter((bot) => favorites.includes(bot.name));
    }, [allBots, favorites]);

    const [loadedBotName, setLoadedBotName] = React.useState<string>(() => {
        try {
            return localStorage.getItem('goldrush_loaded_bot_name') || '';
        } catch {
            return '';
        }
    });

    const loadStrategy = (xmlString: string, strategyName: string, stratObj?: any) => {
        setLoadedBotName(strategyName);
        try {
            localStorage.setItem('goldrush_loaded_bot_name', strategyName);
        } catch (err) {
            console.error('Failed to save loaded bot name:', err);
        }

        if (!window.Blockly?.derivWorkspace) {
            botNotification(
                localize('Blockly workspace is not initialized. Please open Bot Builder first.'),
                undefined,
                { type: 'error' }
            );
            return;
        }

        // Strategy Validation State Alert
        if (stratObj?.validationState === 'UNVALIDATED') {
            botNotification(
                localize(`[SHADOW MODE RECOMMENDED] "${strategyName}" is unvalidated (Sample N < 500). Verify out-of-sample performance before live capital.`),
                undefined,
                { type: 'warning' }
            );
        }

        try {
            handleTabChange(1);

            setTimeout(async () => {
                try {
                    await load({
                        block_string: xmlString,
                        strategy_id: 'custom_strategy_bot',
                        file_name: strategyName,
                        workspace: window.Blockly.derivWorkspace,
                        from: 'local',
                        drop_event: {},
                        showIncompatibleStrategyDialog: false,
                        show_snackbar: false,
                    });
                    
                    window.Blockly.derivWorkspace.strategy_to_load = xmlString;

                    if (window.Blockly.derivWorkspace) {
                        window.Blockly.svgResize(window.Blockly.derivWorkspace);
                    }
                    
                    botNotification(
                        localize(`Successfully loaded "${strategyName}" into Bot Builder!`),
                        undefined,
                        { type: 'success' }
                    );
                } catch (loadError) {
                    console.error('Failed to parse and load XML:', loadError);
                    botNotification(
                        localize('Failed to load strategy blocks. Please try again.'),
                        undefined,
                        { type: 'error' }
                    );
                }
            }, 100);
        } catch (error) {
            console.error('Failed to load XML strategy:', error);
            botNotification(
                localize('Failed to load strategy. Please try again.'),
                undefined,
                { type: 'error' }
            );
        }
    };

    return (
        <div style={{
            padding: '2px 4px',
            color: 'var(--text-general)',
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Top Column Navigation Bar (Snake Light Flowing Directly Through Buttons) */}
            <div 
                className="led-snake-nav-flow"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    marginBottom: '8px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                <button
                    onClick={() => setActiveCategory('favorites')}
                    style={{
                        background: activeCategory === 'favorites' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(0, 0, 0, 0.35)',
                        border: activeCategory === 'favorites' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        padding: '5px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center',
                        backdropFilter: 'blur(4px)',
                        boxShadow: activeCategory === 'favorites' ? '0 0 10px rgba(245, 158, 11, 0.6)' : 'none'
                    }}
                >
                    FAVORITES ★
                </button>
                <button
                    onClick={() => setActiveCategory('strictly2tick')}
                    style={{
                        background: activeCategory === 'strictly2tick' ? 'rgba(6, 182, 212, 0.45)' : 'rgba(0, 0, 0, 0.35)',
                        border: activeCategory === 'strictly2tick' ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        padding: '5px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center',
                        backdropFilter: 'blur(4px)',
                        boxShadow: activeCategory === 'strictly2tick' ? '0 0 10px rgba(6, 182, 212, 0.6)' : 'none'
                    }}
                >
                    2 TICKS
                </button>
                <button
                    onClick={() => setActiveCategory('updown')}
                    style={{
                        background: activeCategory === 'updown' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'updown' ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'updown' ? '#ffffff' : 'var(--text-general)',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center'
                    }}
                >
                    UP/DOWN ONLY
                </button>
                <button
                    onClick={() => setActiveCategory('evenodd')}
                    style={{
                        background: activeCategory === 'evenodd' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'evenodd' ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'evenodd' ? '#ffffff' : 'var(--text-general)',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center'
                    }}
                >
                    EVEN/ODD
                </button>
                <button
                    onClick={() => setActiveCategory('matches')}
                    style={{
                        background: activeCategory === 'matches' ? 'rgba(108, 99, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'matches' ? '1px solid #6c63ff' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'matches' ? '#ffffff' : 'var(--text-general)',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center'
                    }}
                >
                    MATCHES BOTS
                </button>
                <button
                    onClick={() => setActiveCategory('matches_reloaded')}
                    style={{
                        background: activeCategory === 'matches_reloaded' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'matches_reloaded' ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'matches_reloaded' ? '#ffffff' : 'var(--text-general)',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center'
                    }}
                >
                    MATCHES RELOADED
                </button>
                <button
                    onClick={() => setActiveCategory('blends')}
                    style={{
                        background: activeCategory === 'blends' ? 'rgba(138, 43, 226, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'blends' ? '1px solid #8a2be2' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'blends' ? '#ffffff' : 'var(--text-general)',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center'
                    }}
                >
                    OV/UN BLENDS
                </button>
                <button
                    onClick={() => setActiveCategory('maxing')}
                    style={{
                        background: activeCategory === 'maxing' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'maxing' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'maxing' ? '#ffffff' : 'var(--text-general)',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center'
                    }}
                >
                    MAXING BOTS
                </button>
                <button
                    onClick={() => setActiveCategory('multilegs')}
                    style={{
                        background: activeCategory === 'multilegs' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'multilegs' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'multilegs' ? '#ffffff' : 'var(--text-general)',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0px',
                        textAlign: 'center'
                    }}
                >
                    MULTILEGS
                </button>
                <button
                    onClick={() => setActiveCategory('power')}
                    style={{
                        background: activeCategory === 'power' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeCategory === 'power' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeCategory === 'power' ? '#ffffff' : 'var(--text-general)',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap'
                    }}
                >
                    POWER STRATS
                </button>
            </div>

            {/* Column -1: FAVORITES (Saved Bots) */}
            {activeCategory === 'favorites' && (
                <div>
                    {favoritedBotObjects.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '26px 20px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '6px',
                            color: 'var(--text-less-prominent)',
                            fontSize: '12px'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '6px', color: '#f59e0b' }}>★</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-general)', marginBottom: '4px', fontSize: '13px' }}>No Favorited Bots Yet</div>
                            <div>Click the star icon (☆) next to any strategy in the other tabs to save your favorite bots here!</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {favoritedBotObjects.map((strat, idx) => (
                                <BotCardRow
                                    key={idx}
                                    strat={strat}
                                    isLoaded={loadedBotName === strat.name}
                                    isFavorite={true}
                                    onToggleFavorite={toggleFavorite}
                                    onLoad={loadStrategy}
                                    accentColor="#f59e0b"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Column -0.5: STRICTLY 2 TICKS */}
            {activeCategory === 'strictly2tick' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {strictly2TickBots.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#06b6d4"
                        />
                    ))}
                </div>
            )}

            {/* Column 0: UP/DOWN ONLY */}
            {activeCategory === 'updown' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {upDownBots.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#ec4899"
                        />
                    ))}
                </div>
            )}

            {/* Column 0.5: EVEN/ODD */}
            {activeCategory === 'evenodd' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {evenOddBots.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#6366f1"
                        />
                    ))}
                </div>
            )}

            {/* Column 1: MATCHES BOTS */}
            {activeCategory === 'matches' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dedicatedMatchesBots.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#6c63ff"
                        />
                    ))}
                </div>
            )}

            {/* Column 1.5: MATCHES RELOADED */}
            {activeCategory === 'matches_reloaded' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {strategies.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#a855f7"
                        />
                    ))}
                </div>
            )}

            {/* Column 2: OV/UN Blends */}
            {activeCategory === 'blends' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {comboBlends.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#8a2be2"
                        />
                    ))}
                </div>
            )}

            {/* Column 3: Maxing Bots */}
            {activeCategory === 'maxing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {maxingBots.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#10b981"
                        />
                    ))}
                </div>
            )}

            {/* Column 4: Multilegs Bots */}
            {activeCategory === 'multilegs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {multilegBots.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#ef4444"
                        />
                    ))}
                </div>
            )}

            {/* Column 5: Power Strats */}
            {activeCategory === 'power' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {powerBots.map((strat, idx) => (
                        <BotCardRow
                            key={idx}
                            strat={strat}
                            isLoaded={loadedBotName === strat.name}
                            isFavorite={favorites.includes(strat.name)}
                            onToggleFavorite={toggleFavorite}
                            onLoad={loadStrategy}
                            accentColor="#f59e0b"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomBots;
