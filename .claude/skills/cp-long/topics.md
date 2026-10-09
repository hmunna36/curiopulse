# CurioPulse long-form topic queue

`/cp-long next` takes the first `[ ]` topic from the top of the queue. An interrupted `[~]` topic is always resumed
first. Edit this file freely: reorder, add, remove, or change an angle. One line per video:

    - [ ] <Question, titled the way people type it> — demand: <median views, how many of 8 at a million, date checked> — <angle: the hiker's situation; the clock; act 1 / act 2 / act 3>      queued
    - [~] <Question> — <slug> — started <date>                                     in progress (the next run resumes it)
    - [x] <Question> — <slug> — <link, release day>                                done

A film is made only for a question that already draws millions (reference/long-form.md, "Which questions get made"):
`node bin/yt.mjs demand "<question>"` must show a median of 1,000,000 views or at least three of eight videos at a
million. The line says what the check found. A line marked "demand not checked" is checked before it is taken; one
that fails is rephrased once, else moved under "Not made" with its numbers.

Every topic also needs a clock (second by second, hour by hour, day by day), three acts on it (what you would feel,
what breaks and the proof, the edge and what is still unknown) AND a small human story for the hiker: what he wants,
and how the answer changes him (reference/long-form.md, "The film bar"). Check the claims in real sources before
writing: the angles below are leads, not facts.

## Queue

- [ ] What Happens When You Hold Your Breath? (Second by Second) — demand: median 4.1M (Peekaboo Kidz 4.7M, Veritasium 4.1M; a 2026 small channel reached 4.4K with "(Second by Second)"), checked 7 Oct 2026 — the clock: seconds — a pool dare; act 1: it's the CO2 alarm, not the missing oxygen; act 2: the diving reflex that slows your heart when your face hits cold water; act 3: how free divers go past 10 minutes, and why you should never test it alone
- [ ] What Happens If You Go to Space Without a Suit? (Second by Second) — demand: median 1.1M (Ridddle 4.2M, Peekaboo Kidz 3.3M, Infographics 1.1M), checked 7 Oct 2026 — the clock: seconds — the hiker steps out of an airlock by mistake; act 1: you don't explode or freeze instantly; act 2: about 15 seconds of consciousness, and the 1965 test-chamber accident; act 3: what actually gets you, and how long a rescue has
- [ ] Why does time slow down when you're scared? — demand not checked (a "why" question: likely a Short, not a film; check before taking, and look for its "what happens if you…" form first) — he slips on a banana peel in slow motion; act 1: the amygdala writes denser memories; act 2: the free-fall experiment with the wrist display; act 3: it's memory, not perception — and why holidays feel long and routine years vanish
- [ ] Why do songs get stuck in your head? — demand not checked (a "why" question: likely a Short, not a film; check before taking, and look for its "what happens if you…" form first) — a jingle follows him everywhere; act 1: the phonological loop replaying; act 2: what earworm songs share (tempo, simple contour, one odd leap); act 3: the cures that were tested (chewing gum, finishing the song) and why your brain does it at all (hedged)
- [ ] Why do we get dizzy when we spin? — demand not checked (a "why" question: likely a Short, not a film; check before taking, and look for its "what happens if you…" form first) — an office chair; act 1: three fluid loops in the inner ear; act 2: the fluid keeps moving after you stop, so the eyes flick; act 3: why dancers and skaters don't fall over, and why astronauts get it worst
- [ ] How does your body know what time it is? — demand not checked (a "why" question: likely a Short, not a film; check before taking, and look for its "what happens if you…" form first) — jet lag ruins his trip; act 1: the clock behind your eyes and the light that sets it; act 2: the cave experiment where people drifted off the 24-hour day; act 3: every organ has its own clock, and why night owls are real
- [ ] Why can't you remember being a baby? — demand not checked (a "why" question: likely a Short, not a film; check before taking, and look for its "what happens if you…" form first) — he looks at a baby photo, blank; act 1: memories were made, then lost; act 2: the brain region still under construction, and new neurons overwriting; act 3: the false first memories most people swear by
- [ ] Why do we laugh? — demand not checked (a "why" question: likely a Short, not a film; check before taking, and look for its "what happens if you…" form first) — he gets the giggles at the worst moment; act 1: laughter is older than speech (apes pant-laugh, rats chirp); act 2: we laugh 30 times more with others, mostly not at jokes; act 3: why it's contagious and what it signals (hedged)
- [ ] Why is yawning contagious — demand not checked (a "why" question: likely a Short, not a film; check before taking, and look for its "what happens if you…" form first) — the full story — a callback to the Short; act 1: what a yawn does; act 2: the brain-cooling experiments; act 3: empathy, dogs catching human yawns, and what still doesn't add up

## Done
- [x] What Happens If You NEVER Sleep? (Day by Day) — never-sleep — https://youtu.be/GvZX6Yq81P4, scheduled for Sunday 11 Oct 2026 17:30 IST (made 9 Oct 2026)
- [x] Why can't you tickle yourself? — tickle-yourself — https://youtu.be/RXYD9zslO1g, public since 4 Oct 2026 18:30 IST (made 4 Oct 2026; the user released it early)

## Not made (failed the demand check)
- Why Do We Cry? (asked for by the user on 9 Oct 2026) — the morning check on 9 Oct found 3 of 8 at a million, but the routine's check later that day found 2 of 8 on both wordings: "why do we cry" median 363,400, 2 of 8 (Peekaboo Kidz 8.7M, AumSum 4.7M; the AumSum 1.8M video no longer ranks) and "why do humans cry" median 363,400, 2 of 8. It sits right at the line: re-check it before the next run takes the queue, or the user can say to make it anyway. The plan for it (one cry, second by second; the hiker at a sad film beside someone he wants to impress) is kept here: act 1 what you feel and the three kinds of tears (the onion Short is the callback), act 2 the feeling brain opens the tap, babies cry for weeks before their first tear, the tear-erased faces (Provine 2009), act 3 does a good cry help (it depends who is there), the unproven stress-flush idea, the sniffed-tears studies; he stops fighting it and gets handed a tissue.
- Why can't you tickle yourself? was made before the check existed: every 4–20 min video with that title has 5–240 views (median 32, checked 7 Oct 2026); the film got 588 thumbnail impressions, 1.5 % clicks and about six viewers in three days.
