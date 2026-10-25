// THE LIGHT STAGE (the cinematic look, 8 Oct 2026; reference/visual.md "The light"). It runs on the graphics chip
// (WebGL2) inside the same page. It takes the picture a scene has drawn plus the shape map (shapemap.js) and lights it:
//   - every shape gets a drawn, two-tone shadow on the side away from the key light (soft-crisp edge, not a 3D gradient);
//   - a shape drawn later drops a short shadow on the shapes drawn before it (hair on a forehead, an arm on a jacket);
//   - a character's outline catches a thin rim of light on the side of the back light;
//   - whatever is in the glow layer spills its colour on what is near it;
//   - the set behind the hero gets a pool of light around him and a faint glow behind his head.
// Then the lens: bloom and halation (only from the glow layer, so eyes and shirts never bloom), a film grade, a little
// colour fringing, optional sun rays. The idea of lighting flat shapes through normals taken from their own outlines is
// Johnston's "Lumo: Illumination for Cel Animation" (2002). Nothing here knows about a particular scene.
// If WebGL2 is missing, LS is null and the look falls back to the classic picture (look.js); if the context is lost
// mid-render it throws, and render.js starts the render again in the classic look.
'use strict';
const LS = (() => {
  if (!(window.TL && window.TL.look === 'cine')) return null;
  try {
  const cv = mkCanvas(W, H);
  const gl = cv.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  if (!gl) { window.LOOK_ERROR = 'no WebGL2 in this browser'; return null; }
  gl.getExtension('EXT_color_buffer_float'); gl.getExtension('OES_texture_float_linear');
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

  const VS = `#version 300 es
in vec2 aP; out vec2 vUv; void main() { vUv = aP * 0.5 + 0.5; gl_Position = vec4(aP, 0.0, 1.0); }`;
  const HEAD = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
in vec2 vUv;
const float W = ${W}.0, H = ${H}.0;
vec2 pcOf(vec2 uv) { return vec2(uv.x * W, (1.0 - uv.y) * H); }
vec2 uvOf(vec2 pc) { return vec2(pc.x / W, 1.0 - pc.y / H); }
vec3 toLin(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y); }
`;
  const IDLIB = `
uniform sampler2D uId, uFlags;
int idAt(vec2 pc) {          // the number of the shape at a canvas pixel: 0 = backdrop, -1 = an edge pixel with no clean number
  ivec2 q = ivec2(int(floor(pc.x)), int(H) - 1 - int(floor(pc.y)));
  if (q.x < 0 || q.y < 0 || q.x >= int(W) || q.y >= int(H)) return 0;
  vec4 c = texelFetch(uId, q, 0);
  if (c.a < 0.004) return 0;
  ivec3 b = ivec3(c.rgb * 255.0 + 0.5);
  if (c.a < 0.996 || (((b.r * 167 + 13) ^ (b.g * 59 + 77)) & 255) != b.b) return -1;
  return b.r + b.g * 256;
}
int idNear(vec2 pc) {        // the same, and an edge pixel takes the front-most clean neighbour
  int id = idAt(pc);
  if (id >= 0) return id;
  id = max(max(idAt(pc + vec2(1.5, 0.0)), idAt(pc - vec2(1.5, 0.0))), max(idAt(pc + vec2(0.0, 1.5)), idAt(pc - vec2(0.0, 1.5))));
  return max(id, 0);
}
vec2 flagsOf(int id) { vec4 f = texelFetch(uFlags, ivec2(id & 255, id >> 8), 0); return vec2(f.r * 255.0, floor(f.g * 255.0 + 0.5)); }
bool flatBit(float b) { return mod(floor(b / 2.0), 2.0) > 0.5; }
bool actorBit(float b) { return mod(b, 2.0) > 0.5; }
`;
  // ---- pass 1: for every pixel, how near is the edge of its own shape and what lies beyond it
  const FS_EDGE = HEAD + IDLIB + `
layout(location = 0) out vec4 o0;       // xy: which way the surface leans, z: rim light, w: tucked-under darkness
layout(location = 1) out vec4 o1;       // x: shadow dropped on it by something in front, y: 1 on clean pixels, 0.5 on edge pixels
uniform vec4 uDirs;                     // xy: where the rim light comes from, zw: where the key light comes from (canvas, unit)
const int ND = 16, NS = 9;
void main() {
  vec2 pc = pcOf(vUv);
  int raw = idAt(pc), id = raw >= 0 ? raw : idNear(pc);
  o0 = vec4(0.0); o1 = vec4(0.0, raw >= 0 ? 1.0 : 0.5, 0.0, 1.0);
  if (id <= 0) return;
  vec2 fl = flagsOf(id);
  float R = fl.x; bool actor = actorBit(fl.y);
  if (flatBit(fl.y)) return;
  float Rm = max(R, 3.0), Rr = clamp(R * 0.18, 3.0, 11.0), Ra = clamp(R * 0.4, 6.0, 20.0);
  vec2 e = vec2(0.0); float rim = 0.0, ao = 0.0;
  for (int k = 0; k < ND; k++) {
    float a = (float(k) + 0.5) * 6.2831853 / float(ND);
    vec2 d = vec2(cos(a), sin(a));
    float lo = 0.0, reach = max(Rm, Ra);
    for (int s = 1; s <= NS; s++) {
      float dist = float(s) / float(NS) * reach;
      int q = idAt(pc + d * dist);
      if (q == id) { lo = dist; continue; }
      if (q < 0) continue;
      float hi = dist; int other = q;
      for (int b = 0; b < 3; b++) { float m = 0.5 * (lo + hi); int qm = idAt(pc + d * m); if (qm == id) lo = m; else { hi = m; if (qm >= 0) other = qm; } }
      float bd = 0.5 * (lo + hi);
      if (other < id) {
        float w = max(1.0 - bd / Rm, 0.0); e += d * w * w * step(1.5, R);
        // the rim belongs to the outline: an actor's edge counts only where something that is not that actor lies beyond it
        bool outline = other == 0 || !(actor && actorBit(flagsOf(other).y));
        if (outline) {
          float face = pow(max(dot(d, uDirs.xy), 0.0), 1.5) * pow(max(1.0 - bd / Rr, 0.0), 1.3);
          if (face > 0.002 && actor) {            // open air beyond the edge, or just a gap between his own parts?
            int q1 = idAt(pc + d * (bd + 22.0)), q2 = idAt(pc + d * (bd + 50.0));
            float g1 = (q1 > 0 && actorBit(flagsOf(q1).y)) ? 0.0 : 1.0, g2 = (q2 > 0 && actorBit(flagsOf(q2).y)) ? 0.0 : 1.0;
            face *= 0.5 * (g1 + g2);
          }
          rim += face;
        }
      } else {
        vec2 of = flagsOf(other);
        float w = max(1.0 - bd / Ra, 0.0); ao += w * w * smoothstep(0.0, 7.0, of.x) * (flatBit(of.y) ? 0.0 : 1.0);
      }
      break;
    }
  }
  float nrm = 3.14159265 / float(ND);
  // the shadow something in front drops on this pixel: look toward the key light for a shape drawn later
  float cs = 0.0, len = clamp(R * 0.55, 7.0, 34.0);
  vec2 ld = uDirs.zw;
  for (int j = 0; j < 3; j++) {
    vec2 dj = normalize(ld + vec2(-ld.y, ld.x) * (float(j) - 1.0) * 0.16);
    float c1 = 0.0, prev = 0.0;
    for (int i = 1; i <= 8; i++) {
      float dd = (float(i) - 0.5) / 8.0 * len; int q = idAt(pc + dj * dd);
      if (q > id) {
        vec2 qf = flagsOf(q);
        if (!flatBit(qf.y)) {
          float lo = prev, hi = dd;
          for (int b = 0; b < 3; b++) { float m = 0.5 * (lo + hi); if (idAt(pc + dj * m) > id) hi = m; else lo = m; }
          c1 = (1.0 - 0.5 * (lo + hi) / len) * smoothstep(0.0, 7.0, qf.x);
          break;
        }
      }
      prev = dd;
    }
    cs += c1 / 3.0;
  }
  o0 = vec4(e * nrm, min(rim * nrm * 2.4, 1.0), ao * nrm);
  o1.x = cs;
}`;
  // ---- pass 2 (full size): the lit picture
  const FS_LIGHT = HEAD + IDLIB + `
out vec4 o;
uniform sampler2D uAlbedo, uEdge, uCast, uGlow;
uniform vec3 uKey, uKeyTint, uShadowTint, uRimColor, uPoolTint, uBeamColor;
uniform vec4 uPool;        // x, y, radius in canvas px, depth of the falloff
uniform vec4 uAmt;         // form shadow, dropped shadow, rim, tucked-under
uniform vec4 uMisc;        // edge steepness, glow spill, beams, time
uniform vec4 uToon;        // where the shadow edge sits, its softness, softness of dropped shadows, strength on things that are not characters
uniform vec4 uHalo;        // x, y, radius of the glow behind the hero, strength
uniform float uPlate;      // 1: this is the set behind the hero (or a shot without him): pool of light + haze
uniform float uProps;      // rim strength on things that are not characters
uniform float uShadowDeep; // how much deeper (more saturated) a colour gets in shadow
uniform vec3 uHaloColor;
void main() {
  vec2 pc = pcOf(vUv);
  vec3 a = toLin(texture(uAlbedo, vUv).rgb), col = a;
  vec3 gl0 = texture(uGlow, vUv).rgb;
  float em = clamp(luma(gl0) * 2.2, 0.0, 1.0);
  int id = idNear(pc);
  vec3 N = vec3(0.0, 0.0, 1.0);
  if (id > 0) {
    vec2 fl = flagsOf(id);
    if (!flatBit(fl.y)) {
      vec4 E = texture(uEdge, vUv); vec4 C = texture(uCast, vUv);
      vec2 es = vec2(0.0); float ws = 0.0, cs2 = 0.0;
      for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
        vec2 q = pc + vec2(float(xx), float(yy)) * 2.5;
        if (idNear(q) != id) continue;
        es += texture(uEdge, uvOf(q)).xy; cs2 += texture(uCast, uvOf(q)).x; ws += 1.0;
      }
      if (ws > 0.5) { E.xy = es / ws; C.x = cs2 / ws; }
      float rs = 0.0, rw = 0.0;
      for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
        vec2 q = pc + vec2(float(xx), float(yy)) * 1.2;
        if (idNear(q) != id) continue;
        rs += texture(uEdge, uvOf(q)).z; rw += 1.0;
      }
      if (rw > 0.5) E.z = rs / rw;
      N = normalize(vec3(E.xy * uMisc.x, 1.0));
      float s = dot(N, uKey) / uKey.z;
      bool isActor = actorBit(fl.y); float actor = isActor ? 1.0 : uToon.w;
      float form = (1.0 - smoothstep(uToon.x - uToon.y, uToon.x + uToon.y, s)) * uAmt.x * actor;       // a drawn shadow with a soft-crisp edge
      float drop = smoothstep(0.02, 0.02 + uToon.z, C.x) * uAmt.y;
      float sh = max(form, drop) * (1.0 - em) * mix(1.0, 0.5, smoothstep(0.80, 0.97, luma(a)));
      vec3 lit = mix(a, pow(a, vec3(uShadowDeep)) * uShadowTint, sh);
      lit *= 1.0 + smoothstep(1.03, 1.6, s) * 0.12 * uKeyTint * (1.0 - sh) * actor;      // the side that faces the key
      lit *= 1.0 - E.w * uAmt.w * (1.0 - em);
      lit += uRimColor * (0.30 + 1.1 * a) * E.z * uAmt.z * (isActor ? 1.0 : uProps) * C.y * (1.0 - 0.6 * em);
      col = lit;
    }
  }
  // glowing things spill their colour on what is near them (a wide blur of the glow layer; brighter on the side facing it)
  vec3 irr = textureLod(uGlow, vUv, 4.3).rgb;
  float gx = luma(textureLod(uGlow, uvOf(pc + vec2(40.0, 0.0)), 4.3).rgb) - luma(textureLod(uGlow, uvOf(pc - vec2(40.0, 0.0)), 4.3).rgb);
  float gy = luma(textureLod(uGlow, uvOf(pc + vec2(0.0, 40.0)), 4.3).rgb) - luma(textureLod(uGlow, uvOf(pc - vec2(0.0, 40.0)), 4.3).rgb);
  vec2 gd = vec2(gx, gy); float gm = length(gd);
  float facing = gm > 1e-4 ? 0.65 + 0.9 * dot(N.xy, gd / gm) : 0.65;
  if (uPlate > 0.5 || id > 0) col += (a * 1.4 + 0.02) * irr * uMisc.y * max(facing, 0.15);
  if (uPlate > 0.5) {
    float d = length((pc - uPool.xy) / vec2(uPool.z, uPool.z * 1.3));
    float k = smoothstep(0.5, 1.55, d) * uPool.w * (1.0 - em);
    col *= mix(vec3(1.0), uPoolTint, k);
    if (uHalo.w > 0.001) { float hd = length((pc - uHalo.xy) / uHalo.z); col += (uHaloColor * 0.22 + a * uHaloColor * 3.2) * uHalo.w * exp(-hd * hd * 2.2) * (1.0 - 0.5 * em); }
    if (uMisc.z > 0.001) {     // shafts of light in the haze, running away from the key light
      vec2 ld = normalize(uKey.xy), across = vec2(-ld.y, ld.x);
      float u = dot(pc, across), v = dot(pc - vec2(W * 0.5, 0.0), -ld);
      float n = vnoise(vec2(u / 230.0 + uMisc.w * 0.04, 3.7)) * 0.8 + vnoise(vec2(u / 110.0 - uMisc.w * 0.06, 9.1)) * 0.2;
      float beam = smoothstep(0.36, 0.92, n) * smoothstep(1500.0, 150.0, v) * (0.8 + 0.2 * vnoise(vec2(v / 420.0 - uMisc.w * 0.25, u / 160.0))) * 0.8;
      col += uBeamColor * beam * uMisc.z * (1.0 - 0.5 * em);
      col += uBeamColor * 0.10 * uMisc.z * smoothstep(1300.0, 0.0, v);     // the haze itself
    }
  }
  o = vec4(toSrgb(col), 1.0);
}`;
  // ---- the set goes out of focus behind him: a disc blur that lets bright points bloom into discs (half size)
  const FS_BOKEH = HEAD + `
out vec4 o; uniform sampler2D uSrc; uniform float uRad;
void main() {
  vec3 acc = vec3(0.0); float wsum = 0.0;
  for (int i = 0; i < 40; i++) {
    float r = sqrt((float(i) + 0.5) / 40.0) * uRad, th = float(i) * 2.39996323;
    vec3 c = toLin(texture(uSrc, vUv + vec2(cos(th) / W, sin(th) / H) * r).rgb);
    float w = 1.0 + 9.0 * pow(luma(c), 3.0);
    acc += c * w; wsum += w;
  }
  o = vec4(toSrgb(acc / wsum), 1.0);
}`;
  const FS_BRIGHT = HEAD + `
out vec4 o; uniform sampler2D uSrc, uGlow; uniform float uThr;
void main() {
  vec3 acc = vec3(0.0);
  for (int y = -1; y <= 1; y += 2) for (int x = -1; x <= 1; x += 2) acc += toLin(texture(uSrc, vUv + vec2(float(x) / W, float(y) / H)).rgb);
  vec3 c = acc * 0.25; float l = luma(c);
  float lit = clamp(luma(textureLod(uGlow, vUv, 1.5).rgb) * 5.0, 0.0, 1.0);
  o = vec4(c * smoothstep(uThr, uThr + 0.35, l) * (0.06 + 0.94 * lit), 1.0);
}`;
  const FS_BLUR = HEAD + `
out vec4 o; uniform sampler2D uSrc; uniform vec2 uStep;
void main() {
  vec3 acc = vec3(0.0); float ws = 0.0;
  for (int i = -8; i <= 8; i++) { float w = exp(-float(i * i) / 24.0); acc += texture(uSrc, vUv + uStep * float(i)).rgb * w; ws += w; }
  o = vec4(acc / ws, 1.0);
}`;
  const FS_RAYS = HEAD + `
out vec4 o; uniform sampler2D uSrc; uniform vec4 uRay;      // the source in uv (x, y), how far around it counts (in widths), how fast the rays fade
void main() {
  vec2 c = uRay.xy, d = c - vUv; vec3 acc = vec3(0.0); float w = 1.0;
  float j = hash12(gl_FragCoord.xy) / 44.0;
  for (int i = 0; i < 44; i++) {
    vec2 p = vUv + d * (float(i) / 44.0 + j) * 0.94;
    float near = smoothstep(uRay.z, 0.0, length((p - c) * vec2(1.0, H / W)));
    acc += texture(uSrc, p).rgb * near * w; w *= uRay.w;
  }
  float ang = atan(d.y * H / W, d.x);
  float streak = 0.5 + 1.1 * pow(vnoise(vec2(ang * 6.0, 0.5)) * 0.6 + vnoise(vec2(ang * 17.0, 4.2)) * 0.4, 2.0);
  o = vec4(acc / 44.0 * 4.2 * streak, 1.0);
}`;
  const FS_COPY = HEAD + `out vec4 o; uniform sampler2D uSrc; void main() { o = vec4(texture(uSrc, vUv).rgb, 1.0); }`;
  // ---- the lens: bloom, halation, fringing, the grade, grain
  const FS_LENS = HEAD + `
out vec4 o; uniform sampler2D uSrc, uB1, uB2, uR;
uniform vec4 uRays;        // the colour of the sun rays, and how strong
uniform vec4 uLens;        // bloom, halation, fringing in px at the corners, grain
uniform vec4 uGrade;       // contrast, saturation, split-tone, frame number
void main() {
  vec2 cc = vUv - 0.5; float r2 = dot(cc * vec2(1.0, H / W), cc * vec2(1.0, H / W));
  vec2 off = cc * r2 * uLens.z * 2.2 / W;
  vec3 col = toLin(vec3(texture(uSrc, vUv + off).r, texture(uSrc, vUv).g, texture(uSrc, vUv - off).b));
  vec3 b1 = texture(uB1, vUv).rgb, b2 = texture(uB2, vUv).rgb;
  col += b1 * uLens.x + b2 * uLens.y * vec3(1.0, 0.52, 0.30);
  if (uRays.w > 0.001) col += texture(uR, vUv).rgb * uRays.rgb * uRays.w;
  vec3 c = toSrgb(col);
  float l = luma(c);
  c = mix(c, c * c * (3.0 - 2.0 * c), uGrade.x);                                   // a gentle S curve
  c += uGrade.z * (pow(1.0 - l, 2.0) * vec3(-0.020, 0.006, 0.040) + pow(l, 2.0) * vec3(0.030, 0.010, -0.030));   // cool shadows, warm lights
  l = luma(c); c = mix(vec3(l), c, uGrade.y);
  c = max(c, vec3(0.012, 0.014, 0.026));                                             // blacks never go dead
  float g = hash12(gl_FragCoord.xy + vec2(uGrade.w * 17.13, uGrade.w * 9.71)) + hash12(gl_FragCoord.xy * 1.37 + vec2(uGrade.w * 3.3, 41.0)) - 1.0;
  c += g * uLens.w * (0.35 + 0.65 * (1.0 - abs(2.0 * l - 1.0)));
  o = vec4(c, 1.0);
}`;

  function prog(fs) {
    const mk = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('light stage shader: ' + gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('light stage link: ' + gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const inf = gl.getActiveUniform(p, i); u[inf.name] = gl.getUniformLocation(p, inf.name); }
    return { p, u };
  }
  const P = { edge: prog(FS_EDGE), light: prog(FS_LIGHT), bokeh: prog(FS_BOKEH), rays: prog(FS_RAYS), bright: prog(FS_BRIGHT), blur: prog(FS_BLUR), copy: prog(FS_COPY), lens: prog(FS_LENS) };
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function tex(filter, mips) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function target(w, h, n = 1, fmt = gl.RGBA16F) {
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const ts = [];
    for (let i = 0; i < n; i++) {
      const t = tex(gl.LINEAR, false); gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0); ts.push(t);
    }
    gl.drawBuffers(ts.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('light stage: framebuffer');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, t: ts, w, h };
  }
  const T = { albedo: tex(gl.LINEAR), id: tex(gl.NEAREST), flags: tex(gl.NEAREST), glow: tex(gl.LINEAR, true) };
  gl.bindTexture(gl.TEXTURE_2D, T.flags); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const F = { edge: target(W, H, 2), lit: target(W, H, 1, gl.RGBA8), half: target(W / 2, H / 2, 1, gl.RGBA8),
    q1: target(W / 4, H / 4), q2: target(W / 4, H / 4), r1: target(W / 4, H / 4), r2: target(W / 4, H / 4), e1: target(W / 8, H / 8), e2: target(W / 8, H / 8) };

  function upload(t, canvas, premul, mips) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !!premul);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    if (mips) gl.generateMipmap(gl.TEXTURE_2D);
  }
  function run(pr, dst, uniforms, textures) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
    gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
    gl.useProgram(pr.p);
    let unit = 0;
    for (const k in textures) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, textures[k]); gl.uniform1i(pr.u[k], unit); unit++; }
    for (const k in uniforms) {
      const v = uniforms[k], loc = pr.u[k]; if (loc === undefined) continue;
      if (typeof v === 'number') gl.uniform1f(loc, v); else if (v.length === 2) gl.uniform2fv(loc, v); else if (v.length === 3) gl.uniform3fv(loc, v); else gl.uniform4fv(loc, v);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  const norm2 = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
  const norm3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

  // light the picture now on `main`; with o.blur > 0 it also goes out of focus (the set behind the hero). Result on LS.canvas
  const alive = () => { if (gl.isContextLost()) throw new Error('light stage: the graphics context was lost'); };
  function light(main, idCanvas, glow, L, o) {
    alive();
    upload(T.albedo, main, false); upload(T.id, idCanvas, false); upload(T.glow, glow, true, true);
    gl.bindTexture(gl.TEXTURE_2D, T.flags); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const rows = Math.min(256, (ID_N >> 8) + 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, rows, gl.RGBA, gl.UNSIGNED_BYTE, ID_FLAGS.subarray(0, rows * 1024));
    const key = norm3(L.key), kd = norm2(key[0], key[1]), rd = norm2(L.rimFrom[0], L.rimFrom[1]);
    run(P.edge, F.edge, { uDirs: [rd[0], rd[1], kd[0], kd[1]] }, { uId: T.id, uFlags: T.flags });
    const blur = o.blur || 0;
    run(P.light, blur > 0.6 ? F.lit : null, {
      uKey: key, uKeyTint: L.keyTint, uShadowTint: L.shadowTint, uRimColor: L.rim, uPoolTint: L.poolTint, uBeamColor: L.beamColor,
      uPool: [o.pool[0], o.pool[1], o.pool[2], o.plate ? L.pool : 0], uAmt: [L.form, L.cast, L.rimAmt, L.ao],
      uMisc: [L.steep, L.spill, o.plate ? L.beams : 0, o.time || 0], uPlate: o.plate ? 1 : 0,
      uProps: L.propsRim, uShadowDeep: L.shadowDeep, uHaloColor: L.haloColor || L.rim, uToon: [L.toonAt, L.toonSoft, L.castSoft, L.props], uHalo: [o.halo ? o.halo[0] : 0, o.halo ? o.halo[1] : 0, o.halo ? o.halo[2] : 1, o.plate && o.halo ? L.halo : 0],
    }, { uAlbedo: T.albedo, uEdge: F.edge.t[0], uCast: F.edge.t[1], uGlow: T.glow, uId: T.id, uFlags: T.flags });
    if (blur > 0.6) {
      run(P.bokeh, F.half, { uRad: blur }, { uSrc: F.lit.t[0] });
      run(P.copy, null, {}, { uSrc: F.half.t[0] });
    }
    gl.flush();
  }
  // the lens, over the finished frame
  function lens(main, L, frame, rays) {
    alive();
    upload(T.albedo, main, false);
    run(P.bright, F.q1, { uThr: L.bloomAt }, { uSrc: T.albedo, uGlow: T.glow });
    const rayAmt = rays ? rays.amt : 0;
    if (rayAmt > 0.001) {
      run(P.rays, F.r1, { uRay: [rays.x / W, 1 - rays.y / H, rays.reach || 0.55, 0.972] }, { uSrc: F.q1.t[0] });
      run(P.blur, F.r2, { uStep: [4 / W * 0.6, 0] }, { uSrc: F.r1.t[0] });
      run(P.blur, F.r1, { uStep: [0, 4 / H * 0.6] }, { uSrc: F.r2.t[0] });
    }
    run(P.blur, F.q2, { uStep: [4 / W * 1.0, 0] }, { uSrc: F.q1.t[0] });
    run(P.blur, F.q1, { uStep: [0, 4 / H * 1.0] }, { uSrc: F.q2.t[0] });
    run(P.blur, F.e1, { uStep: [8 / W * 1.3, 0] }, { uSrc: F.q1.t[0] });
    run(P.blur, F.e2, { uStep: [0, 8 / H * 1.3] }, { uSrc: F.e1.t[0] });
    run(P.blur, F.e1, { uStep: [8 / W * 2.2, 0] }, { uSrc: F.e2.t[0] });
    run(P.blur, F.e2, { uStep: [0, 8 / H * 2.2] }, { uSrc: F.e1.t[0] });
    run(P.lens, null, { uLens: [L.bloom, L.halation, L.fringe, L.grain], uGrade: [L.contrast, L.sat, L.split, frame], uRays: [(rays && rays.color || L.beamColor)[0], (rays && rays.color || L.beamColor)[1], (rays && rays.color || L.beamColor)[2], rayAmt] }, { uSrc: T.albedo, uB1: F.q1.t[0], uB2: F.e2.t[0], uR: F.r1.t[0] });
    gl.flush();
  }
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return { canvas: cv, light, lens, alive, renderer: String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) };
  } catch (err) { console.log('light stage off: ' + err.message); window.LOOK_ERROR = err.message; return null; }
})();
