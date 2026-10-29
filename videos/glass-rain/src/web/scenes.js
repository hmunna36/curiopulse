// The Planet Where It Rains GLASS Sideways ☔ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The world: HD 189733b's sky from a balloon basket, its star, the planet from space (gr_sky.js); the umbrella, the
// bullet, the stink (gr_props.js); the hero in jupiter-no-ground's blue spacesuit and glass helmet (jphero.js).
'use strict';

const cu = () => TLd.cues;
const grShot = (id) => TLd.shots.find((s) => s.id === id);
const grSince = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the sky: the star is up and to the right (a warm key from the upper right), the azure sky all round (a blue rim from
// the left); in front of the star (the furnace) it is the rim; space: the diagram light
const GR_SKYL = { ...LIGHTS.day, key: [0.3, -0.5, 0.86], keyTint: [1.12, 1.0, 0.86], shadowTint: [0.62, 0.72, 1.0], shadowDeep: 1.25, cast: 0.45, form: 0.85,
  rimFrom: [-0.85, -0.35], rim: [0.55, 0.82, 1.0], rimAmt: 1.15, pool: 0.3, poolTint: [0.42, 0.52, 0.86], halo: 0.08 };
const GR_STARL = { ...GR_SKYL, key: [0.25, -0.8, 0.55], keyTint: [1.16, 0.98, 0.8], rimFrom: [0.5, -0.85], rim: [1.0, 0.62, 0.3], rimAmt: 1.6, pool: 0.2 };
const GR_SPACEL = { ...LIGHTS.diagram, pool: 0.1, halo: 0 };
setLights({ hook: GR_SKYL, sky: GR_SKYL, furnace: GR_STARL, wind: GR_SKYL, side: GR_SKYL, space: GR_SPACEL, eggs: GR_SKYL,
  button: GR_SKYL, loop: GR_SKYL, cover: GR_SKYL });

// ---------------------------------------------------------------- the hero in the basket
// world: he stands at (540, 1500), the basket's rim at y 1238, the balloon's mouth at y 400 above him
const GR_HX = 540, GR_HY = 1500, GR_RIM = 1290, GR_MOUTH = [540, 400];
const GR_POSE = { hipY: -222, lean: 0, armL: { a: 0.3, b: 0.5 }, armR: { a: 0.3, b: 0.5 }, legL: { a: 0.06, b: -0.08 },
  legR: { a: 0.06, b: -0.08 }, hand: 'open', feetFront: 1 };
// his faces (jupiter-no-ground's JF plus a few)
const GF = {
  smug: Object.assign({}, FACES.grin, { lookX: -0.5, lookY: -0.8, mouthOpen: 0.25, browY: 0.35, browTilt: -0.35 }),
  up: Object.assign({}, FACES.calm, { lookX: -0.6, lookY: -1, mouth: 'flat', mouthOpen: 0.15, browY: 0.5 }),
  uhoh: Object.assign({}, FACES.nervous, { lookX: -0.7, lookY: -1, browY: 0.9, browTilt: 0.8, mouth: 'wavy', mouthOpen: 0.35 }),
  shock: Object.assign({}, FACES.startled, { lookX: -0.4, lookY: -0.9, mouth: 'o', mouthOpen: 0.9, eyeOpen: 1.35 }),
  meh: Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0.15, blink: 0.38, browTilt: -0.3, browY: -0.2, mouth: 'flat', mouthOpen: 0 }),
  wow: Object.assign({}, FACES.startled, { lookX: 0.5, lookY: -1, mouth: 'o', mouthOpen: 0.7, eyeOpen: 1.25, browY: 1 }),
  squint: Object.assign({}, FACES.calm, { lookX: 0.4, lookY: -0.9, blink: 0.7, browY: -0.3, browTilt: -0.5, mouth: 'grimace', mouthOpen: 0.4 }),
  brace: Object.assign({}, FACES.nervous, { lookX: -1, lookY: -0.2, blink: 0.45, browY: 0.7, browTilt: 0.9, mouth: 'grimace', mouthOpen: 0.8 }),
  peek: Object.assign({}, FACES.calm, { lookX: -1, lookY: -0.1, browY: 0.3, browTilt: -0.4, mouth: 'flat', mouthOpen: 0.05 }),
  yuck: Object.assign({}, FACES.nervous, { lookX: 0.2, lookY: 0.4, blink: 0.6, browY: 0.8, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.5 }),
  gag: Object.assign({}, FACES.nervous, { lookX: 0, lookY: 0.2, blink: 1, browY: 1.0, browTilt: 1.0, mouth: 'grimace', mouthOpen: 0.9 }),
  ok: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0.05, blink: 0.4, browY: 0.1, browTilt: -0.2, mouth: 'flat', mouthOpen: 0 }),
};
function grFaceAt(keys, t) {             // keys: [[t, face]...], 0.12 s blends
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t >= keys[i][0]) f = lerpFace(keys[i - 1][1], keys[i][1], clamp((t - keys[i][0]) / 0.12));
  return f;
}
// the umbrella in his LEFT hand (screen left, upwind). U: {open, shred, rot, L, R, hide}
function grUmbrellaPost(U, t) {
  return (lc, rr, st) => {
    if (!U || U.hide) return;
    const d = rr.armDirL, hx = rr.wrL[0] + d[0] * 14, hy = rr.wrL[1] + d[1] * 14;
    const rot = U.rot || 0, wl = [Math.cos(-rot) * 1 - Math.sin(-rot) * 0.2, Math.sin(-rot) * 1 + Math.cos(-rot) * 0.2];
    lc.save(); lc.translate(hx, hy); lc.rotate(rot);
    grUmbrella(lc, U.L || 200, U.R || 172, { open: U.open, shred: U.shred, t, wind: wl, seed: 71 });
    lc.restore();
  };
}
// where the umbrella's canopy middle is in world coordinates (for sparks and the camera)
function grCanopyAt(H, pose) {
  const rr = rig(pose), d = rr.armDirL, hx = rr.wrL[0] + d[0] * 14, hy = rr.wrL[1] + d[1] * 14;
  const rot = H.umb.rot || 0, ly = -(H.umb.L || 200) - 40;          // the canopy's middle, up the shaft
  return [GR_HX + hx - ly * Math.sin(rot), GR_HY + hy + ly * Math.cos(rot)];
}
// draw in his head's space from inside his layer's post (already rig-local there)
function grHeadLocal(lc, rr, st, fn) {
  lc.save(); lc.translate(rr.head[0] + (st.headDX || 0), rr.head[1] + (st.headDY || 0)); lc.rotate(rr.lean + (st.headRot || 0));
  fn(lc); lc.restore();
}
// H: {face, umb, armR: {e, w} | null, handR, pinch, scarf, lean, headRot, rot (the whole of him), visor (0..1 darkened)}
function grHero(cam, t, H) {
  let pose = JSON.parse(JSON.stringify(GR_POSE));
  pose.lean = H.lean || 0;
  const A = {
    x: GR_HX, y: GR_HY, s: 1, face: H.face || GF.ok, pose, headRot: H.headRot || 0, headDY: H.headDY || 0,
    armL: H.armL || { e: [-142, -284], w: [-64, -356] },
    armR: H.armR || { e: [138, -292], w: [176, -262] },
    handR: H.handR || 'open', handL: 'open',
    scarf: H.scarf === undefined ? 0.15 : H.scarf, scarfSide: 1, pinch: H.pinch || 0, rot: H.rot || 0,
    post: (lc, rr, st, ps) => {
      if (H.visor > 0.01) grHeadLocal(lc, rr, st, (c) => {
        paint(() => { c.beginPath(); c.arc(0, -8, 97, 0, 7); c.fillStyle = `rgba(20,24,40,${0.62 * H.visor})`; c.fill();
          c.beginPath(); c.arc(0, -8, 82, Math.PI * 1.1, Math.PI * 1.4); c.lineWidth = 8; c.strokeStyle = `rgba(255,190,120,${0.5 * H.visor})`; c.stroke(); });
      });
      if (H.umb && !H.umb.hide) {                       // his fist round the shaft, in front of it
        const d = rr.armDirL, hx = rr.wrL[0] + d[0] * 14, hy = rr.wrL[1] + d[1] * 14;
        circle(lc, hx, hy, 21, JPPAL.skin); line(lc, hx - 14, hy - 6, hx + 12, hy - 8, 2.5, PAL.skinSh);
      }
      if (H.post) H.post(lc, rr, st, ps);
    },
    pre: (lc, rr) => grUmbrellaPost(H.umb, t)(lc, rr, { pal: JPPAL }),
  };
  return jpHero(cam, t, A);
}
// the balloon around him: ropes behind, the basket's far wall behind, the front wall over his legs
function grBalloonBack(t, o = {}) {
  const corners = [[GR_HX - 205, GR_RIM - 10], [GR_HX + 205, GR_RIM - 10], [GR_HX - 150, GR_RIM - 30], [GR_HX + 150, GR_RIM - 30]];
  if (o.envelope !== false) {
    const tilt = o.tilt || 0;
    grEnvelope(GR_MOUTH[0], GR_MOUTH[1], 1.32, tilt, t);
    if (o.occlude) {                                 // a silhouette in front of the star: hide the star's bloom behind it
      gctx.save(); gctx.translate(GR_MOUTH[0], GR_MOUTH[1]); gctx.rotate(tilt); gctx.scale(1.32, 1.32);
      gctx.beginPath(); gctx.ellipse(0, -330, 300, 330, 0, 0, 7); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore();
    }
  }
  grRigging([GR_MOUTH[0], GR_MOUTH[1] + 30], corners, 1.0, t, o.flame === undefined ? 0.6 : o.flame);
  grBasketBack(GR_HX, GR_RIM, 1);
}
function grBalloonFront(t, o = {}) {
  grBasketFront(GR_HX, GR_RIM, 1, { sign: o.sign });
}
// the whole balloon scene for a world camera: sky, decks, far rain, balloon, him, basket front, near rain
function grScene(cam, t, H, o = {}) {
  const S = grSkyBg(cam, t, o.sky || {});
  grRain(t, { ang: o.ang, k: o.rain === undefined ? 1 : o.rain, speed: o.speed, layers: [0, 1], lenK: o.lenK });
  if (o.under) o.under(cam);
  applyCam(cam);
  grBalloonBack(t, o);
  const hr = grHero(cam, t, H);
  applyCam(cam);
  grBalloonFront(t, o);
  if (o.front) o.front(cam, hr);
  grRain(t, { ang: o.ang, k: o.rain === undefined ? 1 : o.rain, speed: o.speed, layers: [2], lenK: o.lenK });
  return { S, hr };
}

// ---------------------------------------------------------------- the hook (valid at negative time: the Short's last frames)
// tt = seconds since frame 1. Frame 1: tight on him under his open umbrella, glass beads already pinging off it from the
// upper left. "GLASS": punctures; "Shredded.": the canopy tears to rags that stream away; bare spokes; deadpan.
function hookA(tt) {
  const c = cu();
  if (tt < 0) {                                       // the end of the Short: the fresh umbrella pops open into frame 1
    const op = E.outBack(inv(-0.42, -0.1, tt), 1.6);
    return { open: lerp(0.0, 1, op), shred: 0, face: lerpFace(GF.ok, GF.smug, inv(-0.3, -0.05, tt)), rot: lerp(-0.05, -0.2, op), lift: 0 };
  }
  const shred = 0.3 * smooth(inv(c.holes, c.tear, tt)) + 0.7 * smooth(inv(c.tear, c.tear_done + 0.2, tt));
  const face = grFaceAt([[0, GF.smug], [c.holes + 0.15, GF.uhoh], [c.tear + 0.05, GF.shock], [c.shredded_end + 0.25, GF.meh]], tt);
  const jolt = grSince(tt, c.tear, 7) * Math.sin((tt - c.tear) * 40);
  return { open: 1, shred, face, rot: -0.2 + 0.05 * jolt + 0.015 * Math.sin(tt * 11), lift: 0 };
}
function hookCam(tt) {
  const c = cu();
  const push = clamp((tt + 0.5) / 4.6);
  const sh = shake(tt, 7 * grSince(tt, c.tear, 5), 24, 3);
  return { x: 500 + sh[0] / 1.9, y: 1064 + sh[1] / 1.9 - 6 * push, zoom: 1.9 + 0.06 * E.inOutSine(push), rot: 0 };
}
function hookDraw(tt, t) {
  const c = cu(), A = hookA(tt), cam = hookCam(tt);
  const HS = { face: A.face, umb: { open: A.open, shred: A.shred, rot: A.rot }, headRot: -0.08, scarf: 0.12 };
  grScene(cam, t, HS, { ang: 0.6, rain: 1, sky: { starAt: [1500, -500], starR: 300 }, flame: 0.5,
    front: (cm, hr) => {
      // beads bouncing off the canopy while it is still cloth
      if (A.shred < 0.7) {
        const cp = grCanopyAt(HS, hr.pose), sp = toScreen(cm, cp[0], cp[1]);
        for (let k = 0; k < 14; k++) {
          const tk = 0.07 + k * 0.29 + 0.05 * Math.sin(k * 7.1);
          const ox = 90 * Math.sin(k * 2.3), oy = 40 * Math.cos(k * 1.7);
          grSparks(sp[0] - 60 + ox, sp[1] - 70 + oy, tt, tk, 5, 400 + k, 1);
        }
      }
    } });
  return { glow: 0.85, push: { k: 1 + 0.02 * clamp(tt / 4), cx: 540, cy: 900 } };
}
SC.hook = (lt, t) => hookDraw(lt, t);
SC.loop = (lt, t) => hookDraw(t - TLd.duration, t);

// ---------------------------------------------------------------- the answer: the whole sky is a glass factory
SC.sky = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, t0 = shot.start;
  const cam = camKeys(lt, [[0, 500, 1060, 1.95], [1.25, 540, 760, 0.66], [D - 0.2, 520, 960, 0.86], [D, 520, 980, 0.88]], E.inOutCubic);
  const HS = { face: grFaceAt([[0, GF.meh], [0.4, GF.up], [c.factory - t0, GF.wow]], lt), umb: { open: 1, shred: 1, rot: -0.3 }, scarf: 0.15, headRot: -0.1 };
  grScene(cam, t, HS, { ang: 0.6, envelope: true, flame: 0.6, sky: { starAt: [1500, -420], starR: 300 },
    front: () => {
      // beads condensing out of the clouds: they pop up glinting and fall (the factory at work)
      screenSpace();
      const rng = mulberry32(5150);
      for (let i = 0; i < 26; i++) {
        const bx = 60 + 960 * rng(), by = 1050 + 520 * rng(), ph = rng(), sp = 0.6 + 0.5 * rng();
        const u = ((lt * sp + ph) % 1);
        const k = Math.sin(Math.PI * clamp(u * 1.4));
        circle(ctx, bx + 160 * u, by - 40 + 160 * u * u, 3 + 2 * k, `rgba(240,252,255,${0.9 * k})`);
        softDot(gctx, bx + 160 * u, by - 40 + 160 * u * u, 16, '#D8F6FF', 0.7 * k);
      }
    } });
  // GLASS factory: five beads pop up out of the cloud tops one after another (the ting-ting-ting), arc and fall
  screenSpace();
  for (let i = 0; i < 5; i++) {
    const tp = c.factory_end + 0.03 + 0.05 * i - 0.12, a = t - tp;
    if (a < 0 || a > 1.4) continue;
    const bx = [150, 300, 810, 950, 230][i] + (i < 2 || i === 4 ? -90 : 90) * a, by = 1110 - 640 * a + 700 * a * a;   // clear of him
    ctx.save(); ctx.translate(bx, by); ctx.rotate(a * 6 + i); ctx.scale(1.9, 1.9);
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(0, -12); ctx.lineTo(-13, 0); ctx.lineTo(0, 12); ctx.closePath(); ctx.fillStyle = '#BFEFFF'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(0, -12); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.restore();
    softDot(gctx, bx, by, 46, '#D8F6FF', 0.9 * Math.max(0, 1 - a * 0.6));
    if (a < 0.15) softDot(gctx, [150, 300, 810, 950, 230][i], 1110, 70 * (1 - a / 0.15), '#FFFFFF', 0.6);
  }
  const tk = popK(t, c.factory - 0.05, shot.end + 1);
  grTag('CLOUDS OF GLASS', 330, 690, tk, { size: 44, edge: '#7FE9FF', rot: -0.04 });
  if (tk > 0.01) { screenSpace(); thinLeader([300, 724], [210, 1030], tk, '#7FE9FF'); }
  return { glow: 0.85, zblur: 0.12 * (1 - ramp(lt, 0, 0.5)), zcx: 540, zcy: 900 };
};

// ---------------------------------------------------------------- THE ONE PICTURE: the furnace is its star, right there;
// rock steams up out of the hot deep and comes back down as glass
SC.furnace = (lt, t, shot) => {
  const c = cu(), t0 = shot.start;
  const sw = E.inOutCubic(inv(c.swing - t0, c.star_hit - t0 + 0.05, lt));          // the whip up and right to the star
  const pb = E.inOutCubic(inv(c.right_k - t0 - 0.1, c.right_k - t0 + 0.9, lt));     // the pull back: the balloon beside it
  const dn = E.inOutCubic(inv(c.steam_in - t0 - 0.2, c.steam_in - t0 + 1.0, lt));   // a look down at the steam
  // the world camera: on him -> off to the star (the balloon leaves the frame left) -> the balloon small against the star
  // -> lower, to the hot deep under it
  let cam = { x: lerp(520, 1500, sw), y: lerp(1010, 200, sw), zoom: lerp(1.6, 0.9, sw), rot: 0 };
  cam = { x: lerp(cam.x, 720, pb), y: lerp(cam.y, 480, pb), zoom: lerp(cam.zoom, 0.42, pb), rot: 0 };
  cam = { x: lerp(cam.x, 640, dn), y: lerp(cam.y, 780, dn), zoom: lerp(cam.zoom, 0.46, dn), rot: 0 };
  const sh = shake(lt, 9 * grSince(t, c.star_hit, 4), 20, 5); cam.x += sh[0] / cam.zoom; cam.y += sh[1] / cam.zoom;
  // the star in screen terms: it swings in from the upper right, fills the frame, then settles up and right of the balloon
  let sx = lerp(1500, 560, sw), sy = lerp(-500, 760, sw), sR = lerp(380, 440, sw) * (1 + 0.035 * grSince(t, c.star_hit, 3));
  sx = lerp(sx, 760, pb); sy = lerp(sy, 640, pb); sR = lerp(sR, 400, pb);
  sy = lerp(sy, 360, dn); sx = lerp(sx, 780, dn);
  const HS = { face: grFaceAt([[0, GF.meh], [c.look_up - t0, Object.assign({}, GF.up, { lookX: 0.6 })], [c.star_hit - t0, GF.squint]], lt),
    umb: { open: 1, shred: 1, rot: -0.3 }, headRot: 0.06, headDY: -4, scarf: 0.2 };
  grSkyBg(cam, t, { starScreen: [sx, sy, sR], deep: dn, decks: [0, 1, 2, 3] });
  grRain(t, { ang: 0.6, k: 0.8, layers: [0, 1] });
  grSteam(t, { k: ramp(t, c.steam_in, c.steam_in + 0.6), y0: 1920 + 80, y1: 640, x0: 80, x1: 1000 });
  applyCam(cam);
  grBalloonBack(t, { envelope: true, occlude: true, flame: 0.7 });
  grHero(cam, t, HS);
  applyCam(cam);
  grBalloonFront(t);
  grRain(t, { ang: 0.6, k: 0.6, layers: [2, 3] });
  // tags: 13x CLOSER (on "RIGHT there"), ROCK STEAM rises, GLASS falls
  const k1 = popK(t, c.right + 0.05, c.steam_in + 0.5);
  grTag('13× CLOSER', 360, 540, k1, { size: 62, edge: '#FFB067', bg: '#3A1A08', fg: '#FFE6B8', sub: 'than Mercury is to our Sun', subCol: '#FFD9AE' });
  const k2 = popK(t, c.steams, t0 + 99);
  grTag('ROCK STEAM ▲', 300, 1560, k2, { size: 42, edge: '#FF9A3C', bg: '#3A1A08', fg: '#FFD9AE' });
  const k3 = popK(t, c.glass3 - 0.05, t0 + 99);
  grTag('GLASS ▼', 790, 560, k3, { size: 48, edge: '#7FE9FF' });
  const whip = Math.sin(Math.PI * clamp((lt - (c.swing - t0)) / (c.star_hit - c.swing + 0.05)));
  return { glow: 0.85, blur: [30 * whip, -40 * whip] };
};

// ---------------------------------------------------------------- the wind hits: faster than a bullet
SC.wind = (lt, t, shot) => {
  const c = cu(), t0 = shot.start, D = shot.end - shot.start;
  const g = E.outCubic(inv(c.gust - t0, c.gust - t0 + 0.35, lt));                     // the gust
  const sh = shake(lt, 10 * grSince(t, c.gust, 3.5) + 2 * g, 26, 9);
  const cam = { x: 520 + sh[0] / 1.35, y: 1010 + sh[1] / 1.35, zoom: 1.35 + 0.05 * lt / D, rot: -0.03 * g };
  const HS = { face: grFaceAt([[0, GF.meh], [c.gust - t0, GF.brace], [c.overtake - t0, GF.shock]], lt),
    umb: { open: 1, shred: 1, rot: lerp(-0.3, 0.55, g) }, lean: -0.06 * g, scarf: lerp(0.15, 0.0, g), headRot: -0.05 * g,
    armR: { e: [150, -300], w: [196, -258] } };
  const ang = lerp(0.6, 0.1, g), speed = lerp(1, 1.8, g);
  grScene(cam, t, HS, { ang, speed, lenK: lerp(1, 1.8, g), rain: 1, flame: 0.4, sky: { starAt: [1500, -400], starR: 300, wind: g } });
  // the bullet zips across above him, and a glass bead overtakes it
  const bu = inv(c.bullet_in, c.bullet_in + 1.6, t);
  if (bu > 0 && bu < 1) {
    const bx = lerp(-220, 1300, bu), by = 640;
    const ov = inv(c.overtake - 0.12, c.overtake + 0.2, t);
    grBullet(bx, by, 1.45, t, { look: lerp(-1, 1, ov), sweat: ov, k: 1 });
    const gx = lerp(-300, 1500, inv(c.overtake - 0.42, c.overtake + 0.42, t)), gy = by + 52;
    if (gx > -100 && gx < W + 500) {
      screenSpace();
      const gr = ctx.createLinearGradient(gx - 480, gy, gx, gy);
      gr.addColorStop(0, 'rgba(200,240,255,0)'); gr.addColorStop(1, 'rgba(235,250,255,0.95)');
      ctx.strokeStyle = gr; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(gx - 480, gy); ctx.lineTo(gx, gy); ctx.stroke();
      circle(ctx, gx, gy, 14, '#F4FCFF'); softDot(gctx, gx, gy, 60, '#CFF2FF', 1);
    }
  }
  const tg = popK(t, c.bullet + 0.1, shot.end + 1);
  return { glow: 0.85, blur: [14 * g, 0], push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 900 },
    overlay: () => grTag('8,700 KM/H', 540, 500, tg, { size: 60, edge: '#BFF0FF', rot: -0.05, sub: 'measured, 2015' }) };
};

// ---------------------------------------------------------------- SIDEWAYS: he holds the bare spokes up like a shield
SC.side = (lt, t, shot) => {
  const c = cu(), t0 = shot.start, D = shot.end - shot.start;
  const sd = E.outBack(inv(c.shield - t0, c.shield - t0 + 0.45, lt), 1.3);
  const cam = { x: 440, y: 1000, zoom: 1.5 + 0.05 * lt / D, rot: 0 };
  const HS = { face: grFaceAt([[0, GF.brace], [c.shield - t0 + 0.2, GF.peek], [c.through - t0 + 0.12, GF.meh]], lt),
    umb: { open: 1, shred: 1, rot: lerp(0.55, -1.22, sd), L: lerp(200, 150, sd) },
    armL: { e: [lerp(-142, -196, sd), lerp(-284, -318, sd)], w: [lerp(-64, -122, sd), lerp(-356, -408, sd)] },
    armR: { e: [150, -300], w: [196, -258] }, lean: -0.05, scarf: 0.0, headRot: -0.05 };
  const { hr } = grScene(cam, t, HS, { ang: 0.08, speed: 1.9, lenK: 2.0, rain: 1, flame: 0.4, sky: { starAt: [1500, -400], starR: 300, wind: 1 } });
  // SIDEWAYS: beads stream straight through the spokes; most ping off his helmet
  if (t >= c.through - 0.05) {
    screenSpace();
    const cp = toScreen(cam, ...grCanopyAt(HS, hr.pose)), hp = toScreen(cam, GR_HX, GR_HY - 478);
    const rng = mulberry32(808), edge = hp[0] - 100 * cam.zoom;
    for (let i = 0; i < 16; i++) {
      const y = cp[1] + (rng() - 0.5) * 240, sp = 2600 + 900 * rng(), ph = rng();
      const hits = Math.abs(y - hp[1]) < 120 * cam.zoom;
      const span = (hits ? edge : W + 200) + 200;
      const s0 = ((t - c.through) * sp + ph * span) % span, x = -200 + s0;
      line(ctx, x - 220, y, x, y, 4, 'rgba(225,246,255,0.85)');
      circle(ctx, x, y, 6, '#F4FCFF'); softDot(gctx, x, y, 24, '#CFF2FF', 0.85);
      if (hits && x > edge - 60) grSparks(edge, y, (x - (edge - 60)) / sp * 3, 0, 5, 900 + i, 1);
    }
  }
  return { glow: 0.85, blur: [8, 0], push: { k: 1 + 0.025 * lt / D, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- from space: the planet, deep blue, beside its star
function grPullU(t) { const c = cu(); return E.inOutCubic(inv(c.pull + 0.45, c.planet_full + 0.1, t)); }
SC.space = (lt, t, shot) => {
  const c = cu(), t0 = shot.start;
  const zo = inv(c.pull, c.pull + 0.5, t);                                           // the first half second: up and away
  if (zo < 1) {
    const cam = { x: 540, y: lerp(960, 700, zo), zoom: lerp(1.25, 0.16, E.inCubic(zo)), rot: 0 };
    const HS = { face: GF.up, umb: { open: 1, shred: 1, rot: -0.3 }, scarf: 0 };
    grScene(cam, t, HS, { ang: 0.12, speed: 1.6, rain: 1 - zo, envelope: true, flame: 0.5, sky: { starAt: [1500, -400], starR: 300, wind: 1 } });
    return { glow: 0.8, zblur: 0.35 * zo, zcx: 540, zcy: 960, flash: Math.max(0, (zo - 0.8) * 2.5) };
  }
  const u = grPullU(t);
  grSpaceBg(t, { zoom: 1 + 0.06 * (1 - u) });
  // the star on the right, mostly off frame: huge and orange
  grStarDraw(1030 + 40 * (1 - u), 610, lerp(560, 400, u), t, { glow: 0.9 });
  // the planet: from a curved horizon filling the bottom to the whole disc
  const R1 = 330, R0 = 4600, R = R1 * Math.exp(Math.log(R0 / R1) * (1 - u));
  const end = [430, 1040], start = [520, 1180 + R0];
  const k = (R - R1) / (R0 - R1);
  const P = [lerp(end[0], start[0], k), lerp(end[1], start[1], k)];
  grPlanet(P[0], P[1], R, t);
  // a glint of glass haze over its limb on BLUE, and the name
  const bk = popK(t, c.blue - 0.02, shot.end + 1);
  if (bk > 0) { screenSpace(); softDot(gctx, P[0], P[1], R * 1.35, '#4A94F0', 0.35 * bk); }
  grTag('HD 189733b', 430, 560, popK(t, c.blue + 0.15, shot.end + 1), { size: 50, edge: '#8FB8FF', sub: '64 light-years away' });
  return { glow: 0.95, flash: 0.55 * grSince(t, c.pull + 0.5, 9), push: { k: 1 + 0.02 * u, cx: 540, cy: 960 } };
};

// ---------------------------------------------------------------- it stinks of rotten eggs: he goes to pinch his nose... CLONK
SC.eggs = (lt, t, shot) => {
  const c = cu(), t0 = shot.start, D = shot.end - shot.start;
  const pk = E.outBack(inv(c.pinch, c.clonk, t), 1.3), back = inv(c.clonk + 0.35, c.clonk + 0.9, t);
  const pinch = pk * (1 - 0.4 * back);
  const sh = shake(lt, 6 * grSince(t, c.clonk, 6), 28, 4);
  const cam = { x: 520 + sh[0] / 1.8, y: 1020 + sh[1] / 1.8, zoom: 1.8 + 0.05 * lt / D, rot: 0 };
  const HS = { face: grFaceAt([[0, GF.ok], [c.sniff - t0, GF.yuck], [c.clonk - t0, GF.gag]], lt), umb: { hide: true },
    armL: { e: [-150, -300], w: [-190, -262] },
    armR: { e: [lerp(150, 120, pk), lerp(-300, -340, pk)], w: [lerp(196, 34, pk), lerp(-258, -436, pk)] }, pinch,
    scarf: 0.12, headRot: 0.05 * grSince(t, c.clonk, 5) * Math.sin((t - c.clonk) * 30) };
  const g = ramp(t, c.sniff - 0.2, c.sniff + 0.6);
  grScene(cam, t, HS, { ang: 0.35, rain: 0.8, flame: 0.4, sky: { starAt: [1500, -400], starR: 300 },
    front: () => {
      // green haze drifting through (screen space)
      screenSpace();
      const rng = mulberry32(2024);
      for (let i = 0; i < 10; i++) {
        const bx = ((rng() * 1300 + 260 * (t - t0)) % 1400) - 160, by = 480 + 1000 * rng(), r = 110 + 90 * rng();
        softDot(ctx, bx, by, r, '#9BD45A', 0.3 * g);
      }
      grStink(870, 820, 1.25, t, g);
    } });
  // the CLONK and the egg badge
  grBurst('CLONK!', 790, 720, 150, popK(t, c.clonk, c.clonk + 0.75), { fg: '#FFD447', size: 76 });
  const ek = popK(t, c.eggs + 0.08, shot.end + 1);
  grEgg(275, 690, 1.25, t, ek);
  grTag('ROTTEN-EGG GAS', 345, 930, ek, { size: 40, edge: '#9BD45A', bg: '#1E2E10', fg: '#E8FFD0', sub: 'found by Webb, 2024', subCol: '#CFF2A8' });
  return { glow: 0.85, tint: '#8FD050', tintA: 0.14 * g, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- the button: "Lovely planet. Pack an umbrella."
SC.button = (lt, t, shot) => {
  const c = cu(), t0 = shot.start, D = shot.end - shot.start;
  const th = E.outBack(inv(c.thumbs, c.thumbs + 0.3, t), 1.5) * (1 - inv(c.pack - 0.2, c.pack + 0.1, t));
  const po = E.outCubic(inv(c.pull_out, c.pull_out + 0.5, t));                        // the fresh umbrella comes up
  const cam = { x: 500, y: lerp(1010, 1064, po), zoom: lerp(1.55, 1.9, po), rot: 0 };
  const HS = { face: grFaceAt([[0, GF.ok], [c.thumbs - t0, GF.meh], [c.pack - t0, GF.smug]], lt),
    umb: po > 0.02 ? { open: 0, shred: 0, rot: lerp(0.4, -0.05, po), L: lerp(100, 200, po) } : { hide: true },
    armL: { e: [lerp(-150, -142, po), lerp(-300, -284, po)], w: [lerp(-190, -64, po), lerp(-262, -356, po)] },
    armR: th > 0.02 ? { e: [150, -300], w: [lerp(196, 150, th), lerp(-258, -420, th)] } : undefined, handR: th > 0.3 ? 'thumb' : 'open',
    scarf: 0.12 };
  grScene(cam, t, HS, { ang: 0.55, rain: 1, flame: 0.5, sky: { starAt: [1500, -480], starR: 300 } });
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover: the hook's picture with IT RAINS / GLASS
SC.cover = (lt, t) => {
  const c = cu();
  hookDraw(c.tear + 0.18, t);
  screenSpace();
  bigWord('IT RAINS', 540, 1215, 132, '#FFFFFF', 1, -0.04);
  bigWord('GLASS', 540, 1400, 236, '#7FE9FF', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  grInitSky();
}
