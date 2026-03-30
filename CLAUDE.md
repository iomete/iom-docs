# IOMETE Documentation

Docusaurus 3.x site (MDX v3) for IOMETE platform docs.

## Key Conventions

- **MDX v3**: No HTML comments (`<!-- -->`). Use JSX comments (`{/* */}`). Bare `{name}` in prose crashes the build; escape as `\{name\}` or use backticks.
- **Images**: Use the `<Img>` component, not `![]()`. Provide a `-dark.png` variant for dark mode. Import: `import Img from '@site/src/components/Img';`
- **Frontmatter**: Every doc needs `title`, `description`, `sidebar_label`, `last_update.date`, `last_update.author`.
- **Style**: Second person ("you"), active voice, present tense, Title Case headings, gerund form for tasks ("Creating a Cluster").
- **Links**: Relative paths (`./feature.md` or `../category/page.md`). Never prefix with `/docs/`.

## Development

```bash
npm run start    # Dev server on port 3000
npm run build    # Production build
```

## Claude Code Doc Pipeline

There are 5 Claude Code agents in `.claude/agents/` that handle doc creation from source extraction through QA review. See [.claude/README.md](.claude/README.md) for setup and usage.
