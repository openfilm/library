# Contributing to the OpenFilm Library

Thank you for adding to the library. Every item here must be usable by anyone in any film, commercial or not, with
no credit and no payment. That is the one rule, and everything below follows from it.

## What can be added

- **Released under CC0 1.0.** `"license": "CC0-1.0"` in `item.json`, for code as well as media. No other license is
  accepted, including licenses that ask for credit (CC BY) or forbid resale ("free for commercial use" stock sites).
- **With its source said** (`"source"` in `item.json`):
  - `{ "kind": "own" }`: you recorded, filmed, drew, composed or wrote it yourself.
  - `{ "kind": "ai", "tool": "<tool and model>", "plan": "<your plan>" }`: you made it with an AI tool whose terms
    give you, on that plan, ownership of the output and the right to use it commercially. The tools accepted are
    listed below; outputs of free plans are not accepted.
  - `{ "kind": "cc0", "url": "<where it was published>" }`: someone else's work, published under CC0 1.0 at that
    address. The check keeps a copy of that page as it was.
- **Nothing of anyone else's inside it**: no samples, melodies, lyrics, logos, trademarks, recognizable faces or
  voices of real people, or footage of private places, unless they are yours or under CC0 themselves.
- **Not registered anywhere**: no item may be registered with YouTube Content ID or any similar system, by you or
  anyone. A registered item would claim the films of everyone who used it.

### AI tools accepted

The list is kept by the maintainers from each tool's current terms. Ask in an issue to add one.

| Tool | Plans accepted |
| --- | --- |
| ElevenLabs (sound effects, music) | paid plans |

## What it must be

- One folder per item, `<category>/<name>/`, with an `item.json` that follows [schema/item.schema.json](schema/item.schema.json):
  a name in English, Simplified Chinese, Japanese, Korean and Spanish, a sentence about it, tags.
- Sizes: a sound at most 2 MB, a music track at most 8 MB, a preview at most 2 MB and 10 seconds, a template's own
  files at most 20 MB (what it `uses` from the library does not count).
- Audio in M4A (AAC) or MP3, loudness about −16 LUFS, no silence at either end.
- Pages (transitions, effects, text, templates) are HTML, CSS and JavaScript that load nothing from the network and
  run nothing they did not bring: they play in a sandbox.

`node scripts/check.mjs <category>/<name>` checks all of this before you open a pull request; the same check runs on it.

## How

1. Add your folder. Large files (sound, music, footage) are uploaded with `openfilm library upload <file>`, which
   prints the `sha256` and `bytes` to list in `files`; small ones (text, code, stills, previews) go in the folder.
2. Run the check.
3. Open a pull request and tick the statements in its template.

A maintainer reviews what the check cannot see: that it is fit for films, named and tagged well, and yours to give.
Once merged, it reaches every OpenFilm within minutes.

## Taking something down

If you believe an item here is yours and was added without your consent, open an issue with the item's id. It is
taken out of the library while it is looked into; films already made with it are not affected.
