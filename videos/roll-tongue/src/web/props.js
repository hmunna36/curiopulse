// Can You ROLL Your Tongue? Short: props, all in screen space.
//   framedPhoto(x, y, w, h, k, rot, drawInside)   a wooden frame with glass glare; drawInside(w, h) draws the picture
//                                                  about its middle (clipped)
//   parentsPhoto(x, y, s, t, o)                    Mum and Dad, both rolling perfect tubes. o: {k (pop), look, rot}
//   famPhoto(x, y, s, t, o)                        Mum, the kid and Dad squeezed together. o: {k, hug}
//   schoolBook(t, o)                               an open school book: TONGUE ROLLING, a family tree MOM + DAD -> YOU,
//                                                  ONE GENE. o: {drop, tree, arrows, stamp, push}
//   sciPhoto(t, o)                                 an old photo of the 1940 scientist at his blackboard. o: {k, red, hide}
//   mailWindow(t, o)                               an email being written to a scientist. o: {k, subj, body, send, fly}
'use strict';

const PH_MUM = { skin: '#F2C29C', hair: 'bun', hairCol: '#6A3A22' };
const PH_DAD = { skin: '#E8B48C', hair: 'cap', hairCol: '#2A1B14', moustache: '#3A2418' };
const PH_KID = { skin: '#F6CDA8', hair: 'cap', hairCol: '#C8743A' };

function framedPhoto(x, y, w, h, k, rot, drawInside, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.7);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  const fw = o.frame || 22;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrect(ctx, -w / 2 - fw + 10, -h / 2 - fw + 14, w + 2 * fw, h + 2 * fw, 10); ctx.fill();
  rrect(ctx, -w / 2 - fw, -h / 2 - fw, w + 2 * fw, h + 2 * fw, 10);
  const fg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); fg.addColorStop(0, o.frameA || '#C98A4A'); fg.addColorStop(1, o.frameB || '#8A5426'); ctx.fillStyle = fg; ctx.fill();
  paint(() => {
    rrect(ctx, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 4); ctx.fillStyle = '#4A2A12'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
    drawInside(w, h);
    // glass glare
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(-w / 2 + w * 0.42, -h / 2); ctx.lineTo(-w / 2, -h / 2 + h * 0.62); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}
// a bust: shoulders in a colour, then the little face (any units: the face is about 2 * s wide)
function bust(c, x, y, s, coat, face) {
  actor(() => { c.beginPath(); c.ellipse(x, y + s * 1.55, s * 1.25, s * 0.85, 0, Math.PI, 0); c.lineTo(x + s * 1.25, y + s * 2.4); c.lineTo(x - s * 1.25, y + s * 2.4); c.closePath(); c.fillStyle = coat; c.fill(); });
  miniFace(c, x, y, s, face);
}
function parentsPhoto(x, y, s, t, o = {}) {
  framedPhoto(x, y, 300 * s, 330 * s, o.k === undefined ? 1 : o.k, o.rot || -0.06, (w, h) => {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#7EC8E8'); g.addColorStop(1, '#F6E2B0'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    circle(ctx, w * 0.3, -h * 0.32, 26 * s, '#FFF4C8');
    ctx.fillStyle = '#6CC07A'; ctx.beginPath(); ctx.moveTo(-w / 2, h * 0.2); ctx.quadraticCurveTo(0, h * 0.05, w / 2, h * 0.22); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill();
    const look = o.look || [0, 0];
    bust(ctx, -w * 0.22, -h * 0.06, 52 * s, '#5FB8A4', { ...PH_MUM, k: 1, eyes: o.eyes || 'smug', look });
    bust(ctx, w * 0.22, -h * 0.1, 56 * s, '#D2683E', { ...PH_DAD, k: 1, eyes: o.eyes || 'smug', look });
  });
}
function famPhoto(x, y, s, t, o = {}) {
  framedPhoto(x, y, 470 * s, 360 * s, o.k === undefined ? 1 : o.k, o.rot || 0.03, (w, h) => {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#FFB86B'); g.addColorStop(1, '#FF7E8A'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + t * 0.3; ctx.fillStyle = 'rgba(255,240,200,0.12)'; ctx.beginPath(); ctx.moveTo(0, -h * 0.1); ctx.lineTo(Math.cos(a - 0.12) * w, -h * 0.1 + Math.sin(a - 0.12) * w); ctx.lineTo(Math.cos(a + 0.12) * w, -h * 0.1 + Math.sin(a + 0.12) * w); ctx.closePath(); ctx.fill(); }
    const hug = clamp(o.hug === undefined ? 1 : o.hug);
    bust(ctx, -w * lerp(0.3, 0.24, hug), -h * 0.1, 56 * s, '#5FB8A4', { ...PH_MUM, k: 1, eyes: 'shut' });
    bust(ctx, w * lerp(0.3, 0.24, hug), -h * 0.12, 60 * s, '#D2683E', { ...PH_DAD, k: 1, eyes: 'shut' });
    bust(ctx, 0, h * 0.06, 50 * s, '#FF6B6B', { ...PH_KID, k: 0, eyes: 'open', look: [0, -0.3] });
    // their arms round the kid
    if (hug > 0.02) for (const sd of [-1, 1]) actor(() => { line(ctx, sd * w * 0.2, h * 0.22, sd * w * 0.06, h * 0.3, 22 * s, sd < 0 ? '#5FB8A4' : '#D2683E'); });
  });
}

// ---------------------------------------------------------------- the school book
function schoolBook(t, o = {}) {
  const drop = clamp(o.drop === undefined ? 1 : o.drop), push = o.push || 1;
  if (drop <= 0.01) return;
  screenSpace();
  const y0 = lerp(-700, 0, E.outBack(drop, 1.1));
  ctx.save(); ctx.translate(540, 900 + y0); ctx.rotate(-0.035); ctx.scale(0.9 * push, 0.9 * push);
  const BW = 920, BH = 660;
  // the cover behind the pages, the pages, the spine's shade
  actor(() => { rrect(ctx, -BW / 2 - 24, -BH / 2 - 18, BW + 48, BH + 44, 18); ctx.fillStyle = '#2E5FA8'; ctx.fill(); });
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -BH / 2 + 6); ctx.quadraticCurveTo(sd * BW * 0.25, -BH / 2 - 14, sd * BW / 2, -BH / 2); ctx.lineTo(sd * BW / 2, BH / 2); ctx.quadraticCurveTo(sd * BW * 0.25, BH / 2 - 14, 0, BH / 2 + 6); ctx.closePath(); ctx.fillStyle = '#FBF5E6'; ctx.fill(); }
  paint(() => {
    const sg = ctx.createLinearGradient(-60, 0, 60, 0); sg.addColorStop(0, 'rgba(120,90,50,0)'); sg.addColorStop(0.5, 'rgba(120,90,50,0.35)'); sg.addColorStop(1, 'rgba(120,90,50,0)'); ctx.fillStyle = sg; ctx.fillRect(-60, -BH / 2, 120, BH);
    // text lines (unreadable, like a page seen at a glance)
    for (const sd of [-1, 1]) for (let i = 0; i < 9; i++) { const yy = 120 + i * 30; if (sd < 0 && i < 1) continue; line(ctx, sd * 60, yy - BH / 2 + 260 - (sd > 0 ? 200 : 0), sd * (60 + 300 - 40 * ((i * 7) % 3)), yy - BH / 2 + 260 - (sd > 0 ? 200 : 0), 7, 'rgba(90,80,70,0.18)'); }
    // left page: the chapter
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 30px Montserrat'; ctx.fillStyle = '#2E5FA8'; ctx.fillText('CHAPTER 4', -BW / 4, -BH / 2 + 62);
    ctx.font = '400 66px Anton, Montserrat'; ctx.fillStyle = '#2A2440'; ctx.fillText('TONGUE', -BW / 4, -BH / 2 + 128); ctx.fillText('ROLLING', -BW / 4, -BH / 2 + 196);
    miniFace(ctx, -BW / 4, 40, 70, { skin: '#F4C9A4', hair: 'cap', hairCol: '#2A1B14', k: 1, eyes: 'open' });
  });
  // right page: the family tree
  const tr = clamp(o.tree === undefined ? 1 : o.tree), ar = clamp(o.arrows || 0);
  if (tr > 0.01) {
    const M = [BW * 0.14, -BH * 0.22], D = [BW * 0.36, -BH * 0.22], Y = [BW * 0.25, BH * 0.16];
    paint(() => {
      ctx.lineWidth = 6; ctx.strokeStyle = rgba('#2A2440', tr); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(M[0], M[1] + 66); ctx.lineTo(M[0], M[1] + 110); ctx.lineTo(D[0], D[1] + 110); ctx.lineTo(D[0], D[1] + 66); ctx.moveTo(Y[0], M[1] + 110); ctx.lineTo(Y[0], Y[1] - 70); ctx.stroke();
      ctx.font = '900 26px Montserrat'; ctx.fillStyle = rgba('#2A2440', tr); ctx.textAlign = 'center';
      ctx.fillText('MOM', M[0], M[1] - 74); ctx.fillText('DAD', D[0], D[1] - 74); ctx.fillText('YOU', Y[0], Y[1] + 92);
    });
    const sc = E.outBack(tr, 1.8);
    miniFace(ctx, M[0], M[1], 48 * sc, { ...PH_MUM, k: 1 });
    miniFace(ctx, D[0], D[1], 48 * sc, { ...PH_DAD, k: 1 });
    miniFace(ctx, Y[0], Y[1], 52 * sc, { ...PH_KID, k: 1 });
    // the gene running down to YOU: a glowing bead
    if (ar > 0.01) {
      const path = [[M[0], M[1] + 66], [M[0], M[1] + 110], [Y[0], M[1] + 110], [Y[0], Y[1] - 70]];
      const path2 = [[D[0], D[1] + 66], [D[0], D[1] + 110], [Y[0], M[1] + 110], [Y[0], Y[1] - 70]];
      for (const P of [path, path2]) {
        const pl = polyLen(P), p = polyAt(P, pl, ar * pl[pl.length - 1]);
        for (const [cc, r, col] of [[ctx, 13, '#FFD447']]) circle(cc, p[0], p[1], r, col);
        const m = ctx.getTransform(); softDot(gctx, (m.a * p[0] + m.c * p[1] + m.e), (m.b * p[0] + m.d * p[1] + m.f), 60, '#FFD447', 0.7);
      }
    }
  }
  ctx.restore();
  // ONE GENE, stamped on the right page
  const st = clamp(o.stamp || 0);
  if (st > 0.01) stamp('ONE GENE', 350, 1100 + y0, st, '#E8344A', -0.12, 58);
}

// ---------------------------------------------------------------- the 1940 scientist, in an old photo
const SCIPAL = Object.assign({}, PAL, { coat: '#F1F4FA', coatSh: '#BFC8DA', coatHi: '#FFFFFF', coatDk: '#8E99B3', hair: '#C9CDD8', hairHi: '#F2F4F8', strap: '#F1F4FA', strapSh: '#BFC8DA', pj: true });
function sciPhoto(t, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k), red = clamp(o.red || 0), hide = clamp(o.hide || 0);
  framedPhoto(540, 820, 780, 860, k, -0.02, (w, h) => {
    // the blackboard
    ctx.fillStyle = '#2E3A30'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#5A4632'; ctx.fillRect(-w / 2, h * 0.18, w, 18);
    ctx.font = '400 92px Anton, Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(240,240,230,0.85)';
    ctx.fillText('1 GENE', -w * 0.17, -h * 0.34);
    ctx.font = '900 48px Montserrat'; ctx.fillText('= ROLLER', w * 0.23, -h * 0.34);
    // him: the rig in a white coat, grey hair, glasses, a moustache; drawn inside the photo (unlit, like a print)
    const S = 2.45;
    const st = { x: 0, y: 70 + 470 * S, s: S, pose: JSON.parse(JSON.stringify(POSES.stand)), face: o.face || FACES.calm, noLegs: true, headDY: 4 * hide, headRot: -0.04 * hide };
    st.pose.hand = 'open';
    st.pose = ikReach(st.pose, 'L', [-118, lerp(-230, -470, hide)], -1);
    st.pose = ikReach(st.pose, 'R', [118, lerp(-230, -470, hide)], -1);
    const r = drawCharacterRig(ctx, st, t, SCIPAL);
    const HX = st.x + r.head[0] * S, HY = st.y + (r.head[1] + st.headDY) * S;   // his head's middle, in the photo
    ctx.save(); ctx.translate(HX, HY); ctx.scale(S, S); ctx.rotate(st.headRot);
    if (red > 0.01) { ellipse(ctx, 0, 6, 64, 52, rgba('#FF2A3A', 0.42 * red)); for (const sd of [-1, 1]) ellipse(ctx, sd * 36, 22, 18, 11, rgba('#FF2A3A', 0.6 * red)); }
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 26); ctx.quadraticCurveTo(sd * 16, 20, sd * 34, 33); ctx.quadraticCurveTo(sd * 18, 40, 0, 33); ctx.closePath(); ctx.fillStyle = '#E2E5EC'; ctx.fill(); }
    ctx.lineWidth = 4.5; ctx.strokeStyle = '#3A3A44'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 24, -2, 19, 0, 7); ctx.stroke(); } line(ctx, -5, -3, 5, -3, 4, '#3A3A44');
    ctx.restore();
    // the book he hides behind (it comes up from his chest to his nose), his hands on its sides
    if (hide > 0.01) {
      const by = lerp(HY + 330, HY + 30, E.outBack(hide, 1.3)), bw = 330, bh = 250;
      rrect(ctx, -bw / 2, by - bh / 2, bw, bh, 14); ctx.fillStyle = '#2E5FA8'; ctx.fill();
      rrect(ctx, -bw / 2 + 14, by - bh / 2 + 14, bw - 28, bh - 28, 8); ctx.fillStyle = '#3A6EBC'; ctx.fill();
      ctx.font = '900 44px Montserrat'; ctx.fillStyle = '#FBF5E6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GENETICS', 0, by - 10);
      line(ctx, -100, by + 40, 100, by + 40, 6, 'rgba(251,245,230,0.6)');
      for (const sd of [-1, 1]) circle(ctx, sd * (bw / 2 + 6), by + 20, 38, '#F2C29C');
    }
    // sepia: the whole print, warm and faded
    ctx.globalCompositeOperation = 'color'; ctx.fillStyle = 'rgba(150,110,60,0.55)'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.globalCompositeOperation = 'source-over';
    if (red > 0.01) {   // the red of his face cuts through the old print: his forehead and ears above the book
      ctx.save(); ctx.translate(HX, HY); ctx.scale(S, S);
      ellipse(ctx, 0, lerp(4, -40, hide), 60, lerp(46, 24, hide), rgba('#FF3A4A', 0.5 * red));
      for (const sd of [-1, 1]) ellipse(ctx, sd * 70, 4, 10, 16, rgba('#FF3A4A', 0.7 * red));
      // steam from his ears
      for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const u = ((t * 1.6 + i / 3) % 1); circle(ctx, sd * (80 + 26 * u), -10 - 50 * u, 8 + 9 * u, `rgba(255,255,255,${0.7 * (1 - u) * red})`); }
      ctx.restore();
    }
    // grain and scratches
    const rng = mulberry32(Math.floor(t * 12) + 5);
    for (let i = 0; i < 4; i++) { const xx = (rng() - 0.5) * w; line(ctx, xx, -h / 2, xx + (rng() - 0.5) * 30, h / 2, 1.5, 'rgba(255,240,210,0.18)'); }
    for (let i = 0; i < 30; i++) circle(ctx, (rng() - 0.5) * w, (rng() - 0.5) * h, 1.5 + 2 * rng(), 'rgba(40,24,10,0.25)');
  }, { frameA: '#E6D2A8', frameB: '#A8865A', frame: 26 });
}

// ---------------------------------------------------------------- the email
// o: {k (pop), subj 0..1 (typed), body 0..1, send 0..1 (the button pressed), fly 0..1 (it leaves), bigWord 0..1 (ADOPTED stamps)}
function mailWindow(t, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const s = E.outBack(k, 1.5), fly = clamp(o.fly || 0);
  screenSpace();
  ctx.save(); ctx.translate(540, 742 - 1400 * E.inCubic(fly)); ctx.rotate(-0.25 * fly); ctx.scale(s * (1 - 0.6 * fly), s * (1 - 0.6 * fly));
  const w = 860, h = 600;
  actor(() => { rrect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = '#F7F8FC'; ctx.fill(); });
  paint(() => {
    rrect(ctx, -w / 2, -h / 2, w, 86, 26); ctx.fillStyle = '#3B6FD8'; ctx.fill(); ctx.fillRect(-w / 2, -h / 2 + 50, w, 36);
    ctx.font = '900 34px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('New message', -w / 2 + 36, -h / 2 + 44);
    for (const [i, c] of [[0, '#FF6B6B'], [1, '#FFD447'], [2, '#4DFFB4']]) circle(ctx, w / 2 - 110 + i * 34, -h / 2 + 44, 10, c);
    ctx.font = '700 34px Montserrat'; ctx.fillStyle = '#6A6F86';
    ctx.fillText('To:', -w / 2 + 36, -h / 2 + 140); ctx.fillText('Subject:', -w / 2 + 36, -h / 2 + 220);
    ctx.fillStyle = '#2A2440'; ctx.font = '800 34px Montserrat'; ctx.fillText('A Scientist', -w / 2 + 110, -h / 2 + 140);
    line(ctx, -w / 2 + 30, -h / 2 + 178, w / 2 - 30, -h / 2 + 178, 2, '#DADDE8'); line(ctx, -w / 2 + 30, -h / 2 + 258, w / 2 - 30, -h / 2 + 258, 2, '#DADDE8');
    // the subject, typed
    const subj = 'AM I ADOPTED??', ns = Math.round(subj.length * clamp(o.subj || 0));
    ctx.font = '900 46px Montserrat'; ctx.fillStyle = '#E8344A'; ctx.fillText(subj.slice(0, ns), -w / 2 + 196, -h / 2 + 220);
    // the body, typed
    const lines = ["I can't roll my tongue.", 'Mum and Dad CAN.', 'Please write back.'], nb = clamp(o.body || 0);
    let left = Math.round(lines.join('').length * nb);
    ctx.font = '700 38px Montserrat'; ctx.fillStyle = '#2A2440';
    lines.forEach((L, i) => { const n = Math.max(0, Math.min(L.length, left)); left -= L.length; ctx.fillText(L.slice(0, n), -w / 2 + 36, -h / 2 + 318 + i * 56); });
    // a caret that blinks after the last letter typed
    if (nb < 1 && (o.subj || 0) > 0 && Math.floor(t * 3) % 2 === 0) { const caretY = nb > 0 ? -h / 2 + 330 : -h / 2 + 220; line(ctx, -w / 2 + 40 + (nb > 0 ? 400 * nb : 400 * (o.subj || 0)), caretY - 24, -w / 2 + 40 + (nb > 0 ? 400 * nb : 400 * (o.subj || 0)), caretY + 24, 4, '#3B6FD8'); }
    // SEND
    const sd = clamp(o.send || 0), bs = 1 - 0.12 * Math.sin(Math.PI * sd);
    ctx.save(); ctx.translate(w / 2 - 160, h / 2 - 88); ctx.scale(bs, bs);
    rrect(ctx, -104, -40, 208, 80, 40); ctx.fillStyle = sd > 0.5 ? '#12B25C' : '#3B6FD8'; ctx.fill();
    ctx.font = '900 38px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(sd > 0.5 ? 'SENT ✓' : 'SEND', 0, 2);
    ctx.restore();
  });
  ctx.restore();
}
