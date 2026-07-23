// @ts-nocheck — vendored custom bots tab UI; see AGENTS.md
import React from 'react';
import { localize } from '@deriv-com/translations';
import { botNotification } from '@/components/bot-notification/bot-notification';

// ── Bot 1: Matches Top Common ────────────────────────────────────────────────
const MATCHES_TOP_COMMON_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
    <variable id="var_recent_digits">recent_digits</variable>
    <variable id="var_target_digit">target_digit</variable>
    <variable id="var_max_count">max_count</variable>
    <variable id="var_d">d</variable>
    <variable id="var_current_count">current_count</variable>
    <variable id="var_digit">digit</variable>
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
  <block type="after_purchase" id="after_purch" x="935" y="292">
    <statement name="AFTERPURCHASE_STACK">
      <block type="trade_again" id="trade_again_action"></block>
    </statement>
  </block>
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="variables_set" id="set_recent_digits">
        <field name="VAR" id="var_recent_digits">recent_digits</field>
        <value name="VALUE">
          <block type="lists_getSublist" id="sublist_recent">
            <mutation at1="true" at2="false"></mutation>
            <field name="WHERE1">FROM_END</field>
            <field name="WHERE2">LAST</field>
            <value name="LIST">
              <block type="lastDigitList" id="digit_list_source"></block>
            </value>
            <value name="AT1">
              <block type="math_number" id="slice_size">
                <field name="NUM">30</field>
              </block>
            </value>
          </block>
        </value>
        <next>
          <block type="variables_set" id="init_target_digit">
            <field name="VAR" id="var_target_digit">target_digit</field>
            <value name="VALUE">
              <block type="math_number" id="zero_val">
                <field name="NUM">0</field>
              </block>
            </value>
            <next>
              <block type="variables_set" id="init_max_count">
                <field name="VAR" id="var_max_count">max_count</field>
                <value name="VALUE">
                  <block type="math_number" id="neg_one_val">
                    <field name="NUM">-1</field>
                  </block>
                </value>
                <next>
                  <block type="controls_for" id="loop_digits_0_to_9">
                    <field name="VAR" id="var_d">d</field>
                    <value name="FROM">
                      <block type="math_number" id="loop_start">
                        <field name="NUM">0</field>
                      </block>
                    </value>
                    <value name="TO">
                      <block type="math_number" id="loop_end">
                        <field name="NUM">9</field>
                      </block>
                    </value>
                    <value name="BY">
                      <block type="math_number" id="loop_step">
                        <field name="NUM">1</field>
                      </block>
                    </value>
                    <statement name="DO">
                      <block type="variables_set" id="init_current_count">
                        <field name="VAR" id="var_current_count">current_count</field>
                        <value name="VALUE">
                          <block type="math_number" id="current_count_zero">
                            <field name="NUM">0</field>
                          </block>
                        </value>
                        <next>
                          <block type="controls_forEach" id="loop_recent_digits">
                            <field name="VAR" id="var_digit">digit</field>
                            <value name="LIST">
                              <block type="variables_get" id="get_recent_digits_list">
                                <field name="VAR" id="var_recent_digits">recent_digits</field>
                              </block>
                            </value>
                            <statement name="DO">
                              <block type="controls_if" id="if_digit_matches">
                                <value name="IF0">
                                  <block type="logic_compare" id="compare_digit_d">
                                    <field name="OP">EQ</field>
                                    <value name="A">
                                      <block type="variables_get" id="get_digit_val">
                                        <field name="VAR" id="var_digit">digit</field>
                                      </block>
                                    </value>
                                    <value name="B">
                                      <block type="variables_get" id="get_d_val">
                                        <field name="VAR" id="var_d">d</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                                <statement name="DO0">
                                  <block type="variables_set" id="increment_current_count">
                                    <field name="VAR" id="var_current_count">current_count</field>
                                    <value name="VALUE">
                                      <block type="math_arithmetic" id="add_one_to_count">
                                        <field name="OP">ADD</field>
                                        <value name="A">
                                          <block type="variables_get" id="get_current_count_val">
                                            <field name="VAR" id="var_current_count">current_count</field>
                                          </block>
                                        </value>
                                        <value name="B">
                                          <block type="math_number" id="one_val">
                                            <field name="NUM">1</field>
                                          </block>
                                        </value>
                                      </block>
                                    </value>
                                  </block>
                                </statement>
                              </block>
                            </statement>
                            <next>
                              <block type="controls_if" id="check_if_new_max">
                                <value name="IF0">
                                  <block type="logic_compare" id="compare_count_max">
                                    <field name="OP">GT</field>
                                    <value name="A">
                                      <block type="variables_get" id="get_current_count_check">
                                        <field name="VAR" id="var_current_count">current_count</field>
                                      </block>
                                    </value>
                                    <value name="B">
                                      <block type="variables_get" id="var_max_count">
                                        <field name="VAR" id="var_max_count">max_count</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                                <statement name="DO0">
                                  <block type="variables_set" id="set_new_max_count">
                                    <field name="VAR" id="var_max_count">max_count</field>
                                    <value name="VALUE">
                                      <block type="variables_get" id="get_new_max_val">
                                        <field name="VAR" id="var_current_count">current_count</field>
                                      </block>
                                    </value>
                                    <next>
                                      <block type="variables_set" id="set_new_target_digit">
                                        <field name="VAR" id="var_target_digit">target_digit</field>
                                        <value name="VALUE">
                                          <block type="variables_get" id="get_new_target_val">
                                            <field name="VAR" id="var_d">d</field>
                                          </block>
                                        </value>
                                      </block>
                                    </next>
                                  </block>
                                </statement>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </statement>
                    <next>
                      <block type="variables_set" id="apply_prediction">
                        <field name="VAR" id="var_prediction">prediction</field>
                        <value name="VALUE">
                          <block type="variables_get" id="get_final_target_digit">
                            <field name="VAR" id="var_target_digit">target_digit</field>
                          </block>
                        </value>
                        <next>
                          <block type="notify" id="notify_target">
                            <field name="NOTIFICATION_TYPE">success</field>
                            <field name="NOTIFICATION_SOUND">silent</field>
                            <value name="MESSAGE">
                              <shadow type="text" id="notify_shadow">
                                <field name="TEXT">Targeting</field>
                              </shadow>
                              <block type="text_join" id="join_message">
                                <mutation items="4"></mutation>
                                <value name="ADD0">
                                  <block type="text" id="text_part1">
                                    <field name="TEXT">Top Matches Target: </field>
                                  </block>
                                </value>
                                <value name="ADD1">
                                  <block type="variables_get" id="msg_target_digit">
                                    <field name="VAR" id="var_target_digit">target_digit</field>
                                  </block>
                                </value>
                                <value name="ADD2">
                                  <block type="text" id="text_part2">
                                    <field name="TEXT"> (Count: </field>
                                  </block>
                                </value>
                                <value name="ADD3">
                                  <block type="variables_get" id="msg_max_count">
                                    <field name="VAR" id="var_max_count">max_count</field>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <next>
                              <block type="purchase" id="buy_digit_match">
                                <field name="PURCHASE_LIST">DIGITMATCH</field>
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
        </next>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 2: Bulk Matches Top Common SLT ──────────────────────────────────────
const BULK_MATCHES_SLT_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
    <variable id="var_recent_digits">recent_digits</variable>
    <variable id="var_target_1">target_1</variable>
    <variable id="var_target_2">target_2</variable>
    <variable id="var_max_count_1">max_count_1</variable>
    <variable id="var_max_count_2">max_count_2</variable>
    <variable id="var_d">d</variable>
    <variable id="var_current_count">current_count</variable>
    <variable id="var_digit">digit</variable>
    <variable id="var_alt_index">alt_index</variable>
  </variables>
  <block type="trade_definition" id="trade_def_bulk_matches" deletable="false" x="0" y="60">
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
  <block type="after_purchase" id="after_purch" x="935" y="292">
    <statement name="AFTERPURCHASE_STACK">
      <block type="trade_again" id="trade_again_action"></block>
    </statement>
  </block>
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="controls_if" id="init_alt_index_if">
        <value name="IF0">
          <block type="logic_compare" id="compare_alt_null">
            <field name="OP">EQ</field>
            <value name="A">
              <block type="variables_get" id="get_alt_index_check">
                <field name="VAR" id="var_alt_index">alt_index</field>
              </block>
            </value>
            <value name="B">
              <block type="logic_null" id="null_val"></block>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="variables_set" id="set_alt_initial">
            <field name="VAR" id="var_alt_index">alt_index</field>
            <value name="VALUE">
              <block type="math_number" id="one_num">
                <field name="NUM">1</field>
              </block>
            </value>
          </block>
        </statement>
        <next>
          <block type="variables_set" id="set_recent_digits">
            <field name="VAR" id="var_recent_digits">recent_digits</field>
            <value name="VALUE">
              <block type="lists_getSublist" id="sublist_recent">
                <mutation at1="true" at2="false"></mutation>
                <field name="WHERE1">FROM_END</field>
                <field name="WHERE2">LAST</field>
                <value name="LIST">
                  <block type="lastDigitList" id="digit_list_source"></block>
                </value>
                <value name="AT1">
                  <block type="math_number" id="slice_size">
                    <field name="NUM">30</field>
                  </block>
                </value>
              </block>
            </value>
            <next>
              <block type="variables_set" id="init_t1">
                <field name="VAR" id="var_target_1">target_1</field>
                <value name="VALUE">
                  <block type="math_number" id="zero_t1"><field name="NUM">0</field></block>
                </value>
                <next>
                  <block type="variables_set" id="init_mc1">
                    <field name="VAR" id="var_max_count_1">max_count_1</field>
                    <value name="VALUE">
                      <block type="math_number" id="neg_one_mc1"><field name="NUM">-1</field></block>
                    </value>
                    <next>
                      <block type="controls_for" id="loop_t1">
                        <field name="VAR" id="var_d">d</field>
                        <value name="FROM"><block type="math_number" id="start_t1"><field name="NUM">0</field></block></value>
                        <value name="TO"><block type="math_number" id="end_t1"><field name="NUM">9</field></block></value>
                        <value name="BY"><block type="math_number" id="step_t1"><field name="NUM">1</field></block></value>
                        <statement name="DO">
                          <block type="variables_set" id="set_cc1">
                            <field name="VAR" id="var_current_count">current_count</field>
                            <value name="VALUE"><block type="math_number" id="cc_zero_1"><field name="NUM">0</field></block></value>
                            <next>
                              <block type="controls_forEach" id="each_cc1">
                                <field name="VAR" id="var_digit">digit</field>
                                <value name="LIST"><block type="variables_get" id="get_rd1"><field name="VAR" id="var_recent_digits">recent_digits</field></block></value>
                                <statement name="DO">
                                  <block type="controls_if" id="if_rd1">
                                    <value name="IF0">
                                      <block type="logic_compare" id="comp_rd1">
                                        <field name="OP">EQ</field>
                                        <value name="A"><block type="variables_get" id="d_rd1"><field name="VAR" id="var_digit">digit</field></block></value>
                                        <value name="B"><block type="variables_get" id="d_loop1"><field name="VAR" id="var_d">d</field></block></value>
                                      </block>
                                    </value>
                                    <statement name="DO0">
                                      <block type="variables_set" id="inc_cc1">
                                        <field name="VAR" id="var_current_count">current_count</field>
                                        <value name="VALUE">
                                          <block type="math_arithmetic" id="add1"><field name="OP">ADD</field>
                                            <value name="A"><block type="variables_get" id="cc_v1"><field name="VAR" id="var_current_count">current_count</field></block></value>
                                            <value name="B"><block type="math_number" id="one_1"><field name="NUM">1</field></block></value>
                                          </block>
                                        </value>
                                      </block>
                                    </statement>
                                  </block>
                                </statement>
                                <next>
                                  <block type="controls_if" id="check_max1">
                                    <value name="IF0">
                                      <block type="logic_compare" id="comp_max1">
                                        <field name="OP">GT</field>
                                        <value name="A"><block type="variables_get" id="cc_v1_chk"><field name="VAR" id="var_current_count">current_count</field></block></value>
                                        <value name="B"><block type="variables_get" id="mc_v1"><field name="VAR" id="var_max_count_1">max_count_1</field></block></value>
                                      </block>
                                    </value>
                                    <statement name="DO0">
                                      <block type="variables_set" id="set_mc1">
                                        <field name="VAR" id="var_max_count_1">max_count_1</field>
                                        <value name="VALUE"><block type="variables_get" id="cc_v1_new"><field name="VAR" id="var_current_count">current_count</field></block></value>
                                        <next>
                                          <block type="variables_set" id="set_t1">
                                            <field name="VAR" id="var_target_1">target_1</field>
                                            <value name="VALUE"><block type="variables_get" id="d_v1_new"><field name="VAR" id="var_d">d</field></block></value>
                                          </block>
                                        </next>
                                      </block>
                                    </statement>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </statement>
                        <next>
                          <block type="variables_set" id="init_t2">
                            <field name="VAR" id="var_target_2">target_2</field>
                            <value name="VALUE">
                              <block type="math_number" id="zero_t2"><field name="NUM">0</field></block>
                            </value>
                            <next>
                              <block type="variables_set" id="init_mc2">
                                <field name="VAR" id="var_max_count_2">max_count_2</field>
                                <value name="VALUE">
                                  <block type="math_number" id="neg_one_mc2"><field name="NUM">-1</field></block>
                                </value>
                                <next>
                                  <block type="controls_for" id="loop_t2">
                                    <field name="VAR" id="var_d">d</field>
                                    <value name="FROM"><block type="math_number" id="start_t2"><field name="NUM">0</field></block></value>
                                    <value name="TO"><block type="math_number" id="end_t2"><field name="NUM">9</field></block></value>
                                    <value name="BY"><block type="math_number" id="step_t2"><field name="NUM">1</field></block></value>
                                    <statement name="DO">
                                      <block type="controls_if" id="skip_t1">
                                        <value name="IF0">
                                          <block type="logic_compare" id="comp_not_t1">
                                            <field name="OP">NEQ</field>
                                            <value name="A"><block type="variables_get" id="d_t2"><field name="VAR" id="var_d">d</field></block></value>
                                            <value name="B"><block type="variables_get" id="get_t1"><field name="VAR" id="var_target_1">target_1</field></block></value>
                                          </block>
                                        </value>
                                        <statement name="DO0">
                                          <block type="variables_set" id="set_cc2">
                                            <field name="VAR" id="var_current_count">current_count</field>
                                            <value name="VALUE"><block type="math_number" id="cc_zero_2"><field name="NUM">0</field></block></value>
                                            <next>
                                              <block type="controls_forEach" id="each_cc2">
                                                <field name="VAR" id="var_digit">digit</field>
                                                <value name="LIST"><block type="variables_get" id="get_rd2"><field name="VAR" id="var_recent_digits">recent_digits</field></block></value>
                                                <statement name="DO">
                                                  <block type="controls_if" id="if_rd2">
                                                    <value name="IF0">
                                                      <block type="logic_compare" id="comp_rd2">
                                                        <field name="OP">EQ</field>
                                                        <value name="A"><block type="variables_get" id="d_rd2"><field name="VAR" id="var_digit">digit</field></block></value>
                                                        <value name="B"><block type="variables_get" id="d_loop2"><field name="VAR" id="var_d">d</field></block></value>
                                                      </block>
                                                    </value>
                                                    <statement name="DO0">
                                                      <block type="variables_set" id="inc_cc2">
                                                        <field name="VAR" id="var_current_count">current_count</field>
                                                        <value name="VALUE">
                                                          <block type="math_arithmetic" id="add2"><field name="OP">ADD</field>
                                                            <value name="A"><block type="variables_get" id="cc_v2"><field name="VAR" id="var_current_count">current_count</field></block></value>
                                                            <value name="B"><block type="math_number" id="one_2"><field name="NUM">1</field></block></value>
                                                          </block>
                                                        </value>
                                                      </block>
                                                    </statement>
                                                  </block>
                                                </statement>
                                                <next>
                                                  <block type="controls_if" id="check_max2">
                                                    <value name="IF0">
                                                      <block type="logic_compare" id="comp_max2">
                                                        <field name="OP">GT</field>
                                                        <value name="A"><block type="variables_get" id="cc_v2_chk"><field name="VAR" id="var_current_count">current_count</field></block></value>
                                                        <value name="B"><block type="variables_get" id="mc_v2"><field name="VAR" id="var_max_count_2">max_count_2</field></block></value>
                                                      </block>
                                                    </value>
                                                    <statement name="DO0">
                                                      <block type="variables_set" id="set_mc2">
                                                        <field name="VAR" id="var_max_count_2">max_count_2</field>
                                                        <value name="VALUE"><block type="variables_get" id="cc_v2_new"><field name="VAR" id="var_current_count">current_count</field></block></value>
                                                        <next>
                                                          <block type="variables_set" id="set_t2">
                                                            <field name="VAR" id="var_target_2">target_2</field>
                                                            <value name="VALUE"><block type="variables_get" id="d_v2_new"><field name="VAR" id="var_d">d</field></block></value>
                                                          </block>
                                                        </next>
                                                      </block>
                                                    </statement>
                                                  </block>
                                                </next>
                                              </block>
                                            </next>
                                          </block>
                                        </statement>
                                      </block>
                                    </statement>
                                    <next>
                                      <block type="controls_if" id="alt_selection">
                                        <mutation xmlns="http://www.w3.org/1999/xhtml" else="1" elseif="1"></mutation>
                                        <value name="IF0">
                                          <block type="logic_compare" id="alt1_chk">
                                            <field name="OP">EQ</field>
                                            <value name="A"><block type="variables_get" id="get_alt_v1"><field name="VAR" id="var_alt_index">alt_index</field></block></value>
                                            <value name="B"><block type="math_number" id="one_num_1"><field name="NUM">1</field></block></value>
                                          </block>
                                        </value>
                                        <statement name="DO0">
                                          <block type="variables_set" id="pred_t1">
                                            <field name="VAR" id="var_prediction">prediction</field>
                                            <value name="VALUE"><block type="variables_get" id="get_t1_f"><field name="VAR" id="var_target_1">target_1</field></block></value>
                                            <next>
                                              <block type="variables_set" id="next_alt_2">
                                                <field name="VAR" id="var_alt_index">alt_index</field>
                                                <value name="VALUE"><block type="math_number" id="two_num_2"><field name="NUM">2</field></block></value>
                                              </block>
                                            </next>
                                          </block>
                                        </statement>
                                        <value name="IF1">
                                          <block type="logic_compare" id="alt2_chk">
                                            <field name="OP">EQ</field>
                                            <value name="A"><block type="variables_get" id="get_alt_v2"><field name="VAR" id="var_alt_index">alt_index</field></block></value>
                                            <value name="B"><block type="math_number" id="two_num_b"><field name="NUM">2</field></block></value>
                                          </block>
                                        </value>
                                        <statement name="DO1">
                                          <block type="variables_set" id="pred_t2">
                                            <field name="VAR" id="var_prediction">prediction</field>
                                            <value name="VALUE"><block type="variables_get" id="get_t2_f"><field name="VAR" id="var_target_2">target_2</field></block></value>
                                            <next>
                                              <block type="variables_set" id="next_alt_1">
                                                <field name="VAR" id="var_alt_index">alt_index</field>
                                                <value name="VALUE"><block type="math_number" id="one_num_f"><field name="NUM">1</field></block></value>
                                              </block>
                                            </next>
                                          </block>
                                        </statement>
                                        <statement name="ELSE">
                                          <block type="variables_set" id="pred_t1_fallback">
                                            <field name="VAR" id="var_prediction">prediction</field>
                                            <value name="VALUE"><block type="variables_get" id="get_t1_fb"><field name="VAR" id="var_target_1">target_1</field></block></value>
                                            <next>
                                              <block type="variables_set" id="next_alt_initial_f">
                                                <field name="VAR" id="var_alt_index">alt_index</field>
                                                <value name="VALUE"><block type="math_number" id="one_num_i"><field name="NUM">1</field></block></value>
                                              </block>
                                            </next>
                                          </block>
                                        </statement>
                                        <next>
                                          <block type="notify" id="notify_bulk">
                                            <field name="NOTIFICATION_TYPE">info</field>
                                            <field name="NOTIFICATION_SOUND">silent</field>
                                            <value name="MESSAGE">
                                              <shadow type="text" id="notify_shadow_bulk">
                                                <field name="TEXT">Targeting</field>
                                              </shadow>
                                              <block type="text_join" id="join_message_bulk">
                                                <mutation items="6"></mutation>
                                                <value name="ADD0"><block type="text" id="tb1"><field name="TEXT">SLT Bulk Matches Targets - T1: </field></block></value>
                                                <value name="ADD1"><block type="variables_get" id="gt1"><field name="VAR" id="var_target_1">target_1</field></block></value>
                                                <value name="ADD2"><block type="text" id="tb2"><field name="TEXT">, T2: </field></block></value>
                                                <value name="ADD3"><block type="variables_get" id="gt2"><field name="VAR" id="var_target_2">target_2</field></block></value>
                                                <value name="ADD4"><block type="text" id="tb3"><field name="TEXT"> | Buying Target: </field></block></value>
                                                <value name="ADD5"><block type="variables_get" id="gpred"><field name="VAR" id="var_prediction">prediction</field></block></value>
                                              </block>
                                            </value>
                                            <next>
                                              <block type="purchase" id="buy_bulk_match">
                                                <field name="PURCHASE_LIST">DIGITMATCH</field>
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
  </block>
</xml>`;

// ── Bot 3: Combo OV3/UN6 Hedger ─────────────────────────────────────────────
const COMBO_OV3_UN6_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
    <variable id="var_buy_over">buy_over</variable>
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
  <block type="after_purchase" id="after_purch" x="935" y="292">
    <statement name="AFTERPURCHASE_STACK">
      <block type="trade_again" id="trade_again_action"></block>
    </statement>
  </block>
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="controls_if" id="init_buy_over_if">
        <value name="IF0">
          <block type="logic_compare" id="compare_buy_over_null">
            <field name="OP">EQ</field>
            <value name="A">
              <block type="variables_get" id="get_buy_over_check">
                <field name="VAR" id="var_buy_over">buy_over</field>
              </block>
            </value>
            <value name="B">
              <block type="logic_null" id="null_val_combo"></block>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="variables_set" id="set_buy_over_initial">
            <field name="VAR" id="var_buy_over">buy_over</field>
            <value name="VALUE">
              <block type="logic_boolean" id="boolean_true">
                <field name="BOOL">TRUE</field>
              </block>
            </value>
          </block>
        </statement>
        <next>
          <block type="controls_if" id="combo_execution">
            <mutation xmlns="http://www.w3.org/1999/xhtml" else="1"></mutation>
            <value name="IF0">
              <block type="logic_compare" id="check_buy_over">
                <field name="OP">EQ</field>
                <value name="A">
                  <block type="variables_get" id="get_buy_over">
                    <field name="VAR" id="var_buy_over">buy_over</field>
                  </block>
                </value>
                <value name="B">
                  <block type="logic_boolean" id="boolean_true_chk">
                    <field name="BOOL">TRUE</field>
                  </block>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="variables_set" id="set_pred_3">
                <field name="VAR" id="var_prediction">prediction</field>
                <value name="VALUE">
                  <block type="math_number" id="three_num">
                    <field name="NUM">3</field>
                  </block>
                </value>
                <next>
                  <block type="variables_set" id="toggle_to_false">
                    <field name="VAR" id="var_buy_over">buy_over</field>
                    <value name="VALUE">
                      <block type="logic_boolean" id="boolean_false">
                        <field name="BOOL">FALSE</field>
                      </block>
                    </value>
                    <next>
                      <block type="notify" id="notify_over">
                        <field name="NOTIFICATION_TYPE">info</field>
                        <field name="NOTIFICATION_SOUND">silent</field>
                        <value name="MESSAGE">
                          <block type="text" id="msg_over_text">
                            <field name="TEXT">OV3/UN6 Combo Hedging: Purchasing DIGITOVER 3 (Wins 4-9)</field>
                          </block>
                        </value>
                        <next>
                          <block type="purchase" id="buy_over_contract">
                            <field name="PURCHASE_LIST">DIGITOVER</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="variables_set" id="set_pred_6">
                <field name="VAR" id="var_prediction">prediction</field>
                <value name="VALUE">
                  <block type="math_number" id="six_num">
                    <field name="NUM">6</field>
                  </block>
                </value>
                <next>
                  <block type="variables_set" id="toggle_to_true">
                    <field name="VAR" id="var_buy_over">buy_over</field>
                    <value name="VALUE">
                      <block type="logic_boolean" id="boolean_true_set">
                        <field name="BOOL">TRUE</field>
                      </block>
                    </value>
                    <next>
                      <block type="notify" id="notify_under">
                        <field name="NOTIFICATION_TYPE">info</field>
                        <field name="NOTIFICATION_SOUND">silent</field>
                        <value name="MESSAGE">
                          <block type="text" id="msg_under_text">
                            <field name="TEXT">OV3/UN6 Combo Hedging: Purchasing DIGITUNDER 6 (Wins 0-5)</field>
                          </block>
                        </value>
                        <next>
                          <block type="purchase" id="buy_under_contract">
                            <field name="PURCHASE_LIST">DIGITUNDER</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </next>
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
  <block type="after_purchase" id="after_purch" x="935" y="292">
    <statement name="AFTERPURCHASE_STACK">
      <block type="trade_again" id="trade_again_action"></block>
    </statement>
  </block>
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="variables_set" id="set_recent_digits">
        <field name="VAR" id="var_recent_digits">recent_digits</field>
        <value name="VALUE">
          <block type="lists_getSublist" id="sublist_recent">
            <mutation at1="true" at2="false"></mutation>
            <field name="WHERE1">FROM_END</field>
            <field name="WHERE2">LAST</field>
            <value name="LIST">
              <block type="lastDigitList" id="digit_list_source"></block>
            </value>
            <value name="AT1">
              <block type="math_number" id="slice_size">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
        </value>
        <next>
          <!-- Extract last 3 digits -->
          <block type="variables_set" id="set_d1">
            <field name="VAR" id="var_d1">d1</field>
            <value name="VALUE">
              <block type="lists_getIndex" id="get_d1">
                <mutation statement="false" at="true"></mutation>
                <field name="MODE">GET</field>
                <field name="WHERE">FROM_END</field>
                <value name="VALUE"><block type="variables_get" id="rd1"><field name="VAR" id="var_recent_digits">recent_digits</field></block></value>
                <value name="AT"><block type="math_number" id="d1_idx"><field name="NUM">1</field></block></value>
              </block>
            </value>
            <next>
              <block type="variables_set" id="set_d2">
                <field name="VAR" id="var_d2">d2</field>
                <value name="VALUE">
                  <block type="lists_getIndex" id="get_d2">
                    <mutation statement="false" at="true"></mutation>
                    <field name="MODE">GET</field>
                    <field name="WHERE">FROM_END</field>
                    <value name="VALUE"><block type="variables_get" id="rd2"><field name="VAR" id="var_recent_digits">recent_digits</field></block></value>
                    <value name="AT"><block type="math_number" id="d2_idx"><field name="NUM">2</field></block></value>
                  </block>
                </value>
                <next>
                  <block type="variables_set" id="set_d3">
                    <field name="VAR" id="var_d3">d3</field>
                    <value name="VALUE">
                      <block type="lists_getIndex" id="get_d3">
                        <mutation statement="false" at="true"></mutation>
                        <field name="MODE">GET</field>
                        <field name="WHERE">FROM_END</field>
                        <value name="VALUE"><block type="variables_get" id="rd3"><field name="VAR" id="var_recent_digits">recent_digits</field></block></value>
                        <value name="AT"><block type="math_number" id="d3_idx"><field name="NUM">3</field></block></value>
                      </block>
                    </value>
                    <next>
                      <!-- Check for Even Streak (d1, d2, d3 all even) -->
                      <block type="controls_if" id="streak_even_if">
                        <mutation xmlns="http://www.w3.org/1999/xhtml" else="1"></mutation>
                        <value name="IF0">
                          <block type="logic_operation" id="and_even_all">
                            <field name="OP">AND</field>
                            <value name="A">
                              <block type="logic_compare" id="d1_even">
                                <field name="OP">EQ</field>
                                <value name="A">
                                  <block type="math_modulo" id="mod1">
                                    <value name="DIVIDEND"><block type="variables_get" id="v_d1"><field name="VAR" id="var_d1">d1</field></block></value>
                                    <value name="DIVISOR"><block type="math_number" id="two_1"><field name="NUM">2</field></block></value>
                                  </block>
                                </value>
                                <value name="B"><block type="math_number" id="zero_1"><field name="NUM">0</field></block></value>
                              </block>
                            </value>
                            <value name="B">
                              <block type="logic_operation" id="and_even_2">
                                <field name="OP">AND</field>
                                <value name="A">
                                  <block type="logic_compare" id="d2_even">
                                    <field name="OP">EQ</field>
                                    <value name="A">
                                      <block type="math_modulo" id="mod2">
                                        <value name="DIVIDEND"><block type="variables_get" id="v_d2"><field name="VAR" id="var_d2">d2</field></block></value>
                                        <value name="DIVISOR"><block type="math_number" id="two_2"><field name="NUM">2</field></block></value>
                                      </block>
                                    </value>
                                    <value name="B"><block type="math_number" id="zero_2"><field name="NUM">0</field></block></value>
                                  </block>
                                </value>
                                <value name="B">
                                  <block type="logic_compare" id="d3_even">
                                    <field name="OP">EQ</field>
                                    <value name="A">
                                      <block type="math_modulo" id="mod3">
                                        <value name="DIVIDEND"><block type="variables_get" id="v_d3"><field name="VAR" id="var_d3">d3</field></block></value>
                                        <value name="DIVISOR"><block type="math_number" id="two_3"><field name="NUM">2</field></block></value>
                                      </block>
                                    </value>
                                    <value name="B"><block type="math_number" id="zero_3"><field name="NUM">0</field></block></value>
                                  </block>
                                </value>
                              </block>
                            </value>
                          </block>
                        </value>
                        <statement name="DO0">
                          <block type="notify" id="notify_odd">
                            <field name="NOTIFICATION_TYPE">success</field>
                            <field name="NOTIFICATION_SOUND">silent</field>
                            <value name="MESSAGE">
                              <block type="text" id="txt_odd"><field name="TEXT">3 Evens Streak → Mean Revert: Buying DIGITODD</field></block>
                            </value>
                            <next>
                              <block type="purchase" id="buy_odd">
                                <field name="PURCHASE_LIST">DIGITODD</field>
                              </block>
                            </next>
                          </block>
                        </statement>
                        <statement name="ELSE">
                          <!-- Check for Odd Streak (d1, d2, d3 all odd) -->
                          <block type="controls_if" id="streak_odd_if">
                            <value name="IF0">
                              <block type="logic_operation" id="and_odd_all">
                                <field name="OP">AND</field>
                                <value name="A">
                                  <block type="logic_compare" id="d1_odd">
                                    <field name="OP">NEQ</field>
                                    <value name="A">
                                      <block type="math_modulo" id="mod4">
                                        <value name="DIVIDEND"><block type="variables_get" id="v_d1_2"><field name="VAR" id="var_d1">d1</field></block></value>
                                        <value name="DIVISOR"><block type="math_number" id="two_4"><field name="NUM">2</field></block></value>
                                      </block>
                                    </value>
                                    <value name="B"><block type="math_number" id="zero_4"><field name="NUM">0</field></block></value>
                                  </block>
                                </value>
                                <value name="B">
                                  <block type="logic_operation" id="and_odd_2">
                                    <field name="OP">AND</field>
                                    <value name="A">
                                      <block type="logic_compare" id="d2_odd">
                                        <field name="OP">NEQ</field>
                                        <value name="A">
                                          <block type="math_modulo" id="mod5">
                                            <value name="DIVIDEND"><block type="variables_get" id="v_d2_2"><field name="VAR" id="var_d2">d2</field></block></value>
                                            <value name="DIVISOR"><block type="math_number" id="two_5"><field name="NUM">2</field></block></value>
                                          </block>
                                        </value>
                                        <value name="B"><block type="math_number" id="zero_5"><field name="NUM">0</field></block></value>
                                      </block>
                                    </value>
                                    <value name="B">
                                      <block type="logic_compare" id="d3_odd">
                                        <field name="OP">NEQ</field>
                                        <value name="A">
                                          <block type="math_modulo" id="mod6">
                                            <value name="DIVIDEND"><block type="variables_get" id="v_d3_2"><field name="VAR" id="var_d3">d3</field></block></value>
                                            <value name="DIVISOR"><block type="math_number" id="two_6"><field name="NUM">2</field></block></value>
                                          </block>
                                        </value>
                                        <value name="B"><block type="math_number" id="zero_6"><field name="NUM">0</field></block></value>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <statement name="DO0">
                              <block type="notify" id="notify_even">
                                <field name="NOTIFICATION_TYPE">success</field>
                                <field name="NOTIFICATION_SOUND">silent</field>
                                <value name="MESSAGE">
                                  <block type="text" id="txt_even"><field name="TEXT">3 Odds Streak → Mean Revert: Buying DIGITEVEN</field></block>
                                </value>
                                <next>
                                  <block type="purchase" id="buy_even">
                                    <field name="PURCHASE_LIST">DIGITEVEN</field>
                                  </block>
                                </next>
                              </block>
                            </statement>
                          </block>
                        </statement>
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
  </block>
</xml>`;

// ── Bot 5: Matches Longest Sleeper ──────────────────────────────────────────
const LONGEST_SLEEPER_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
    <variable id="var_recent_digits">recent_digits</variable>
    <variable id="var_target_digit">target_digit</variable>
    <variable id="var_max_sleep">max_sleep</variable>
    <variable id="var_d">d</variable>
    <variable id="var_sleep">sleep</variable>
    <variable id="var_i">i</variable>
  </variables>
  <block type="trade_definition" id="trade_def_sleeper" deletable="false" x="0" y="60">
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
  <block type="after_purchase" id="after_purch" x="935" y="292">
    <statement name="AFTERPURCHASE_STACK">
      <block type="trade_again" id="trade_again_action"></block>
    </statement>
  </block>
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <block type="variables_set" id="set_recent_digits">
        <field name="VAR" id="var_recent_digits">recent_digits</field>
        <value name="VALUE">
          <block type="lists_getSublist" id="sublist_recent">
            <mutation at1="true" at2="false"></mutation>
            <field name="WHERE1">FROM_END</field>
            <field name="WHERE2">LAST</field>
            <value name="LIST">
              <block type="lastDigitList" id="digit_list_source"></block>
            </value>
            <value name="AT1">
              <block type="math_number" id="slice_size">
                <field name="NUM">30</field>
              </block>
            </value>
          </block>
        </value>
        <next>
          <!-- Initialize target_digit = 0 and max_sleep = -1 -->
          <block type="variables_set" id="init_target_digit">
            <field name="VAR" id="var_target_digit">target_digit</field>
            <value name="VALUE"><block type="math_number" id="zero_val"><field name="NUM">0</field></block></value>
            <next>
              <block type="variables_set" id="init_max_sleep">
                <field name="VAR" id="var_max_sleep">max_sleep</field>
                <value name="VALUE"><block type="math_number" id="neg_one_val"><field name="NUM">-1</field></block></value>
                <next>
                  <!-- Loop d from 0 to 9 -->
                  <block type="controls_for" id="loop_digits_0_to_9">
                    <field name="VAR" id="var_d">d</field>
                    <value name="FROM"><block type="math_number" id="loop_start"><field name="NUM">0</field></block></value>
                    <value name="TO"><block type="math_number" id="loop_end"><field name="NUM">9</field></block></value>
                    <value name="BY"><block type="math_number" id="loop_step"><field name="NUM">1</field></block></value>
                    <statement name="DO">
                      <!-- Initialize sleep = 30 (max possible sleep in this window) -->
                      <block type="variables_set" id="init_sleep">
                        <field name="VAR" id="var_sleep">sleep</field>
                        <value name="VALUE"><block type="math_number" id="sleep_max_val"><field name="NUM">30</field></block></value>
                        <next>
                          <!-- Loop i from 1 to 30 to search backwards -->
                          <block type="controls_for" id="loop_backwards">
                            <field name="VAR" id="var_i">i</field>
                            <value name="FROM"><block type="math_number" id="idx_start"><field name="NUM">1</field></block></value>
                            <value name="TO"><block type="math_number" id="idx_end"><field name="NUM">30</field></block></value>
                            <value name="BY"><block type="math_number" id="idx_step"><field name="NUM">1</field></block></value>
                            <statement name="DO">
                              <block type="controls_if" id="check_digit_occur">
                                <value name="IF0">
                                  <block type="logic_compare" id="compare_dig">
                                    <field name="OP">EQ</field>
                                    <value name="A">
                                      <block type="lists_getIndex" id="get_dig_at">
                                        <mutation statement="false" at="true"></mutation>
                                        <field name="MODE">GET</field>
                                        <field name="WHERE">FROM_END</field>
                                        <value name="VALUE"><block type="variables_get" id="rd_source"><field name="VAR" id="var_recent_digits">recent_digits</field></block></value>
                                        <value name="AT"><block type="variables_get" id="i_val"><field name="VAR" id="var_i">i</field></block></value>
                                      </block>
                                    </value>
                                    <value name="B"><block type="variables_get" id="d_val"><field name="VAR" id="var_d">d</field></block></value>
                                  </block>
                                </value>
                                <statement name="DO0">
                                  <block type="variables_set" id="set_sleep_found">
                                    <field name="VAR" id="var_sleep">sleep</field>
                                    <value name="VALUE">
                                      <block type="math_arithmetic" id="calc_sleep">
                                        <field name="OP">MINUS</field>
                                        <value name="A"><block type="variables_get" id="get_i"><field name="VAR" id="var_i">i</field></block></value>
                                        <value name="B"><block type="math_number" id="one_num"><field name="NUM">1</field></block></value>
                                      </block>
                                    </value>
                                    <next>
                                      <!-- Break loop by setting i = 30 -->
                                      <block type="variables_set" id="break_loop">
                                        <field name="VAR" id="var_i">i</field>
                                        <value name="VALUE"><block type="math_number" id="thirty_num"><field name="NUM">30</field></block></value>
                                      </block>
                                    </next>
                                  </block>
                                </statement>
                              </block>
                            </statement>
                            <next>
                              <!-- If sleep > max_sleep, update target -->
                              <block type="controls_if" id="check_new_sleep_max">
                                <value name="IF0">
                                  <block type="logic_compare" id="compare_sleep">
                                    <field name="OP">GT</field>
                                    <value name="A"><block type="variables_get" id="get_sleep"><field name="VAR" id="var_sleep">sleep</field></block></value>
                                    <value name="B"><block type="variables_get" id="get_max_sleep"><field name="VAR" id="var_max_sleep">max_sleep</field></block></value>
                                  </block>
                                </value>
                                <statement name="DO0">
                                  <block type="variables_set" id="set_new_max_sleep">
                                    <field name="VAR" id="var_max_sleep">max_sleep</field>
                                    <value name="VALUE"><block type="variables_get" id="get_sleep_val"><field name="VAR" id="var_sleep">sleep</field></block></value>
                                    <next>
                                      <block type="variables_set" id="set_new_target_digit">
                                        <field name="VAR" id="var_target_digit">target_digit</field>
                                        <value name="VALUE"><block type="variables_get" id="get_d"><field name="VAR" id="var_d">d</field></block></value>
                                      </block>
                                    </next>
                                  </block>
                                </statement>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </statement>
                    <next>
                      <!-- Apply target digit prediction -->
                      <block type="variables_set" id="apply_pred">
                        <field name="VAR" id="var_prediction">prediction</field>
                        <value name="VALUE"><block type="variables_get" id="get_final_target"><field name="VAR" id="var_target_digit">target_digit</field></block></value>
                        <next>
                          <block type="notify" id="notify_sleeper">
                            <field name="NOTIFICATION_TYPE">success</field>
                            <field name="NOTIFICATION_SOUND">silent</field>
                            <value name="MESSAGE">
                              <block type="text_join" id="join_msg">
                                <mutation items="4"></mutation>
                                <value name="ADD0"><block type="text" id="t1"><field name="TEXT">Sleeper Matches Target: </field></block></value>
                                <value name="ADD1"><block type="variables_get" id="gt"><field name="VAR" id="var_target_digit">target_digit</field></block></value>
                                <value name="ADD2"><block type="text" id="t2"><field name="TEXT"> (Slept: </field></block></value>
                                <value name="ADD3"><block type="variables_get" id="gms"><field name="VAR" id="var_max_sleep">max_sleep</field></block></value>
                              </block>
                            </value>
                            <next>
                              <block type="purchase" id="buy_sleeper">
                                <field name="PURCHASE_LIST">DIGITMATCH</field>
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
        </next>
      </block>
    </statement>
  </block>
</xml>`;

// ── Bot 6: Over 4 Trend Follower ─────────────────────────────────────────────
const OVER_4_TREND_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
    <variable id="var_recent_digits">recent_digits</variable>
    <variable id="var_over_count">over_count</variable>
    <variable id="var_i">i</variable>
    <variable id="var_digit">digit</variable>
  </variables>
  <block type="trade_definition" id="trade_def_trend" deletable="false" x="0" y="60">
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
  <block type="after_purchase" id="after_purch" x="935" y="292">
    <statement name="AFTERPURCHASE_STACK">
      <block type="trade_again" id="trade_again_action"></block>
    </statement>
  </block>
  <block type="before_purchase" id="before_purch" deletable="false" x="23" y="690">
    <statement name="BEFOREPURCHASE_STACK">
      <!-- Force prediction = 4 -->
      <block type="variables_set" id="force_pred_4">
        <field name="VAR" id="var_prediction">prediction</field>
        <value name="VALUE"><block type="math_number" id="four_num"><field name="NUM">4</field></block></value>
        <next>
          <!-- Slice lastDigitList to last 10 elements -->
          <block type="variables_set" id="set_recent_digits">
            <field name="VAR" id="var_recent_digits">recent_digits</field>
            <value name="VALUE">
              <block type="lists_getSublist" id="sublist_recent">
                <mutation at1="true" at2="false"></mutation>
                <field name="WHERE1">FROM_END</field>
                <field name="WHERE2">LAST</field>
                <value name="LIST">
                  <block type="lastDigitList" id="digit_list_source"></block>
                </value>
                <value name="AT1">
                  <block type="math_number" id="slice_size">
                    <field name="NUM">10</field>
                  </block>
                </value>
              </block>
            </value>
            <next>
              <!-- Initialize over_count = 0 -->
              <block type="variables_set" id="init_over_count">
                <field name="VAR" id="var_over_count">over_count</field>
                <value name="VALUE"><block type="math_number" id="zero_count"><field name="NUM">0</field></block></value>
                <next>
                  <!-- Loop digit in recent_digits -->
                  <block type="controls_forEach" id="loop_recent">
                    <field name="VAR" id="var_digit">digit</field>
                    <value name="LIST"><block type="variables_get" id="get_list"><field name="VAR" id="var_recent_digits">recent_digits</field></block></value>
                    <statement name="DO">
                      <!-- If digit > 4, increment over_count -->
                      <block type="controls_if" id="check_is_over">
                        <value name="IF0">
                          <block type="logic_compare" id="compare_over">
                            <field name="OP">GT</field>
                            <value name="A"><block type="variables_get" id="get_digit"><field name="VAR" id="var_digit">digit</field></block></value>
                            <value name="B"><block type="math_number" id="compare_four"><field name="NUM">4</field></block></value>
                          </block>
                        </value>
                        <statement name="DO0">
                          <block type="variables_set" id="increment_over">
                            <field name="VAR" id="var_over_count">over_count</field>
                            <value name="VALUE">
                              <block type="math_arithmetic" id="add_one">
                                <field name="OP">ADD</field>
                                <value name="A"><block type="variables_get" id="get_over_count"><field name="VAR" id="var_over_count">over_count</field></block></value>
                                <value name="B"><block type="math_number" id="one_val"><field name="NUM">1</field></block></value>
                              </block>
                            </value>
                          </block>
                        </statement>
                      </block>
                    </statement>
                    <next>
                      <!-- Trend decisions -->
                      <block type="controls_if" id="trend_action">
                        <mutation xmlns="http://www.w3.org/1999/xhtml" else="1"></mutation>
                        <value name="IF0">
                          <block type="logic_compare" id="check_uptrend">
                            <field name="OP">GTE</field>
                            <value name="A"><block type="variables_get" id="get_over_total"><field name="VAR" id="var_over_count">over_count</field></block></value>
                            <value name="B"><block type="math_number" id="uptrend_threshold"><field name="NUM">6</field></block></value>
                          </block>
                        </value>
                        <statement name="DO0">
                          <block type="notify" id="notify_over">
                            <field name="NOTIFICATION_TYPE">info</field>
                            <field name="NOTIFICATION_SOUND">silent</field>
                            <value name="MESSAGE">
                              <block type="text_join" id="join_msg_over">
                                <mutation items="2"></mutation>
                                <value name="ADD0"><block type="text" id="t1"><field name="TEXT">Uptrend Detected (Over Count: </field></block></value>
                                <value name="ADD1"><block type="variables_get" id="gt1"><field name="VAR" id="var_over_count">over_count</field></block></value>
                              </block>
                            </value>
                            <next>
                              <block type="purchase" id="buy_over">
                                <field name="PURCHASE_LIST">DIGITOVER</field>
                              </block>
                            </next>
                          </block>
                        </statement>
                        <statement name="ELSE">
                          <block type="controls_if" id="check_downtrend_if">
                            <value name="IF0">
                              <block type="logic_compare" id="check_downtrend">
                                <field name="OP">LTE</field>
                                <value name="A"><block type="variables_get" id="get_under_total"><field name="VAR" id="var_over_count">over_count</field></block></value>
                                <value name="B"><block type="math_number" id="downtrend_threshold"><field name="NUM">4</field></block></value>
                              </block>
                            </value>
                            <statement name="DO0">
                              <block type="notify" id="notify_under">
                                <field name="NOTIFICATION_TYPE">info</field>
                                <field name="NOTIFICATION_SOUND">silent</field>
                                <value name="MESSAGE">
                                  <block type="text_join" id="join_msg_under">
                                    <mutation items="2"></mutation>
                                    <value name="ADD0"><block type="text" id="t2"><field name="TEXT">Downtrend Detected (Over Count: </field></block></value>
                                    <value name="ADD1"><block type="variables_get" id="gt2"><field name="VAR" id="var_over_count">over_count</field></block></value>
                                  </block>
                                </value>
                                <next>
                                  <block type="purchase" id="buy_under">
                                    <field name="PURCHASE_LIST">DIGITUNDER</field>
                                  </block>
                                </next>
                              </block>
                            </statement>
                          </block>
                        </statement>
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
  </block>
</xml>`;

const strategies = [
    {
        name: 'Matches Top Common',
        description: 'Targets single most common digit',
        xml: MATCHES_TOP_COMMON_XML,
    },
    {
        name: 'Bulk Matches Top Common SLT',
        description: 'Alternates top 2 common digits',
        xml: BULK_MATCHES_SLT_XML,
    },
    {
        name: 'Combo OV3 / UN6 Hedger',
        description: 'Alternates Over 3 / Under 6 hedge',
        xml: COMBO_OV3_UN6_XML,
    },
    {
        name: 'Even/Odd Streak mean-reverter',
        description: 'Trades against 3+ odd/even streaks',
        xml: EVEN_ODD_STREAK_XML,
    },
    {
        name: 'Matches Longest Sleeper',
        description: 'Targets longest dormant digit',
        xml: LONGEST_SLEEPER_XML,
    },
    {
        name: 'Over 4 Trend Follower',
        description: 'Follows over/under 4 tick bias',
        xml: OVER_4_TREND_XML,
    },
];

interface CustomBotsProps {
    handleTabChange: (index: number) => void;
}

const CustomBots: React.FC<CustomBotsProps> = ({ handleTabChange }) => {
    const loadStrategy = (xmlString: string, strategyName: string) => {
        if (!window.Blockly?.derivWorkspace) {
            botNotification(
                localize('Blockly workspace is not initialized. Please open Bot Builder first.'),
                undefined,
                { type: 'error' }
            );
            return;
        }

        try {
            // FIXED: Using window.Blockly.utils.xml.textToDom as required by Deriv DBot custom parser
            const dom = window.Blockly.utils.xml.textToDom(xmlString);
            window.Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, window.Blockly.derivWorkspace);
            window.Blockly.derivWorkspace.cleanUp();
            window.Blockly.derivWorkspace.clearUndo();
            
            botNotification(
                localize(`Successfully loaded "${strategyName}" strategy into Bot Builder!`),
                undefined,
                { type: 'success' }
            );
            
            // Switch back to Bot Builder tab (index 1 now)
            handleTabChange(1);
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
            padding: '16px',
            color: 'var(--text-general)',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {strategies.map((strat, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => loadStrategy(strat.xml, strat.name)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '4px',
                            padding: '0 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '38px', // Exact height ~1cm (38px)
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                    >
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-general)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {localize(strat.name)}
                        </span>
                        <span style={{
                            fontSize: '11px',
                            color: 'var(--text-less-prominent)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            paddingLeft: '16px'
                        }}>
                            {localize(strat.description)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomBots;
