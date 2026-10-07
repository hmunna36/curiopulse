// What Happens When You CRACK Your Knuckles? Short: the doctor who cracked one hand only, and his two x-rays.
'use strict';

const FACE_DOC = Object.assign({}, FACES.grin, { lookX: 0.5, lookY: -0.1, browY: 1.0, browTilt: -0.5, mouthOpen: 0.7 });
const FACE_DOC2 = Object.assign({}, FACES.calm, { lookX: 0.75, lookY: 0.1, browY: 0.9, browTilt: -0.7, mouth: 'flat', mouthOpen: 0.5, blink: 0.2 });
const FACE_DOC_OLD = Object.assign({}, FACES.grin, { lookX: 0, lookY: 0, browY: 1.2, browTilt: -0.3, mouthOpen: 0.9, blink: 0.25 });

// ---------------------------------------------------------------- 7. doctor: one hand only, for fifty years (the aside ends over this shot)
SC.doctor = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 546, 900, 1.36], [c.he, 548, 892, 1.44], [c.for, 548, 884, 1.5], [shot.end, 548, 878, 1.58]], E.inOutSine);
  // his left hand (screen right) cracks on a beat
  let hot = 0, last = -9, count = 0;
  for (const tk of c.dcracks) { hot = Math.max(hot, decay(t, tk, 9)); if (t >= tk) { last = tk; count++; } }
  const [qx, qy] = shake(t, 5 * hot, 30, 12);
  cam.sx = qx; cam.sy = qy;
  const rise = springStep(lt + 0.02, 3.6, 0.6);
  const age = ramp(t, c.for + 0.05, c.years_end - 0.08, E.inOutSine);
  const show = ramp(t, c.one_doctor + 0.25, c.went, E.inOutCubic);            // he holds his left hand up
  const fist = ramp(t, c.went - 0.05, c.far, E.inOutCubic);
  let face = lerpFace(FACE_DOC, FACE_DOC2, ramp(t, c.he - 0.1, c.he + 0.15));
  face = lerpFace(face, FACE_DOC_OLD, ramp(t, c.years - 0.1, c.years + 0.2));
  face = Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 7, 2.4)) });
  clinicBack(cam, t);
  const h = docHero(cam, t, {
    face, age, rise, fist, hot,
    left: [lerp(150, 158, show), lerp(-330, -412, show) - 9 * hot + 4 * Math.sin(t * 3.1)],
    right: [-156, lerp(-320, -372, ramp(t, c.he - 0.1, c.only, E.inOutCubic)) + 3 * Math.sin(t * 2.3)],
    headRot: 0.05 * (1 - age) + 0.02 * Math.sin(t * 2.1), headDY: -4 * hot, lean: 0.015 * Math.sin(t * 1.7),
  });
  clinicDesk(cam, t);
  const ls = toScreen(cam, h.left[0], h.left[1]), rs = toScreen(cam, h.right[0], h.right[1]);
  screenSpace();
  // sparks on his knuckles each time
  for (const [i, tk] of c.dcracks.entries()) denTick(ls[0] + (i % 3 - 1) * 26, ls[1] - 36 * cam.zoom, t - tk, cam.zoom * 2.2, i, i === 0 ? 'crack' : '');
  // which hand is which
  const tagk = springStep(t - c.only + 0.05, 5, 0.5);
  handTag(Math.min(ls[0] - 30, 756), ls[1] + 122, tagk, 'DAILY', '#4DFFB4');
  handTag(Math.max(rs[0] - 4, 250), rs[1] + 118, springStep(t - c.left_end + 0.25, 5, 0.5), 'NEVER', '#FF8A9A');
  // who he is, then the years
  const nk = springStep(t - c.one_doctor - 0.35, 5, 0.5) * (1 - ramp(t, c.for - 0.25, c.for - 0.1));
  pill(540, 520, 'DR. DONALD UNGER', '#FFFFFF', nk, 46);
  const yk = springStep(t - c.for + 0.1, 5, 0.5), spin = ramp(t, c.for + 0.05, c.years_end - 0.1, E.inOutCubic);
  const year = 1 + 49 * spin;
  yearPanel(540, 528, yk, year, Math.round(730 * year / 10) * 10, t, spin > 0.02 && spin < 0.98 ? 1 : 0);
  flyPages(540, 470, t, c.for + 0.05, c.years_end - 0.15);
  return { glow: 0.78, flash: 0.22 * (1 - ramp(lt, 0, 0.08)) };
};

// ---------------------------------------------------------------- 8. xray: LEFT and RIGHT on a lightbox, both fine
SC.xray = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const bg = ctx.createRadialGradient(540, 800, 80, 540, 900, 1300); bg.addColorStop(0, '#16233A'); bg.addColorStop(1, '#04060D');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const films = lightbox(t, { on: ramp(lt, 0, 0.12) });
  // the names over the films
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [i, f] of films.entries()) {
    ctx.font = '400 62px Anton'; ctx.fillStyle = '#0B1630'; ctx.fillText(i === 0 ? 'LEFT' : 'RIGHT', f.x, LB.y - LB.h / 2 + 44);
    ctx.font = '900 34px Montserrat'; ctx.fillStyle = i === 0 ? '#0B6B47' : '#8A3344';
    ctx.fillText(i === 0 ? '36,500 cracks' : 'never cracked', f.x, LB.y + LB.h / 2 - 22);
  }
  ctx.restore();
  // "Arthritis?": a magnifying glass goes along the knuckles of one hand, then the other
  const u = ramp(t, c.arth - 0.05, c.neither - 0.08, E.inOutSine);
  const fi = u < 0.5 ? 0 : 1, uu = fi === 0 ? u * 2 : (u - 0.5) * 2, m = films[fi].mcp;
  const ks = fi === 0 ? [4, 3, 2, 1] : [1, 2, 3, 4];
  const seg = Math.min(2.999, uu * 3), i0 = Math.floor(seg), fr2 = seg - i0;
  const mx = lerp(m[ks[i0]][0], m[ks[i0 + 1]][0], fr2), my = lerp(m[ks[i0]][1], m[ks[i0 + 1]][1], fr2);
  magnifier(mx, my + 6 * Math.sin(t * 14), 74, (1 - ramp(t, c.neither - 0.1, c.neither + 0.02)) * ramp(lt, 0.02, 0.14));
  // "Neither hand.": a tick on each
  const k1 = ramp(t, c.neither, c.neither + 0.14), k2 = ramp(t, c.neither2, c.neither2 + 0.14);
  bigTick(films[0].x, films[0].y - 30, k1, 1.15); bigTick(films[1].x, films[1].y - 30, k2, 1.15);
  okPill(540, 1222, springStep(t - c.neither - 0.1, 5, 0.5), 'BIGGER STUDIES AGREE', '#4DFFB4', 40);
  const sh = 6 * decay(t, c.neither, 10) + 6 * decay(t, c.neither2, 10);
  return { glow: 0.72, capY: 1410, flash: 0.24 * (1 - ramp(lt, 0, 0.09)), push: { k: 1 + 0.035 * lt / D + 0.012 * decay(t, c.neither, 8) + 0.012 * decay(t, c.neither2, 8), cx: 540, cy: 800 }, blur: [0, sh] };
};
