'use strict';
/*
 * 极速101 · 自动化自测
 * ---------------------------------------------------------------
 * 用 jsdom 加载真实的 index.html，把玩家与 AI 都用策略驱动，
 * 让游戏自己连跑多局，检测卡死 / 异常 / 状态泄漏。
 *
 * 依赖 jsdom 装在 managed node workspace（见任务说明），不污染游戏目录。
 * 本文件为独立测试脚本，不并入 index.html。
 *
 * 运行：
 *   /Users/lcy/.workbuddy/binaries/node/versions/22.22.2/bin/node \
 *     /Users/lcy/speed101/speed101/tests/auto-play.js
 */

const fs = require('fs');
const path = require('path');

const GAME_DIR = '/Users/lcy/speed101/speed101';
const INDEX_HTML = path.join(GAME_DIR, 'index.html');
const REPORT_PATH = path.join(GAME_DIR, 'tests', 'auto-play-report.json');

// ---- 载入 jsdom（优先从 cwd 的 node_modules，回退到 managed workspace）----
let JSDOM;
try {
  JSDOM = require('jsdom').JSDOM;
} catch (e) {
  JSDOM = require('/Users/lcy/.workbuddy/binaries/node/workspace/node_modules/jsdom').JSDOM;
}

const MAX_STEPS = 5000;          // 单局步数上限（超过判卡死/非终止）
const TOTAL_GAMES = 300;         // 跑 300 局（修复复测：更稳地暴露 double+skip 残留）

// ===================== 1. 语法自检 =====================
function syntaxCheck() {
  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) return { ok: false, error: '未找到 <script> 块' };
  const code = m[1];
  try {
    // 仅编译，不执行（验证语法，不依赖浏览器全局）
    new Function(code);
    return { ok: true, length: code.length };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

// ===================== 主流程 =====================
function main() {
  const syn = syntaxCheck();
  console.log('=== 语法自检 ===');
  if (!syn.ok) {
    console.log('FAIL: ' + syn.error);
    process.exit(1);
  }
  console.log('PASS: index.html 内联脚本编译通过（长度 ' + syn.length + ' 字符）');

  // ---- 加载真实游戏 ----
  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://localhost/'
  });
  const g = dom.window;

  // 把 setTimeout 替换为 no-op：由测试同步驱动，避免异步挂起
  try {
    g.setTimeout = function () { return 0; };
  } catch (e) {
    try {
      Object.defineProperty(g, 'setTimeout', { value: function () { return 0; }, configurable: true });
    } catch (e2) { /* ignore */ }
  }

  // 暴露引擎内部（不修改 index.html，仅在本页 eval 中桥接）
  // 注意：state 是顶层 let（词法全局），不能直接 window.state 访问，
  // 但同作用域的 eval 可见，故用闭包函数桥接出来。
  g.eval(`
    window.__initGame = initGame;
    window.__playCard = playCard;
    window.__chooseAiCard = chooseAiCard;
    window.__advanceTurn = advanceTurn;
    window.__nextAliveIdx = nextAliveIdx;
    window.__getState = function () { return state; };
  `);
  if (typeof g.__initGame !== 'function') {
    console.log('FAIL: 无法从 window 暴露引擎函数（jsdom eval 访问全局词法作用域失败）');
    process.exit(1);
  }
  console.log('PASS: 引擎函数已桥接 (initGame / playCard / chooseAiCard / advanceTurn / nextAliveIdx)');

  // ===================== 2. 定向验证（本次修复点）=====================
  console.log('\n=== 定向验证（修复点）===');
  const targeted = [];

  // Test A：升档加速后手牌无速度牌 -> 不应卡死（兜底 fix2）
  g.__initGame(1, 'medium');
  g.eval(`
    state.currentIdx = 0;
    state.extraSpeedMode = false;
    state.skippedPlayerId = null;
    state.doublePlayTarget = null;
    state.deck = [];
    state.discard = [];
    state.speed = 0;
    state.players[0].hand = [
      { type:'func', name:'升档加速', effect:'extraSpeed', value:0 },
      { type:'func', name:'刹车',   effect:'add', value:-10 },
      { type:'func', name:'急刹',   effect:'add', value:-20 }
    ];
  `);
  let st = g.__getState();
  const aBefore = st.currentIdx;
  g.__playCard(st.players[0], 0); // 打出升档加速
  st = g.__getState();
  const aPass = (st.extraSpeedMode === false) && (st.currentIdx !== aBefore || st.gameOver);
  targeted.push({
    name: 'A. 升档加速后无速度牌 → 不卡死',
    pass: aPass,
    detail: `extraSpeedMode=${st.extraSpeedMode}(期望 false), currentIdx ${aBefore}->${st.currentIdx}, gameOver=${st.gameOver}`
  });

  // Test B：升档加速后出速度牌 → 模式应被清除（fix1 修复模式泄漏）
  g.__initGame(1, 'medium');
  g.eval(`
    state.currentIdx = 0;
    state.extraSpeedMode = false;
    state.skippedPlayerId = null;
    state.doublePlayTarget = null;
    state.deck = [{ type:'speed', value:1, name:'+1' }];
    state.discard = [];
    state.speed = 0;
    state.players[0].hand = [
      { type:'func',  name:'升档加速', effect:'extraSpeed', value:0 },
      { type:'speed', value:5, name:'+5' },
      { type:'func',  name:'刹车', effect:'add', value:-10 }
    ];
  `);
  st = g.__getState();
  g.__playCard(st.players[0], 0); // 升档加速
  st = g.__getState();
  const bModeDuring = st.extraSpeedMode; // 期望 true（等待额外出 1 张速度牌）
  const bIdxBefore = st.currentIdx;
  g.__playCard(st.players[0], 0); // 出 +5 速度牌
  st = g.__getState();
  const bPass = (bModeDuring === true) && (st.extraSpeedMode === false) &&
    (st.currentIdx !== bIdxBefore || st.gameOver);
  targeted.push({
    name: 'B. 升档加速后出速度牌 → 关闭模式(无泄漏)',
    pass: bPass,
    detail: `升档后 extraSpeedMode=${bModeDuring}(期望 true), 出速度牌后 extraSpeedMode=${st.extraSpeedMode}(期望 false), currentIdx ${bIdxBefore}->${st.currentIdx}`
  });

  targeted.forEach(t => console.log((t.pass ? 'PASS' : 'FAIL') + ': ' + t.name + ' | ' + t.detail));

  // ===================== 3. 100 局自动对战 =====================
  console.log('\n=== 100 局自动对战（AI 策略驱动双方玩家）===');
  const games = [];
  const anomalyCounters = {};
  const allAnomalies = [];
  const comboStats = {}; // `aiCount|level` -> {total, pass}

  function recordAnomaly(type, detail, gi) {
    anomalyCounters[type] = (anomalyCounters[type] || 0) + 1;
    allAnomalies.push({ game: gi, type, detail });
  }

  for (let gi = 0; gi < TOTAL_GAMES; gi++) {
    const aiCount = [1, 2, 3, 4, 5][gi % 5];
    const level = ['easy', 'medium', 'hard'][Math.floor(gi / 5) % 3];
    const comboKey = aiCount + '|' + level;
    comboStats[comboKey] = comboStats[comboKey] || { total: 0, pass: 0 };

    const res = { gi, aiCount, level, steps: 0, gameOver: false, ok: true, anomalies: [] };
    try {
      g.__initGame(aiCount, level);
      st = g.__getState();

      // 局间残留检查（initGame 应重置）
      if (st.extraSpeedMode !== false) recordAnomaly('RESIDUE_extraSpeedMode', '新局 extraSpeedMode=' + st.extraSpeedMode, gi);
      if (st.doublePlayTarget !== null) recordAnomaly('RESIDUE_doublePlayTarget', '新局 doublePlayTarget=' + st.doublePlayTarget, gi);

      const playCounts = st.players.map(p => 0);
      const localAnoms = new Set();
      let steps = 0;
      let extraStuckEver = false;

      while (!st.gameOver && steps < MAX_STEPS) {
        steps++;
        const p = st.players[st.currentIdx];
        if (!p) { recordAnomaly('NO_CURRENT_PLAYER', 'currentIdx=' + st.currentIdx, gi); break; }
        if (!p.alive) { g.__advanceTurn(); continue; }
        if (p.hand.length === 0) { localAnoms.add('EMPTY_HAND'); g.__advanceTurn(); continue; }

        const prevIdx = st.currentIdx;
        const extraBefore = st.extraSpeedMode;

        let idx;
        if (st.extraSpeedMode) {
          // 升档加速额外出：只能出速度牌（与真实 UI 限制一致）
          idx = p.hand.findIndex(c => c.type === 'speed');
          if (idx < 0) {
            // 不应发生：fix2 应在打出升档加速时自动清除模式
            extraStuckEver = true;
            localAnoms.add('DEADLOCK_extraSpeedNoSpeed');
            break;
          }
        } else {
          idx = g.__chooseAiCard(p);
        }
        if (idx == null || idx < 0 || idx >= p.hand.length) idx = 0;

        const chosen = p.hand[idx];
        const isSkip = chosen && chosen.effect === 'skip';
        const isDouble = chosen && chosen.effect === 'double';

        g.__playCard(p, idx);
        playCounts[p.id] = (playCounts[p.id] || 0) + 1;
        st = g.__getState();

        // TURN_SKIP：非超车/非连续油门/非升档的普通出牌，回合应只前进 1 个存活位。
        // 若前进了 2 位，说明触发了“每回合多跳一人”的隐藏缺陷。
        if (!st.gameOver && prevIdx !== st.currentIdx && !isSkip && !isDouble && !extraBefore) {
          const expected = g.__nextAliveIdx(prevIdx);
          if (st.currentIdx !== expected) localAnoms.add('TURN_SKIP');
        }
        // 升档加速模式泄漏：模式仍开但当前玩家手牌已无速度牌（非刚打出升档加速的瞬间）
        if (st.extraSpeedMode && !st.gameOver) {
          const sp = st.players[st.currentIdx].hand.some(c => c.type === 'speed');
          if (!sp) localAnoms.add('EXTRA_LEAK_noSpeed');
        }
      }

      res.steps = steps;
      res.gameOver = !!st.gameOver;

      // ---- 终局断言 ----
      if (steps >= MAX_STEPS && !st.gameOver) {
        res.ok = false;
        localAnoms.add(extraStuckEver ? 'DEADLOCK_stepCap' : 'NONTERMINATING_stepCap');
      }
      if (typeof st.speed !== 'number' || isNaN(st.speed)) { res.ok = false; localAnoms.add('SPEED_NAN'); }
      if (st.players.some(pl => pl.tires < 0)) { res.ok = false; localAnoms.add('NEG_TIRES'); }
      if (st.extraSpeedMode) { res.ok = false; localAnoms.add('EXTRA_LEAK_atEnd'); }
      if (st.doublePlayTarget !== null) { res.ok = false; localAnoms.add('DOUBLE_LEAK_atEnd'); }
      st.players.forEach(pl => { if (playCounts[pl.id] === 0) { res.ok = false; localAnoms.add('STARVATION_p' + pl.id); } });

      localAnoms.forEach(t => { res.anomalies.push(t); recordAnomaly(t, 'aiCount=' + aiCount + ' level=' + level, gi); });

      comboStats[comboKey].total++;
      if (res.ok) comboStats[comboKey].pass++;
    } catch (e) {
      res.ok = false;
      res.error = String((e && e.stack) || e);
      recordAnomaly('CRASH', (res.error || '').split('\n')[0], gi);
    }
    games.push(res);
  }

  // ===================== 4. 汇总 =====================
  const passCount = games.filter(r => r.ok).length;
  const failCount = games.length - passCount;
  console.log('完成(无卡死/崩溃/状态损坏): ' + passCount + '/' + TOTAL_GAMES + '  失败: ' + failCount + '/' + TOTAL_GAMES);

  console.log('\n--- 各组合通过率 ---');
  Object.keys(comboStats).sort().forEach(k => {
    const s = comboStats[k];
    console.log('  aiCount=' + k.split('|')[0] + ' level=' + k.split('|')[1] + ': ' + s.pass + '/' + s.total);
  });

  console.log('\n--- 异常分类统计（按类型）---');
  const types = Object.keys(anomalyCounters).sort();
  if (types.length === 0) console.log('  （无异常）');
  else types.forEach(t => console.log('  ' + t + ': ' + anomalyCounters[t] + ' 次'));

  const crashes = allAnomalies.filter(a => a.type === 'CRASH');
  if (crashes.length) {
    console.log('\n--- CRASH 样例 ---');
    crashes.slice(0, 3).forEach(c => console.log('  game ' + c.game + ': ' + c.detail));
  }

  // 关键信号：本次修复对应的卡死/泄漏是否仍在随机对局中出现
  const deadlockStills = (anomalyCounters['DEADLOCK_extraSpeedNoSpeed'] || 0) +
    (anomalyCounters['DEADLOCK_stepCap'] || 0) +
    (anomalyCounters['EXTRA_LEAK_noSpeed'] || 0) +
    (anomalyCounters['EXTRA_LEAK_atEnd'] || 0);
  const targetedAllPass = targeted.every(t => t.pass);
  const deadlockFixVerdict = (targetedAllPass && deadlockStills === 0)
    ? '生效（定向+随机对局均无卡死/模式泄漏）'
    : '需复核（见上方 FAIL / 计数）';

  // 完成完整性（无卡死/崩溃/状态损坏）vs 逻辑缺陷（不影响完成，但属 bug）
  const blockingTypes = ['SPEED_NAN', 'NEG_TIRES', 'EXTRA_LEAK_atEnd', 'DOUBLE_LEAK_atEnd',
    'STARVATION_p0', 'STARVATION_p1', 'STARVATION_p2', 'STARVATION_p3', 'STARVATION_p4', 'STARVATION_p5',
    'CRASH', 'DEADLOCK_stepCap', 'NONTERMINATING_stepCap', 'EMPTY_HAND', 'NO_CURRENT_PLAYER',
    'RESIDUE_extraSpeedMode', 'RESIDUE_doublePlayTarget'];
  const completionPass = games.filter(r => r.ok).length;
  const turnSkipCount = anomalyCounters['TURN_SKIP'] || 0;

  // 结构化“新 bug 清单”（仅列出确有信号者）
  const newBugs = [];
  if (turnSkipCount > 0) {
    newBugs.push({
      id: 'BUG-skipPlayerId-uninit',
      title: '首回合多跳一人（回合顺序错误）',
      signal: 'TURN_SKIP 在 ' + turnSkipCount + '/' + TOTAL_GAMES + ' 局触发',
      rootCause: 'initGame 的 state 未初始化 skippedPlayerId（为 undefined）。' +
        '回合流转里 `if (state.skippedPlayerId !== null)` 对 undefined 也为 true，' +
        '导致每一局第一次出牌后都错误地“跳过一人”（前进 2 个存活位）。' +
        '该分支会把 skippedPlayerId 置为 null，故仅首回合异常，之后恢复正常（自愈合）。',
      impact: '首回合当前玩家之后的那名玩家被多跳一次（2人局=先手白赚连续2回合；多人局=该玩家首轮被延后）。' +
        '不自旋、不卡死、不损坏状态，但影响公平性与回合顺序正确性。',
      suggestion: '在 initGame 的 state 对象中加入 `skippedPlayerId: null`（一行）。' +
        '注意：本任务约束只改 playCard 两处，故未在此处修复，交由主理人单独合入。',
      reproduce: '任意对局：第 1 次出牌（非超车/非升档）后 currentIdx 前进了 2 个存活位而非 1。'
    });
  }

  console.log('\n=== 结论 ===');
  console.log('语法自检              : ' + (syn.ok ? 'PASS' : 'FAIL'));
  console.log('定向验证(修复点)      : ' + (targetedAllPass ? '全部 PASS' : '存在 FAIL'));
  console.log('卡死修复判定          : ' + deadlockFixVerdict + '  [随机局卡死/泄漏计数=' + deadlockStills + ']');
  console.log('完成完整率(无卡死/崩溃/损坏): ' + completionPass + '/' + TOTAL_GAMES +
    ' (' + (completionPass / TOTAL_GAMES * 100).toFixed(0) + '%)');
  console.log('逻辑缺陷检出(TURN_SKIP): ' + turnSkipCount + '/' + TOTAL_GAMES + ' 局');
  if (newBugs.length) {
    console.log('\n--- 发现的新 bug ---');
    newBugs.forEach(b => {
      console.log('• [' + b.id + '] ' + b.title);
      console.log('    信号: ' + b.signal);
      console.log('    根因: ' + b.rootCause);
      console.log('    影响: ' + b.impact);
      console.log('    建议: ' + b.suggestion);
      console.log('    复现: ' + b.reproduce);
    });
  } else {
    console.log('\n未发现其它逻辑缺陷（掉头2人局 / 连续油门爆胎 / 失控反转边界等在 100 局中均无崩溃/NaN）。');
  }

  const report = {
    syntaxOk: syn.ok,
    targeted,
    total: games.length,
    completionPass,
    completionRate: completionPass / games.length,
    turnSkipCount,
    deadlockFixVerdict,
    deadlockStills,
    newBugs,
    anomalyCounters,
    comboStats,
    sampledGameDetails: games.slice(0, 10).map(r => ({
      gi: r.gi, aiCount: r.aiCount, level: r.level,
      steps: r.steps, gameOver: r.gameOver, ok: r.ok, anomalies: r.anomalies
    }))
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log('\n报告已写入: ' + REPORT_PATH);
}

main();
