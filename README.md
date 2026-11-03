# OpenFilm Library

The sounds, music, transitions, effects, filters, stickers, text and templates [OpenFilm](https://github.com/openfilm/openfilm)
offers in every film: made by OpenFilm and its community, free to use in any film, commercial or not.

Everything here is dedicated to the public domain under [CC0 1.0](LICENSE): use it, change it, sell films made with it,
with no need to credit anyone. Each item says where it comes from (`source` in its `item.json`).

## Using it

OpenFilm and Studio already have it: the library in Studio, and `openfilm get sfx-search`, `music-search`,
`transition` and the rest for your agent. Nothing to install, no account.

## The layout

One folder per item, under the folder of its category:

```
<category>/<name>/
  item.json      what it is: names in five languages, about, tags, source, license, its files
  poster.jpg     a still (for what is seen)
  preview.mp4    a few seconds of it (transitions, effects, templates)
  …              its own files: a page's HTML, CSS and JS
```

Categories: `sound`, `music`, `transition`, `effect`, `filter`, `sticker`, `text`, `template`. What `item.json` holds
is in [schema/item.schema.json](schema/item.schema.json).

Files in git are the small ones: text, code, stills and short previews. A sound, a music track or a template's own
footage is listed in `files` with its size and sha256, and kept by OpenFilm's storage under that sha256, where
OpenFilm downloads it the first time it is used.

A template uses other items by their id (`"uses": ["music/morning-piano"]`) rather than carrying copies of them.

## Adding to it

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: anything you made yourself, or made with a tool whose terms give
you the rights to use it commercially, released under CC0.

```sh
node scripts/check.mjs            # every item
node scripts/check.mjs sound/rain # one
```
