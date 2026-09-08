# Tipsy Taboo — card spec

A card is one JSON object:

    {"w": "Elephant", "t": ["Trunk", "Grey", "Tusk", "Africa", "Big"]}

- `w`  the target word or phrase the clue-giver must get their team to say. Title Case. 1–4 words.
- `t`  EXACTLY five taboo words the clue-giver may NOT say. Title Case. Each 1–3 words.

Hard rules (a validator rejects the card otherwise):
1. Exactly 5 taboo entries, all different from each other (case-insensitive).
2. No taboo entry may contain the target word, any word of the target, or a 4+ letter
   stem of it (e.g. target "Swimming" → "Swim", "Swimmer" are NOT allowed as taboo).
   The reverse holds too: the target may not contain a taboo word.
3. Characters allowed: letters, digits, spaces, apostrophe, hyphen, ampersand, period.
   No emoji, no quotes inside strings, no parentheses.
4. No duplicate targets within a file (case-insensitive). Different spellings of the same
   thing count as duplicates.
5. Family-friendly: no slurs, no sexual content, no drugs, nothing hateful. "Beer", "Hangover",
   "Wine" etc. are fine outside KIDS.

Quality rules (this is what makes a card fun):
- The five taboo words are the FIVE MOST OBVIOUS clues someone would reach for first.
  Think: "if I had to describe this in one breath, which words come out?" Ban those.
- Leave the card WINNABLE: after banning the top five, a creative route must remain.
- Mix taboo types: a synonym, a category, a defining feature, a famous association, a rhyme
  or word-part if very obvious. Never pad with weak or random words.
- Targets should be things a whole table can shout out — recognisable, not trivia.
- No two cards in your batch should be near-duplicates (e.g. "Cup" and "Mug" are OK;
  "Cell Phone" and "Mobile Phone" are not).
