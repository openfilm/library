#!/usr/bin/env node
// @ts-check
/**
 * Checks the library's items as a pull request must pass them (CONTRIBUTING.md): each folder `<category>/<name>/`
 * with an item.json of schema/item.schema.json's shape, under CC0 with its source said, its files listed and in their
 * sizes, its pages loading nothing from the network. Says every problem it finds, and exits 1 when there is one.
 *
 *   node scripts/check.mjs                    every item
 *   node scripts/check.mjs sound/rain …       those
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATS = ['sound', 'music', 'transition', 'effect', 'filter', 'sticker', 'text', 'template'];
const LANGS = ['en', 'zh-CN', 'ja', 'ko', 'es'];
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MB = 1024 * 1024;
/** The most a file may be, by category and kind of file; a template's own files together. */
const MAX = { sound: 2 * MB, music: 8 * MB, preview: 2 * MB, file: 2 * MB, template: 20 * MB };
/** The AI tools whose outputs are accepted (CONTRIBUTING.md): a source's `tool` starts with one of these. */
const AI_TOOLS = ['ElevenLabs'];
/** What a page may not do: load from the network, or run what it did not bring. */
const UNSAFE = [
  [/\b(?:https?:)?\/\/(?!www\.w3\.org\/)[a-z0-9.-]+\.[a-z]{2,}/i, 'loads from the network'],
  [/\b(?:eval|Function)\s*\(/, 'runs code it makes'],
  [/\bimport\s*\(/, 'imports code at run time'],
  [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/, 'talks to the network'],
];

/** The items asked for, else every one: `<category>/<name>`. */
function itemsAsked() {
  const asked = process.argv.slice(2).map((a) => a.replace(/\/+$/, ''));
  if (asked.length) return asked;
  return CATS.filter((c) => existsSync(join(ROOT, c))).flatMap((c) => readdirSync(join(ROOT, c), { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => `${c}/${d.name}`));
}

/** What is wrong with one item: a sentence each. @param {string} id */
export function problemsOf(id) {
  const problems = [];
  const say = (/** @type {string} */ text) => problems.push(text);
  const [cat, name, ...more] = id.split('/');
  if (!CATS.includes(cat) || !name || more.length) return [`${id}: an item is a folder <category>/<name>, the category one of ${CATS.join(', ')}`];
  if (!NAME.test(name)) say('its folder\'s name: lowercase letters, digits and single hyphens');
  const dir = join(ROOT, cat, name);
  /** @type {any} */
  let item;
  try { item = JSON.parse(readFileSync(join(dir, 'item.json'), 'utf8')); } catch (e) {
    return [...problems, `item.json is missing or is not JSON (${/** @type {Error} */ (e).message})`].map((p) => `${id}: ${p}`);
  }
  const known = ['cat', 'name', 'about', 'tags', 'group', 'by', 'license', 'source', 'version', 'files', 'main', 'uses', 'durationMs', 'place', 'energy', 'bpm', 'loop'];
  for (const k of Object.keys(item)) if (!known.includes(k)) say(`item.json has ${k}, which is not part of an item`);
  if (item.cat !== cat) say(`cat is ${JSON.stringify(item.cat)}, not the folder's ${cat}`);
  for (const lang of LANGS) {
    const n = item.name?.[lang];
    if (typeof n !== 'string' || !n.trim() || n.length > 60) say(`name.${lang}: a name of 1 to 60 characters`);
  }
  if (typeof item.about !== 'string' || item.about.length < 10 || item.about.length > 300) say('about: one or two sentences in English, 10 to 300 characters');
  if (!Array.isArray(item.tags) || !item.tags.length || item.tags.length > 12 || !item.tags.every((t) => typeof t === 'string' && /^[a-z0-9-]+$/.test(t))) {
    say('tags: 1 to 12, each lowercase letters, digits and hyphens');
  }
  if (item.license !== 'CC0-1.0') say('license: CC0-1.0, the only license the library takes');
  const s = item.source;
  if (s?.kind === 'own') { if (Object.keys(s).length !== 1) say('source: { "kind": "own" } and nothing else'); }
  else if (s?.kind === 'ai') {
    if (typeof s.tool !== 'string' || !AI_TOOLS.some((t) => s.tool.startsWith(t))) say(`source.tool: one of the AI tools accepted (${AI_TOOLS.join(', ')}); see CONTRIBUTING.md`);
    if (typeof s.plan !== 'string' || !s.plan.trim() || /\bfree\b/i.test(s.plan)) say('source.plan: the paid plan it was made on');
  } else if (s?.kind === 'cc0') {
    if (typeof s.url !== 'string' || !s.url.startsWith('https://')) say('source.url: the https address it was published at under CC0');
  } else say('source: { "kind": "own" }, { "kind": "ai", "tool", "plan" } or { "kind": "cc0", "url" }');
  if (!Number.isInteger(item.version) || item.version < 1) say('version: a whole number from 1');

  /* its files: each listed, here in the folder or kept by its sha256, in its size */
  const files = Array.isArray(item.files) ? item.files : [];
  if (!files.length) say('files: what it is made of');
  const here = readdirSync(dir).filter((f) => f !== 'item.json' && !f.startsWith('.'));
  let own = 0;
  for (const f of files) {
    if (typeof f?.path !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(f.path)) { say(`files: ${JSON.stringify(f?.path)} is not a file's name`); continue; }
    if (!Number.isInteger(f.bytes) || f.bytes < 1) { say(`files: ${f.path} needs its size in bytes`); continue; }
    if (f.sha256 !== undefined) {
      if (!/^[0-9a-f]{64}$/.test(f.sha256)) say(`files: ${f.path}'s sha256 is 64 hexadecimal digits`);
      if (here.includes(f.path)) say(`files: ${f.path} is kept by its sha256, so it is not in the folder`);
    } else if (!here.includes(f.path)) say(`files: ${f.path} is not in the folder (a large file is listed with its sha256)`);
    else if (statSync(join(dir, f.path)).size !== f.bytes) say(`files: ${f.path} is ${statSync(join(dir, f.path)).size} bytes, not ${f.bytes}`);
    own += f.bytes;
    const audio = /\.(m4a|mp3)$/.test(f.path);
    const most = f.path === 'preview.mp4' ? MAX.preview : audio && (cat === 'sound' || cat === 'music') ? MAX[cat] : cat === 'template' ? MAX.template : MAX.file;
    if (f.bytes > most) say(`files: ${f.path} is ${(f.bytes / MB).toFixed(1)} MB; at most ${most / MB} MB`);
  }
  for (const f of here) if (!files.some((x) => x?.path === f)) say(`${f} is in the folder but not in files`);
  if (cat === 'template' && own > MAX.template) say(`its own files are ${(own / MB).toFixed(1)} MB together; at most ${MAX.template / MB} MB`);
  if (item.main !== undefined && !files.some((f) => f?.path === item.main)) say(`main: ${item.main} is not one of its files`);
  for (const u of item.uses ?? []) if (typeof u !== 'string' || !existsSync(join(ROOT, u, 'item.json'))) say(`uses: ${u} is not an item of the library`);
  for (const [k, lo, hi] of /** @type {[string, number, number][]} */ ([['energy', 1, 5], ['bpm', 30, 300], ['durationMs', 1, 3_600_000]])) {
    if (item[k] !== undefined && !(Number.isInteger(item[k]) && item[k] >= lo && item[k] <= hi)) say(`${k}: a whole number from ${lo} to ${hi}`);
  }

  /* its pages: nothing from the network, nothing run that it did not bring */
  for (const f of here.filter((p) => /\.(html|css|js|mjs|svg)$/.test(p))) {
    const text = readFileSync(join(dir, f), 'utf8');
    for (const [pattern, what] of UNSAFE) if (pattern.test(text)) say(`${f} ${what}: a page plays in a sandbox, with only what it brings`);
  }
  return problems.map((p) => `${id}: ${p}`);
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') {
  const ids = itemsAsked();
  const problems = ids.flatMap(problemsOf);
  for (const p of problems) console.error(p);
  console.log(problems.length ? `${problems.length} problem(s) in ${ids.length} item(s)` : `${ids.length} item(s), all as they should be`);
  process.exitCode = problems.length ? 1 : 0;
}
