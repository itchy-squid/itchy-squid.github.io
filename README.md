# itchy-squid.github.io

Personal portfolio site for Amanda Santi, hosted on GitHub Pages at `itchy-squid.github.io`.

## Structure

```
/
├── index.html   ← portfolio site (single static file, no build step)
└── set/         ← separate JavaScript app for the card game Set
```

## The portfolio site (`index.html`)

A single self-contained HTML/CSS/JS file. No framework, no build toolchain — just open it in a browser or push to GitHub Pages and it works.

**Sections (in order):** Nav → Hero → Work (`#work`) → Projects (`#projects`) → Education & Awards (`#awards`) → Contact/Footer

**To update content**, edit the hardcoded values directly in `index.html`. All content lives in plain HTML — there's no data layer or templating. Key spots:

- **Name / title / blurb / contact info** — Hero section, near the top of `<body>`
- **At-a-glance panel** — The `.glance-panel` div in the hero; edit the `.glance-row` entries
- **Current role & bullets** — The `.featured-card` div inside `#work`
- **Previous roles** — The `.prev-row` divs below the featured card
- **Projects** — Each `.project-card` div inside `#projects`; set/remove `.project-footer` vs `.project-internal` depending on whether the project has links
- **Education** — The first column of the `#awards` section grid
- **Awards** — The `.award-row` divs in the second column
- **Footer year** — `© 2026 Amanda Santi` near the bottom

## Design tokens

| Token | Value | Used for |
|-------|-------|----------|
| `--accent` | `#43d9c8` | Cyan accent — labels, links, borders, buttons |
| `--bg` | `#0d1117` | Page background |
| `--surface` | `#131a24` | Panel/card backgrounds |
| `--border` | `#21262d` | Dividers and card borders |
| `--border2` | `#2a323d` | Secondary borders (stack chips, outline button) |
| `--text-heading` | `#f0f6fc` | Headings and prominent values |
| `--text-body` | `#c9d1d9` | Default body text |
| `--text-secondary` | `#b3bcc6` | Bullet text, card descriptions |
| `--text-muted` | `#8b949e` | Labels, meta, nav links |
| `--text-faint` | `#5b6572` | Footer, "internal" badge |

All tokens are CSS custom properties on `:root`. The accent color is also referenced inline via `var(--accent)` throughout.

## Fonts

Loaded from Google Fonts (no local files needed):
- **Space Grotesk** 500/600 — headings, role names, card titles
- **IBM Plex Sans** 400/500 — body text, bullets, descriptions
- **IBM Plex Mono** 400/500/600 — labels, tags, nav, kickers, mono values

## Interactions

- **Scroll reveal** — elements with `data-reveal` start hidden (`opacity:0; translateY(12px)`) and animate in via `IntersectionObserver`. Adding `data-reveal` to a new element is enough to opt it in.
- **Print / Résumé PDF** — the nav button calls `window.print()`. Print CSS hides `.site-nav` and `.no-print` and avoids page breaks inside cards.
- **Card hover** — project cards lift (`translateY(-4px)`) and their border turns accent via CSS transitions; no JS involved.
- **Smooth scroll** — handled by `html { scroll-behavior: smooth }` + `scroll-margin-top: 80px` on sections.

## The Set game (`/set`)

A standalone JavaScript app in the `/set` directory. It's separate from the portfolio and doesn't share any code or styles with `index.html`. The portfolio links to it at `/set` (same-origin, no `target="_blank"`).

Source: https://github.com/itchy-squid/itchy-squid.github.io/tree/master/set
