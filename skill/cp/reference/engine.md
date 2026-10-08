# Engine: how a Short is built in code

## Files in `videos/<slug>/src/`

| File | Role | Per video? |
|---|---|---|
| `script.txt` | the directed narration (blocks, gaps, tempo, tags) | yes |
| `voice.py` | ElevenLabs takes → `narration.wav` + `words.json` (cached in `voice/`) | engine |
| `make_timeline.py` | SHOTS, CHUNKS, COLOR, DISPLAY, cues → `timeline.json` (with `timeline_lib.py`) | yes |
| `audio.py` | cue-locked sound design + score → `mix.wav` (with `sfxkit.py`, `sfxlib.py`, `mixlib.py`) | yes |
| `web/scene.html` | loads the engine, then the video's world files, then `scenes.js`, then `main.js` | yes (script list) |
| `web/lib.js` | canvases (`ctx`, `gctx`, scratch layers), easing `E`, `ramp`, `inv`, `clamp`, `lerp`, noise, camera (`applyCam`, `screenSpace`, `CAM0`), drawing helpers | engine |
| `web/shapemap.js`, `web/lightstage.js`, `web/look.js` | the cinematic look (8 Oct 2026): the shape map (every opaque shape again, flat, in a colour that is its serial number), the light stage (WebGL2 passes: drawn shadows, dropped shadows, rim, glow spill, the lens), and the switch with the light rig: `LIGHTS`, `setLights`, `flipLight`, `actor`, `paint`, `sunRays` | engine |
| `web/env.js` | storm sky, clouds, hills, rain, lightning bolts, sparks, smoke (`initEnv`) | engine |
| `web/character.js` | the hiker rig: `POSES`, `FACES`, `PAL`/`XPAL`, `drawCharacter` | engine |
| `web/kit.js` | the lightning-era kit: `SC = {}`, `charLayer`, `pill`, `thermo`, the x-ray world (`initScenes`) | engine |
| `web/fx.js` | shared scene helpers (see visual.md) | engine |
| `web/scenes.js` (+ more) | this video's worlds, props and `SC.<shot>` functions, and `initScenes2()` | yes |
| `web/subscribe.js` | the subscribe cue (pill, bell, cursor click, pop-out), mid-video, driven by `cues.sub_in` / `cues.sub_tap` / `cues.sub_out`; `subLift` tells main.js which caption chunks sit at y 1150 | engine |
| `web/main.js` | the compositor: runs the active shot, the light (`lookFrameStart`, `lookScene`, `lookFinal`), bloom, push, blur, grade, VHS, grain, flash, captions | engine |
| `render.js` | headless Chrome → PNG frames piped into ffmpeg (or to a folder for stills); prints `look: …`, takes `CP_LOOK`, falls back to the classic look without a graphics chip | engine |
| `make_srt.py`, `qa.py`, `qc_*.py`, `contact_sheet.py` | captions file, the QA gate, review tools | engine |
| `qc_inband.py` | which narrated words are faint between 300 Hz and 4 kHz (run it after voice.py; narration.md) | engine |
| `cover.sh` | renders `SC.cover` into `cover.jpg` from a one-shot copy of the timeline | engine |

Engine files are the template's. Improve them in the skill's `template/` when an improvement is general, then copy
it into the video. Never let two videos drift apart silently.

## The data flow

`script.txt` → voice.py → `words.json` (word start/end, blocks, events such as `[gasps]` times) → make_timeline.py →
`timeline.json`, which holds:

```
{fps, duration, shots: [{id, start, end}], captions: [{start, end, lines: [[{t, c, at}]]}],
 cues: {name: seconds | [seconds…]}, words, events}
```

Both render.js (the picture) and audio.py (the sound) read that one timeline. Sync is by construction: a cue is
one number both sides use.

- Name every beat as a cue, e.g. `cues["bam"] = W("BAM")` or `cues["final_jolt"] = E("Probably") + 0.95`.
- Schedules (heartbeats, window jolts) are cue lists computed once in make_timeline.py.
- Never type a time into scenes.js or audio.py.

## Writing shots

```js
SC.burst = (lt, t, shot) => {              // lt = time in the shot, t = video time
  const c = TLd.cues, D = shot.end - shot.start;
  darkBg('#0B1A3A', '#02040C');             // or a world: bedroomTop(cam, t) …
  const cam = camKeys(lt, [[0, 540, 700, 1.0], [1.2, 540, 900, 1.4], [D, 540, 1300, 1.6]]);
  applyCam(cam);                            // world coords: 1080×1920 at zoom 1
  // draw into ctx; draw emissive parts into gctx too (both(fn) draws into both)
  const k = ramp(t, c.scientists, c.scientists + 0.4, E.outBack);   // a pop on the beat
  screenSpace();
  bigWord('BAM!', 540, 600, 260, '#FFD447', k);
  return { push: { k: 1 + 0.06 * lt / D, cx: 540, cy: 800 }, zblur: 0.1 * (1 - ramp(lt, 0, 0.3)) };
};
```

- `initScenes2()` runs once before frame 0. Build static layers (tiles, cities, star fields) there with seeded
  `mulberry32`. Never use `Math.random`: frames must render identically every time.
- The x-ray, bone, heart and nerve drawings exist in kit.js and character.js (`drawBones`, `drawHeart`,
  `skinPaths`, `worldPaths`, `bodyArcs`, `flowCurrent`). Reuse them for anatomy.
- `const` and `let` names must be unique across all loaded scripts (a duplicate `const` is a SyntaxError that shows
  up as `[pageerror]`). Function declarations may override earlier ones.

## The light in code (the cinematic look, 8 Oct 2026)

What to write is in visual.md ("The light"). How it works, for when something looks wrong:

- `timeline.json` carries `"look"` (timeline_lib.py reads publish.json; default `cine`). In `classic` the three files
  do nothing and the picture is the old one, pixel for pixel.
- **The shape map.** `ctx` and `lctx` are mirrored: each opaque `fill`, `fillRect` and thick `stroke` is drawn again
  into a hidden canvas in a colour that is its serial number. Left out as paint: shapes under 10 px, lines under
  14 px, anything see-through, blurred, blended or drawn inside a `clip()`, and whatever sits in `paint(fn)`. A solid
  image or lettering over mapped shapes becomes one flat thing that is never lit. A later number is in front.
- **The light stage** reads the picture, the map and the glow layer on the graphics chip. For each pixel it looks for
  the edge of its own shape: where the neighbour beyond is behind, the shape leans away there (the drawn shadow on
  the far side, the rim on a character); where it is in front, it drops a shadow. It runs when the hero is about to
  be drawn (the set: light, pool, glow behind him), when the scene is done (him and the foreground), and after the
  vignette (the lens).
- **Where nothing is in shadow the picture is exactly what the scene drew**, so a place the map does not know never
  shows a seam: the light only adds shadows, a rim and glow.
- Looks wrong? `CP_LOOK=classic node render.js … "f"` shows the same frame unlit. A shadow ring round an eye: wrap the
  face in `paint`. A thing lit as if it were what is behind it: it was drawn from a cached image or see-through;
  draw it with opaque shapes. A line between two parts of one thing: give them the same colour, back to back.
- If the light stage cannot start, or dies mid-render, render.js makes the picture in the classic look and says so.
  Tuning lives in `LIGHT` and `LIGHTS` at the top of `look.js`; change the template, not one video.

## Borrowing from past videos

The repo checkout is blobless and sparse. Fetch one file without checking the whole video out (only that file's
blob is downloaded):

```sh
git -C ~/Desktop/curiopulse show HEAD:videos/hypnic-jerk/src/web/bedroom.js > src/web/bedroom.js
```

World files written before 8 Oct 2026 know nothing of the light. They work as they are (the light is added on top).
When you borrow one, wrap its characters in `actor(...)` and their faces in `paint(...)`, and take out a hand-painted
shade stroke where it fights the drawn shadow (visual.md, "The light").

| World file | What's in it |
|---|---|
| `videos/hypnic-jerk/src/web/bedroom.js` | bedroom at night (overhead + front), bed, duvet, nightstand, moonlit window, pajama palette `PJ`, `armsOnTop` |
| `videos/hypnic-jerk/src/web/brain.js` | side-view brain, EEG, spinal cord signals, x-ray sleeper with muscles, panic button, dream fall |
| `videos/hypnic-jerk/src/web/scenes_end.js` | jungle + moon + ancestor silhouette (with glow occluders), trigger rows, HARMLESS shield, chest inset with diaphragm |
| `videos/finger-wrinkles/src/web/bath.js` | bathroom, clawfoot tub, water + foam, rubber duck, soap, steam, bare-shoulder palette `BARE` |
| `videos/finger-wrinkles/src/web/hand.js` | open hand whose pads wrinkle, macro fingertip, grape → raisin, sponge |
| `videos/finger-wrinkles/src/web/inside.js` | skin cutaway: layers, sweat pores and ducts, nerve, vessels, anchoring strands (`sectionCam`) |
| `videos/finger-wrinkles/src/web/props.js` | stopwatch, tires on a wet road, study cards, clipboard, scan readout |
| `videos/yawning-contagious/src/web/bus.js` | night city bus interior (windows with a scrolling skyline, light sweeps, poles, swaying straps), passengers with their own rig (`drawPassenger`: gran, suit, teen, nurse; yawn/stretch/sleep/smile/"o"), the hero seated on a bench (`heroOnBench`, `heroSeatPose` with stretch/shrug/point), the yawn wisp, the bus from outside |
| `videos/yawning-contagious/src/web/yawnhead.js` | side-view head cutaway with a hinged jaw (opens for a yawn), cool air streaming in, carotid blood rush, brain warm → cool, a thermometer (`thermoY`) |
| `videos/yawning-contagious/src/web/props.js` | cold pack on the forehead, lab monitor playing a clip, a two-bar study chart, a sitting dog that yawns (`drawDog`), a book with lit words (`yawnBook`), a magnifying glass over his eye (`magnifier`) |
| `videos/stomach-growl/src/web/exam.js` | exam hall from the front (daylight windows + shafts, wall clock, SILENCE sign, desks in rows), classmates without legs (`drawStudent`: write, stare, glare, shush), the hero at a desk (`heroAtDesk`, `heroDeskPose`: write, thumbs-up, whisper, shrug), `growlRings`, wobbly `growlWord` |
| `videos/stomach-growl/src/web/gut.js` | x-ray torso with stomach, duodenum, coils and colon; a squeeze band travelling the gut path (`gutAt`); the tube in section with a moving pinch (`tubeSection`, `tubeJuice`), bubbles, crumbs, bacteria with faces; the tartan `bagpipe` stomach; a `vacuum` |
| `videos/stomach-growl/src/web/lab1912.js` | 1912 lab (panelled wall, chalkboard, flasks), kymograph drum + tambour, round x-ray window with a balloon in the stomach, `bowTie`, `sepia()` (colour blend) + `oldFilm()` (scratches, dust, flicker, gate) |
| `videos/goosebumps/src/web/room.js` | living room at night (window + moon, curtains, a framed cat, floor lamp, rug), a couch in front of a TV that is the camera (`tvFlick`, `tvLight`: a blue flicker over the frame), the hero seated (`couchScene`, `couchPose`: hug / arms up / an IK override; `couchLegs`), home outfit `HOMEPAL` (bare forearms), a popcorn bucket and flying popcorn, `armBristles`, `headphones`, `musicNote`, the big red button in a round callout with an alarm beacon (`fluffButton`) |
| `videos/goosebumps/src/web/arm.js` | macro forearm (`macroArm`): a jittered grid of follicles, tapered hairs that lie flat and swing upright per-hair (`rise(u, j)`), goosebumps (`skinBump`), the blurred room behind it (`armBg`); a plucked goose (`drawGoose`: bumpy body, feathered head, deadpan eye, shrugging wing, falling feathers); a wall light switch (`lightSwitch`) |
| `videos/goosebumps/src/web/skin.js` | skin in section (`skinSection`): epidermis, dermis, fat, leaning hair follicles each with its arrector pili muscle and gland, a nerve trunk with a branch to every muscle and a travelling signal (`fire`), the muscle shortening swings the follicle upright and the surface bunches (`skinSurfY`); `ghostIcon`, `flakeIcon` |
| `videos/goosebumps/src/web/cat.js` | snowy yard at night (`yardBg`), a ginger cat (`drawCat`: `puff` 0..2 fur spikes via `furRing`, happy / scared faces, ears back, hiss, tail up, shiver, a warm-air glow), cold wind streaks (`coldWind`), a light bulb (`bulbIcon`), a looming dog silhouette that snarls then gets scared (`dogShadow`) |
| `videos/ears-pop/src/web/cabin.js` | plane cabin at dusk (`cabinBack`: wall, sunset windows whose horizon counter-rotates with the cabin's pitch `rot`, runway streaks at `alt` 0, a cloud deck once up, a `sun` glare; overhead bins, seatbelt signs `cabSigns`, a row of seats with armrests), the hero in seat 12A (`cabinScene`, `cabPose`: grip the armrests / both hands over the ears / one ear / the big yawn / fists to the eyes; the hands follow the head when it leans or jolts), his travel pillow `neckPillow`, `earThrob` (pressure rings at his ears), a tray with `chipBag` (puff 0..1) and `waterBottle` (crush 0..1), passengers with long legs `drawPax` (ears, wince, angry, hold; `PAX` suit / mum / gran), the baby `drawBaby` (cry, wobble, smug, blink, medal), `tearJets`, `screamArcs`, `cabLight` |
| `videos/ears-pop/src/web/ear.js` | the ear in section (`earSection`): outer ear, canal, an eardrum that bows out or in (`bulge`), the middle-ear air pocket with its three little bones, the cochlea and balance canals, the eustachian tube down to the back of the nose (open or collapsed `tube`, suction chevrons `squeeze`), the little muscle that opens it (`pull`), air drawn as particles whose number is the pressure (`canal` / `pocket` / `nose` densities; `earFlow` streams along the tube), push arrows on the drum; `padlock` (ajar / shut / sprung), `headMap` (a small front view of his head with the route from ear to nose) |
| `videos/ears-pop/src/web/scenes.js` (helpers) | `secCam` (camKeys with the focus above the captions), `secLabel`, `pressureHud` (CABIN PRESSURE with a marching arrow), `popWord`, `popStar` (a comic burst), `speechR` (a bubble whose tail points right), `loudWord` (shaking letters: WAAAH!, ACHOO!), `tickPill` |
| `videos/sun-sneeze/src/web/street.js` | a street outside a cinema in late-afternoon sun (`streetBack`: far buildings, a plum wall in shade, posters, the dark foyer, a marquee with a neon sign and chasing bulbs, a door leaf that swings out; `sunDraw`, `streetVeil`, `sunAt`), the hero lit for daylight (`sunChar`: shade wash, warm key light, foyer darkness, pavement shadow), the sneeze as acting (`sneezeAct` → `sneezeFace`, `sneezePose`, `sneezeHead`; `sprayBurst`), popcorn (`popBucket`, `kernel`, `popcornBurst`), sunglasses (`shades`, `shadesShape`), other pedestrians (`drawPed`: three builds; walk, turn, shield, startled), the cold `germ`, a four-point `sparkle` |
| `videos/sun-sneeze/src/web/sneezehead.js` | his head in section, in profile (`headCut`): eyeball with lens and retina, the eye's nerve and the trigeminal nerve with its nose and jaw branches as smooth cords (`shDense`, `shNerve`, `shPulse`), a ring where they run close, a light beam through the pupil, sparks jumping the gap, a shield at the nose, an alarm in the nasal lining, the brainstem, and the brain with a face, an arm and a big red SNEEZE button; `shScreen`, `shSet` (with a head tilt) |
| `videos/sun-sneeze/src/web/scenes.js` (helpers) | `achooWord` (a shaking ACHOO! with shock lines), `secLabel`, `guessStamp` (a BEST GUESS stamp that stays up), `heldBucket`, the framed family photo (hero rig in `PAL_GRAN` / `PAL_KID`), the doctor's chart that types letters and folds them into an acrostic |
| `videos/pins-needles/src/web/studio.js` | a meditation studio at dusk (`studioBack`, `studioMat`, the gong `drawGong` + `gongRings`), classmates in the lotus pose (`drawYogi`, `YOGIS`), the barefoot outfit `YOGA` (a `drawShoe` override: bare feet with toes), `heroLayer` (a whole-body rotation about a pivot) + `heroPt`, `crossLegs` + `POSE_LOTUS`, `legTint`, `legWash` (TV static), `kneeFace`, `drawPin`, `fizzStar(s)`, `bigFoot` |
| `videos/pins-needles/src/web/nerve.js` | a folded leg as an x-ray in profile that can swing open (`legGeo`, `xrayLeg`), an artery, a nerve with its tiny vessels (`legNerve`), signals (`legPulses`), the squeeze (`legSqueeze`), sparks; the nerve's fibres up close (`fibreBundle`), a needle `electrode`, a `scopePanel`; `crDense` (Catmull-Rom) |
| `videos/pins-needles/src/web/brainy.js` | the brain at its desk (`brainRoom`, `brainDesk`, `brainGuy`: calm / worried / squint / think / shrug, arms to targets) and an old TV (`tvSet`: feed, NO SIGNAL, a map with a question mark, static; `footIcon`) |
| `videos/voice-recording/src/web/phone.js` | the phone from his own eyes (`povPhone`: a voice message with his avatar, PLAY, a live waveform, his thumb; `avatarFace` puts the hero's face in a disc), from the front (`heldPhone` + `phoneFingers`: its back in his hand), the voice coming out of it (`squeakRings`: jagged rings, draw them BEHIND him; `scribbleBubble`: a spiky bubble of scribble), `phoneLight` |
| `videos/voice-recording/src/web/voicehead.js` | his head from the front, see-through (`vhHead`): the skull with his eyes in the sockets and a jaw that talks (`vhSkull`, in rig head units, so it also fits on the rig's head in a `post`), his hair and eyebrows (`vhHair`), the voice box (`vhLarynx`), ear canals, eardrums and inner-ear snails (`vhEars`), two routes as dense polylines with draw-on, marching dashes or beads and an arrowhead (`VH_AIR`, `VH_BONE`, `vhRoute`), rings trapped inside the head (`vhTrapped`), a hand-held microphone (`vhMic`), a two-row scope (`vhScope`); `vhBoth`, `vhPt` |
| `videos/voice-recording/src/web/stage.js` | a movie trailer (`trailerBg` sunset, `heroCape`, `letterbox`, `goldTitle`), karaoke night (`karaokeBg`: curtain, neon sign, bulbs, spotlight, stage; `karaokeCrowd` from behind with phone lights; `handMic`; `STAGEPAL`), `waveRibbon(a, b, t, 'fat' | 'thin', k, col)` (a signal as a ribbon between two points), the listening test (`voiceCard`: a mystery bust that flips to his face, a waveform, five stars; `boothBg`, `boothDesk`) |
| `videos/voice-recording/src/web/scenes.js` (helpers) | `couchHero` (goosebumps' couch with a phone in his right hand: hold target, tilt, a toss, the voice's rings behind him), `gibAmp` (the phone voice's loudness on the syllable clock), `povBg`, `headBg`, `routeLabel` (a numbered pill with a leader), `recPanel` (AIR ✓ / SKULL ✗ meters), `teaseCard` |
| `videos/hiccups/src/web/dinner.js` | a candlelit restaurant for two (`dnBack`: plum wall, arched night window with a skyline, drapes, pendant lamp, fairy lights; `dnTable`: a wine-red cloth), `dnCandle` (lit, blown, smoke), `dnVase`, `dnWine`, the soda glass `sodaGlass` (the liquid stays level at any tilt; bubbles; a tadpole that looks out), `dnSplash`, the date from behind in the foreground `dnDate`, the hero at the table `dnHero` (`DATEPAL` white shirt + `dnBowTie`; `chug` blends holding the glass and drinking from it; a hand over his mouth; `dnReach`: IK with the elbow down), `dnTadHero` (he is a tadpole), `hicBurst` (a comic burst with a word), `dnScene` |
| `videos/hiccups/src/web/chest.js` | his body in section from the front (`chestXray`): mouth, throat, voice box with the vocal cords as a pair of doors (`bxDoorPair`: reusable across any tube), windpipe with rings, lungs that fill, the diaphragm as a dome with a face (`bxDiaY`: drop, poke), the stomach filling with soda and swelling (`bxStomPath`), the gullet; air as particles that jam on shut doors; `bxPuff` (a puff of breath with a face: scared, squashed, dizzy), a CLOSED sign; `bxLabel` (a pill with a dotted leader), `bxPt` |
| `videos/hiccups/src/web/pond.js` | a pond underwater (`pdBack`: light shafts, reeds, silt, bubbles; a cross-fade from soda), a tadpole in profile (`pdTadpole`: tail wave, eye, mouth, smile, blink) with feathery gills (`pdGills`), the tadpole in section (`pdTadCut`: mouth, a mouth cavity whose floor pumps, water in and out over the gills, the tube to the lung with the same doors), `pdPortrait` (the hero's face in a round frame) |
| `videos/hiccups/src/web/scenes*.js` (helpers) | `glugWords` (a word per swallow on a clock that loops), `gulpAt`, `hicJ`, `poofCloud`, `ideaStamp` (an UNPROVEN stamp that lands and keeps its corner), `jab`, `bxBg`, `bxStar`, `pdPump` (the tadpole's gulp cycle) |
| `videos/spicy-food/src/web/stall.js` | a chilli stall at a night market (`initStall`, `stallBack`: the market out of focus, a striped awning, bunting, a CHILLI CHALLENGE banner, strings of dried chillies, paper lanterns, a string of bulbs; `stCounter`, `stPlate`, `stHeap` with an EXTRA placard), the hero behind the counter in a teal shirt (`stHero`, `CHPAL`: a chilli held in his fist or between his teeth with his own biting mouth `stBiteMouth` / `stBiteTeeth`, the red that climbs his face (`flush`: the same man drawn again in `CHRED`, clipped to his head), a mouth thermometer `stThermo`, a sprinkler head on his hair `stSprinkler`), `stallScene`; the chilli as a prop `chilliPod` (whole or bitten) and as a small villain `chilliGuy` (smug / evil / wink, arms that reach, legs that walk); `fireJet` (a cone of flame with embers, any size and angle), `earSteam`, `smokeCurl`, `sprinklerSpray` (dashed ribbons of water), `reticle` (a crosshair that sweeps, locks and names its target), `stW(n)` (an angular speed that fits the runtime n times: ambient motion that loops) |
| `videos/spicy-food/src/web/mouth.js` | "a heat sensor is a fire alarm": `heatAlarm` (a red box with a cold-to-hot gauge, a pull handle, a lamp, a bell and a keyway on top), the mouth from inside `caveBack` (teeth, throat, uvula, the tongue as the floor; `caveTongueY`), the tongue in section `tongueScene` (three alarms sunk into the surface, each on a nerve that merges into a trunk; `moSurf`, `moNerve`, `moPulses`: beads of signal along a dense curve from `moDense`), `capKey` (a molecule drawn as a key: a six-sided ring with two side groups for the bow, a zig-zag chain for the blade; `turn`), `soupSpoon` (a spoon of steaming soup), `heatRays` (wavy rays with arrowheads) |
| `videos/spicy-food/src/web/garden.js` | a garden at dusk (`initGarden`, `gdBack`: a half-set sun, hills, a fence, soil with tufts, fireflies), a chilli plant with a face when it wants one (`gdPlant`: stems, leaves, hanging pods, a crown of leaves with eyes, heavy brows and a smirk), a yellow bird that eats (`gdBird`: chomp, nod, eyes shut, a pod in its beak), a mouse (`gdMouse`: tiptoe, rear up, eyes pop, run), `noFlame` (a crossed-out flame in a bubble) |
| `videos/spicy-food/src/web/scenes*.js` (helpers) | `biteState(tt)` (his state as a function of the time since the bite; negative time is the end of the Short, so the last frames are frame 1), `crunchBurst`, `burnSweat`, `tempTag` (a temperature tag with a tick and a dotted leader), `tinkle` (a four-point sparkle), `vendorArm`, `inLabel` (a pill with a leader), `chilliChunk`, `fireMonitor` (a wall screen: ALL OK / INCOMING / FIRE!), `sprLever` (a wall lever with a lamp), `brainMug` |
| `videos/knuckle-cracking/src/web/den.js` | his room at night seen from his monitor (`initDen`, `denBack`: wall, LED strip, poster, shelf and clock, a door that opens on a lit hallway, a gaming chair; `denDesk`: a rainbow keyboard, a mug, a mouse; things hop with `jump`), the hero at his desk in pyjamas (`denHero`, `DENPAL`, `denPhones`: hands locked in front of his chest `denClasp` (fingers lying sideways across each other; `k` = how hard he pushes, `hot` per knuckle), hands on the desk, a shrug, one hand up for an x-ray; lit by the monitor and by the door), `denScene`; Mom in the doorway `denMom` (shout with a wooden spoon, arms crossed, slump), `denShout` (a jagged bubble with a tail and two lines), `denTick` (a spark and a small word), `denCrackWord`, `denHue(t, n)` (colour that loops with the Short) |
| `videos/knuckle-cracking/src/web/joint.js` | the bones of a hand as an x-ray (`xrHand`, `XR_FINGERS`, `xrChain`: either hand, soft flesh, returns the knuckles), a can of soda (`sodaCan`: tab, fizz), a joint in section (`jointSection`: bone ends with cartilage, a sealed bag that draws on, fluid with gloss, dissolved gas as dots, a bubble, vessels with moving blood; `open` pulls it apart, `rot` turns it), `bigArrow`, `pressureGauge`, a scan on a monitor (`mriJoint`, `mriMonitor`: greys, grain, a SOUND strip with a playhead and a spike), a hand scanner (`mriRoomBack`, `mriFront`: a window on his hand with a loop and a cable, a winch; `mriHero` in a gown `HOSPAL`) |
| `videos/knuckle-cracking/src/web/clinic.js` | a doctor's office (`initClinic`, `clinicBack`: diploma, eye chart, panelling; `clinicDesk`: a jar of lollipops), the hero as a doctor (`docHero`: white coat, stethoscope, gold glasses, a fist that squeezes; `age` 0..1 turns his hair white, lines his forehead and grows a moustache), `yearPanel` (a YEAR counter with a count under it), `flyPages` (calendar pages), a lightbox with two x-ray films (`lightbox`), `bigTick`, `magnifier`, `hexMix` |
| `videos/knuckle-cracking/src/web/scenes*.js` (helpers) | `lockState(tt)` (his state round frame 1; negative time is the end of the Short), `scanPanel` (an x-ray panel that slides over his hand), `okPill` (a pill with a green tick), `mythStamp`, `burstWord` (a comic burst with any word), `popRing`, `inLabel` (a pill with a leader), `xrBg`, `watchers` (two people from behind, watching a monitor) |
| `videos/mosquito-bites/src/web/mozzie.js` | mosquitoes: the character `mozzie` (flying or landed; a proboscis at any angle; a belly that fills; faces calm / happy / love / meh / lock / shock; bib, knife and fork, halo; antennae that quiver), one of a swarm `mozMini`, a cloud on wobbling orbits `mozSwarm` (half in front, half behind; they arrive one by one), smell: `scentRibbon` (a wavy ribbon rising from a point), `acidMol` (a zig-zag chain with a two-oxygen head) and `acidPlume` (a stream of them off a line); the forearm up close `macroArm` (goosebumps' arm with pores that bead with amber oil, bite welts, two skin tones, warm and cool rims), `marmPt` (a point on its surface), `biteBump`, `mozHeart` |
| `videos/mosquito-bites/src/web/camp.js` | a campsite at night, painted once into a canvas and drawn sharp or out of focus (`initCamp`, `campBack(cam, t, {soft})`: pines, a tent lit from inside, a string of bulbs, a pond with reeds far left, a moon that leaves the frame in close-ups), `campFire`, `campChar` (charLayer in firelight, and it cuts his shape out of the glow layer), `headPt` / `headSpace` / `rigSpace`, the hero with his sleeves pushed up `CAMPPAL`, the friend in a camp chair `campFriend` (`FRPAL`, a beanie and glasses, a mug, a plaid blanket, a halo) |
| `videos/mosquito-bites/src/web/mlab.js` | a night lab `labBack`, the two-tube choice box `olfBox` + `nylonSleeve` + `olfTag` (a face and a number), `faceDisc` (the hero's or the friend's face in a round frame), `friendHat`, a wall calendar that counts years `yearCard`, a balance scale `labScale` (returns the pans), a wedge of cheese with a face `cheeseWedge`, a bare foot from the side `bareFoot`, the hand at the end of the macro forearm `macroHand`, a cheese board to stand on `cheeseBoard` (back and front halves) |
| `videos/mosquito-bites/src/web/scenes*.js` (helpers) | `slapState(tt)` (frame 1 as a function of time, valid at negative time for the loop), `drawLanders` (mosquitoes that fly in and settle on his face), `mobState` / `mobSwarm`, `handPrint`, `comicBurst`, `counterPill` (an icon, a times sign, a number that punches), `inLabel`, `tickPill`, `heroBites`, `olfMini` (a mosquito's path through the box), `armBg` |
| `videos/time-flies/src/web/party.js` | his birthday, close: a dark room out of focus painted once (`initParty`, `partyBack`: balloons, bunting, a string of lights), a table, a cake with two number candles (`tfCake`, `CAKES`: 29, 30, 31), a candle flame that leans in a breath (`tfFlame`), a wick's smoke (`tfSmoke`), a party hat and puffed cheeks in head space (`tfHat`, `tfCheeks`), a party horn that rolls out and falls (`tfHorn`), `tfConfetti`, the teal party shirt `PARTYPAL`; the whole hook as `partyState(tt)` / `partyCam(tt)` / `partyDraw(tt, t, {cam, kindMap, confetti, under})`, valid at negative time (the last frames run into frame 1) |
| `videos/time-flies/src/web/mind.js` | the brain as a character (`tfBrain`: moods calm / worried / squint / think / grin / sad / wow, arms to targets, a sleep mask, a crash helmet, an instant camera at its eye), a builder's tape measure whose case says TIME (`tfCase`, a cobweb with `web`), a tape along any path with ruler ticks and an end tab (`tfTape`) and photos riding on it (`tfTapePhotos`), paths (`tfLine`; `tfEight`: out of the slot and once round a figure of eight whose lap is a whole number of photo steps), `tfPhoto`, twelve little pictures (`tfIcon`: cake bike frog kite cone wasp fish tent star ball desk fall), `tfCamera`, `tfFlash`, the brain in a round window for the corner of other scenes (`tfHud`, `HUD`), its room of albums (`initMind`, `mindRoom`) |
| `videos/time-flies/src/web/days.js` | a summer day from the front (`summerBack`: sky, hills, a path whose pebbles and flowers stream toward us), a kid on a bike seen head-on (`kidBike`, `kidRide`: planted pedalling, hands on the grips, a wobble; `kidHelmet`, `KIDPAL`); an office seen from his monitor (`officeBack`: a wall, a window where a whole day goes by per calendar page, a strip light; `officeDay` (which day, how far through it), a tear-off calendar `officeCalendar`, `officeDesk` (keyboard, mug, plate), `officeSandwich` (a bite as an even-odd clip), `OFFPAL`) |
| `videos/time-flies/src/web/fair.js` | a night fair and its drop tower (`initFair`, `fairBack`: stars, and the fair rising into view as the camera falls; `fairMast`: rails, braces, bulbs that turn into streaks at speed; `fairTop`: deck, rail, crane arm, pulley, a lever box; `fairNet` (back and front halves, a sag); the scientist `fairScientist` (`LABPAL`, glasses, a clipboard, a hand on the lever), `fairHelmet`, `fairHarness`, a stopwatch `fairWatch`; the drop as functions of time `fallState` / `fallHero` (hanging, falling, sitting in the net) |
| `videos/time-flies/src/web/scenes.js` (helpers) | `headPt` / `headSpace` / `rigSpace`, `flashOf(t, times)`, `kidTape(t)` (how much tape has come out), `towerCam` / `towerDraw` / `towerHud`, `feltEye`, `feltBars` (two bars with their numbers, a tape drawn along one and past its end), `SC.cover` with `src/cover.sh` |
| `videos/lightning-full/src/web/*` | storm, hill, strike, x-ray body, heart, nerves (much of it now in env.js and kit.js) |

Rules for borrowing:
- Read what you borrow.
- Rename anything that collides with fx.js (`let`/`const` names).
- Add the file to scene.html before scenes.js.

## Rendering

```sh
. ~/.claude/skills/cp/bin/cp-env.sh && cd videos/<slug>/src
node render.js ../.work/timeline.json ../.work/stills "0,45,120,300"   # stills for review (≈200 ms per frame)
$PYTHON contact_sheet.py ../.work/stills ../.work/sheet.png 6 270     # then Read the sheet
node render.js ../.work/timeline.json ../<slug>-short.mp4 --audio ../.work/mix.wav   # the full encode
```

- The full encode takes about 7–9 minutes for 2,000 frames. Run it in the background with a log and an exit
  marker:
  `(node render.js … > ../.work/render.log 2>&1; echo "EXIT $?" >> ../.work/render.log) &`
- `[pageerror]` lines mean a scene threw. Fix it: it would repeat on every frame.
- Every call prints `look: cine (light stage on: …)` or `look: classic …`. A WARNING there means the graphics chip was
  not available and the picture is in the classic look (visual.md, "The switch"). `CP_LOOK=classic` in front of the
  command renders one call unlit, for comparing a still.
- Encoder settings: CRF 17, preset slow, High 4.2, closed GOP 30, bt709 tv range, AAC 256 k. A 64 s film-grain
  Short is ≈ 80 MB. **If a Short would pass 95 MB**, add `-maxrate 9M -bufsize 18M` in render.js. GitHub refuses
  files over 100 MB.

## The toolkit (added 2 Oct 2026)

`src/web/toolkit.js` loads after fx.js; `scene.html` also loads the vendored libraries in `src/web/vendor/<lib>/`
(each with its LICENSE): simplex-noise 4.0.3, culori 4.0.2, flubber 0.4.2, Zdog 1.1.3, roughjs 4.6.6 (all MIT).
matter-js 0.20.0 (MIT) runs in Node only, for the physics bake.
- Noise: `sn2 sn3 snFbm snDrift snBlob snWisps`. Colour (OKLCH): `okMix okShade okRamp okPal okColor okHex`.
- Shapes and morphs (flubber): `shapeCircle/Tear/Heart/Star/Rect/Blob shapePath`, `morphPath morphFill morphSplit`.
- Zdog props drawn as vectors under the camera: `zdProp zdBall zdTube zdDraw zdHeart zdEye zdCell zdMolecule zdPlanet zdBlob`.
- Hand-drawn ink (seeded, draw-on `k`, `boil`): `roughDraw roughCircle roughUnderline roughArrow roughBox`.
- Baked physics: write `src/physics.js` and build.sh runs `src/bake_physics.js` (240 Hz, deterministic) into
  `.work/physics.json`; render.js injects it as `window.PHYS`; read it with `physAt physBody physHits physDebug`.
  Baked, not live, because `renderFrame(f)` must be a pure seek (stills and ranges jump straight to a frame).
- character.js: two-bone IK (`ikLimb ikReach ikPlant ikLocal limbRoot angNear`), `walkPlanted` (feet that stay
  planted), frame-pure springs (`springStep springFollow springPose springHead`), plus the yawn face.
- Reserved global prefixes: `sn ok shape morph zd rough phys`, and the globals rough, culori, flubber, Zdog, SimplexNoise.
- Not integrated: Paper Shaders (ESM-only, renders on requestAnimationFrame; needs a synchronous WebGL mount first).
