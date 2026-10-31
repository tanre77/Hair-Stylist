# Translations

English is the source of truth for Hair Stylist documentation. The files named `README.<lang>.md` are machine-assisted translations. If a translation and `README.md` disagree, follow `README.md`.

## What is translated

On this branch the only user-facing product document is the root README. Each translation sits next to it:

| Language | File |
| --- | --- |
| English (source) | [README.md](../README.md) |
| Spanish | [README.es.md](../README.es.md) |
| French | [README.fr.md](../README.fr.md) |
| German | [README.de.md](../README.de.md) |
| Portuguese (Brazil) | [README.pt-BR.md](../README.pt-BR.md) |
| Italian | [README.it.md](../README.it.md) |
| Chinese (Simplified) | [README.zh-CN.md](../README.zh-CN.md) |
| Chinese (Traditional) | [README.zh-TW.md](../README.zh-TW.md) |
| Japanese | [README.ja.md](../README.ja.md) |
| Korean | [README.ko.md](../README.ko.md) |
| Arabic | [README.ar.md](../README.ar.md) |
| Hindi | [README.hi.md](../README.hi.md) |
| Russian | [README.ru.md](../README.ru.md) |
| Vietnamese | [README.vi.md](../README.vi.md) |
| Turkish | [README.tr.md](../README.tr.md) |
| Indonesian | [README.id.md](../README.id.md) |
| Polish | [README.pl.md](../README.pl.md) |
| Dutch | [README.nl.md](../README.nl.md) |
| Ukrainian | [README.uk.md](../README.uk.md) |
| Filipino | [README.fil.md](../README.fil.md) |
| Swahili | [README.sw.md](../README.sw.md) |

There is no separate guides or `docs/` manual to translate. This file is the maintainer note for the set above.

## When English changes

1. Edit [README.md](../README.md) first. Do not treat a translation as the place to change product behavior or wording.
2. Update every `README.<lang>.md` in the table so it still says the same thing as the English file.
3. Keep the short machine-assisted note at the top of each translation, in that language. It must say that the translation is machine-assisted and that English is authoritative. Do not add that note to `README.md`.
4. Keep the language line near the top of `README.md` and every translation. It must link every file in the table. Use a same-folder relative link (`README.fr.md`), not a URL. Bold only the current language, as `**[Français](README.fr.md)**`. Do not wrap the whole line in bold — a second `**` pair will mark the rest of the line as bold.
5. Leave these untranslated so they stay accurate and clickable:
   - code blocks, commands, file paths, and URLs
   - badges, if any are added later
   - product and platform names: Hair Stylist, Venmo, Apple Pay, Payment Request, Visits, iPhone, Android
   - place names used to find the sample shops: Powell, Columbus, Ohio
6. From a translated file, relative links must still resolve. These READMEs live in the repository root, next to `README.md`, so a link written `README.md` or `docs/TRANSLATIONS.md` is correct in every README. From this file, the same targets are `../README.md` and `TRANSLATIONS.md`.
7. Arabic only: keep the prose inside `<div dir="rtl" lang="ar">`. Put Latin names inside `<span dir="ltr">...</span>`. Leave the language line outside that div so the links stay left to right. The line should start with a left-to-right mark (U+200E) so the Arabic label does not reverse the links.

## What to leave untranslated

- Application source, in-app strings, and code comments.
- `AGENTS.md` and `AGENTS.project.md`. Those are instructions for the coding agent, not product documentation.
- License text and legal or privacy documents. Link to the English original instead of translating them. This repository does not currently include those files.
- Wording that exists only on another branch. Translate the default branch.

## Adding a language

1. Copy `README.md` to `README.<language>.md`, using a tag such as `es` or `pt-BR`.
2. Translate the prose. Keep the items in the list above unchanged, and add the machine-assisted note.
3. Add the language to the switcher line in `README.md` and in every translation, using the language's own name.
4. Add a row to the table in this file.
