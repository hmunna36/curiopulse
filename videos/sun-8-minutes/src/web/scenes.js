// What If the Sun VANISHED Right Now? ☀️ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The worlds: the beach at noon and at "night" (sv_beach.js), the hero in his deck chair (sv_hero.js), space (sv_space.js),
// the props and graphics (sv_props.js).
'use strict';

const cu = () => TLd.cues;
const svShotOf = (id) => TLd.shots.find((s) => s.id === id);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the beach at noon: the Sun high on the right (LIGHTS.day: the key from the upper right, a sky-blue rim); the beach with
// the Sun gone: starlight (LIGHTS.night, deep pool); space: the diagram light
const SV_DAYL = { ...LIGHTS.day, pool: 0.22, halo: 0.08 };
const SV_NIGHTL = { ...LIGHTS.night, pool: 0.75, rimAmt: 0.9, halo: 0.04 };
const SV_SPACEL = { ...LIGHTS.diagram, pool: 0.15 };
setLights({ hook: SV_DAYL, delivery: SV_DAYL, road: SV_SPACEL, pull: SV_SPACEL,
  dark: (lt, t) => (t < cu().snap ? SV_DAYL : SV_NIGHTL), fly: SV_SPACEL, feel: SV_NIGHTL, button: SV_DAYL, loop: SV_DAYL,
  cover: SV_DAYL });

// ---------------------------------------------------------------- the clock of the Short
// seconds of sunshine left: 8:20 (500 s) from "EIGHT", down to 0:00 on "out"; the last three seconds tick slowly
function svLeft(t) {
  const c = cu();
  const t0 = c.minutes1_end;                           // it holds 8:20 while she says "EIGHT minutes", then runs
  if (t <= t0) return 500;
  if (t <= c.count3) return lerp(500, 3, (t - t0) / (c.count3 - t0));
  if (t <= c.count2) return lerp(3, 2, inv(c.count3, c.count2, t));
  if (t <= c.count1) return lerp(2, 1, inv(c.count2, c.count1, t));
  return lerp(1, 0, inv(c.count1, c.count_zero, t));
}
const svNews = (t) => clamp(1 - svLeft(t) / 500);   // how far the dark (the news that the Sun is gone) has come: 0 Sun .. 1 Earth
const svSince = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// the countdown at the top of the frame (overlay: crisp, after the light and the bloom)
function svTimerAt(t, k = 1, o = {}) {
  const c = cu();
  if (t < c.timer_in) return;
  const slam = svSince(t, c.timer_in, 7);
  const tick = [c.count3, c.count2, c.count1].reduce((m, tc) => Math.max(m, svSince(t, tc, 12)), 0);
  const zero = t >= c.count_zero ? 1 : 0;
  svTimer(592, 528, svLeft(t), k * ramp(t, c.timer_in, c.timer_in + 0.25), { s: (o.s || 0.86) * (1 + 0.12 * tick + 0.25 * slam * 0), dy: -40 * slam * 0, zero,
    rot: 0.06 * slam * Math.sin((t - c.timer_in) * 30) });
}

// ---------------------------------------------------------------- the hook (valid at negative time: the Short's last frames)
// tt = seconds since frame 1. Frame 1: him mid-sip, the straw in his mouth. "you'd keep sunbathing": he lets go of the
// straw, "aah", the glass down to the chair's arm, his left hand behind his head.
function hookA(tt) {
  const c = cu();
  if (tt < 0) {                                         // the end of the Short: the glass rising to his lips again
    const u = smooth(inv(-0.47, -0.03, tt));
    return { sip: lerp(0.55, 1, u), relax: lerp(0.35, 0, u), face: lerpFace(SVF.smug, SVF.sip, u), headRot: 0, level: 0.72, shadesDown: 0 };
  }
  const un = smooth(inv(c.unstraw, c.unstraw + 0.32, tt));
  const rl = smooth(inv(c.unstraw + 0.12, c.unstraw + 0.6, tt));
  const face = svFace([[0, SVF.sip], [c.unstraw, SVF.aah], [c.eight + 0.15, SVF.smug]], tt);
  // a sip: the lemonade level drops a little while he drinks
  const level = 0.78 - 0.06 * clamp(tt / Math.max(0.1, c.unstraw));
  return { sip: 1 - un, relax: rl, face, headRot: -0.06 * rl, level, cheeks: 1 - un };
}
function hookCam(tt) {
  const c = cu();
  return camKeys(tt, [[-0.47, 532, 1462, 2.82], [0, 526, 1458, 2.94], [c.unstraw, 528, 1456, 3.02], [c.eight - 0.2, 560, 1470, 1.86],
    [6.4, 560, 1468, 1.92]]);
}
// the window on SPACE (overlay, screen space): the Sun, its switch; "vanished": OFF, POP, the chalk outline
function svWindowSpace(t, k) {
  const c = cu();
  svWindow(250, 650, 150, k, (x, y, R) => {
    ctx.fillStyle = '#03040C'; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    ctx.drawImage(SV_STARS, 0, 0, 420, 800, x - R - 40, y - R - 60, 420 * 0.6, 800 * 0.6);
    const sx = x - 30, sy = y + 4, sR = 62;
    const gone = t >= c.pop, shrink = 1 - clamp((t - c.pop) / 0.1);
    if (!gone || shrink > 0) {
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sR * 2.4); g.addColorStop(0, 'rgba(255,200,110,0.55)'); g.addColorStop(1, 'rgba(255,160,60,0)');
      ctx.fillStyle = g; ctx.fillRect(sx - sR * 2.4, sy - sR * 2.4, sR * 4.8, sR * 4.8);
      const RR = sR * (gone ? shrink * (1 + 0.15 * (1 - shrink)) : 1 + 0.02 * Math.sin(t * 9));
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, RR, 0, 7); ctx.clip();
      ctx.translate(sx, sy); ctx.rotate(t * 0.05); const s = RR * 2.2 / SV_GRAN.width; ctx.drawImage(SV_GRAN, -SV_GRAN.width * s / 2, -SV_GRAN.height * s / 2, SV_GRAN.width * s, SV_GRAN.height * s);
      ctx.restore();
      const lg = ctx.createRadialGradient(sx, sy, RR * 0.5, sx, sy, RR); lg.addColorStop(0, 'rgba(120,30,0,0)'); lg.addColorStop(1, 'rgba(110,20,0,0.6)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(sx, sy, RR, 0, 7); ctx.fill();
    }
    if (gone) {
      const u = t - c.pop;
      if (u < 0.5) {                                                   // the pop: a flash ring and sparkles (in the window)
        ctx.beginPath(); ctx.arc(sx, sy, sR * (0.7 + 1.4 * E.outCubic(u / 0.5)), 0, 7); ctx.lineWidth = 6 * (1 - u / 0.5); ctx.strokeStyle = `rgba(255,240,190,${1 - u / 0.5})`; ctx.stroke();
        const rng = mulberry32(4);
        for (let i = 0; i < 10; i++) { const a = rng() * 6.28, d = sR * (0.6 + 1.5 * E.outCubic(u / 0.5)); circle(ctx, sx + Math.cos(a) * d, sy + Math.sin(a) * d, 4 * (1 - u / 0.5), '#FFE08A'); }
        if (u < 0.12) { ctx.fillStyle = `rgba(255,255,255,${1 - u / 0.12})`; ctx.beginPath(); ctx.arc(sx, sy, sR * 1.1, 0, 7); ctx.fill(); }
      }
      // the chalk outline (it draws on)
      const ok = ramp(t, c.pop + 0.12, c.pop + 0.5, E.inOutSine);
      if (ok > 0.01) {
        ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([9, 6]);
        ctx.beginPath(); ctx.arc(sx, sy, sR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ok); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(245,246,255,0.92)'; ctx.stroke();
        ctx.restore();
      }
    }
    // the switch: ON -> OFF on "vanished"
    const off = ramp(t, c.flip, c.flip + 0.07, E.outBack);
    svSwitch(ctx, x + 92, y + 16, 0.62, off, t);
  }, 'SPACE · NOW');
}
function hookDraw(tt, t) {
  const c = cu(), cam = hookCam(tt), A = hookA(tt);
  svBeachBack(cam, t, { N: 0 });
  const H = svHero(cam, t, { sip: A.sip, relax: A.relax, face: A.face, headRot: A.headRot, level: A.level, shadesDown: A.shadesDown || 0 });
  svBeachFront(cam, t, { N: 0 });
  return { cam, A, H };
}
SC.hook = (lt, t) => {
  const c = cu();
  hookDraw(lt, t);
  return { glow: 0.85, overlay: () => {
    svWindowSpace(t, ramp(t, c.window, c.window + 0.22) * (1 - 0 * t));
    svTimerAt(t);
  } };
};
SC.loop = (lt, t) => {
  hookDraw(t - TL.duration, t);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- "Your sunshine is a delivery... sent eight minutes ago."
// close on his face in the sun: envelopes of sunshine fly in from the Sun's side and land on him with a sparkle; one stops
// beside his face; THUD: SENT 8 MIN AGO; he pushes his sunglasses up to read it
const SV_DEL_N = 14;
function svDeliveryFlights(t, cam, H) {
  const c = cu(), out = [];
  const targets = [[-30, -40], [40, 10], [-70, 60], [60, -60], [10, 90], [-40, 150], [80, 140], [-90, 0], [30, 40], [-10, -90], [70, 70], [-60, 110], [20, 170], [50, -20]];
  for (let i = 0; i < SV_DEL_N; i++) {
    const t0 = c.letters + i * 0.2, dur = 0.55;
    const u = (t - t0) / dur;
    if (u < 0 || u > 1.35) continue;
    const tg = targets[i % targets.length];
    const P1 = toScreen(cam, H.head[0] + tg[0], H.head[1] + tg[1] + 60);
    const P0 = [1180 + 60 * Math.sin(i * 2.1), 140 + 120 * Math.cos(i * 1.3)];
    out.push({ u, P0, P1, i });
  }
  return out;
}
SC.delivery = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 520, 1404, 3.15], [D, 512, 1398, 3.4]]);
  svBeachBack(cam, t, { N: 0 });
  const look = smooth(inv(c.stopper, c.stopper + 0.25, t));
  const up = ramp(t, c.read, c.read + 0.16, E.outBack);
  const face = svFace([[shot.start, SVF.smug], [c.stopper + 0.05, Object.assign({}, SVF.read, { lookX: -0.8, lookY: -0.5 })],
    [c.stamp, Object.assign({}, SVF.wide, { lookX: -0.85, lookY: -0.45 })], [c.read + 0.1, Object.assign({}, SVF.read, { lookX: -0.9, lookY: -0.4 })]], t);
  const H = svHero(cam, t, { sip: 0, relax: 1 - up, liftL: up, face, headRot: -0.05 * look + 0.04 * svSince(t, c.stamp, 10), shadesUp: up,
    level: 0.72, glint: 1 });
  svBeachFront(cam, t, { N: 0 });
  const flights = svDeliveryFlights(t, cam, H);
  return { glow: 0.88, overlay: () => {
    screenSpace();
    // the envelopes flying in (and the sparkle where each lands)
    for (const f of flights) {
      if (f.u <= 1) {
        const e = E.inCubic(clamp(f.u)), x = lerp(f.P0[0], f.P1[0], e), y = lerp(f.P0[1], f.P1[1], e);
        const ang = Math.atan2(f.P1[1] - f.P0[1], f.P1[0] - f.P0[0]);
        const s = lerp(1.0, 0.72, e);
        softDot(ctx, x, y, 90 * s, '#FFE7A0', 0.35);
        svEnvelope(ctx, x, y, s, ang * 0.15 - 0.2, { trail: [-Math.cos(ang) * 260 / s * 0.5, -Math.sin(ang) * 260 / s * 0.5] });
      } else {
        const k = (f.u - 1) / 0.35;
        paint(() => {
          for (let j = 0; j < 6; j++) { const a = j * 1.047 + f.i, d = 24 + 50 * k; circle(ctx, f.P1[0] + Math.cos(a) * d, f.P1[1] + Math.sin(a) * d, 6 * (1 - k), '#FFF1B0'); }
          softDot(ctx, f.P1[0], f.P1[1], 70 * (1 - k), '#FFE7A0', 0.6 * (1 - k));
        });
      }
    }
    // the one that stops beside his face, and its postmark
    if (t >= c.stopper) {
      const u = clamp((t - c.stopper) / 0.32), e = E.outBack(u, 1.4);
      const Pf0 = toScreen(cam, H.head[0] - 150, H.head[1] - 108), Pf = [Math.max(272, Pf0[0]), Math.max(700, Pf0[1])];
      const x = lerp(1150, Pf[0], e), y = lerp(260, Pf[1], e) + 8 * Math.sin(t * 4), rot = lerp(-0.6, -0.1, e) + 0.03 * Math.sin(t * 3);
      const thud = svSince(t, c.stamp, 14);
      softDot(ctx, x, y, 240, '#FFE7A0', 0.35);
      svEnvelope(ctx, x, y + 16 * thud, 2.15, rot, { seal: t < c.stamp });
      svPostmark(ctx, x + 10, y + 6 + 16 * thud, 1.12, ramp(t, c.stamp, c.stamp + 0.09, E.outCubic), -0.2);
    }
    svTimerAt(t);
  } };
};

// ---------------------------------------------------------------- "Switch the Sun off, and the light already on the road...
// keeps arriving." THE ONE PICTURE: the road of sunshine from the Sun's chalk outline down to Earth. Its dark end (the
// last envelope) is still on its way; Earth's day side still catches them; his portrait in the corner, still tanning.
const SV_RD = { sun: [540, -2600], R: 150, earth: [540, 1660], ER: 420 };
let SV_RD_PATH = null;
function svRoadPath() {
  if (SV_RD_PATH) return SV_RD_PATH;
  const pts = [], y0 = SV_RD.sun[1] + SV_RD.R + 10, y1 = SV_RD.earth[1] - SV_RD.ER + 30;
  for (let i = 0; i <= 60; i++) {
    const u = i / 60, y = lerp(y0, y1, u), taper = Math.sin(Math.PI * u);
    pts.push([540 + 190 * Math.sin(u * Math.PI * 2.0) * taper, y]);
  }
  return (SV_RD_PATH = pts);
}
// the camera: on the outline and its switch; down the road to its dark end (LAST), riding with it; then fast down to Earth
function svRoadCam(t) {
  const c = cu(), path = svRoadPath(), acc = polyLen(path), L = acc[acc.length - 1], sh = svShotOf('road');
  const tailY = (tt) => polyAt(path, acc, svNews(tt) * L)[1] + 60;
  if (t <= c.travel) { const u = inv(sh.start, c.travel, t); return { x: lerp(560, 556, u), y: lerp(-2520, -2470, u), zoom: lerp(1.02, 0.98, u), rot: 0 }; }
  const t1 = c.last_tag - 0.05;
  if (t <= t1) { const u = E.inOutCubic(inv(c.travel, t1, t)); return { x: lerp(556, 540, u), y: lerp(-2470, tailY(t), u), zoom: lerp(0.98, 0.9, u), rot: 0 }; }
  const t2 = c.road_end;
  if (t <= t2) return { x: 540, y: tailY(t), zoom: 0.9, rot: 0 };
  const t3 = c.keeps1 + 0.15;
  if (t <= t3) { const u = E.inOutCubic(inv(t2, t3, t)); return { x: 540, y: lerp(tailY(t2), 1100, u), zoom: lerp(0.9, 0.82, u), rot: 0 }; }
  const u = inv(t3, sh.end, t);
  return { x: 540, y: lerp(1100, 1140, u), zoom: lerp(0.82, 0.86, u), rot: 0 };
}
SC.road = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = svRoadCam(t), camP = svRoadCam(Math.max(shot.start, t - 1 / 30));
  const vy = (cam.y - camP.y) * cam.zoom;                     // screen px per frame: the motion blur
  svSpaceBg(t, cam.y * 0.6, cam.x);
  applyCam(cam);
  const path = svRoadPath();
  // the outline, its scrawl, the switch (already OFF; it rattles on "Switch")
  svOutline(SV_RD.sun[0], SV_RD.sun[1], SV_RD.R, 1, t, { scrawl: 1, sx: 0.15, sy: -1.42, fs: 0.26 });
  const rattle = 0.06 * Math.sin((t - c.click) * 60) * svSince(t, c.click, 8);
  ctx.save(); ctx.translate(820, -2620); ctx.rotate(rattle); svSwitch(ctx, 0, 0, 1.15, 1, t); ctx.restore();
  svSign(260, -2860, 0.75, ['EARTH ↓', '150,000,000 KM']);
  // the road, its envelopes, its dark end
  const L = polyLen(path); const Lr = L[L.length - 1];
  const v = Lr / (c.count_zero - c.minutes1_end) * (497 / 500);
  const R = svRoad(path, svNews(t), t, v, { lastTag: ramp(t, c.last_tag, c.last_tag + 0.2, E.outBack) });
  // Earth at the end: the day side up (toward where the Sun was)
  svEarth(SV_RD.earth[0], SV_RD.earth[1], SV_RD.ER, t, { sun: -Math.PI / 2, lit: 1, rot: 0.2 });
  // envelopes landing on the day side: little bursts where the road meets the air
  const landK = smooth(inv(c.keeps1 - 0.4, c.keeps1, t));
  if (landK > 0.01) {
    paint(() => {
      for (let i = 0; i < 5; i++) {
        const ph = ((t * 2.2 + i * 0.37) % 1), x = 540 + (i - 2) * 70 + 20 * Math.sin(i * 3), y = SV_RD.earth[1] - SV_RD.ER + 10;
        circle(ctx, x, y - 30 * ph, 10 * (1 - ph) * landK, '#FFF1B0');
      }
    });
    softDot(gctx, 540, SV_RD.earth[1] - SV_RD.ER, 260, '#FFE7A0', 0.5 * landK);
  }
  void R;
  return { glow: 0.92, blur: Math.abs(vy) > 2 ? [0, clamp(vy * 0.9, -60, 60)] : null, overlay: () => {
    svPortrait(214, 1118, 104, t, ramp(t, c.and1 + 0.2, c.and1 + 0.45), {});
    svTimerAt(t);
  } };
};

// ---------------------------------------------------------------- the orbit from above (the pull, the fly)
const SV_OR = { C: [540, 960], RO: 330, ER: 58, th0: 0.55, w: 0.42 };
const svOrbitAng = (t) => SV_OR.th0 - SV_OR.w * (t - svShotOf('pull').start);    // counterclockwise on screen
const svOnOrbit = (a, r = SV_OR.RO) => [SV_OR.C[0] + Math.cos(a) * r, SV_OR.C[1] + Math.sin(a) * r];
// the orbit, the light still flowing outward beyond the ring, the ring (rho), the rope from Earth to the ring
function svOrbitScene(cam, t, o) {
  const [cx, cy] = SV_OR.C, RO = SV_OR.RO, rho = o.rho;
  svSpaceBg(t, 0, 0);
  applyCam(cam);
  // sunlight still on its way out: a warm glow outside the ring, and streaks running outward
  if (o.light > 0.01) {
    const g = ctx.createRadialGradient(cx, cy, rho, cx, cy, rho + 420);
    g.addColorStop(0, `rgba(255,214,130,${0.30 * o.light})`); g.addColorStop(0.5, `rgba(255,190,100,${0.10 * o.light})`); g.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rho + 420, 0, 7); ctx.arc(cx, cy, rho, 0, 7, true); ctx.fill();
    paint(() => {
      for (let i = 0; i < 28; i++) {
        const a = i * (Math.PI * 2 / 28) + 0.1, ph = ((t * 0.55 + hash(i) ) % 1);
        const r0 = rho + 10 + ph * 420, L = 40;
        if (r0 > rho + 400) continue;
        ctx.strokeStyle = `rgba(255,232,160,${0.7 * o.light * (1 - ph)})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + L), cy + Math.sin(a) * (r0 + L)); ctx.stroke();
      }
    });
  }
  // the orbit: a dashed ring
  paint(() => {
    ctx.save(); ctx.setLineDash([18, 16]); ctx.lineDashOffset = -t * 20;
    ctx.beginPath(); ctx.arc(cx, cy, RO, 0, 7); ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(184,196,255,0.45)'; ctx.stroke();
    ctx.restore();
  });
  // the ring: the front of the news (the dark inside it)
  if (rho > 2) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rho, 0, 7); ctx.fillStyle = 'rgba(2,3,10,0.55)'; ctx.fill(); ctx.restore();
    paint(() => { ctx.beginPath(); ctx.arc(cx, cy, rho, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,244,214,0.9)'; ctx.stroke(); });
    gctx.save(); gctx.beginPath(); gctx.arc(cx, cy, rho, 0, 7); gctx.lineWidth = 18; gctx.strokeStyle = 'rgba(255,230,170,0.35)'; gctx.stroke(); gctx.restore();
  }
  // the outline where the Sun was
  svOutline(cx, cy, 74, 1, t, { scrawl: o.scrawl === undefined ? 1 : o.scrawl, sy: 1.62, fs: 0.3 });
  return { cx, cy, RO, rho };
}
// the rope from Earth E inward to the ring (it glows; its inner end frays where the news has passed)
function svRope(E, rho, t, k = 1, snapU = -1) {
  if (k <= 0.01) return;
  const [cx, cy] = SV_OR.C, d = [cx - E[0], cy - E[1]], L = Math.hypot(d[0], d[1]), u = [d[0] / L, d[1] / L];
  const len = Math.max(0, L - rho);                                     // from Earth to the ring
  if (len < 4) return;
  const start = [E[0] + u[0] * SV_OR.ER * 0.9, E[1] + u[1] * SV_OR.ER * 0.9], end = [E[0] + u[0] * len, E[1] + u[1] * len];
  const sw = (snapU >= 0) ? E.outCubic(clamp(snapU)) : 0;              // the snap: the loose end whips back to Earth
  const eX = lerp(end[0], start[0], sw), eY = lerp(end[1], start[1], sw);
  const wob = 10 * Math.sin(t * 20) * (snapU >= 0 ? 1 - sw : 0);
  paint(() => {
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(start[0], start[1]); ctx.quadraticCurveTo((start[0] + eX) / 2 - u[1] * wob, (start[1] + eY) / 2 + u[0] * wob, eX, eY);
    ctx.lineWidth = 9 * k; ctx.strokeStyle = 'rgba(127,233,255,0.95)'; ctx.stroke();
    ctx.lineWidth = 3 * k; ctx.strokeStyle = 'rgba(230,252,255,0.9)'; ctx.stroke();
    if (snapU < 0) for (let i = -1; i <= 1; i++) { line(ctx, eX, eY, eX + u[0] * 16 + u[1] * i * 10, eY + u[1] * 16 - u[0] * i * 10, 3, 'rgba(127,233,255,0.8)'); }   // frayed
  });
  gctx.save(); gctx.lineCap = 'round'; gctx.beginPath(); gctx.moveTo(start[0], start[1]); gctx.lineTo(eX, eY); gctx.lineWidth = 26 * k; gctx.strokeStyle = 'rgba(127,233,255,0.4)'; gctx.stroke(); gctx.restore();
  return [(start[0] + eX) / 2, (start[1] + eY) / 2];
}
SC.pull = (lt, t, shot) => {
  const c = cu();
  const a = svOrbitAng(t), Ep = svOnOrbit(a), rho = SV_OR.RO * svNews(t);
  const cam = camKeys(t, [[shot.start, 540, 960, 0.98], [c.so, 548, 958, 1.06], [c.circling, 560, 955, 1.12],
    [c.push_in, 548, 962, 1.12], [c.nothing + 0.12, 540, 980, 2.25], [shot.end, 540, 982, 2.35]]);
  svOrbitScene(cam, t, { rho, light: 1 });
  // Earth's trail (the way it has come) and Earth, its day side toward the outline
  paint(() => {
    for (let i = 1; i <= 16; i++) { const p = svOnOrbit(a + i * 0.035); circle(ctx, p[0], p[1], SV_OR.ER * 0.32 * (1 - i / 17), `rgba(127,190,255,${0.35 * (1 - i / 17)})`); }
  });
  const mid = svRope(Ep, rho, t, ramp(t, c.rope - 0.1, c.rope + 0.15));
  svEarth(Ep[0], Ep[1], SV_OR.ER, t, { sun: Math.atan2(SV_OR.C[1] - Ep[1], SV_OR.C[0] - Ep[0]), lit: 1, rot: -a + 1.2 });
  // the tumbleweed across the empty outline, on "nothing."
  const tu = (t - c.tumble) / 0.95;
  if (tu > 0 && tu < 1) {
    const x = lerp(SV_OR.C[0] + 290, SV_OR.C[0] - 290, tu), y = SV_OR.C[1] + 30 - 40 * Math.abs(Math.sin(tu * Math.PI * 3)) * (1 - tu * 0.4);
    svTumbleweed(ctx, x, y, 34, -tu * 9);
  }
  return { glow: 0.9, overlay: () => {
    if (mid) {                                                       // PULL beside the rope, off to its side (not on Earth)
      const d = [SV_OR.C[0] - Ep[0], SV_OR.C[1] - Ep[1]], L = Math.hypot(d[0], d[1]) || 1;
      const ms = toScreen(cam, mid[0] - d[1] / L * 64, mid[1] + d[0] / L * 64);
      svTag('PULL', clamp(ms[0], 200, 860), clamp(ms[1], 640, 1240), '#7FE9FF', popK(t, c.rope, c.push_in), 40, 0);
    }
    const ra = -Math.PI * 0.75, rs = toScreen(cam, SV_OR.C[0] + Math.cos(ra) * rho, SV_OR.C[1] + Math.sin(ra) * rho - 40);
    if (rho > 40) svTag('BAD NEWS ➜', clamp(rs[0], 250, 820), clamp(rs[1], 660, 1180), '#FFD447', popK(t, c.ring_tag, c.push_in), 34, -0.12);
    svTimerAt(t);
  } };
};

// ---------------------------------------------------------------- the dark: "Then... lights out."
SC.dark = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const night = t >= c.snap ? 1 : 0;
  const cam = camKeys(t, [[shot.start, 540, 1436, 1.95], [c.snap, 540, 1432, 2.25], [shot.end, 540, 1430, 2.3]]);
  const sh = shake(t, 10 * svSince(t, c.snap, 6), 20, 4);
  cam.x += sh[0] / cam.zoom; cam.y += sh[1] / cam.zoom;
  svBeachBack(cam, t, { N: night });
  const up = popK(t, c.glasses_up, c.glasses_down + 0.12, 0.1, 0.12);
  const face = night ? (up > 0.3 ? Object.assign({}, SVF.wide, { lookY: -0.9, lookX: 0.2 }) : Object.assign({}, SVF.deadpan, { mouth: 'o', mouthOpen: 0.3 })) : SVF.sip;
  svHero(cam, t, { sip: 1, relax: 1 - up, liftL: up, shadesUp: up, face, N: night, level: 0.62, glint: night ? 0 : 1 });
  svBeachFront(cam, t, { N: night });
  return { glow: night ? 0.7 : 0.85, flash: 0.0, overlay: () => { svTimerAt(t); } };
};

// ---------------------------------------------------------------- "Earth flies off in a straight line, at thirty kilometres
// a second..." the ring reaches Earth: the rope snaps; Earth goes dark (city lights) and leaves along the straight line
SC.fly = (lt, t, shot) => {
  const c = cu();
  const ts = c.snap_rope, w = SV_OR.w;
  const aS = svOrbitAng(c.count_zero);                                 // where Earth was when the news arrived
  const ES = svOnOrbit(aS);
  const tang = [Math.sin(aS), -Math.cos(aS)];                          // counterclockwise on screen: d/da of (cos, sin) times -1
  const v = w * SV_OR.RO;
  let Ep, lit;
  if (t < ts) { Ep = svOnOrbit(aS + w * (ts - t)); lit = 1; }
  else { Ep = [ES[0] + tang[0] * v * (t - ts), ES[1] + tang[1] * v * (t - ts)]; lit = 0; }
  const rho = SV_OR.RO + (t - ts) * 230;
  const fol = smooth(inv(ts + 0.2, ts + 1.6, t));
  const cam0 = { x: 540, y: 960, zoom: 1.0 };
  // the camera follows loosely (Earth keeps sliding across the frame toward its corner) and pulls out a little
  const lag = (t - ts) > 0 ? (t - ts) * v * 0.45 : 0;
  const cam = { x: lerp(cam0.x, Ep[0] - tang[0] * (lag - 60), fol), y: lerp(cam0.y, Ep[1] - tang[1] * (lag - 60), fol), zoom: lerp(1.0, 1.14, fol) - 0.03 * clamp(t - ts - 1.6, 0, 3), rot: 0 };
  svOrbitScene(cam, t, { rho: Math.max(0, rho), light: 1 - smooth(inv(ts, ts + 1.2, t)), scrawl: 1 });
  // the straight line ahead (it draws on at "straight")
  const lk = ramp(t, c.straight - 0.1, c.straight + 0.5, E.inOutSine);
  if (lk > 0.01) paint(() => {
    ctx.save(); ctx.setLineDash([26, 20]); ctx.lineDashOffset = -t * 60;
    ctx.beginPath(); ctx.moveTo(ES[0], ES[1]); ctx.lineTo(ES[0] + tang[0] * 2600 * lk, ES[1] + tang[1] * 2600 * lk);
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,212,71,0.9)'; ctx.stroke(); ctx.restore();
  });
  // the rope: whole before the snap, whipping back after
  if (t < ts + 0.3) svRope(Ep, Math.min(rho, SV_OR.RO - 1), t, 1, t >= ts ? (t - ts) / 0.3 : -1);
  // speed lines behind Earth once it is free
  if (t > ts) paint(() => {
    const sp = smooth(inv(ts, ts + 0.5, t));
    for (let i = -2; i <= 2; i++) {
      const o = [-tang[1] * i * 22, tang[0] * i * 22], L = (90 + 40 * Math.abs(Math.sin(i * 7 + t * 9))) * sp;
      line(ctx, Ep[0] - tang[0] * (SV_OR.ER + 14) + o[0], Ep[1] - tang[1] * (SV_OR.ER + 14) + o[1], Ep[0] - tang[0] * (SV_OR.ER + 14 + L) + o[0], Ep[1] - tang[1] * (SV_OR.ER + 14 + L) + o[1], 4, 'rgba(200,220,255,0.6)');
    }
  });
  svEarth(Ep[0], Ep[1], SV_OR.ER, t, { sun: Math.atan2(SV_OR.C[1] - Ep[1], SV_OR.C[0] - Ep[0]), lit, rot: -aS + 1.2 });
  // the snap: a little burst where the rope broke
  const sk = t - ts;
  if (sk > 0 && sk < 0.35) paint(() => { const d = [SV_OR.C[0] - ES[0], SV_OR.C[1] - ES[1]], L = Math.hypot(d[0], d[1]); const p = [ES[0] + d[0] / L * 90, ES[1] + d[1] / L * 90]; shockLines(p[0], p[1], 30, sk / 0.35, 8, '#BFF6FF', 3); });
  return { glow: 0.9, overlay: () => {
    const es = toScreen(cam, Ep[0], Ep[1]);
    svTag('30 KM/S', clamp(es[0] + 40, 230, 850), clamp(es[1] - SV_OR.ER * cam.zoom - 80, 500, 1200), '#FFD447', ramp(t, c.speed_tag, c.speed_tag + 0.18), 56, -0.05);
    if (t < ts + 0.32) svTimerAt(t, 1 - smooth(inv(ts + 0.12, ts + 0.32, t)));
  } };
};

// ---------------------------------------------------------------- "...and you wouldn't even feel it." the beach in the dark
SC.feel = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 548, 1440, 2.05], [D, 548, 1436, 2.2]]);
  svBeachBack(cam, t, { N: 1 });
  const sip = smooth(inv(c.sip_dark - 0.25, c.sip_dark + 0.05, t)) * (1 - smooth(inv(c.it_end + 0.1, c.it_end + 0.4, t)));
  const face = svFace([[shot.start, SVF.deadpan], [c.sip_dark, Object.assign({}, SVF.sip, { blink: 0.2 })], [c.it_end + 0.1, SVF.deadpan]], t);
  svHero(cam, t, { sip, relax: 1, face, N: 1, level: 0.6, clink: svSince(t, c.clink, 6) * Math.sin((t - c.clink) * 40) * 0.5, glint: 0 });
  svBeachFront(cam, t, { N: 1 });
  return { glow: 0.7 };
};

// ---------------------------------------------------------------- "Relax. The Sun's still there. Probably." the sun is back
SC.button = (lt, t, shot) => {
  const c = cu(), DUR = TL.duration;
  const end = hookCam(shot.end - DUR);
  const cam = camKeys(t, [[shot.start, 556, 1446, 1.62], [c.probably - 0.1, 546, 1452, 1.95], [c.unsquint, 536, 1460, 2.15], [shot.end, end.x, end.y, end.zoom]]);
  svBeachBack(cam, t, { N: 0 });
  const back = hookA(shot.end - DUR);
  const sq = popK(t, c.squint, c.unsquint, 0.12, 0.14);
  const toLoop = smooth(inv(c.resip, shot.end, t));
  let face = svFace([[shot.start, SVF.aah], [c.relax_end, SVF.smug], [c.the_sun, Object.assign({}, SVF.smug, { lookX: 0.6, lookY: -0.7 })],
    [c.squint, SVF.squint], [c.unsquint, SVF.smug]], t);
  face = lerpFace(face, back.face, toLoop);
  svHero(cam, t, { sip: lerp(0, back.sip, toLoop), relax: lerp(1, back.relax, toLoop), face, shadesDown: sq, headRot: 0.05 * sq - 0.04 * (1 - toLoop), level: 0.72 });
  svBeachFront(cam, t, { N: 0 });
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover: the hook after the pop
SC.cover = (lt, t) => {
  const tt = 2.4;
  hookDraw(tt, tt);
  return { glow: 0.85, noCaptions: true, overlay: () => {
    svWindowSpace(tt + 0.6, 1);
    svTimer(612, 528, 500, 1, { s: 0.95 });
    screenSpace();
    bigWord('SUN GONE?!', 540, 1300, 180, '#FFD447', 1, -0.03);
  } };
};

function initScenes2() {
  initBeach();
  initSpace();
}
