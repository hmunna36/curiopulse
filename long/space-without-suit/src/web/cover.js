// What If You Went to Space WITHOUT a Suit? (long-form): the thumbnail (make_cover.js draws SC.cover once).
// Three candidates for the shelf test (reference/long-form.md, "Thumbnail"): TL.cues.coverV = 1, 2 or 3.
// One face filling about half the height in one hard emotion, one object, one to three fat words, one glow.
'use strict';

SC.cover = (lt, t, shot) => {
  const V = (TLd.cues && TLd.cues.coverV) || 1;
  // a near-dark field: space through the hatch, the Earth's thin blue line glowing behind him
  screenSpace();
  spaceField(ctx, 0, 0, W, H, 2.0, { starS: 1.4 });
  earthLimb(ctx, 1500, 2350, 1500, 0, { line: 0.03 });
  softDot(gctx, 1320, 640, 700, '#3F8BFF', 0.35);
  const face = V === 2 ? FACES.tongue : (V === 3 ? Object.assign({}, FACES.shock, { lookX: 0, lookY: 0 }) : Object.assign({}, FACES.cheeks, { eyeOpen: 1.55, pupil: 0.42, browY: 1.6 }));
  const h = { x: 1380, y: 1480, s: 1.0, face, cheeks: V === 1 ? 1.15 : 0, tongue: V === 2 ? 1.2 : 0, boil: V === 2 ? 1.2 : 0, hair: 1.2, blue: V === 3 ? 0.25 : 0.1,
    exhale: V === 3 ? 0.55 : 0, L: [-100, -60], R: [100, -60], rot: -0.06, earthLight: 0.7 };
  const hp = alHeadPt(h), Z = 3.7;
  const cam = { x: hp[0] - (1310 - 960) / Z, y: hp[1] - (450 - 540) / Z, zoom: Z, rot: 0 };
  applyCam(cam);
  alHero(cam, 2.0, h);
  // the air streaming past him toward the hatch (behind the words)
  screenSpace();
  for (let i = 0; i < 26; i++) { const y = 80 + hash(i * 3) * 900, x = 900 + hash(i * 7) * 1000, L = 120 + 200 * hash(i); line(ctx, x, y, x + L, y - 20, 4, `rgba(235,245,255,${0.18 + 0.2 * hash(i * 5)})`); }
  // the words, left, never under the face; the bottom-right corner stays clear for the duration badge
  if (V === 1) { bigWord('15', 330, 430, 430, '#FFD447', 1, -0.05); bigWord('SECONDS', 360, 720, 150, '#FFFFFF', 1, -0.05); }
  if (V === 2) { bigWord('IT', 300, 330, 210, '#FFFFFF', 1, -0.05); bigWord('BOILS', 380, 560, 250, '#FFD447', 1, -0.05); }
  if (V === 3) { bigWord('NO', 300, 360, 260, '#FFFFFF', 1, -0.05); bigWord('SUIT', 360, 640, 290, '#FF5A6E', 1, -0.05); }
  return { glow: 0.95, noCaptions: true, noSubscribe: true, noHud: true, grain: 0 };
};
