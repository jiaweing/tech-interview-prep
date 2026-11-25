# Topic format for "Explained"

Audience: someone who is **rusty**. They studied this once and forgot it, and dense cheatsheets lose them.
Each topic explains ONE idea from zero, like a friendly 3-minute video: plain words, one concrete example
that the animation walks through, then the code. No jargon without saying what it means. No other programming
language than Python is ever mentioned.

One file per topic: `topics/<track>/<id>.json`, UTF-8, written with `json.dump(obj, f, indent=1, ensure_ascii=False)`.

```json
{
 "id": "hash-map",                  // kebab-case, unique across all tracks
 "track": "ds",                     // py | ds | algo | sd
 "order": 4,                        // position in its track's learning path (1 = learn first)
 "title": "Hash map",               // <= 32 chars
 "short": "Find anything by its name in one step.",   // <= 70 chars, what it does for you
 "what": "2-3 short sentences: what it is, in plain words.",
 "analogy": "1-2 sentences, a real-world picture (a coat check, a phone book...).",
 "viz": { "kind": "map", "frames": [ { ...state..., "say": "one sentence: what happens in this step" } ] },
 "when": ["3-5 signals that this is the tool, phrased like words in a question"],
 "python": "<= 15 lines, runnable as-is, standard library only, prints its results",
 "output": "exactly what python prints (the validator runs the code and compares)",
 "cost": [["Look up a key", "O(1)"], ["Insert", "O(1)"]],
 "watch": ["1-3 common mistakes, each one short sentence"],
 "interview": ["1-3 classic problems, e.g. 'LC 1 Two Sum'"],
 "related": ["other topic ids"]
}
```

## Animation (`viz`)

4-9 frames. Frame 1 sets the scene, the middle frames show the work one step at a time, the last frame shows the
result. Every frame has `say` (<= 140 chars): read together, the `say` lines tell the whole story. Use the
highlight lists to show what changes: `hi` (looking at now, accent colour), `ok` (done / found, green),
`bad` (rejected / conflict, red), `dim` (out of play). Optional on every frame: `label` (short caption, top left),
`out` (short result text, bottom right, e.g. "best = 3").

| kind | frame fields |
|---|---|
| `array` | `cells` (list of values, <= 12), `noIdx` (true hides the index numbers), `hi` `ok` `bad` `dim` (indexes), `ptr` ({"L": 0, "R": 5}, name -> index), `band` ([start, end] dashed window) |
| `map` | `rows` ([[key, value], ...] <= 7 rows), `heads` (["request", "response"] renames the two headers), `hi` `ok` `bad` `dim` (row indexes) |
| `stack` | `items` (bottom -> top, <= 7), `hi` `ok` `bad` `dim` (indexes) |
| `queue` | `items` (front -> back, <= 9), `hi` `ok` `bad` `dim` |
| `list` | `nodes` (values, <= 7), `hi` `ok` `bad` `dim`, `ptr` (name -> index), `dir` (one per link: "f" forward, "b" reversed, "x" no link), `cycleTo` (index the last node points back to), `noNull` (true hides the trailing None) |
| `tree` | `nodes` (level-order list with null for gaps, <= 15), `hi` `ok` `bad` `dim` (indexes), `edge` (child indexes whose edge to the parent is highlighted), `tag` (index -> short text shown beside the node) |
| `graph` | `nodes` ([{"id": "A", "x": 0-100, "y": 0-100, "label"?}], <= 8), `edges` ([["A", "B", weight?]]), `directed` (bool), `hi` `ok` `bad` `dim` (node ids), `edgeHi` ([["A", "B"]]), `dist` (id -> text under the node) |
| `grid` | `cells` (rows of values, <= 8 x 8), `hi` `ok` `bad` `dim` ([[r, c]]), `vals` (same shape, numbers drawn instead of cells, null = keep), `wall` (true: cells "#" or 1 draw as walls) |
| `table` | `cells` (rows of values, null = empty, <= 9 x 10), `rows`/`cols` (header labels), `hi` `ok` `bad` `dim` ([[r, c]]) |
| `bars` | `vals` (numbers, <= 12), `hi` `ok` `bad` `dim` (indexes), `swap` ([i, j]) |
| `sd` | `nodes` ([{"id", "label" (<= 14 chars), "sub"? (<= 18 chars), "x": 0-100, "y": 0-100}], <= 8), `edges` ([["a", "b", "label"?, "async" or "down"?]]: "down" draws a red dashed broken link), `hi` `ok` `bad` `dim` (ids), `edgeHi` ([["a", "b"]]) |

Layout tips: `graph`/`sd` coordinates are percentages of the drawing area; keep nodes >= 20 apart on x or y so
boxes don't overlap (`sd` boxes are wide: >= 24 apart on x when on the same row). Values are short (<= 6 chars in
cells, <= 14 in map rows).

## Voice

- Plain, direct, warm. Second person. Short sentences. Explain why, with the example's real numbers.
- No marketing words, no emoji, no em-dash chains, no "simply"/"just"/"obviously".
- `cost` uses plain row names ("Add to the end", "Find the smallest") and Big-O.

## Check

`node validate.js topics/<track>/<id>.json` must print OK (it checks the schema, renders every frame, and runs the
Python and compares its output).
