# sohanur.me

Personal portfolio site for Md Sohanur Rahman — Senior Data Analyst & Team Lead.

Served by GitHub Pages from `master` at <https://sohanur.me> (the domain comes
from `CNAME`). No build step and no server code: the committed files are served
as they are, so pushing to `master` publishes the site.

## Editing the content

**Almost everything lives in [`assets/data/site.json`](assets/data/site.json).**
Edit that file, commit, push. You should not need to touch the HTML to add a
job, a role, a degree, a project, a skill or a certificate.

```
assets/data/site.json     <- the content
assets/js/site-data.js    <- reads it and builds the page
index.html                <- section headings and empty containers only
```

### Adding a new job

```json
{
  "company": "New Company Ltd.",
  "start": "2027-02",
  "roles": [
    {
      "title": "Head of Data",
      "start": "2027-02",
      "end": "present",
      "text": "What you did there."
    }
  ]
}
```

Put it at the top of the `employment` array — the list shows in the order you
write it, newest first.

### Adding a role at a company you are already at

Add it to that company's `roles` array, **above** the current one, and close the
old one off by changing its `"end"` from `"present"` to the last month:

```json
"roles": [
  { "title": "Head of Data",  "start": "2027-02", "end": "present", "text": "..." },
  { "title": "Senior Analyst","start": "2024-05", "end": "2027-01", "text": "..." }
]
```

The company block stays one block — it does not split into two employers. The
date range, each role's length and the company total are all worked out from
these dates, so nothing has to be typed or kept up to date. `"present"` keeps
counting on its own as months pass.

Dates are `"YYYY-MM"`. Both ends count, the way a CV counts them: Oct 2021 to
Apr 2024 reads as 2 yrs 7 mos.

### Other things

| To add | Edit |
| --- | --- |
| A degree or course | `education` — `subjects` is optional and renders as chips |
| A skill | the right group's `items` in `skills` |
| A whole new skill group | a new `{ "group": ..., "items": [...] }` in `skills` |
| A client project | `projects` — `tag` must match a `tag` in `projectFilters` |
| A practice project | `practice` |
| A book, paper or talk | `publications` |
| A certificate | `certifications` |
| Phone, email, photo, CV, headline | `profile` |

`text` fields in `hello`, `education`, `employment` roles, `projects` and
`publications` allow simple HTML such as `<b>` and `<i>`. Everything else is
plain text and is escaped.

### Adding a new project illustration

Drawings live in `assets/img/proj-*.svg`, drawn on an 800x600 canvas with a flat
`#F5F2FC` background and a `viewBox` cropped to a 3:2 ratio so every card's
artwork renders at the same size. Point the project's `"image"` at the new file.

## Layout

| Path | What it is |
| --- | --- |
| `assets/data/site.json` | All the content |
| `assets/js/site-data.js` | Renders the page from the JSON |
| `assets/css/color.css` | The theme, as compiled from the original template |
| `assets/css/skillbtnb.css` | Everything added since: skill groups, timeline, cards |
| `assets/js/` | jQuery, Bootstrap and the small site scripts |
| `cv/` | The CV the Download CV button serves |
| `robots.txt`, `sitemap.xml` | For search engines |

Accent colour is `#6D56C1`. Type is Roboto, Roboto Mono and Inconsolata from
Google Fonts, with Font Awesome and Material Design Icons for the icons.

## Light and dark

A new visitor gets whatever their operating system is set to; the moon/sun
button in the top bar overrides that and the choice is remembered. The theme is
set by an inline script in `<head>`, before the stylesheet paints, so dark-mode
visitors never see a white flash.

`color.css` is a compiled file with its colours baked in, so dark mode is not a
rewrite of it: `skillbtnb.css` names the palette once as custom properties under
`:root` and `[data-theme="dark"]`, and re-states the surfaces that actually
show. **To change a colour, edit the property, not the rules.**

Two things worth knowing if you touch this:

- The project illustrations are light artwork, so in dark mode they are flipped
  with `invert(1) hue-rotate(180deg)` — the inversion handles the lightness and
  the rotation puts the purples back. `--c-panel` is set to the colour the
  drawing's own `#F5F2FC` background becomes after that filter, which is what
  stops a visible rectangle appearing around it.
- Muted text runs through `--c-muted` in both themes rather than the template's
  `#999`, which fails contrast on white.

## Gotchas worth knowing

- **Open it over http, not from disk.** The page fetches `site.json`, and
  browsers block that on `file://`. GitHub Pages is fine; locally use the
  command below. If the page comes up empty, this is why — the console says so.
- **Bump `?v=` after changing any CSS or JS.** Pages serves assets with
  `Cache-Control: max-age=600`, so a returning visitor can get the new
  `index.html` with a stale stylesheet still cached — new markup, old rules,
  broken layout. The `?v=1` on every `assets/css/*.css` and `assets/js/*.js`
  reference in `index.html` and `404.html` prevents that: raise the number and
  the browser treats it as a new file. Content in `site.json` needs no bump —
  it is fetched with `cache: 'no-cache'` and is always current.
- **A new section** needs its `<h2>` id added to the `animatedHeaders` list in
  `assets/js/section.js`, or the heading stays invisible. The typing animation
  blanks it until a scroll waypoint fires.
- **Project filter tags** in `projects` must match the `tag` values in
  `projectFilters`, otherwise the card never shows under its filter.
- **Styling a Bootstrap column** — set only vertical padding on it. Replacing
  its horizontal padding makes any nested `.row` overflow on mobile.

## Checking a change before pushing

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Editing the styles

Edit the CSS directly. `color.css` came out of the original template's Sass
build; those sources, the Gulp toolchain and the template's unused pages, demo
images and scripts were deleted once the site stopped using them — they are in
the git history if anything is ever needed back. Everything written since lives
in `skillbtnb.css`, which is ordinary CSS.
