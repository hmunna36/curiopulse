// Frame compositor: runs the active shot, then bloom, motion blur, captions, grade.
'use strict';

const TLd = window.TL;
let VIGNETTE = null, GRAIN = null;

function shotAt(t) {
  for (const s of TLd.shots) if (t >= s.start - 1e-6 && t < s.end - 1e-6) return s;
  return TLd.shots[TLd.shots.length - 1];
}

function makeVignette() {
  const c = mkCanvas(W, H), x = c.getContext('2d');
  const hd = Math.hypot(W, H) / 2;   // radii by the half-diagonal: identical to the Shorts' vignette at 1080x1920
  const g = x.createRadialGradient(W / 2, H * 0.46, hd * 0.3835, W / 2, H * 0.5, hd * 1.2551);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,12,0.55)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  return c;
}

function composeGlow(amount) {
  // wide bloom from a quarter-res blur + tight glow from the half-res layer
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, W / 4, H / 4);
  bctx.filter = 'blur(7px)';
  bctx.drawImage(glowC, 0, 0, W / 4, H / 4);
  bctx.filter = 'none';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = amount;
  ctx.filter = 'blur(3px)';
  ctx.drawImage(glowC, 0, 0, W, H);
  ctx.filter = 'none';
  ctx.globalAlpha = amount * 0.75;
  ctx.drawImage(bloomC, 0, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// motion blur: average n shifted copies (dx, dy = total smear in px)
function dirBlur(dx, dy, n = 10) {
  if (Math.hypot(dx, dy) < 1.5) return;
  tmpx.setTransform(1, 0, 0, 1, 0, 0);
  tmpx.globalCompositeOperation = 'copy'; tmpx.drawImage(mainC, 0, 0); tmpx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1) - 0.5;
    ctx.globalAlpha = 1 / (i + 1);
    ctx.drawImage(tmpC, dx * k, dy * k);
  }
  ctx.globalAlpha = 1;
}
// zoom blur around (cx, cy): amount = relative scale spread (0.1 = 10 %)
function zoomBlur(amount, cx = W / 2, cy = H / 2, n = 10) {
  if (Math.abs(amount) < 0.004) return;
  tmpx.setTransform(1, 0, 0, 1, 0, 0);
  tmpx.globalCompositeOperation = 'copy'; tmpx.drawImage(mainC, 0, 0); tmpx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const s = 1 + amount * (i / (n - 1));
    ctx.globalAlpha = 1 / (i + 1);
    ctx.drawImage(tmpC, cx - cx * s, cy - cy * s, W * s, H * s);
  }
  ctx.globalAlpha = 1;
}

// ---------- captions ----------
// Landscape geometry (long-form, 1920x1080): word-pop captions in the lower third, centred. One line is the norm
// (up to 6 words); a second line is allowed. Lines shrink to fit CAP_MAXW. The bottom ~70 px stay clear (the player's
// progress bar shows there on a tap), and nothing important sits in the outer 90 px on any side.
const CAP_Y = 915, CAP_X = W / 2, CAP_SIZE = 74, CAP_LINE = 88, CAP_MAXW = 1480;
function drawCaptions(t, capY) {
  const cap = TLd.captions.find((c) => t >= c.start && t < c.end - 0.002);
  if (!cap) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textBaseline = 'middle';
  const lines = cap.lines;
  const y0 = (capY || CAP_Y) - ((lines.length - 1) * CAP_LINE) / 2;
  const end = cap.end;
  lines.forEach((ln, li) => {
    // measure at full size; shrink the line if it is too wide
    let size = CAP_SIZE * (ln.length === 1 && lines.length > 1 && ln[0].t.length <= 8 && ln[0].c !== '#FFFFFF' ? 1.18 : 1);
    ctx.font = `900 ${size}px Montserrat`;
    const gap = size * 0.28;
    let widths = ln.map((w) => ctx.measureText(w.t).width);
    let total = widths.reduce((a, b) => a + b, 0) + gap * (ln.length - 1);
    if (total > CAP_MAXW) {
      size *= CAP_MAXW / total; ctx.font = `900 ${size}px Montserrat`;
      widths = ln.map((w) => ctx.measureText(w.t).width);
      total = widths.reduce((a, b) => a + b, 0) + size * 0.28 * (ln.length - 1);
    }
    let x = CAP_X - total / 2;
    const y = y0 + li * CAP_LINE;
    ln.forEach((w, wi) => {
      const age = t - w.at;
      const wx = x + widths[wi] / 2;
      x += widths[wi] + size * 0.28;
      if (age < 0) return;
      const pop = E.outBack(clamp(age / 0.16), 2.2);
      const sc = lerp(0.55, 1, pop) * (1 - 0.06 * ramp(t, end - 0.07, end, E.inCubic));
      const rot = (1 - clamp(age / 0.16)) * (wi % 2 ? 0.06 : -0.06);
      ctx.save();
      ctx.translate(wx, y); ctx.rotate(rot); ctx.scale(sc, sc);
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(0,0,10,0.55)';
      ctx.fillText(w.t, 0, size * 0.07);
      ctx.lineWidth = size * 0.2;
      ctx.strokeStyle = '#0B0B1A';
      ctx.strokeText(w.t, 0, 0);
      ctx.fillStyle = w.c;
      ctx.fillText(w.t, 0, 0);
      ctx.restore();
    });
  });
}

// colour grade: desaturate toward grey, then multiply a tint
function grade(desat, tint, tintA) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (desat > 0) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = `rgba(128,128,128,${clamp(desat)})`; ctx.fillRect(0, 0, W, H);
  }
  if (tint && tintA > 0) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = rgba(tint, tintA); ctx.fillRect(0, 0, W, H);
  }
  ctx.globalCompositeOperation = 'source-over';
}
// VHS / glitch: sliced horizontal offsets, chroma ghosts, tracking noise
function vhs(amount, t, seed = 1) {
  if (amount <= 0.01) return;
  const fr = Math.floor(t * FPS);
  const rng = mulberry32(seed * 1000 + fr);
  tmpx.setTransform(1, 0, 0, 1, 0, 0);
  tmpx.globalCompositeOperation = 'copy'; tmpx.drawImage(mainC, 0, 0); tmpx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  let y = 0;
  while (y < H) {
    const h = 8 + rng() * 90;
    const dx = (rng() < 0.35 ? (rng() - 0.5) * 90 : (rng() - 0.5) * 12) * amount;
    ctx.drawImage(tmpC, 0, y, W, h, dx, y, W, h);
    y += h;
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.28 * amount;
  ctx.filter = 'hue-rotate(-60deg) saturate(3)';
  ctx.drawImage(tmpC, 10 * amount, 0);
  ctx.filter = 'hue-rotate(120deg) saturate(3)';
  ctx.drawImage(tmpC, -10 * amount, 0);
  ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 5; i++) {
    const ly = rng() * H, lh = 2 + rng() * 6;
    ctx.fillStyle = `rgba(230,235,255,${(0.15 + rng() * 0.35) * amount})`;
    ctx.fillRect(0, ly, W, lh);
  }
}

function renderFrame(f) {
  const t = f / FPS;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#05060F'; ctx.fillRect(0, 0, W, H);
  gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.clearRect(0, 0, W / 2, H / 2);
  gctx.globalAlpha = 1; gctx.globalCompositeOperation = 'source-over';
  const shot = shotAt(t);
  const post = SC[shot.id](t - shot.start, t, shot) || {};
  composeGlow(post.glow === undefined ? 0.85 : post.glow);
  // digital camera push (graphic shots): post.push = {k, cx, cy}, k = scale factor
  if (post.push && Math.abs(post.push.k - 1) > 1e-4) {
    const { k, cx = W / 2, cy = H / 2 } = post.push;
    tmpx.setTransform(1, 0, 0, 1, 0, 0);
    tmpx.globalCompositeOperation = 'copy'; tmpx.drawImage(mainC, 0, 0); tmpx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(tmpC, cx - cx * k, cy - cy * k, W * k, H * k);
  }
  if (post.blur) dirBlur(post.blur[0], post.blur[1]);
  if (post.zblur) zoomBlur(post.zblur, post.zcx, post.zcy);
  if (post.desat || post.tint) grade(post.desat || 0, post.tint, post.tintA || 0);
  if (post.vhs) vhs(post.vhs, t, 1);
  if (post.glitch) vhs(post.glitch, t, 7);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(VIGNETTE, 0, 0);
  if (post.overlay) post.overlay();
  // film grain (the encoder has no noise filter here): one of four noise plates, jittered per frame
  if (post.grain !== 0) {
    const g = GRAIN[f % GRAIN.length];
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07;
    ctx.drawImage(g, -((f * 37) % 64), -((f * 53) % 64), W + 64, H + 64);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  if (post.flash > 0) {
    ctx.fillStyle = `rgba(235,242,255,${clamp(post.flash)})`;
    ctx.fillRect(0, 0, W, H);
  }
  // the film's clock (reference/long-form.md, "The clock"): a video's scenes may define drawHud(t, post); it is
  // drawn over the picture and under the captions, top left. post.noHud hides it for one shot.
  if (!post.noHud && typeof drawHud === 'function') { ctx.setTransform(1, 0, 0, 1, 0, 0); drawHud(t, post); }
  const subOn = !post.noSubscribe && typeof subActive === 'function' && subActive(t);
  if (!post.noCaptions) drawCaptions(t, subOn ? Math.min(post.capY || CAP_Y, SUB_CAPY) : post.capY);
  if (subOn) drawSubscribe(t);   // the subscribe cue (subscribe.js) sits above captions, inside the safe area
  if (post.flashTop > 0) { // flash that also washes over the captions
    ctx.fillStyle = `rgba(240,246,255,${clamp(post.flashTop)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

async function init() {
  await Promise.all([
    document.fonts.load('900 74px Montserrat'), document.fonts.load('800 40px Montserrat'),
    document.fonts.load('700 30px Montserrat'), document.fonts.load('900 58px Montserrat'), document.fonts.load('400 200px Anton'),
  ]);
  initEnv();
  initScenes();
  initScenes2();
  VIGNETTE = makeVignette();
  GRAIN = [0, 1, 2, 3].map((k) => {
    const c = mkCanvas(W / 2 + 32, H / 2 + 32), x = c.getContext('2d'), id = x.createImageData(c.width, c.height), r = mulberry32(90 + k);
    for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 90; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0);
    return c;
  });
  window.renderFrame = renderFrame;
  window.READY = true;
}
init();
