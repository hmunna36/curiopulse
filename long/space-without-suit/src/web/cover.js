// What If You Went to Space WITHOUT a Suit? (long-form): the thumbnail (make_cover.js draws SC.cover once).
// Three candidates for the shelf test (reference/long-form.md, "Thumbnail"): TL.cues.coverV = 1, 2 or 3.
// One face filling about half the height in one hard emotion, one object, one to three fat words, one glow.
'use strict';

SC.cover = (lt, t, shot) => {
  const V = (TLd.cues && TLd.cues.coverV) || 1;
  // the field: space; the alarm's red flooding in from the left, the Earth's blue glowing on the right
  screenSpace();
  spaceField(ctx, 0, 0, W, H, 2.0, { starS: 1.5 });
  const rg = ctx.createLinearGradient(0, 0, 1100, 0); rg.addColorStop(0, 'rgba(255,30,60,0.75)'); rg.addColorStop(1, 'rgba(255,30,60,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  earthLimb(ctx, 1550, 2250, 1450, 0, { line: 0.035 });
  softDot(gctx, 1450, 700, 760, '#3F8BFF', 0.45);
  const face = V === 2 ? Object.assign({}, FACES.tongue, { eyeOpen: 1.55, pupil: 0.6, cross: 0, browY: 1.6 })
    : (V === 3 ? Object.assign({}, FACES.shock, { eyeOpen: 1.55, pupil: 0.6, lookX: 0, lookY: 0 }) : Object.assign({}, FACES.cheeks, { eyeOpen: 1.55, pupil: 0.62, browY: 1.7, browTilt: 0.8 }));
  const h = { x: 1380, y: 1480, s: 1.0, face, cheeks: V === 1 ? 1.25 : 0, tongue: V === 2 ? 1.25 : 0, boil: V === 2 ? 1.3 : 0, hair: 1.3, blue: V === 3 ? 0.2 : 0,
    exhale: V === 3 ? 0.55 : 0, L: [-100, -60], R: [100, -60], rot: -0.06, earthLight: 1.0, red: 0 };
  screenSpace();
  for (let i = 0; i < 26; i++) { const y = 80 + hash(i * 3) * 900, x = 950 + hash(i * 7) * 950, L = 140 + 220 * hash(i); line(ctx, x, y, x + L, y - 20, 5, `rgba(235,245,255,${0.18 + 0.22 * hash(i * 5)})`); }
  const hp = alHeadPt(h), Z = 4.3;
  const cam = { x: hp[0] - (1330 - 960) / Z, y: hp[1] - (470 - 540) / Z, zoom: Z, rot: 0 };
  applyCam(cam);
  alHero(cam, 2.0, h);
  // a red rim on his left side (the alarm), sweat flying
  screenSpace();
  const [fx, fy] = toScreen(cam, ...hp);
  ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.restore();
  for (const [dx, dy, r] of [[-330, -120, 1.0], [300, -200, 0.8], [-260, 60, 0.7]]) sweatDrop(ctx, fx + dx, fy + dy, 2.2 * r, 1);
  shockLines(fx, fy - 30, 380, 1, 12, '#FFFFFF', 3);
  // the words, left, never under the face; the bottom-right corner stays clear for the duration badge
  if (V === 1) { bigWord('15', 330, 420, 470, '#FFD447', 1, -0.05); bigWord('SECONDS', 350, 740, 160, '#FFFFFF', 1, -0.05); }
  if (V === 2) { bigWord('IT', 290, 330, 230, '#FFFFFF', 1, -0.05); bigWord('BOILS', 380, 580, 270, '#FFD447', 1, -0.05); }
  if (V === 3) { bigWord('NO', 300, 360, 280, '#FFFFFF', 1, -0.05); bigWord('SUIT', 360, 650, 310, '#FFD447', 1, -0.05); }
  return { glow: 1.0, noCaptions: true, noSubscribe: true, noHud: true, grain: 0 };
};
