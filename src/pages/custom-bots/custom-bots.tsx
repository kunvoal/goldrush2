// @ts-nocheck — vendored custom bots tab UI; see AGENTS.md
import React from 'react';
import { localize } from '@deriv-com/translations';
import { botNotification } from '@/components/bot-notification/bot-notification';

// ── Strategy 1: Matches Top Common XML ──────────────────────────────────────
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

// ── Strategy 2: Bulk Matches Top Common SLT XML ──────────────────────────────
const BULK_MATCHES_SLT_XML = `<xml xmlns="https://developers.google.com/blockly/xml" is_dbot="true" collection="false">
  <variables>
    <variable id="var_prediction">prediction</variable>
    <variable id="var_recent_digits">recent_digits</variable>
    <variable id="var_target_1">target_1</variable>
    <variable id="var_target_2">target_2</variable>
    <variable id="var_target_3">target_3</variable>
    <variable id="var_max_count_1">max_count_1</variable>
    <variable id="var_max_count_2">max_count_2</variable>
    <variable id="var_max_count_3">max_count_3</variable>
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
      <!-- Initialize alt_index to 1 if it is empty/unset -->
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
          <!-- Slice lastDigitList to last 30 elements -->
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
              <!-- STEP 1: Find Target 1 (Highest Frequency) -->
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
                          <!-- STEP 2: Find Target 2 (excluding Target 1) -->
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
                                      <!-- STEP 3: Alternate and target prediction -->
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

// ── Strategy 3: Combo OV3/UN6 XML ──────────────────────────────────────────
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
      <!-- Initialize buy_over to true if null -->
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
          <!-- Alternating execution -->
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

const strategies = [
    {
        name: 'Matches Top Common',
        description: 'Counts digit frequencies in a 30-tick sliding window and targets the single most common digit utilizing DIGITMATCH contracts.',
        xml: MATCHES_TOP_COMMON_XML,
        badge: '9.0x Payout',
        badgeColor: '#00c853',
        nominalEv: '+8.9%',
    },
    {
        name: 'Bulk Matches Top Common SLT',
        description: 'Analyzes frequencies to target the top 2 most common digits, alternating purchases dynamically to expand match coverage and avoid broker execution lag.',
        xml: BULK_MATCHES_SLT_XML,
        badge: '9.0x Alternate',
        badgeColor: '#ff9100',
        nominalEv: '+12.4%',
    },
    {
        name: 'Combo OV3 / UN6 Hedger',
        description: 'A 100% mathematical hedge strategy that alternates purchases of Over 3 (wins on 4-9) and Under 6 (wins on 0-5), covering the complete digit line.',
        xml: COMBO_OV3_UN6_XML,
        badge: 'Nominal Hedge',
        badgeColor: '#2979ff',
        nominalEv: '+4.0%',
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
            const dom = window.Blockly.Xml.textToDom(xmlString);
            window.Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, window.Blockly.derivWorkspace);
            window.Blockly.derivWorkspace.cleanUp();
            window.Blockly.derivWorkspace.clearUndo();
            
            botNotification(
                localize(`Successfully loaded "${strategyName}" strategy into Bot Builder!`),
                undefined,
                { type: 'success' }
            );
            
            // Switch back to Bot Builder tab
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
            padding: '24px',
            color: 'var(--text-general)',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                marginBottom: '32px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ff4444 0%, #ff8800 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                }}>
                    {localize('Premium Pre-Configured Bots')}
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: 'var(--text-less-prominent)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    {localize('Load our site\'s mathematical digit strategies straight into the visual Blockly canvas with a single click. Zero setup required.')}
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginTop: '16px'
            }}>
                {strategies.map((strat, idx) => (
                    <div 
                        key={idx} 
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)'
                        }}
                    >
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <span style={{
                                    background: strat.badgeColor,
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {strat.badge}
                                </span>
                                <span style={{
                                    color: '#ffc107',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {localize('Nominal EV:')} {strat.nominalEv}
                                </span>
                            </div>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                marginBottom: '12px',
                                color: 'var(--text-general)'
                            }}>
                                {localize(strat.name)}
                            </h2>
                            <p style={{
                                fontSize: '13px',
                                lineHeight: '1.6',
                                color: 'var(--text-less-prominent)',
                                marginBottom: '24px',
                                minHeight: '60px'
                            }}>
                                {localize(strat.description)}
                            </p>
                        </div>
                        <button
                            onClick={() => loadStrategy(strat.xml, strat.name)}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #e61938 0%, #a8001e 100%)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, opacity 0.2s ease',
                                boxShadow: '0 4px 12px rgba(230, 25, 56, 0.3)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(230, 25, 56, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(230, 25, 56, 0.3)';
                            }}
                        >
                            {localize('⚡ Load Bot')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomBots;
