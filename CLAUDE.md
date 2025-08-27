# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Start development server on port 3000
- `npm run build` - Build production site
- `npm run serve` - Serve built site locally
- `npm run clear` - Clear Docusaurus cache

### Deployment
- `npm run deploy` - Deploy to AWS S3 + CloudFront (requires GitHub Actions)

## Architecture

This is a Docusaurus 3.7.0 documentation site with the following structure:

### Content Organization
- `/docs/` - Main documentation organized by category (getting-started, user-guide, developer-guide, reference, integrations, tutorials, deployment, troubleshooting)
- `/blog/` - Technical articles with author system (`blog/authors.yml`)
- `/glossary/` - Technical terminology dictionary (separate Docusaurus instance)
- `/static/` - Images, avatars, and other static assets
- `docusaurus.config.js` - Main configuration including plugins, themes, and metadata
- `sidebars.js` - Navigation structure for documentation

### Custom Components
Located in `/src/components/`:
- `<Release>` - Standardized release notes with sections: features, improvements, fixes, deprecations
- `<MiniCard>` - Call-to-action cards with links
- `<Iframe>` - Embedded content wrapper
- `<YoutubeCard>` - YouTube video embeds
- `<Feedback>` - User feedback component (can be disabled with `hideFeedback: true` in frontmatter)

### Key Features
- Algolia search integration (App ID: A90PMTH5W5)
- Dark/light theme switching
- Mermaid diagram support
- GitHub codeblock integration
- Image zoom functionality
- PDF export capability

### Release Notes Guidelines
When creating release notes:
1. Use the `<Release>` component for consistent formatting
2. Include standard sections: features, improvements, fixes, deprecations
3. Follow semantic versioning
4. Place in appropriate category under `/docs/release-notes/`

### Development Notes
- Node.js 18+ required
- Prettier configured (80 char width)
- No formal testing framework - focus on content validation
- Build validation through `npm run build`
- Devbox environment available with automatic setup