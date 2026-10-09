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

- [ ] Why Do We Cry? — demand: 3 of 8 at a million for "why do we cry" (Peekaboo Kidz 8.7M, AumSum 4.7M and 1.8M; median 363K), checked 9 Oct 2026: it qualifies on the three-at-a-million rule. "What happens when you cry" does not (2 of 8), so keep the "why" title; newer videos on "people who cry easily" reach 0.5–1.6M (a lead for act 3) — ASKED FOR BY THE USER on 9 Oct 2026 ("i need 1 short and 1 long form video for this"): make it next, ahead of the rest of the queue. A Short on the same question is first in the Shorts queue for the same day, so the film goes far beyond it and repeats none of its gags — the clock: one cry, second by second (the trigger, the lump in the throat, the eyes filling, the spill and the runny nose, the sob, the calm after) — the hiker's story: at a sad film beside someone he wants to impress, he fights it; act 1: what you feel, and the three kinds of tears (the onion Short is the callback: those are eye-wash tears); act 2: tears of feeling are different: the feeling brain opens the tap, babies cry for weeks before their first tear, the same sad face with its tears erased looks less sad and gets less help (the proof), and as far as we know only humans do it; act 3: the edge: does a good cry help (it seems to depend on who is there), the unproven "it flushes out stress chemicals" idea, the small studies where sniffing tears changed other people, why some people cry easily; he stops fighting it, and gets handed a tissue
- [ ] What Happens If You Never Sleep? (Day by Day) — demand: median 1.8M for "what happens if you never sleep" (5 of 8 at a million; TED-Ed 15M, Peekaboo Kidz 12.5M, Insider 7M), checked 7 Oct 2026 — the clock: hours awake, then days — an all-nighter that keeps going; act 1: day one, adenosine and microsleeps; act 2: the 1964 schoolboy who stayed awake 11 days; act 3: why record books stopped accepting attempts, and what sleep seems to be FOR (the brain's rinse cycle, hedged)
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
- [x] Why can't you tickle yourself? — tickle-yourself — https://youtu.be/RXYD9zslO1g, public since 4 Oct 2026 18:30 IST (made 4 Oct 2026; the user released it early)

## Not made (failed the demand check)
- Why can't you tickle yourself? was made before the check existed: every 4–20 min video with that title has 5–240 views (median 32, checked 7 Oct 2026); the film got 588 thumbnail impressions, 1.5 % clicks and about six viewers in three days.
