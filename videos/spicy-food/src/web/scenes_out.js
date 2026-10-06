// Why Does Spicy Food BURN? Short: the shot outside. 8. garden (a bird eats chillies off the plant without a care; the
// plant opens its eyes and takes aim at a mouse). World: garden.js. Every beat is a cue.
'use strict';

SC.garden = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 572, 700, 1.72], [c.sci - 0.04, 578, 698, 1.78], [c.plant_w + 0.1, 440, 956, 1.1], [c.aims + 0.3, 424, 960, 1.14], [c.at + 0.12, 344, 980, 1.32], [shot.end, 336, 982, 1.36]], E.inOutCubic);
  const sneak = ramp(t, c.sci + 0.2, c.aims + 0.25, E.inOutSine);         // the mouse tiptoes in from the left
  const flee = ramp(t, c.mammals_end, c.mammals_end + 0.5, E.inCubic);
  const rear = ramp(t, c.aims + 0.3, c.aims + 0.55, E.outBack) * (1 - ramp(t, c.mammals_end - 0.05, c.mammals_end + 0.1));
  const bitten = t >= c.at - 0.2 ? 1 : 0, burn = ramp(t, c.mammals, c.mammals + 0.1);
  const [qx, qy] = shake(t, 9 * decay(t, c.mammals, 5), 30, 14);
  cam.sx = qx; cam.sy = qy;
  gdBack(cam, t);
  gdPlant(t, { eyes: ramp(t, c.plant_w - 0.12, c.plant_w + 0.12, E.outBack), look: [-0.9, 0.85], smirk: burn, lowGone: bitten });
  // the bird: bite, bite, bite. It looks down at the fuss, then carries on
  const eat = (t * 4.2) % 1, chomp = Math.pow(Math.sin(Math.PI * eat), 2), peek = burn * (1 - flee);
  gdBird(GD.perch[0], GD.perch[1], 1, t, { chomp, bob: chomp * (1 - peek), happy: peek < 0.5, look: [-0.9, 0.9], pod: true });
  for (let i = 0; i < 5; i++) {          // crumbs of chilli fall from its beak
    const p = (t * 4.2 + i * 0.37) % 1, bx = GD.perch[0] - 96 - 30 * hash(i * 3 + Math.floor(t * 4.2)), by = GD.perch[1] - 140 + 260 * p * p;
    ctx.save(); ctx.translate(bx - 30 * p, by); ctx.rotate(p * 9 + i); ctx.globalAlpha = 1 - p; ctx.fillStyle = i % 2 ? '#E3182B' : '#FFB59A'; ctx.fillRect(-6, -4, 12, 8); ctx.restore();
  }
  // the mouse
  const MS = 1.5, mx = lerp(-190, 98, sneak) - 700 * flee, my = GD.ground + 8;
  const hop = 10 * Math.abs(Math.sin(t * 9)) * (sneak < 1 ? 1 : 0) + 34 * burn * Math.abs(Math.sin((t - c.mammals) * 16)) * (1 - flee);
  gdMouse(mx, my, MS, t, { rear, burn, hop, run: flee > 0 ? 1 : 0 });
  const a = -0.42 * rear, nose = [mx + MS * (92 * Math.cos(a) + 52 * Math.sin(a)), my - hop + MS * (92 * Math.sin(a) - 52 * Math.cos(a))];
  if (burn > 0.01) fireJet(nose[0] + 4, nose[1] + 8, -0.5 + 0.08 * Math.sin(t * 14), 300, 66, t, burn * (1 - 0.6 * flee), 5);
  if (flee > 0) for (let i = 0; i < 5; i++) { const p = clamp((t - c.mammals_end - i * 0.07) / 0.5); if (p > 0 && p < 1) circle(ctx, mx + 120 + i * 70 + 40 * p, my - 20 - 40 * p, 16 + 30 * p, `rgba(220,214,235,${0.5 * (1 - p)})`); }
  // on screen: the bird feels nothing; the best guess; the crosshair
  const bs = toScreen(cam, GD.perch[0] + 96, GD.perch[1] - 262), hs = toScreen(cam, GD.head[0], GD.head[1]), ms = toScreen(cam, mx + 50, my - 96 - hop * 0.5);
  screenSpace();
  noFlame(clamp(bs[0], 300, 860), Math.max(bs[1], 520), 76, springStep(t - c.bonk + 0.25, 5, 0.45) * (1 - ramp(t, c.sci + 0.25, c.sci + 0.5)), t);
  stamp('LEADING IDEA', 318, 498, ramp(t, c.sci + 0.1, c.sci + 0.36), '#FFD447', -0.08, 52);
  const sw = ramp(t, c.aims, c.at - 0.1, E.inOutCubic);
  reticle(lerp(hs[0], ms[0], sw), lerp(hs[1], ms[1], sw), 112, ramp(t, c.aims - 0.06, c.aims + 0.1), t, ramp(t, c.at - 0.1, c.at + 0.05), 'MAMMAL', true);
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.09)) + 0.14 * decay(t, c.mammals, 11), zblur: 0.12 * (1 - ramp(lt, 0, 0.18)), zcx: 640, zcy: 800 };
};
