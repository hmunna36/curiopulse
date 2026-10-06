// Why Do We Get DÉJÀ VU? Short: the shots inside his head (caught, bell, files, clash).
'use strict';

// a light from above on whoever is working (world coords under the camera)
function mindSpot(x, y, w = 300, a = 0.13, col = '#FFE9C0') {
  const g = ctx.createLinearGradient(0, y - 760, 0, y + 140);
  g.addColorStop(0, rgba(col, a * 1.4)); g.addColorStop(1, rgba(col, 0));
  ctx.beginPath(); ctx.moveTo(x - 70, y - 760); ctx.lineTo(x + 70, y - 760); ctx.lineTo(x + w, y + 140); ctx.lineTo(x - w, y + 140); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  softDot(gctx, x, y - 80, w * 1.2, col, a * 1.5);
}
// a little picture of the cafe (what his eyes are sending in), in a frame at world (x, y, w, h) under camera cam
function cafePhoto(cam, x, y, w, h, t, rot = 0, label = 'TODAY') {
  const a = toScreen(cam, x, y), z = cam.zoom;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(a[0] + w * z / 2, a[1] + h * z / 2); ctx.rotate(rot); ctx.translate(-w * z / 2, -h * z / 2);
  rrect(ctx, -14 * z + 8 * z, -14 * z + 10 * z, (w + 28) * z, (h + 74) * z, 10 * z); ctx.fillStyle = 'rgba(0,0,10,0.4)'; ctx.fill();
  rrect(ctx, -14 * z, -14 * z, (w + 28) * z, (h + 74) * z, 10 * z); ctx.fillStyle = '#FFF9EA'; ctx.fill();
  ctx.font = `900 ${34 * z}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#39444A'; ctx.fillText(label, w * z / 2, (h + 30) * z);
  ctx.beginPath(); ctx.rect(0, 0, w * z, h * z); ctx.clip();
  // the room, small: a camera of its own, composed with this frame's place and tilt
  const m = ctx.getTransform(), k = (w * z) / 880;
  const room = (c) => { c.setTransform(m); c.transform(k, 0, 0, k, 0, 0); c.translate(-100, -612); };
  room(ctx);
  cfWall(ctx, null, t, 0); cfFloor(ctx, null, t, 0); cfDoorway(ctx, null, t, 0); cfWindow(ctx, null, t, 0); cfFrames(ctx, null, t, 0); cfSign(ctx, null, t, 0);
  cfCounter(ctx, null, t, 0); cfLamp(ctx, null, t, 0); cfTable(ctx, null, t, 0); cfLeaf(ctx, null, t, 0, 0);
  ctx.restore();
}
// a tiny megaphone in a hand (local)
function megaphone(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-30, -14); c.lineTo(46, -46); c.lineTo(46, 46); c.lineTo(-30, 14); c.closePath(); c.fillStyle = '#E23A52'; c.fill(); c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = '#6E0C1C'; c.stroke();
  rrect(c, -52, -16, 26, 32, 6); c.fillStyle = '#FFFFFF'; c.fill(); c.stroke(); ellipse(c, 48, 0, 10, 46, '#FFF9EA');
  c.restore();
}

// ---------------------------------------------------------------- 3. caught: the torch finds the eager one
SC.caught = (lt, t, shot) => {
  const c = cu();
  mindBg(t, '#2E2A70', '#070618', '#8FB8FF');
  const on = ramp(t, c.beam, c.beam + 0.06);
  const busted = springStep(t - c.busted, 4.6, 0.42);
  const [qx, qy] = shake(t, 9 * decay(t, c.beam, 7) + 12 * decay(t, c.busted, 8), 30, 5);
  const cam = camKeys(t, [[shot.start, 560, 850, 1.55], [shot.start + 0.42, 552, 884, 1.0], [c.beam - 0.02, 552, 884, 1.04], [c.beam + 0.28, 520, 846, 1.3], [shot.end, 516, 844, 1.37]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  applyCam(cam);
  const HX = 560, HY = 884;
  const whis = ramp(t, c.lying - 0.05, c.lying + 0.15);
  const E0 = MG_AT.eager, B0 = MG_AT.boss, hand = [B0[0] + 0.44 * 150, B0[1] + 0.44 * 34];
  mindHead(ctx, gctx, HX, HY, 1, t, {
    glow: 0.22,
    mini: (cc, who, px, py) => {
      if (who === 'boss') {
        // the torch's beam, under the others
        if (on > 0) {
          const dx = E0[0] + 40 - hand[0], dy = E0[1] + 30 - hand[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
          const g = cc.createLinearGradient(hand[0], hand[1], hand[0] + dx, hand[1] + dy);
          g.addColorStop(0, `rgba(255,244,180,${0.6 * on})`); g.addColorStop(1, `rgba(255,244,180,${0.1 * on})`);
          cc.beginPath(); cc.moveTo(hand[0] + nx * 10, hand[1] + ny * 10); cc.lineTo(hand[0] + dx + nx * 96, hand[1] + dy + ny * 96); cc.lineTo(hand[0] + dx - nx * 96, hand[1] + dy - ny * 96); cc.lineTo(hand[0] - nx * 10, hand[1] - ny * 10); cc.closePath();
          cc.fillStyle = g; cc.fill();
          ellipse(cc, E0[0], E0[1] + 52, 96, 20, `rgba(255,244,180,${0.22 * on})`);
        }
        mindGuy(cc, px, py, 0.44, t, {
          who, mood: on > 0.5 ? 'stern' : 'think', look: on > 0.5 ? [0.9, 0.6] : [Math.sin(t * 5), 0.2], armR: [150, 34], armL: [-128, 92], ph: 1,
          hold: (c2, hs) => { c2.save(); c2.translate(hs[1][0], hs[1][1]); c2.rotate(0.5); rrect(c2, -34, -16, 62, 32, 8); c2.fillStyle = '#39444A'; c2.fill(); c2.lineWidth = 5; c2.strokeStyle = '#12161A'; c2.stroke(); rrect(c2, 22, -24, 26, 48, 6); c2.fillStyle = on > 0.5 ? '#FFF4B4' : '#8E99A0'; c2.fill(); c2.stroke(); c2.restore(); },
        });
      } else if (who === 'memo') {
        mindGuy(cc, px, py, 0.4, t, { who, mood: on > 0.5 ? 'shock' : 'calm', look: [-0.9, 0.5], ph: 2, armL: on > 0.5 ? [-70, 30] : undefined });
      } else {
        const loud = 1 - on;
        const hop = loud * -26 * Math.abs(Math.sin(t * 9));
        mindGuy(cc, px, py, 0.46, t, {
          who, mood: on < 0.5 ? 'yell' : whis > 0.5 ? 'whistle' : 'oops', look: on < 0.5 ? [0, 0] : whis > 0.5 ? [0.7, -0.8] : [-0.9, -0.3], hop, sweat: on * (0.5 + 0.5 * Math.sin(t * 9)), ph: 3,
          armL: on < 0.5 ? [-150, -110] : [-60, 150], armR: on < 0.5 ? [140, -70] : [60, 150],
          hold: (c2, hs) => { megaphone(c2, hs[1][0] + 30 - 40 * on, hs[1][1] - 10 + 30 * on, 1.1, -0.5 + 2.2 * on); },
        });
        // what he was shouting
        const kb = (0.9 + 0.1 * Math.sin(t * 22)) * loud;
        if (kb > 0.02) {
          cc.save(); cc.translate(px + 128, py - 112); cc.rotate(0.1); cc.scale(kb, kb);
          rrect(cc, -96, -38, 192, 76, 22); cc.fillStyle = '#FFFFFF'; cc.fill(); cc.lineWidth = 6; cc.strokeStyle = '#3A1A04'; cc.stroke();
          cc.beginPath(); cc.moveTo(-60, 32); cc.lineTo(-84, 66); cc.lineTo(-34, 34); cc.closePath(); cc.fillStyle = '#FFFFFF'; cc.fill();
          cc.font = '400 52px Anton'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillStyle = '#E2702A'; cc.fillText('SEEN IT!', 0, 4);
          cc.restore();
        }
        if (whis > 0.5) {                                   // an innocent little tune
          for (const ph of [0, 0.5]) {
            const p = ((t - c.lying) * 1.5 + ph) % 1, nx = px + 70 + 44 * p + 10 * Math.sin(p * 9), ny = py - 56 - 86 * p, a = Math.sin(Math.PI * p);
            ellipse(cc, nx, ny, 11, 8, `rgba(255,255,255,${a})`, -0.4); line(cc, nx + 9, ny - 2, nx + 9, ny - 34, 4, `rgba(255,255,255,${a})`); line(cc, nx + 9, ny - 34, nx + 22, ny - 26, 5, `rgba(255,255,255,${a})`);
          }
        }
      }
    },
  });
  const es = toScreen(cam, HX + E0[0], HY + E0[1]);
  screenSpace();
  softDot(gctx, es[0], es[1], 170, '#FFF4B4', 0.14 * on);
  shockLines(es[0], es[1], 96 * cam.zoom, inv(c.beam, c.beam + 0.4, t), 12, '#FFF4B4', 9);
  return {
    glow: 0.8, flash: 0.28 * (1 - ramp(lt, 0, 0.12)) + 0.12 * decay(t, c.beam, 12), zblur: 0.4 * (1 - ramp(lt, 0, 0.3)),
    overlay: () => stamp('BUSTED!', 590, 1124, busted, '#FF5A6E', -0.1, 124),
  };
};

// ---------------------------------------------------------------- 4. bell: the eager one, and SEEN IT!
SC.bell = (lt, t, shot) => {
  const c = cu();
  mindBg(t, '#70284E', '#16061A', '#FFB070');
  const wind = ramp(t, c.yells - 0.05, c.windup + 0.25, E.inOutSine) * (1 - ramp(t, c.seen - 0.07, c.seen - 0.01));
  const slam = ramp(t, c.seen - 0.07, c.seen);
  const yay = ramp(t, c.it_end + 0.02, c.it_end + 0.2, E.outBack);
  const hit = decay(t, c.seen, 7) * slam, ring = inv(c.seen, c.seen + 0.9, t);
  const [qx, qy] = shake(t, 20 * decay(t, c.seen, 6), 30, 7);
  const cam = camKeys(t, [[shot.start, 560, 992, 1.2], [c.one, 560, 992, 1.34], [c.windup, 560, 984, 1.44], [c.seen - 0.04, 560, 980, 1.46], [c.seen + 0.1, 562, 974, 1.58], [shot.end, 562, 978, 1.52]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  applyCam(cam);
  const GX = 560, GY = 892, DY = 1182;
  mindSpot(GX, DY, 330, 0.13, '#FFD9A0');
  motes(t, 0.7); applyCam(cam);
  let hop = 0;
  for (const h of c.hops) hop += -52 * Math.sin(Math.PI * inv(h, h + 0.3, t));
  hop += -34 * wind + 30 * hit - 60 * yay * Math.abs(Math.sin((t - c.it_end) * 11)) * decay(t, c.it_end, 2.4);
  const rest = [150, DY - GY - 14], up = [128, -196], on = [20, DY - GY - 168];
  const hand = (sd) => {
    let p = [sd * rest[0], rest[1]];
    p = [lerp(p[0], sd * up[0], wind), lerp(p[1], up[1] + 14 * Math.sin(t * 30), wind)];
    p = [lerp(p[0], sd * on[0], slam), lerp(p[1], on[1] + 22 * hit, slam)];
    return [lerp(p[0], sd * 176, yay), lerp(p[1], -150, yay)];
  };
  const look = t < c.windup ? [0.5 * Math.sin(t * 3.1), -0.3 + 0.3 * Math.sin(t * 2.3)] : [0, 0.2];
  const guy = {
    who: 'eager', mood: slam > 0.5 && yay < 0.5 ? 'yell' : yay >= 0.5 ? 'happy' : wind > 0.5 ? 'shock' : 'happy', look, hop, armL: hand(-1), armR: hand(1),
    sx: 1 - 0.07 * wind + 0.1 * hit, sy: 1 + 0.1 * wind - 0.1 * hit, tilt: 0.04 * Math.sin(t * 6) * (1 - slam), blink: blinkAt(t, 9, 2.2),
  };
  mindGuy(ctx, GX, GY, 1, t, Object.assign({ noArms: true }, guy));
  mindDesk(ctx, DY, t, '#4A2548', slam > 0.5 ? 1 : 0);
  mindBell(ctx, gctx, GX, DY - 8, 1, t, hit, ring);
  mindGuy(ctx, GX, GY, 1, t, Object.assign({ armsOnly: true }, guy));
  const gs = toScreen(cam, GX, GY);
  screenSpace();
  softDot(gctx, gs[0], gs[1] + 250 * cam.zoom, 300, '#FFD98A', 0.3 * decay(t, c.seen, 3) * slam);
  shockLines(gs[0], gs[1] + 190 * cam.zoom, 170 * cam.zoom, inv(c.seen, c.seen + 0.45, t), 16, '#FFE9A0', 3);
  const kb = springStep(t - c.seen + 0.02, 5, 0.4);
  const kc = springStep(lt - 0.12, 4, 0.5) * (1 - ramp(t, c.yells, c.yells + 0.2, E.inCubic));
  return {
    glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) + 0.09 * decay(t, c.seen, 10) * slam, zblur: 0.07 * decay(t, c.seen, 8) * slam, zcx: gs[0], zcy: gs[1],
    overlay: () => { mindChip(214, 534, t, 'eager', kc); mindBurst('SEEN IT!', 676, 512, kb, t, 106, '#FF8A1E', -0.07); },
  };
};

// ---------------------------------------------------------------- 6. files: drawer after drawer ... nope
SC.files = (lt, t, shot) => {
  const c = cu();
  mindBg(t, '#1E5560', '#051216', '#7FE9FF');
  const empty = ramp(t, c.empty, c.empty + 0.16, E.outBack);
  const nope = ramp(t, c.nope - 0.04, c.nope + 0.08);
  const stampK = springStep(t - c.norecord, 5, 0.45);
  const shrug = ramp(t, c.here2 - 0.1, c.here2 + 0.15, E.outBack);
  const [qx, qy] = shake(t, 12 * decay(t, c.norecord, 8), 30, 9);
  const cam = camKeys(t, [[shot.start, 540, 952, 1.1], [c.checks, 540, 948, 1.26], [c.empty, 548, 946, 1.32], [c.nope + 0.1, 552, 950, 1.42], [shot.end, 552, 952, 1.45]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  applyCam(cam);
  const GX = 330, GY = 900, DY = 1182, BX = 640;
  mindDrawers(ctx, 150, 440, 800, 640, t);
  ctx.fillStyle = 'rgba(4,14,18,0.5)'; ctx.fillRect(-400, 300, 1880, 900);
  mindSpot(480, DY, 420, 0.12, '#D4F6FF');
  motes(t, 0.7); applyCam(cam);
  cafePhoto(cam, 668, 508, 190, 200, t, 0.06 + 0.012 * Math.sin(t * 2), 'TODAY');
  applyCam(cam);
  // which folder is up: index into the flips, and how far through it
  const F = c.flips;
  let cur = -1; for (let i = 0; i < F.length; i++) if (t >= F[i]) cur = i;
  const up = cur >= 0 && t < c.empty ? ramp(t, F[cur], F[cur] + 0.09, E.outBack) : 0;
  const reach = ramp(t, c.checks - 0.12, c.checks + 0.05) * (1 - empty);
  const flick = cur >= 0 && t < c.empty ? Math.sin(Math.PI * inv(F[cur], F[cur] + 0.2, t)) : 0;
  const look = empty > 0.5 ? (nope > 0.5 ? [0, 0] : [0.5, 0.2]) : reach > 0.5 ? [0.85, 0.35 - 0.5 * flick] : [0.4, -0.5];
  // her right hand flicks through the box, then holds the empty folder up by its edge; the left one shrugs
  const armR = [lerp(lerp(150, 262, reach), 56, empty), lerp(lerp(96, 128 - 70 * flick, reach), 14, empty)], armL = [-150 - 28 * shrug, 96 - 134 * shrug];
  const guy = {
    who: 'memo', mood: nope > 0.5 ? 'deadpan' : empty > 0.5 ? 'think' : 'calm', look, armL, armR,
    tilt: 0.05 * reach * (1 - empty) - 0.04 * shrug * Math.sin(t * 3), blink: blinkAt(t, 4, 2.4), hop: -10 * shrug,
  };
  mindGuy(ctx, GX, GY, 1, t, Object.assign({ noArms: true }, guy));
  mindDesk(ctx, DY, t, '#17424A', 0);
  // the open box of folders on the desk
  rrect(ctx, BX - 190, DY - 104, 380, 110, 12); ctx.fillStyle = '#0E3A42'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#06242A'; ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const x = BX - 160 + i * 38, lift = cur >= 0 && i === 8 - (cur % 9) && t < c.empty ? 0 : 1;
    rrect(ctx, x - 16, DY - 132 - 8 * (i % 2), 46, 60, 6); ctx.fillStyle = lift ? ['#F2C56E', '#E9B13A', '#FFD98A'][i % 3] : 'rgba(0,0,0,0)'; ctx.fill();
  }
  rrect(ctx, BX - 190, DY - 78, 380, 84, 12); ctx.fillStyle = '#13505A'; ctx.fill(); ctx.stroke();
  rrect(ctx, BX - 60, DY - 56, 120, 34, 6); ctx.fillStyle = '#F4EBD6'; ctx.fill();
  ctx.font = '900 22px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#13505A'; ctx.fillText('PLACES', BX, DY - 38);
  // folders that went by (each flies off to the right), then the one that is up
  for (let i = 0; i <= cur && i < F.length; i++) {
    const d = t - F[i], isCur = i === cur && t < c.empty;
    if (isCur) { mindFolder(ctx, 640, 878 - 40 * (1 - up), 1.32, -0.05 + 0.03 * Math.sin(t * 11), i % 5, clamp(up)); }
    else {
      const e = i === cur ? ramp(t, c.empty - 0.02, c.empty + 0.2) : inv(F[i + 1] - 0.02, F[i + 1] + 0.26, t);
      if (e > 0 && e < 1) mindFolder(ctx, 640 + 420 * e, 878 - 120 * Math.sin(Math.PI * e * 0.8) + 260 * e * e, 1.32 * (1 - 0.3 * e), 1.6 * e, i % 5, 1);
    }
  }
  // ... and the last one has nothing in it
  if (empty > 0.01) {
    const ex = lerp(640, 566, ramp(t, c.empty, c.empty + 0.3)), eyy = 858 - 6 * Math.sin(t * 3);
    mindFolder(ctx, ex, eyy, 1.62, 0.02 * Math.sin(t * 2.2), -1, clamp(empty));
    const mp = (t - c.empty) * 1.0;                              // a moth gets out
    if (mp > 0.1 && mp < 1.4) {
      const mx = ex + 20 + 150 * mp + 30 * Math.sin(mp * 14), my = eyy - 10 - 190 * mp + 26 * Math.cos(mp * 17), fl = Math.sin(t * 60);
      for (const sd of [-1, 1]) ellipse(ctx, mx + sd * 12, my, 14, 9 * Math.abs(fl) + 3, `rgba(222,214,196,${0.95 * (1 - inv(1.0, 1.4, mp))})`, sd * 0.5);
      ellipse(ctx, mx, my, 4, 10, `rgba(90,80,60,${1 - inv(1.0, 1.4, mp)})`);
    }
  }
  mindGuy(ctx, GX, GY, 1, t, Object.assign({ armsOnly: true }, guy));
  const kc = springStep(lt - 0.12, 4, 0.5) * (1 - ramp(t, c.empty - 0.2, c.empty, E.inCubic));
  return {
    glow: 0.8, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) + 0.1 * decay(t, c.norecord, 12),
    overlay: () => { mindChip(214, 534, t, 'memo', kc); stamp('NO RECORD', 566, 852, stampK, '#FF4D5E', -0.1, 128); },
  };
};

// ---------------------------------------------------------------- 7. clash: two slips that can't both be true
SC.clash = (lt, t, shot) => {
  const c = cu();
  const al = t >= c.alarm ? 1 : 0, strobe = al * (0.5 + 0.5 * Math.sin((t - c.alarm) * 30));
  mindBg(t, al ? '#7A2A4A' : '#3A2A7E', '#0A0620', al ? '#FF86A6' : '#C8A8FF');
  const walk = ramp(t, shot.start - 0.1, c.steps + 0.3, E.outCubic);
  const A = springStep(t - c.slip_a, 3.4, 0.6), B = springStep(t - c.slip_b, 3.4, 0.6);
  const panic = ramp(t, c.impossible - 0.02, c.impossible + 0.14) * (1 - ramp(t, c.stamp - 0.02, c.stamp + 0.05));
  const raise = ramp(t, c.impossible + 0.1, c.stamp - 0.12, E.inOutSine), down = ramp(t, c.stamp - 0.07, c.stamp, E.inCubic);
  const hit = decay(t, c.stamp, 6) * down;
  const stampK = springStep(t - c.stamp + 0.01, 5.2, 0.42);
  const [qx, qy] = shake(t, 22 * decay(t, c.stamp, 6) + 10 * strobe, 30, 11);
  const cam = camKeys(t, [[shot.start, 640, 962, 1.02], [c.in, 584, 962, 1.14], [c.slip_b, 584, 962, 1.18], [c.impossible, 584, 958, 1.22], [c.stamp, 584, 952, 1.25], [c.stamp + 0.12, 584, 946, 1.3], [shot.end, 584, 948, 1.26]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  applyCam(cam);
  const CX = 540, GX = lerp(1150, CX, walk), GY = 892, DY = 1182;
  mindSpot(CX, DY, 380, 0.12, '#E4DCFF');
  motes(t, 0.7); applyCam(cam);
  const lookSide = t < c.slip_a ? 0 : t < c.slip_b ? -1 : t < c.impossible ? 1 : (Math.sin((t - c.impossible) * 21) > 0 ? 1 : -1);
  const look = panic > 0.5 ? [0.9 * lookSide, 0.55] : down > 0.5 ? [0, 0.6] : [0.9 * lookSide, lookSide ? 0.7 : 0];
  const nod = t > c.familiar && t < c.but ? 10 * Math.sin((t - c.familiar) * 13) * decay(t, c.familiar, 2) : 0;
  const hop = -30 * Math.abs(Math.sin(walk * Math.PI * 3)) * (1 - walk) * 3 * (walk < 1 ? 1 : 0) + nod - 40 * raise * (1 - down) + 26 * hit;
  // his right hand: at his side, then up with the stamp, then down between the two slips
  const sx0 = CX - GX;
  const hr = [lerp(lerp(150, 120, raise), sx0 + 4, down), lerp(lerp(96, -210, raise), DY - GY - 150 + 30 * hit, down)];
  const hl = panic > 0.5 ? [-90, -40 + 12 * Math.sin(t * 40)] : [-150, 96 + (t > c.slip_a && t < c.slip_b ? -30 : 0)];
  const guy = {
    who: 'boss', mood: down > 0.5 ? 'stern' : panic > 0.5 ? 'oops' : t < c.slip_a ? 'calm' : t < c.slip_b ? 'happy' : 'think', look, hop, armL: hl, armR: hr,
    sweat: panic * (0.6 + 0.4 * Math.sin(t * 12)), tilt: 0.05 * Math.sin(t * 24) * panic + 0.06 * (1 - walk), blink: blinkAt(t, 6, 2.7), sx: 1 + 0.08 * hit, sy: 1 - 0.08 * hit,
    hold: (cc, hs) => { if (raise > 0.02) mindStampTool(cc, hs[1][0], hs[1][1] + 30, 1.05 * clamp(raise * 3), 0.25 * (1 - down)); },
  };
  mindGuy(ctx, GX, GY, 1, t, Object.assign({ noArms: true }, guy));
  mindDesk(ctx, DY, t, al ? '#5A2046' : '#30245E', al ? 2 : 0);
  // the two slips on the desk
  const jit = (s) => 5 * panic * Math.sin(t * 50 + s) + 12 * hit * Math.sin(t * 60 + s);
  mindSlip(ctx, lerp(-260, 370, clamp(A)) + jit(1), 1082 + jit(2), 0.76, -0.08 + 0.1 * (1 - clamp(A)), 'SEEN IT', true, t >= c.slip_a ? 1 : 0);
  mindSlip(ctx, lerp(1340, 710, clamp(B)) + jit(3), 1086 + jit(4), 0.76, 0.07 - 0.1 * (1 - clamp(B)), 'NO|RECORD', false, t >= c.slip_b ? 1 : 0);
  // sparks where they meet
  if (panic > 0.02) for (let i = 0; i < 6; i++) {
    const a = t * 30 + i * 1.05, r = 26 + 20 * Math.sin(t * 43 + i);
    line(ctx, CX, 1082, CX + Math.cos(a) * r, 1082 + Math.sin(a) * r * 0.9, 5, `rgba(255,236,150,${0.9 * panic})`);
  }
  softDot(gctx, CX, 1082, 120, '#FFE9A0', 0.6 * panic);
  mindGuy(ctx, GX, GY, 1, t, Object.assign({ armsOnly: true }, guy));
  // the alarm on the desk
  const bx = 944, by = DY - 16;
  rrect(ctx, bx - 34, by - 22, 68, 26, 6); ctx.fillStyle = '#1B1028'; ctx.fill();
  ctx.beginPath(); ctx.arc(bx, by - 22, 30, Math.PI, 0); ctx.fillStyle = al ? (strobe > 0.5 ? '#FF5A6E' : '#9C2436') : '#5A2030'; ctx.fill();
  if (al) { softDot(gctx, bx, by - 30, 300, '#FF5A6E', 0.7 * strobe); softDot(ctx, bx, by - 30, 120, '#FF5A6E', 0.5 * strobe); }
  const gs = toScreen(cam, CX, 1060);
  screenSpace();
  shockLines(gs[0], gs[1], 230 * cam.zoom, inv(c.stamp, c.stamp + 0.45, t), 16, '#FF8A96', 13);
  const kc = springStep(t - c.front + 0.1, 4, 0.5) * (1 - ramp(t, c.impossible - 0.25, c.impossible - 0.05, E.inCubic));
  return {
    glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) + 0.1 * decay(t, c.stamp, 10) * down, tint: '#FF8A96', tintA: 0.22 * strobe, zblur: 0.06 * decay(t, c.stamp, 8) * down,
    overlay: () => { mindChip(214, 534, t, 'boss', kc); stamp('IMPOSSIBLE', 520, 590, stampK, '#FF4D5E', -0.07, 136); },
  };
};
