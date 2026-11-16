# Direction for the daily Short (CurioPulse)

Since 16 Nov 2026 (owner: add the direction sheet to every channel's daily and weekly runs, after a blind test of it on
another channel). Fitted from the all-channel core sheet. It sits on top of `story.md`, `visual.md`, `sound.md` and
`qa.md`: where they differ from this sheet, this sheet wins, except the owner's standing rules (SKILL.md: the rules of
15 Oct, 24 Oct and 5 Nov, the non-negotiables). Where one of those makes a rule here impossible, the owner's rule stays
and the line "Rule N here" says what is kept. Follow it exactly. Record in the video's `NOTES.md` how each numbered
rule was met, one line each (the template has the 21 lines; ship bar item 12; qa.py counts them).

## A. Story (settle these before any code)

1. **Spine and last line first.** One sentence: "you think X, but Y, because Z" (a test: "you think you can lift that
   finger, but it stays down, because one cord ties it to its neighbour"). Write the button line before the rest: it is
   the line the viewer repeats to a friend. If the spine needs "and" twice, it is two Shorts: cut one.
2. **Every beat changes the situation** (test, answer, mechanism, payoff, the weirdest fact, button). A beat that only
   adds information is cut or folded into a picture.
3. **The hook is a picture, not a sentence.** Frame 0 shows the conflict with the sound off, inside the key zone, and
   the strange result is said within 3 s, its strongest word last. Rule 3 here: frame 0 stays the tight shot of him
   already doing the test (owner, 7 and 15 Oct), so the two things in opposition are in that one shot: his hand and
   what it will not do (a CURIOUS Short: him and the impossible thing, close). No wide shot, no establishing shot.
4. **A flash-forward.** Between 4 and 7 s the picture shows, for 0.5-0.8 s, the payoff's own moment (the real later
   shot, replayed from part-way in), unexplained, then goes back: the viewer must want to know how we get there. Plan
   it as `CAMERA["flash"]` (engine.md, "The flash-forward"); it sits in a gap of the narration, never on the answer's
   punch word. Rule 4 here: the test stays on screen through 13 s (owner, 24 Oct), so in a TEST Short the flash plays
   in a window over the test shot, never as a cut away; in a CURIOUS Short it may fill the frame. The test's own
   surprising result is already the hook (owner, 15 Oct: by 3 s); this flash is the later twist.
5. **One running device with three beats** (set up, escalate, reverse), on screen as a prop, a counter or a second
   character, never only in the narration: his tally of failed tries, the frog that watches, the flamingo that sleeps
   through it. Its third beat lands on the payoff or the button, and it is back as on frame 0 when the picture cuts
   back for the loop.
6. **The twist is held.** The longest shot of the Short (about 3 s, never over 3.2) is the one just before the payoff's
   sting. Everything else is faster. Nothing is held after the last line (owner, 5 Nov).
7. **Facts.** Every claim, spoken or on screen, has two independent sources in the README's claims table; a myth is
   said as a myth and stamped on screen (`stamp`, `bigX`); an injury is said plainly and is never the joke; a famous
   detail that is not in the sources is called out ("nobody has measured that") instead of repeated. Never a test that
   could hurt (story.md §2).

## B. Comedy and acting

8. **Each punchline has three parts:** the setup line, a beat (the music stops dead for 0.25 s or more), and a picture
   that pays it off within 6 frames of the punch word (its sound just after the word, sound.md). A joke without its
   picture is cut.
9. **The reaction is the joke.** In every shot somebody or something reacts: his eyes, a lean, a dropped prop, a slow
   turn to camera, and where the place allows a second character with one acting beat of its own (visual.md, "The
   world kit"). Rule 9 here: Jessica stays performed and expressive (owner: never "reading a book"), but she never
   explains or laughs at the joke: he and the things round him do the comedy. Before 12 s he reacts inside the moving
   shot in under half a second (story.md §2).
10. **Never cruel.** The comedy is the situation and the body as a clumsy coworker, never fear, pain or a person's looks.

## C. Picture

11. **Rhythm.** Average shot 2.2 s or less, none over 3.2 s (make_timeline.py prints it; a cut is a new SHOTS entry, or
    a cue named `cut_*` where the camera jumps inside a shot). Never three shots in a row at the same size (wide,
    medium, close alternate). At least two extreme close-ups: his eyes and mouth, the hand doing the test. Up to 13 s
    every cut is another framing of the same test (owner, 24 Oct).
12. **Every shot has a motivated camera move** from the cinema kit: a push on a realisation, a whip at a story turn, a
    snap (punch-in) on a number or a punchline, a drift on a wait. No locked-off shot, no move without a reason.
13. **Colour stays vivid** (owner, 7 Nov). No shot is greyed, darkened or washed out for mood; night keeps saturated
    blues and warm practical light. Measure a new place or mood (visual.md, "The world kit", the colour check).
14. **Words on screen:** five at most in any one caption chunk, label, sign or bubble, and big; a number is the largest
    thing in its frame; everything that must be read sits inside the key zone (x 100-980 for y 400-1000, x 100-870 for
    y 1000-1640).
15. **The silent test.** The contact sheet alone, one still every 1.5 s with the captions off (qa.md, "The silent
    test"), must tell the story to someone who has not read the script. Write what it says in three lines; where that
    is not the spine, fix the picture, not the caption.

## D. Sound

16. **No wallpaper.** The score is keyed to the words: four dead stops or more (the answer's punchline, before the
    payoff, the button, one more); one instrument or motif for him and one for the second character or the idea; a
    sound for every picture event; full silence before the payoff, then the biggest hit of the Short. The loop score
    (sound.md) keeps the bar line on the loop while it stops and starts.
17. Voice 12 dB or more over everything in the speech band in every shot; -14 LUFS; -1 dBTP or lower; nothing clipped
    (qa.py).

## E. The loop and the package

18. **The loop.** The button's last words run into the hook's first words, and the last frame equals frame 0. Rule 18
    here: the last spoken line is the button, never a question (owner, 5 Nov: the sting, or one short line that sends
    them back to the test; nothing after it); the one-word question stays in the caption, the description and the
    comment (owner, 15 Oct).
19. **Title and cover words stand alone.** Someone who sees only the cover knows what it is about and what happens:
    the test or the claim in two or three big words with him doing it ("LIFT THIS FINGER", "OLDER THAN TREES"), never a
    riddle that needs the title ("WAIT, WHAT?").

## F. Before calling it finished

20. **The swipe check, twice.** Read the timed script as a stranger and mark the second where you would leave; rework
    that second. Once when make_timeline.py has printed the timings, once on the sweep before the full render.
21. **Score the ship bar honestly.** Never rounded up. Rule 21 here: an item under 8 is fixed, not shipped with a note
    (owner: ship only above the bar; a hard blocker means no weaker upload). What nobody could check (nobody heard the
    mix; nobody watched it at speed on a phone) is said in the first lines of the final report.

If any part of the run is handed to a sub-agent, its brief names this file and the rules that apply to its part: a
sub-agent sees only what the brief names.
