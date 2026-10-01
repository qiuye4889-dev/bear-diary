/* ============================================================
   pixel.js —— 像素精灵定义与绘制工具
   ｜想改图案就改这里｜
   - 每个精灵由「调色板 palette + 像素图 map」组成
   - map 每行必须是等长字符串，"." 表示透明
   - drawSprite() 把精灵画到 canvas 上，scale 为放大倍数
============================================================ */

const PIXEL = {
  /* ---------- 坐着的熊（正面） 24×26 ---------- */
  bear_sit: {
    palette: {
      D: '#5e3b26', // 深棕（轮廓）
      B: '#8a5a3b', // 熊棕
      L: '#eccfa8', // 口鼻浅色
      C: '#f2e3c6', // 肚皮奶白
      N: '#3a2a20', // 鼻子
      E: '#26221f', // 眼睛
      W: '#ffffff', // 高光
      P: '#e0918a', // 腮红
    },
    map: [
      '.....DD..........DD.....',
      '....DBBD........DBBD....',
      '....DBBD..DDDD..DBBD....',
      '.....DD..DBBBBD..DD.....',
      '.........DBBBBBBD.......',
      '........DBBBBBBBBD......',
      '......DBBBEW..WEBBBBD...',
      '......DBBEE...EEBBBD....',
      '.......DBBBBBBBBBBD.....',
      '......DBPBBBBBBBBPBD....',
      '......DBBBBBBBBBBBBD....',
      '....DBBBLLLLLLLLBBBD....',
      '....DBBLLNNNNLLBBD......',
      '....DBBLLNNNNLLBBD......',
      '.....DBBLLLLLLBBDD......',
      '......DBBBBBBBBBD.......',
      '......DBBBBBBBBBBD......',
      '.....DBBBCCCCCCBBBD.....',
      '.....DBBCCCCCCCCBBD.....',
      '.....DBBCCCCCCCCBBD.....',
      '.....DBBBBBBBBBBBBD.....',
      '.....DBBBBBBBBBBBBD.....',
      '......DBBBDDDDDDBBBD....',
      '......DBBD.....DBBD.....',
      '......DBBD.....DBBD.....',
      '......DDD.......DDD.....',
    ],
  },

  /* ---------- 走路的熊（侧面朝右） 20×24，4 帧 ---------- */
  bear_walk_0: {
    palette: {
      D: '#5e3b26', B: '#8a5a3b', L: '#eccfa8', C: '#f2e3c6',
      N: '#3a2a20', E: '#26221f', R: '#b5543f', // R = 背包
    },
    map: [
      '.........DDDD.......',
      '.......DDBBBBBD.....',
      '......DBBBBBBBBD....',
      '.....DBBBBBBBBBBD...',
      '.....DBBBBBBBBEBBD..',
      '.....DBBBBBBBEEBBD..',
      '.....DBBBBBBBBBBBD..',
      '.....DBBBLLLBBBBBD..',
      '......DBBBLLLBBBBD..',
      '.......DBBLNNBBBBBD.',
      '........DBBBBBBBBBD.',
      '.........DBBBBBBD...',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RR...DBBCCCCCCDB.',
      '........DBBBBBBBDB..',
      '........DBBBBBBBDB..',
      '.........DBBBBBB....',
      '.........DBB.DBB....',
      '.........DBB.DBB....',
      '........DDDB.DDDB...',
      '....................',
    ],
  },
  bear_walk_1: {
    palette: {
      D: '#5e3b26', B: '#8a5a3b', L: '#eccfa8', C: '#f2e3c6',
      N: '#3a2a20', E: '#26221f', R: '#b5543f',
    },
    map: [
      '.........DDDD.......',
      '.......DDBBBBBD.....',
      '......DBBBBBBBBD....',
      '.....DBBBBBBBBBBD...',
      '.....DBBBBBBBBEBBD..',
      '.....DBBBBBBBEEBBD..',
      '.....DBBBBBBBBBBBD..',
      '.....DBBBLLLBBBBBD..',
      '......DBBBLLLBBBBD..',
      '.......DBBLNNBBBBBD.',
      '........DBBBBBBBBBD.',
      '.........DBBBBBBD...',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RR...DBBCCCCCCDB.',
      '........DBBBBBBBDB..',
      '........DBBBBBBBDB..',
      '.........DBBBBBB....',
      '..........DBBDBB....',
      '..........DBBDBB....',
      '........DDDB..DDDB..',
      '....................',
    ],
  },
  bear_walk_2: {
    palette: {
      D: '#5e3b26', B: '#8a5a3b', L: '#eccfa8', C: '#f2e3c6',
      N: '#3a2a20', E: '#26221f', R: '#b5543f',
    },
    map: [
      '.........DDDD.......',
      '.......DDBBBBBD.....',
      '......DBBBBBBBBD....',
      '.....DBBBBBBBBBBD...',
      '.....DBBBBBBBBEBBD..',
      '.....DBBBBBBBEEBBD..',
      '.....DBBBBBBBBBBBD..',
      '.....DBBBLLLBBBBBD..',
      '......DBBBLLLBBBBD..',
      '.......DBBLNNBBBBBD.',
      '........DBBBBBBBBBD.',
      '.........DBBBBBBD...',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RR...DBBCCCCCCDB.',
      '........DBBBBBBBDB..',
      '........DBBBBBBBDB..',
      '.........DBBBBBB....',
      '.........DBB.DBB....',
      '.........DBB.DBB....',
      '........DDDB.DDDB...',
      '....................',
    ],
  },
  bear_walk_3: {
    palette: {
      D: '#5e3b26', B: '#8a5a3b', L: '#eccfa8', C: '#f2e3c6',
      N: '#3a2a20', E: '#26221f', R: '#b5543f',
    },
    map: [
      '.........DDDD.......',
      '.......DDBBBBBD.....',
      '......DBBBBBBBBD....',
      '.....DBBBBBBBBBBD...',
      '.....DBBBBBBBBEBBD..',
      '.....DBBBBBBBEEBBD..',
      '.....DBBBBBBBBBBBD..',
      '.....DBBBLLLBBBBBD..',
      '......DBBBLLLBBBBD..',
      '.......DBBLNNBBBBBD.',
      '........DBBBBBBBBBD.',
      '.........DBBBBBBD...',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBBBBBBBDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RRR..DBBCCCCCCDB.',
      '...RR...DBBCCCCCCDB.',
      '........DBBBBBBBDB..',
      '........DBBBBBBBDB..',
      '.........DBBBBBB....',
      '.........DBBDBB.....',
      '.........DBBDBB.....',
      '........DDDB.DDDB...',
      '....................',
    ],
  },

  /* ---------- 六件物品 16×16 ---------- */
  item_honey: {
    palette: {
      D: '#5e3b26', C: '#c9a06a', // 木塞
      G: '#cfe0e4', // 玻璃
      H: '#f0b429', // 蜂蜜
      L: '#f2e3c6', // 标签
    },
    map: [
      '....DDDD........',
      '...DCCCCD.......',
      '...DCCCCD.......',
      '..DDDDDDDD......',
      '.DGHGGGHGGD.....',
      '.DG.......GD....',
      '.DG.HHHH..GD....',
      '.DG.HHHH..GD....',
      '.DG.HHHH..GD....',
      '.DG.HHHH..GD....',
      '.DG.......GD....',
      '.DGGGGGGGGD.....',
      '..DDDDDDDD......',
      '...DLLLLLD......',
      '...DLLLLLD......',
      '....DDDDD.......',
    ],
  },
  item_umbrella: {
    palette: {
      D: '#5e3b26', B: '#8a5a3b', R: '#d9534f',
    },
    map: [
      '......DDDD......',
      '.....DBBBBD.....',
      '....DBBBBBBD....',
      '...DBBBBBBBBD...',
      '..DBBBBBBBBBBD..',
      '.DBBBBBBBBBBBBD.',
      '.DRRRRRRRRRRRRD.',
      '.DRDRRDRRDRRRRD.',
      '.DDDDDDDDDDDDDD.',
      '......DDBD......',
      '......DBBD......',
      '......DBBD......',
      '......DBBD......',
      '......DBBD......',
      '......DBDBB.....',
      '.....DD.BBB.....',
    ],
  },
  item_scarf: {
    palette: {
      D: '#5e3b26', R: '#c9544a', C: '#f2e3c6',
    },
    map: [
      '................',
      '................',
      'DDDDDDDDDDDDDDDD',
      'DRRRRRRRRRRRRRRD',
      'DRCCCCCCCCCCCCRD',
      'DRRRRRRRRRRRRRRD',
      'DRRRRRRRRRRRRRRD',
      'DRCCCCCCCCCCCCRD',
      'DRRRRRRRRRRRRRRD',
      'DDDDDDDDDDDDDDDD',
      '........DDDDDD..',
      '........DRRRRD..',
      '........DRRRRD..',
      '........DDDDDD..',
      '................',
      '................',
    ],
  },
  item_lantern: {
    palette: {
      D: '#5e3b26', B: '#8a5a3b', // 黄铜
      G: '#fff3c4', // 灯罩
      L: '#ffd166', // 光
    },
    map: [
      '......DDDD......',
      '.....DBBBBD.....',
      '.....DDBBDD.....',
      '....DDDDDDDD....',
      '...DBGGGGGGBD...',
      '...DGLGGGGLGD...',
      '...DGLGGGGLGD...',
      '...DGLGGGGLGD...',
      '...DGLGGGGLGD...',
      '...DBGGGGGGBD...',
      '....DDDDDDDD....',
      '......DDBD......',
      '......DBBD......',
      '.....DDDDDD.....',
      '................',
      '................',
    ],
  },
  item_acorn: {
    palette: {
      D: '#5e3b26', B: '#8a5a3b', N: '#a9714b',
    },
    map: [
      '................',
      '......DDDD......',
      '.....DBBBBD.....',
      '....DBBBBBBD....',
      '.....DBBBBD.....',
      '.....DDDDDD.....',
      '....DNNNNNND....',
      '...DNNNNNNNND...',
      '...DNNNNNNNND...',
      '....DNNNNNND....',
      '.....DNNNNND....',
      '......DNNND.....',
      '.......DND......',
      '................',
      '................',
      '................',
    ],
  },
  item_harmonica: {
    palette: {
      D: '#5e3b26', G: '#c8ccd0',
    },
    map: [
      '................',
      '................',
      '................',
      '................',
      'DDDDDDDDDDDDDDDD',
      'DGGGGGGGGGGGGGGD',
      'DGDGDGDGDGDGDGGD',
      'DGDGDGDGDGDGDGGD',
      'DGGGGGGGGGGGGGGD',
      'DDDDDDDDDDDDDDDD',
      'DGGGGGGGGGGGGGGD',
      'DGDGDGDGDGDGDGGD',
      'DGGGGGGGGGGGGGGD',
      'DDDDDDDDDDDDDDDD',
      '................',
      '................',
    ],
  },

  /* ---------- 爱心徽章 9×8 ---------- */
  heart: {
    palette: {
      D: '#8e2f28', R: '#e2738a',
    },
    map: [
      '.DD...DD.',
      'DRRD.DRRD',
      'DRRRDRRRD',
      '.DRRRRRRD',
      '.DRRRRRRD',
      '..DRRRRD.',
      '...DRRD..',
      '....DD...',
    ],
  },
};

/* 把精灵画到画布上（x、y 为左上角像素坐标） */
function drawSprite(ctx, sprite, x, y, scale) {
  const s = Math.max(1, Math.round(scale || 1));
  for (let r = 0; r < sprite.map.length; r++) {
    const row = sprite.map[r];
    for (let c = 0; c < row.length; c++) {
      const color = sprite.palette[row[c]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x) + c * s, Math.round(y) + r * s, s, s);
      }
    }
  }
}

/* 生成一个装着精灵的独立 canvas 元素（用于贴在 HTML 里） */
function makeSpriteCanvas(sprite, scale) {
  const cv = document.createElement('canvas');
  cv.width = sprite.map[0].length * scale;
  cv.height = sprite.map.length * scale;
  drawSprite(cv.getContext('2d'), sprite, 0, 0, scale);
  return cv;
}

/* 校验所有精灵：行宽是否一致、有无未知颜色字符（开发时用） */
function validateSprites() {
  const issues = [];
  for (const name of Object.keys(PIXEL)) {
    const sp = PIXEL[name];
    const w = sp.map[0].length;
    sp.map.forEach(function (row, i) {
      if (row.length !== w) {
        issues.push(name + ': 第' + i + '行长度 ' + row.length + ' ≠ ' + w);
      }
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch !== '.' && !(ch in sp.palette)) {
          issues.push(name + ': 第' + i + '行存在未知颜色字符 "' + ch + '"');
        }
      }
    });
  }
  return issues;
}
