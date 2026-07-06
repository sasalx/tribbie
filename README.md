# Tribbie

Tribbie is a weighted scoring tool for anime and manga. Search a title on AniList, rate it across multiple dimensions (each with its own weight and genre-based multiplier), and Tribbie computes a single final score out of 10 — with a full breakdown of how it got there. The result can be sent straight to AniList as notes on your entry.

## Features

- **Search** — look up anime or manga via the AniList API.
- **Weighted rating** — score a title across multiple dimensions, with per-dimension weights and genre multipliers (primary/secondary genre blending), or skip dimensions you don't care about.
- **Score breakdown** — see exactly how the final score was derived: base weight, genre multiplier, effective weight, and contribution per dimension.
- **AniList sync** — publish the final score and a detailed notes breakdown back to your AniList entry.
- **History** — revisit past ratings.
- **i18n-ready** — UI strings are managed through vue-i18n.

## Tech stack

- [Vue 3](https://vuejs.org/) + TypeScript
- [Vite](https://vitejs.dev/) with file-based routing (`unplugin-vue-router`) and auto-imports
- [Naive UI](https://www.naiveui.com/) component library
- [UnoCSS](https://unocss.dev/) for styling
- [vue-i18n](https://vue-i18n.intlify.dev/) for localization

## Getting started

```bash
pnpm install
pnpm dev
```

Create a `.env` file in the project root with the API base URL Tribbie should talk to:

```
VITE_API_BASE_URL=
```

## What I Learned

- It is never a good idea to use an opinionated eslint rules of someone else. Some of the rules are really baffling antfu.
- Naive UI is solid and helps a lot to build an app. That said, just like any other ui lib, it is better to start from zero if you value flexibility over speed.
- Tailwind or in my case UnoCSS is not helpful in a solo project. I might even refactor this out in the future. (Removed o7)

## License

Tribbie is licensed under the [GNU General Public License v3.0](LICENSE).
