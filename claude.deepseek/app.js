/* ============================================================
   app.js —— 熊的日记 · 主交互流程
   小屋（熊 + 六件物品）→ 日记本（翻页 + 写反馈）→
   毛毡板（六张便签 + 分享故事）→ 路上（走路的熊）
============================================================ */

/* ============ 状态（localStorage 持久化，刷新不丢） ============ */

const LS_KEY = 'bearDiaryState.v1';

const state = {
  done: {},   // itemId -> 观者写下的反馈文本
  story: '',  // 观者分享的故事
  stage: 'home', // home | felt | final
};

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (e) { /* 数据损坏时忽略，从头开始 */ }
}

function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
}

/* ============ 工具 ============ */

const $ = (id) => document.getElementById(id);

let toastTimer = null;

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* 暖色淡入淡出地切换屏幕 */
let veilTimer = null;

function transitionTo(fn) {
  const veil = $('veil');
  clearTimeout(veilTimer);
  veil.classList.add('in');
  veilTimer = setTimeout(() => {
    fn();
    veil.classList.remove('in');
  }, 280);
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.toggle('active', s.id === 'screen-' + name);
  });
  window.scrollTo(0, 0);
  if (name === 'home') drawScene();
  if (name === 'felt') enterFelt();
  if (name === 'final') enterFinal();
}

/* ============================================================
   屏幕 1：熊的小屋（120×80 逻辑像素，1 格 = 8px）
============================================================ */

const SCENE = { W: 960, H: 640, SC: 8, LW: 120, LH: 80 };

const ITEM_RECTS = {
  honey:     { x: 17, y: 30, w: 8, h: 8 },  // 桌上
  umbrella:  { x: 10, y: 55, w: 8, h: 8 },  // 靠墙
  scarf:     { x: 80, y: 19, w: 6, h: 6 },  // 置物架上
  lantern:   { x: 96, y: 55, w: 8, h: 8 },  // 地板
  acorn:     { x: 41, y: 63, w: 8, h: 8 },  // 地毯前
  harmonica: { x: 68, y: 63, w: 8, h: 8 },  // 地毯前
};

const BEAR_RECT = { x: 52.5, y: 45.5, w: 15, h: 16.5 };

let hoveredKey = null; // 'bear' | 物品 id | null

function rect(ctx, x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x * SCENE.SC, y * SCENE.SC, w * SCENE.SC, h * SCENE.SC);
}

function softShadow(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx * SCENE.SC, cy * SCENE.SC, rx * SCENE.SC, ry * SCENE.SC, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(90,60,40,0.15)';
  ctx.fill();
}

function drawRoom(ctx) {
  // 墙
  rect(ctx, 0, 0, 120, 46, '#f2e0c2');
  rect(ctx, 0, 40, 120, 6, '#ead3ae');
  // 踢脚线
  rect(ctx, 0, 44, 120, 2, '#a9714b');
  // 地板 + 木板线
  rect(ctx, 0, 46, 120, 34, '#c8935f');
  for (let y = 50; y < 80; y += 4) rect(ctx, 0, y, 120, 1, '#b07c4a');
  const seams = [
    [18, 40, 62, 84, 106],
    [29, 51, 73, 95],
    [18, 40, 62, 84, 106],
    [7, 29, 51, 73, 95],
    [18, 40, 62, 84, 106],
    [29, 51, 73, 95],
    [18, 40, 62, 84, 106],
    [7, 29, 51, 73, 95],
  ];
  seams.forEach((xs, i) => {
    const y = 46 + i * 4;
    xs.forEach((x) => rect(ctx, x, y, 1, 4, '#b07c4a'));
  });
  // 窗户
  rect(ctx, 5, 7, 24, 22, '#8a5a3b');
  rect(ctx, 7, 9, 20, 18, '#cfeaf5');
  rect(ctx, 9, 12, 4, 2, '#ffffff');
  rect(ctx, 15, 15, 5, 2, '#ffffff');
  rect(ctx, 10, 20, 3, 2, '#ffffff');
  rect(ctx, 16, 9, 1, 18, '#8a5a3b');
  rect(ctx, 7, 17, 20, 1, '#8a5a3b');
  rect(ctx, 4, 29, 26, 2, '#8a5a3b');
  // 墙上小画框（爱心）
  rect(ctx, 34, 11, 9, 9, '#8a5a3b');
  rect(ctx, 35, 12, 7, 7, '#fdf3dd');
  drawSprite(ctx, PIXEL.heart, 37 * SCENE.SC, 13.2 * SCENE.SC, 2);
  // 置物架（放着围巾）
  rect(ctx, 76, 25, 27, 2, '#8a5a3b');
  rect(ctx, 88, 27, 2, 3, '#a9714b');
  // 小桌（放着蜂蜜罐）
  rect(ctx, 13, 38, 16, 2, '#a9714b');
  rect(ctx, 14, 40, 2, 6, '#8a5a3b');
  rect(ctx, 26, 40, 2, 6, '#8a5a3b');
  // 地毯
  const rug = [[48, 72], [44, 76], [42, 78], [42, 78], [44, 76], [48, 72]];
  rug.forEach((r, i) => rect(ctx, r[0], 60 + i, r[1] - r[0], 1, '#c9544a'));
  rect(ctx, 47, 62, 26, 2, '#a83e38');
  rect(ctx, 55, 63, 10, 2, '#f2e3c6');
  // 灯笼的光晕
  const g = ctx.createRadialGradient(100 * SCENE.SC, 59 * SCENE.SC, 0, 100 * SCENE.SC, 59 * SCENE.SC, 6 * SCENE.SC);
  g.addColorStop(0, 'rgba(255,210,90,0.35)');
  g.addColorStop(1, 'rgba(255,210,90,0)');
  ctx.fillStyle = g;
  ctx.fillRect(88 * SCENE.SC, 47 * SCENE.SC, 24 * SCENE.SC, 24 * SCENE.SC);
}

function drawItem(key) {
  const ctx = $('scene-canvas').getContext('2d');
  const r = ITEM_RECTS[key];
  const sprite = PIXEL['item_' + key];
  const scale = key === 'scarf' ? 3 : 4;
  const raised = hoveredKey === key ? 1 : 0;
  const cx = (r.x + r.w / 2) * SCENE.SC;
  const cy = (r.y + r.h / 2) * SCENE.SC;
  if (raised) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5 * SCENE.SC);
    g.addColorStop(0, 'rgba(255,220,140,0.45)');
    g.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 5 * SCENE.SC, cy - 5 * SCENE.SC, 10 * SCENE.SC, 10 * SCENE.SC);
  }
  if (key === 'umbrella') { // 微微斜靠着
    ctx.save();
    ctx.translate(cx, (r.y + r.h) * SCENE.SC);
    ctx.rotate(-0.14);
    drawSprite(ctx, sprite, -r.w / 2 * SCENE.SC, -r.h * SCENE.SC - raised * SCENE.SC, scale);
    ctx.restore();
  } else {
    drawSprite(ctx, sprite, r.x * SCENE.SC, (r.y - raised) * SCENE.SC, scale);
  }
}

function drawBadges(ctx) {
  STORIES.forEach((item) => {
    if (!state.done[item.id]) return;
    const r = ITEM_RECTS[item.id];
    drawSprite(ctx, PIXEL.heart, (r.x + r.w) * SCENE.SC - 28, r.y * SCENE.SC - 24, 3);
  });
}

function drawScene() {
  const ctx = $('scene-canvas').getContext('2d');
  ctx.clearRect(0, 0, SCENE.W, SCENE.H);
  drawRoom(ctx);
  // 地面阴影
  softShadow(ctx, 14, 63.5, 4.5, 1);   // 雨伞
  softShadow(ctx, 100, 63.5, 4.5, 1);  // 提灯
  softShadow(ctx, 45, 71.5, 4.5, 1);   // 橡果
  softShadow(ctx, 72, 71.5, 4.5, 1);   // 口琴
  softShadow(ctx, 60, 62, 8.5, 1.4);   // 熊
  // 物品与熊
  Object.keys(ITEM_RECTS).forEach(drawItem);
  drawSprite(ctx, PIXEL.bear_sit, 420, hoveredKey === 'bear' ? 356 : 364, 5);
  // 已听过的爱心徽章
  drawBadges(ctx);
}

/* ----- 命中检测与交互 ----- */

function toLogical(e) {
  const cv = $('scene-canvas');
  const r = cv.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) / r.width * SCENE.LW,
    y: (e.clientY - r.top) / r.height * SCENE.LH,
  };
}

function hitTest(p) {
  const pad = 0.8;
  for (const key in ITEM_RECTS) {
    const r = ITEM_RECTS[key];
    if (p.x >= r.x - pad && p.x <= r.x + r.w + pad && p.y >= r.y - pad && p.y <= r.y + r.h + pad) {
      return { kind: 'item', key };
    }
  }
  const b = BEAR_RECT;
  if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return { kind: 'bear' };
  return null;
}

function updateTip(e, key) {
  const tip = $('scene-tip');
  if (!key) { tip.hidden = true; return; }
  if (key === 'bear') {
    tip.innerHTML = '这只熊叫阿棕';
  } else {
    const item = STORIES.find((s) => s.id === key);
    tip.innerHTML = item.name + '<span>' + (state.done[key] ? '已写下' : '未翻开') + '</span>';
  }
  const wrap = e.currentTarget.parentElement;
  const wr = wrap.getBoundingClientRect();
  tip.hidden = false;
  tip.style.left = (e.clientX - wr.left + 16) + 'px';
  tip.style.top = (e.clientY - wr.top - 12) + 'px';
}

function initScene() {
  const cv = $('scene-canvas');
  cv.addEventListener('mousemove', (e) => {
    const h = hitTest(toLogical(e));
    const key = h ? (h.kind === 'bear' ? 'bear' : h.key) : null;
    if (key !== hoveredKey) { hoveredKey = key; drawScene(); }
    cv.style.cursor = key ? 'pointer' : 'default';
    updateTip(e, key);
  });
  cv.addEventListener('mouseleave', () => {
    if (hoveredKey) { hoveredKey = null; drawScene(); }
    $('scene-tip').hidden = true;
  });
  cv.addEventListener('click', (e) => {
    const h = hitTest(toLogical(e));
    if (!h) return;
    if (h.kind === 'bear') {
      toast('点我旁边的物品，就能翻开我的日记啦');
      return;
    }
    openDiary(STORIES.find((s) => s.id === h.key));
  });
}

function updateProgress() {
  const n = Object.keys(state.done).length;
  let h = '<span class="hearts">';
  for (let i = 0; i < STORIES.length; i++) {
    h += '<span class="' + (i < n ? 'on' : 'off') + '">♥</span>';
  }
  h += '</span>';
  $('home-progress').innerHTML = h + '已听完 ' + n + ' / ' + STORIES.length + ' 个故事';
}

/* ============================================================
   屏幕 2：日记本
============================================================ */

let diaryState = { item: null, idx: 0, total: 0, pages: [] };
let flipping = false;

function buildDiary(item) {
  const wrap = $('diary-pages');
  wrap.innerHTML = '';
  const total = 2 + item.pages.length; // 封面 + 正文 + 反馈页
  diaryState = { item, idx: 0, total, pages: [] };
  wrap.appendChild(makeCoverPage(item));
  item.pages.forEach((text, i) => wrap.appendChild(makeStoryPage(text, i)));
  wrap.appendChild(makeFeedbackPage(item));
  Array.from(wrap.children).forEach((p) => {
    diaryState.pages.push(p);
  });
  flipping = false;
  updateDiaryControls();
}

function makeCoverPage(item) {
  const page = document.createElement('div');
  page.className = 'page is-cover';
  const front = document.createElement('div'); front.className = 'page-front';
  const back = document.createElement('div'); back.className = 'page-back';
  const inner = document.createElement('div'); inner.className = 'cover-inner';

  const sticker = document.createElement('div'); sticker.className = 'cover-sticker';
  sticker.appendChild(makeSpriteCanvas(PIXEL['item_' + item.id], 3));
  const h2 = document.createElement('h2'); h2.textContent = item.name;
  const p1 = document.createElement('p'); p1.className = 'cover-diary'; p1.textContent = item.diary;
  const p2 = document.createElement('p'); p2.className = 'cover-hint'; p2.textContent = '点击翻开 ▸';
  inner.append(sticker, h2, p1, p2);
  inner.addEventListener('click', () => flipTo(1));

  front.appendChild(inner);
  page.append(front, back);
  return page;
}

function makeStoryPage(text, i) {
  const page = document.createElement('div');
  page.className = 'page';
  const front = document.createElement('div'); front.className = 'page-front';
  const back = document.createElement('div'); back.className = 'page-back';
  const p = document.createElement('p'); p.className = 'diary-text'; p.textContent = text;
  const num = document.createElement('span'); num.className = 'page-num'; num.textContent = '· ' + (i + 1) + ' ·';
  front.append(p, num);
  page.append(front, back);
  page.addEventListener('click', () => flipTo(diaryState.idx + 1));
  return page;
}

function makeFeedbackPage(item) {
  const page = document.createElement('div');
  page.className = 'page is-feedback';
  const front = document.createElement('div'); front.className = 'page-front';
  const back = document.createElement('div'); back.className = 'page-back';
  const fb = document.createElement('div'); fb.className = 'fb';
  fb.style.setProperty('--item-accent', item.color);

  const prompt = document.createElement('p'); prompt.className = 'fb-prompt'; prompt.textContent = item.prompt;
  const ta = document.createElement('textarea'); ta.className = 'fb-input'; ta.maxLength = 300;
  ta.placeholder = '在这里写下你的看法……';
  ta.value = state.done[item.id] || '';
  const hint = document.createElement('p'); hint.className = 'fb-hint'; hint.textContent = '写完后，点下面的按钮还给熊';
  const btn = document.createElement('button'); btn.className = 'fb-submit'; btn.type = 'button';
  btn.textContent = '写好了，还给熊 ▸';
  btn.addEventListener('click', () => submitFeedback(ta, hint));

  fb.append(prompt, ta, hint, btn);
  front.appendChild(fb);
  page.append(front, back);
  return page;
}

function flipTo(idx) {
  const d = diaryState;
  if (flipping || idx === d.idx || idx < 0 || idx > d.total - 1) return;
  flipping = true;
  let p; // 正在翻转的那一页
  if (idx > d.idx) { // 向前翻
    p = d.pages[d.idx];
    p.classList.add('no-events');
    p.style.setProperty('--depth', d.idx + 1);
    p.classList.add('flipped');
    d.idx++;
  } else { // 向后翻（合上当前页）
    p = d.pages[idx];
    p.classList.add('no-events');
    p.style.removeProperty('--depth');
    p.classList.remove('flipped');
    d.idx = idx;
  }
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    flipping = false;
    document.querySelectorAll('.page.no-events').forEach((el) => el.classList.remove('no-events'));
    updateDiaryControls();
  };
  p.addEventListener('transitionend', function h(e) {
    if (e.propertyName === 'transform') {
      p.removeEventListener('transitionend', h);
      finish();
    }
  });
  setTimeout(finish, 850); // 兜底
}

function updateDiaryControls() {
  const d = diaryState;
  // 动态层级：
  //   当前页最上；已翻到左侧的页按翻页顺序叠放；
  //   未翻到的页压在右侧底下（下一层最先被翻到）
  d.pages.forEach((p, i) => {
    if (i === d.idx) p.style.zIndex = 1000;
    else if (i < d.idx) p.style.zIndex = 100 + i;
    else p.style.zIndex = d.total - i;
  });
  $('prev-page').disabled = d.idx === 0;
  $('next-page').hidden = d.idx === d.total - 1;
  const step = $('diary-step');
  if (d.idx === 0) step.textContent = '封面';
  else if (d.idx === d.total - 1) step.textContent = '写下你的话';
  else step.textContent = '第 ' + d.idx + ' / ' + (d.total - 2) + ' 页';
  const dots = $('diary-dots');
  dots.innerHTML = '';
  for (let i = 0; i < d.total; i++) {
    const s = document.createElement('span');
    if (i === d.idx) s.className = 'on';
    dots.appendChild(s);
  }
}

function submitFeedback(ta, hint) {
  const v = ta.value.trim();
  if (!v) {
    ta.classList.add('shake');
    hint.textContent = '写点什么，再还给熊吧';
    hint.classList.add('warn');
    setTimeout(() => ta.classList.remove('shake'), 500);
    return;
  }
  state.done[diaryState.item.id] = v;
  saveState();
  toast('熊把你说的话，认真收好了。');
  transitionTo(() => {
    showScreen('home');
    updateProgress();
    maybeAllDone();
  });
}

function openDiary(item) {
  $('diary-item-name').textContent = item.name;
  buildDiary(item);
  transitionTo(() => showScreen('diary'));
}

function initDiary() {
  $('diary-close').addEventListener('click', () => transitionTo(() => showScreen('home')));
  $('prev-page').addEventListener('click', () => flipTo(diaryState.idx - 1));
  $('next-page').addEventListener('click', () => flipTo(diaryState.idx + 1));
}

/* ============================================================
   六个故事听完 → 时刻层 → 毛毡板
============================================================ */

let momentShown = false;
let momentTimer = null;

function maybeAllDone() {
  if (momentShown) return;
  if (Object.keys(state.done).length !== STORIES.length) return;
  if (state.stage !== 'home') return;
  momentShown = true;
  $('moment').classList.add('active');
  momentTimer = setTimeout(goFelt, 2600);
}

function goFelt() {
  clearTimeout(momentTimer);
  $('moment').classList.remove('active');
  state.stage = 'felt';
  saveState();
  transitionTo(() => showScreen('felt'));
}

function initMoment() {
  $('moment').addEventListener('click', goFelt); // 点击可跳过等待
}

/* ============================================================
   屏幕 3：毛毡板
============================================================ */

function enterFelt() {
  const board = $('felt-board');
  board.innerHTML = '';
  const rots = [-2.5, 1.5, -1.2, 2, -1.8, 2.4];
  STORIES.forEach((item, i) => {
    board.appendChild(makeNote(item, state.done[item.id] || '', rots[i], i));
  });
  drawSprite($('felt-bear').getContext('2d'), PIXEL.bear_sit, 0, 0, 3);
  const card = $('share-card');
  card.classList.remove('visible');
  setTimeout(() => card.classList.add('visible'), 2000);
}

function makeNote(item, feedback, rot, i) {
  const note = document.createElement('div');
  note.className = 'note';
  note.style.setProperty('--rot', rot + 'deg');
  note.style.setProperty('--delay', (i * 0.28) + 's');
  const pin = document.createElement('span'); pin.className = 'pin';
  const head = document.createElement('div'); head.className = 'note-head';
  const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = item.color;
  const b = document.createElement('b'); b.textContent = item.name;
  const em = document.createElement('em'); em.textContent = '熊的日记';
  head.append(dot, b, em);
  const body = document.createElement('div'); body.className = 'note-body'; body.textContent = feedback;
  note.append(pin, head, body);
  return note;
}

function goFinal() {
  state.stage = 'final';
  saveState();
  transitionTo(() => showScreen('final'));
}

function initFelt() {
  $('share-btn').addEventListener('click', () => {
    const v = $('share-input').value.trim();
    if (!v) {
      toast('写下你的故事，或者选择直接陪熊走走');
      return;
    }
    state.story = v;
    goFinal();
  });
  $('share-skip').addEventListener('click', () => {
    state.story = '';
    goFinal();
  });
}

/* ============================================================
   屏幕 4：路上的熊（黄昏、星星、月亮、公路）
============================================================ */

let finalRunning = false;
let finalW = 0, finalH = 0;
let bearX = -140, frame = 0, frameAcc = 0, lastT = 0;
let stars = [];

function seededRnd(seed) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function enterFinal() {
  if (finalRunning) return;
  finalRunning = true;
  const cv = $('final-canvas');
  const fit = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    finalW = window.innerWidth;
    finalH = window.innerHeight;
    cv.width = finalW * dpr;
    cv.height = finalH * dpr;
    cv.style.width = finalW + 'px';
    cv.style.height = finalH + 'px';
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  window.addEventListener('resize', fit);
  const rnd = seededRnd(20261001);
  stars = [];
  for (let i = 0; i < 70; i++) {
    stars.push({ x: rnd(), y: rnd() * 0.5, r: rnd() < 0.25 ? 2 : 1, p: rnd() * 6.28 });
  }
  bearX = -140;
  frame = 0;
  frameAcc = 0;
  lastT = performance.now();
  requestAnimationFrame(loopFinal);
  // 观者的故事卡片
  setTimeout(() => {
    const card = $('final-story');
    if (state.story) {
      $('final-story-title').textContent = '你的故事';
      $('final-story-text').textContent = state.story;
      $('final-closing').textContent = '熊把你的故事装进行囊，继续向前走了。';
    } else {
      $('final-story-title').textContent = '就这样安静地走一段';
      $('final-story-text').textContent = '你安静地陪熊走了一段路。这也不错。';
      $('final-closing').textContent = '';
    }
    card.classList.add('visible');
  }, 1300);
}

function loopFinal(now) {
  const dt = Math.min(50, now - lastT);
  lastT = now;
  bearX += dt * 0.055;
  if (bearX > finalW + 140) bearX = -140;
  frameAcc += dt;
  if (frameAcc > 170) { frameAcc = 0; frame = (frame + 1) % 4; }
  drawFinalFrame(now);
  requestAnimationFrame(loopFinal);
}

function drawPine(ctx, x, baseY, s) {
  ctx.fillStyle = '#33283a';
  ctx.fillRect(x - 3 * s, baseY - 18 * s, 6 * s, 18 * s);
  ctx.beginPath();
  ctx.moveTo(x, baseY - 60 * s);
  ctx.lineTo(x - 16 * s, baseY - 22 * s);
  ctx.lineTo(x + 16 * s, baseY - 22 * s);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, baseY - 50 * s);
  ctx.lineTo(x - 13 * s, baseY - 20 * s);
  ctx.lineTo(x + 13 * s, baseY - 20 * s);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, baseY - 40 * s);
  ctx.lineTo(x - 10 * s, baseY - 14 * s);
  ctx.lineTo(x + 10 * s, baseY - 14 * s);
  ctx.closePath(); ctx.fill();
}

function drawFinalFrame(now) {
  const ctx = $('final-canvas').getContext('2d');
  const W = finalW, H = finalH;
  // 天空（黄昏渐变）
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#f9c784');
  sky.addColorStop(0.55, '#e08a6a');
  sky.addColorStop(1, '#6b5a7c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // 星星（闪烁）
  const t = now / 1000;
  for (const s of stars) {
    ctx.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.8 + s.p));
    ctx.fillStyle = '#fff5d6';
    ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
  }
  ctx.globalAlpha = 1;
  // 月亮
  const mx = W * 0.8, my = H * 0.16;
  const mg = ctx.createRadialGradient(mx, my, 10, mx, my, 130);
  mg.addColorStop(0, 'rgba(255,233,176,0.35)');
  mg.addColorStop(1, 'rgba(255,233,176,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(mx - 130, my - 130, 260, 260);
  ctx.fillStyle = '#ffe9b0';
  ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(230,200,140,0.5)';
  ctx.beginPath(); ctx.arc(mx - 12, my - 8, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + 10, my + 12, 5, 0, Math.PI * 2); ctx.fill();
  // 远山
  ctx.fillStyle = '#4a3a55';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.68);
  ctx.bezierCurveTo(W * 0.22, H * 0.54, W * 0.42, H * 0.72, W * 0.64, H * 0.6);
  ctx.lineTo(W, H * 0.64);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath(); ctx.fill();
  // 近山树线
  ctx.fillStyle = '#3d3140';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.72);
  ctx.bezierCurveTo(W * 0.3, H * 0.66, W * 0.6, H * 0.74, W, H * 0.68);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath(); ctx.fill();
  // 松树剪影
  const trees = [
    [0.06, 0.9], [0.2, 1.25], [0.38, 0.85], [0.52, 1.15], [0.7, 0.8], [0.88, 1.2],
  ];
  trees.forEach(([tx, s]) => drawPine(ctx, tx * W, H * 0.72, s));
  // 公路
  const roadY = H * 0.72;
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(0, roadY, W, H - roadY);
  ctx.fillStyle = '#cbb894';
  ctx.fillRect(0, roadY, W, 3);
  // 路面虚线（随熊的移动后退）
  ctx.fillStyle = '#d8c9a8';
  const step = 110;
  const off = (bearX * 0.5) % step;
  for (let x = -off; x < W; x += step) {
    ctx.fillRect(x, roadY + H * 0.14, 56, 7);
  }
  // 走路的熊（4 帧循环，路过时轻微起伏）
  const bob = [3, 0, 3, 0][frame];
  drawSprite(ctx, PIXEL['bear_walk_' + frame], bearX, roadY - 84 - bob, 4);
}

/* ============================================================
   初始化
============================================================ */

function initRestart() {
  $('restart-btn').addEventListener('click', () => {
    localStorage.removeItem(LS_KEY);
    location.reload();
  });
}

loadState();
initScene();
initDiary();
initFelt();
initMoment();
initRestart();
drawScene();
updateProgress();

// 路由：刷新后回到上次所在阶段
if (state.stage === 'felt') {
  showScreen('felt');
} else if (state.stage === 'final') {
  showScreen('final');
} else {
  showScreen('home');
  maybeAllDone();
}
