# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IOMETE documentation site built with **Docusaurus 3.9.2**, React 19, Tailwind CSS, and SCSS. Hosted at `https://iomete.com/resources/` via AWS S3 + CloudFront.

## Commands

```bash
yarn install              # Install dependencies
yarn start                # Dev server at localhost:3000
yarn build                # Production build to /build
yarn serve                # Serve production build locally
yarn clear                # Clear Docusaurus cache
```

Deployment is manual via GitHub Actions (`workflow_dispatch`) in `.github/workflows/deployment_v3.yaml`.

## Architecture

- **docs/** — Markdown/MDX documentation organized by category (getting-started, user-guide, developer-guide, reference, integrations, tutorials, etc.)
- **blog/** — Blog posts in Markdown
- **glossary/** — Glossary terms (disabled in dev mode, enabled in production)
- **src/components/** — Custom React components (Img, Feedback, MiniCard, YoutubeCard, Iframe, FAQPage, Release, etc.)
- **src/theme/** — Docusaurus theme overrides (Layout, DocItem/Footer, EditThisPage, BlogListPage, GlossaryListPage, TOC)
- **src/css/** — SCSS stylesheets; `custom.scss` imports Tailwind and overrides Infima
- **plugins/llms-txt-plugin.js** — Custom build plugin that generates `/llms-full.txt` from sidebars
- **static/** — Images (`/img/`), analytics scripts, logos, `llms.txt`
- **sidebars.js** — 5 sidebar sections: getting_started, guides, integrations, reference, tutorials
- **consts.ts** — Exports `BASE_PATH = "/resources"`

## Documentation Conventions

### Frontmatter
Every doc requires `title` and `description`. Optional: `sidebar_label`, `hideFeedback: true`, `last_update` (date + author).

### No H1 in content
The `title` frontmatter renders as H1. Start content headings at `##`.

### Images
Use the custom `<Img>` component, not standard markdown images:
```jsx
import Img from '@site/src/components/Img';

<Img src="/img/path/image.png" alt="Description" maxWidth="600px" centered />
```
Props: `src` (required), `alt`, `centered`, `maxWidth` (px), `borderless`. Store images in `/static/img/`. The component auto-switches to `-dark.png` variant in dark mode if the file exists. Compress images with TinyPNG before adding.

### Internal links
Use relative file paths: `[Link text](./other-page.md)` or `[Link text](../category/page.md)`.

### Release Notes
Use `<Release>` component with structured sub-components (`<NewFeatures>`, `<Improvements>`, `<BugFixes>`, `<Deprecations>`, `<BreakingChanges>`). See `RELEASE_NOTES_GUIDELINES.md`.

### Blog frontmatter
```yaml
title: Blog Title
description: First sentence
authors: vugar  # Single value: piet, fuad, aytan, vusal, vugar, abhishek, rocco, alokh, Mateus, Shahriyar, Shashank, Soltan
hide_table_of_contents: true
tags: [Technical]  # Up to 2: Technical, Release, Educational, Company, Engineering
```

## Styling

Tailwind CSS with Infima (Docusaurus default). Tailwind preflight is disabled to avoid conflicts. Custom fonts: Inter, Archivo, DM Mono. SCSS component styles in `src/css/components/`.

## Key Integrations

- **Algolia DocSearch** for search
- **Google Tag Manager** + GA for analytics
- **Mermaid** diagrams supported in markdown
- **docusaurus-theme-github-codeblock** for code blocks with GitHub links
- **docusaurus-plugin-image-zoom** for image click-to-zoom
