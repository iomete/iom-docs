# Shared Storage Diagram

An inline explanation of independent Spark compute clusters sharing Iceberg
tables. The same component works in docs and blog MDX:

```jsx
import SharedStorageDiagram from '@site/src/components/SharedStorageDiagram';

<SharedStorageDiagram />
```

For blogs, place the import and diagram after the truncate marker. Place the
diagram beside prose about compute/storage separation, not at the top as a hero.

The three steps show a BI cluster running, a separate ETL cluster starting,
and ETL stopping without removing the stored tables. These are conceptual
states, not telemetry, measured timings, provisioning guarantees, or automatic
scaling. The catalog and access controls are deliberately outside this schematic.

## Behavior

- Advances every five seconds while visible. Pause/Play controls playback.
- Selecting a step pauses playback and leaves that step on screen.
- Offscreen diagrams do not advance.
- Reduced-motion preferences disable autoplay and moving markers, including
  when the preference changes during the session. Steps still work.
- Server-rendered / JavaScript-disabled pages show both clusters and shared
  storage as a complete static explanation, without nonfunctional controls.
- Colors use existing site tokens; dark mode uses the same semantic hierarchy.

The diagram follows the site's stone-ground, thin-line, DM Mono annotation
language. The external reference informed the sequential explanation only;
no external assets, copy, or architecture are used.

## Testing

Build the site, serve it at `/resources/`, then run:

```sh
BASE_URL=http://127.0.0.1:3000/resources node scripts/check-diagram.cjs
```

Install the Playwright browser once with `yarn playwright install chromium`.
The script checks both placements in light/dark themes at desktop and phone
widths, keyboard controls, pause/play, automatic steps, offscreen pause, reduced
motion, no-JavaScript fallback, overflow, touch targets, and browser errors.
It writes screenshots to `/tmp/diagram-proof/`.
