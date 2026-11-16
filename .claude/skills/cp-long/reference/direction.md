# Direction for the weekly film (CurioPulse long-form)

Since 16 Nov 2026 (owner: add the direction sheet to every channel's daily and weekly runs, after a blind test of it on
another channel). Fitted from the all-channel core sheet for a 4:00-5:00 film at 1920x1080. It sits on top of
`long-form.md` and the Shorts' craft docs (`skill/cp/reference/`): where they differ from this sheet, this sheet wins,
except the owner's standing rules (SKILL.md's non-negotiables: the demand check, the film bar, the every-scene and
every-second rules, the viewer takes part, the length, the spoken subscribe block, vivid colour). Where one of those
makes a rule here impossible, the owner's rule stays and the line "Rule N here" says what is kept. Follow it exactly.
Record in the film's `NOTES.md` how each numbered rule was met, one line each (the template has the 21 lines; ship bar
item 16; qa.py counts them). "Act" below is the core sheet's "chapter".

## A. Story (settle these before any code)

1. **Spine and last line first.** One sentence: "you think X, but Y, because Z", with what he wants in it. Write the
   button line and the final image before the scene table. If the spine needs "and" twice, it is two films: cut one.
   Rule 1 here: the last spoken block is the subscribe line (owner); the line written first is the button that calls
   back to the hook.
2. **Every act and every scene changes the situation.** A scene that only adds information is cut or folded into a
   picture (the scene table's "turn" column). Every act ends with the situation different from how it began, and shows
   in picture what is still open: the clock's next number, stamped or ticking toward it.
3. **The hook is a picture, not a sentence.** Frame 0 shows the conflict with the sound off, clear of the captions'
   band, and it is the picture the thumbnail promised. The question's own words are said within 3 s, the strongest
   word last; the promise by 0:08 (owner).
4. **The cold open flashes forward.** Inside the first 30 s, one flash of 1-1.5 s to each act's strongest picture (the
   real later shots, replayed from part-way in, never a made-up teaser), while he names the worst number that is
   coming. Plan them as `CAMERA["flash"]` (the cp skill's engine.md, "The flash-forward"). The viewer's first test has
   started by 0:08 (owner): a flash that falls while they are doing it plays in a window. The first test's surprising
   result is shown before it is explained.
5. **One running device with three beats** (set up, escalate, reverse), on screen, never only in the narration. Here it
   is the clock together with the film's motif (the film bar): the motif returns at the end of every act, changed, and
   its final state is the final image.
6. **The twist is held.** In each act the longest shot (5-6 s) is the one just before its turn; the longest of the film
   is the one before the last turn. Everything else is faster.
7. **Facts.** Every claim, spoken or on screen, has two independent sources in the README's claims table; a myth is
   said as a myth and stamped on screen; a death or an injury (the real case of act 2) is said plainly and is never
   the joke; a famous detail that is not in the sources is called out ("the records don't say that") instead of
   repeated. Every test the viewer does is safe (long-form.md, "The viewer takes part").

## B. Comedy and acting

8. **Each punchline has three parts:** the setup line, a beat (the music stops dead for 0.25 s or more), and a picture
   that pays it off within 6 frames of the punch word. A joke without its picture is cut (8-12 laugh beats stand).
9. **The reaction is the joke.** In every shot somebody or something reacts: his eyes, a lean, a dropped prop, a slow
   turn to camera, a second character with a beat of its own. Rule 9 here: Jessica stays performed and expressive
   (owner), but she never explains or laughs at the joke: he and the things round him do the comedy. The three
   wordless beats of the film bar are reactions.
10. **Never cruel.** The comedy is the situation and the body as a clumsy coworker, never fear, pain or a person's looks.

## C. Picture

11. **Rhythm.** Average shot 3 s or less; none over 6 s unless something on screen changes every second (a diagram
    being built, a count running: name those shots in NOTES.md). Never three shots in a row at the same size. At least
    one extreme close-up in every act (his eyes, a hand, the clock's digits). make_timeline.py prints the rhythm; a cut
    is a new SHOTS entry, or a cue named `cut_*` where the camera jumps inside a shot. Rule 11 here replaces
    long-form.md's "45-70 shots of 3-8 s": about 90 cuts in a 4:30 film.
12. **Every shot has a motivated camera move:** a push on a realisation, a whip at an act turn or a clock jump, a snap
    (punch-in) on a number or a punchline, a drift on a wait. No move without a reason. Rule 12 here: a planned
    wordless beat that carries a reveal may be locked off (the film bar).
13. **Colour stays vivid** (owner, 7 Nov). No shot is greyed, darkened or washed out for mood; the cold acts keep
    saturated blues and warm practical light. The every-second rule's "restrained frame" means fewer competing
    accents, never a paler picture. Measure every world and mood (HSV saturation and brightness of a still).
14. **Words on screen:** five at most in any one caption chunk, label, sign or bubble, and big. A number that is the
    point of a shot (the clock landing on its worst value) is the largest thing in that frame; the running clock stays
    in its corner. Everything that must be read sits above y 820 and inside the outer 90 px (captions in their band).
15. **The silent test.** The contact sheet alone, one still every 4 s with the captions off, must tell the story to
    someone who has not read the script (render with a copy of the timeline whose `captions` is empty: the cp skill's
    qa.md, "The silent test", every 120 frames). Write what each act's sheet says in three lines; where that is not
    the scene table, fix the picture, not the caption.

## D. Sound

16. **No wallpaper.** The score is keyed to the words: two dead stops or more in every act; the one theme of the film
    bar for him and a motif or instrument of its own for the obstacle and for any second character; a sound for every
    picture event; full silence before the last turn, then the biggest hit of the film.
17. Voice 12 dB or more over everything in the speech band in every section; -14 LUFS; -1 dBTP or lower; nothing
    clipped (qa.py).

## E. The ending and the package

18. **The film ends on the device's final state:** the motif's last form is the final image, held while the theme
    resolves. Then the next-video promise is one concrete picture: he is already in next week's question (not only the
    words of the `sub` block), with the pill over it.
19. **Title and cover words stand alone.** Someone who sees only the thumbnail knows what it is about and what happens:
    if the picture does not show the subject plainly, the words name it ("NO SLEEP: DAY 11", not "DAY 11"). The words
    still add to the title rather than repeat it, and the shelf test still picks the winner.

## F. Before calling it finished

20. **The swipe check, twice, act by act.** Read the timed script as a stranger and mark the second of each act where
    you would leave; rework that second. Once when make_timeline.py has printed the timings, once on the pre-render
    sheets. The last minute must be the strongest.
21. **Score the ship bar honestly.** Never rounded up. Rule 21 here: an item under 8 is fixed, not shipped with a note
    (owner: ship only above the bar). What nobody could check (nobody heard the mix; nobody watched the film at speed)
    is said in the first lines of the run's report.

If any part of the run is handed to a sub-agent, its brief names this file and the rules that apply to its part: a
sub-agent sees only what the brief names.
