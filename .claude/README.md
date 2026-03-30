# Claude Code Documentation Pipeline

Five Claude Code agents that turn source code into finished docs. They extract data from repos, write MDX pages, clean up the language, process screenshots, and run a QA check before you merge.

## Prerequisites

- **Node.js 18+** and `npm install` (installs `sharp` for image processing)
- **SSH key** with access to the `iomete` GitHub org (source-extractor clones private repos)
- **GitHub CLI** (`gh`) installed and authenticated (for PR workflows)
- **Optional**: [humanizer skill](https://github.com/blader/humanizer) catches AI-sounding text in the language editor:
  ```bash
  git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer
  ```

## Quick Start

Run the full pipeline for any doc page:

```
/doc-pipeline docs/user-guide/<feature>.md
```

This runs all 5 agents one after another, pausing between phases so you can review.

## Skill vs Agents: When to Use What

### The `/doc-pipeline` Skill

Best for new pages or full rewrites. It walks you through every phase with checkpoints. The trade-off is context: it keeps everything in one session, so it eats more of the context window.

- New doc page from scratch
- Full rewrite of an existing page
- You want guided pauses between phases

### Individual Agents

Better when you only need one step, or you've already done part of the work in a previous session. Each agent runs independently and uses less context.

- Just polish language on an existing doc
- Re-run doc-review after fixing issues
- Add screenshots to a page that's already written
- Pick up where you left off without restarting the pipeline

### Common Patterns

| Scenario | What to run |
|----------|-------------|
| New doc from scratch | `/doc-pipeline docs/user-guide/feature.md` |
| Re-extract after code changes | `source-extractor docs/user-guide/feature.md` |
| Polish an existing doc | `polish the language in docs/user-guide/feature.md` |
| Add screenshots to a finished doc | `screenshot-processor docs/user-guide/feature.md` |
| QA check before merging | `doc-review docs/user-guide/feature.md` |
| Rewrite doc (source data exists) | `doc-writer docs/user-guide/feature.md` |

## Pipeline Phases

```
Phase 1: source-extractor ──> tasks/raw-data/<feature>.md
   │  (checkpoint: review source gaps, fill in missing context)
Phase 2: doc-writer ──> docs/user-guide/<feature>.md
         doc-language-editor ──> cleans up prose
   │  (checkpoint: review doc content)
Phase 3: screenshot-processor ──> static/img/<feature>/*.png + <Img> tags
   │  (checkpoint: review screenshots)
Phase 4: doc-review ──> pass/warn/fail QA report
```

At each checkpoint you can say "continue", "skip screenshots", or give specific feedback.

## Agent Reference

### source-extractor

Clones the frontend, backend, and infra repos into `tasks/repos/`, reads the relevant source files, and writes a structured raw-data file. This file has everything doc-writer needs: user flows, form fields, API endpoints, permissions, state machines.

| | |
|---|---|
| **Trigger** | `source-extractor docs/user-guide/<feature>.md` |
| **Input** | Source repos (cloned automatically) + existing doc (if any) |
| **Output** | `tasks/raw-data/<feature>.md` |

<details>
<summary>Permissions needed</summary>

| Permission | Why |
|-----------|-----|
| `Bash(git clone:*)` | Clones iomete repos into tasks/repos/ |
| `Bash(git pull:*)` | Updates existing clones |
| `Bash(git -C:*)` | Runs git commands in repo subdirectories |
| `Bash(git checkout:*)` | Switches to main branch before extraction |
| `Bash(mkdir:*)` | Creates lock dirs for parallel clone safety |
| `Bash(rmdir:*)` | Cleans up lock dirs |
| `Bash(while:*)`, `Bash(sleep:*)`, `Bash(trap:*)` | Lock-wait loop during parallel cloning |

This agent spawns subagents for frontend, backend, and infra in parallel, so expect several permission prompts the first time. Adding these to `settings.local.json` makes subsequent runs quieter.
</details>

---

### doc-writer

Takes the raw-data file and produces a complete MDX page. It picks a template (Feature How-To, Developer Reference, Tutorial, or Conceptual) based on the doc type, shows you the section outline, and waits for your OK before writing.

| | |
|---|---|
| **Trigger** | `doc-writer docs/user-guide/<feature>.md` |
| **Input** | `tasks/raw-data/<feature>.md` (must exist; run source-extractor first) |
| **Output** | The doc page at the specified path |

<details>
<summary>Permissions needed</summary>

None. Uses Read, Write, and Edit tools only.
</details>

---

### doc-language-editor

Rewrites prose across 4 passes: structural flow, mechanical polish, humanizer (optional), and a final read-through. Leaves technical content, code blocks, and MDX structure alone.

| | |
|---|---|
| **Trigger** | `polish the language in docs/user-guide/<feature>.md` |
| **Input** | Any doc file |
| **Output** | Edited doc file (in place) |

<details>
<summary>Permissions needed</summary>

None if you pre-install the humanizer skill (see Prerequisites). Otherwise Pass 3 spawns a subagent that needs:

| Permission | Why |
|-----------|-----|
| `Bash(git clone:*)` | One-time install of humanizer skill |
| `Bash(mkdir:*)` | Creates ~/.claude/skills/ directory |

</details>

---

### screenshot-processor

You capture screenshots and drop them in `tasks/screenshots/`. This agent looks at each image, figures out what UI it shows, detects light vs dark theme, pairs variants, compresses them, moves them to `static/img/`, and inserts `<Img>` tags in the doc. It shows a matching plan before doing anything.

| | |
|---|---|
| **Trigger** | `screenshot-processor docs/user-guide/<feature>.md` |
| **Input** | Raw screenshots in `tasks/screenshots/` + target doc file |
| **Output** | Compressed images in `static/img/<feature>/`, `<Img>` tags in doc |

<details>
<summary>Permissions needed</summary>

| Permission | Why |
|-----------|-----|
| `Bash(node:*)` | Runs `scripts/process-image.mjs` for PNG compression |
| `Bash(mkdir:*)` | Creates output directories under `static/img/` |
| `Bash(mv:*)` | Moves screenshots from staging to final path |
| `Bash(ls:*)` | Lists files in tasks/screenshots/ |

</details>

---

### doc-review

A read-only QA pass. Checks 9 categories: MDX build safety, frontmatter, screenshot coverage, source gaps, broken links, language issues, structural problems, page length, and content consistency against the raw-data file. Outputs a report with pass/warn/fail per category. Doesn't touch the doc.

| | |
|---|---|
| **Trigger** | `doc-review docs/user-guide/<feature>.md` |
| **Input** | Doc file + optional `tasks/raw-data/<feature>.md` for cross-checks |
| **Output** | Structured review report (displayed, not saved) |

<details>
<summary>Permissions needed</summary>

None. Only uses Read, Glob, and Grep.
</details>

## Directory Structure

```
.claude/
  agents/              # Agent definitions (committed)
    source-extractor.md
    doc-writer.md
    doc-language-editor.md
    doc-review.md
    screenshot-processor.md
  skills/              # Skill definitions (committed)
    doc-pipeline/
      SKILL.md
  settings.json        # Project permissions, read-only defaults (committed)
  launch.json          # Dev server config (committed)
  README.md            # This file (committed)
  settings.local.json  # Your personal overrides (gitignored)
  commands/            # Personal commands (gitignored)
  worktrees/           # Git worktree data (gitignored)
  memory/              # Auto-memory files (gitignored)
  plans/               # Ephemeral plan files (gitignored)

scripts/
  process-image.mjs    # Sharp-based PNG compression (committed)

tasks/                 # All working data (gitignored)
  repos/               # Cloned source repos (created by source-extractor)
  raw-data/            # Extracted feature data (created by source-extractor)
  screenshots/         # Staging folder for raw screenshots
```

## Permission Setup

**`.claude/settings.json`** (committed) ships with read-only defaults (WebSearch, WebFetch). Pipeline agents need Bash permissions to clone repos, run scripts, and move files.

**Quickest setup** — run this once to create your local settings file with all pipeline permissions:

```bash
cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(git clone:*)",
      "Bash(git pull:*)",
      "Bash(git checkout:*)",
      "Bash(git -C:*)",
      "Bash(node:*)",
      "Bash(npm:*)",
      "Bash(npm run:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(mv:*)",
      "Bash(rmdir:*)",
      "Bash(ln:*)",
      "Bash(chmod:*)",
      "Bash(sleep:*)",
      "Bash(while:*)",
      "Bash(trap:*)",
      "Bash(rm -rf tasks/:*)",
      "Bash(rm -r tasks/:*)",
      "Bash(rm tasks/:*)",
      "Bash(rmdir tasks/:*)"
    ]
  }
}
EOF
```

This file is gitignored — it won't affect anyone else.

Without it, agents will prompt you for each Bash command. That works fine but gets repetitive.

**What each permission group does:**

| Permission | Used by | Purpose |
|-----------|---------|---------|
| `git clone/pull/checkout/-C` | source-extractor | Clone and update iomete source repos in `tasks/repos/` |
| `node`, `npm`, `npm run` | screenshot-processor, dev server | Run image compression scripts, start dev server |
| `ls`, `mkdir`, `mv`, `rmdir`, `ln`, `chmod` | source-extractor, screenshot-processor | File operations: create dirs, move screenshots to `static/img/` |
| `sleep`, `while`, `trap` | source-extractor | Lock-wait loop when cloning repos in parallel |
| `rm tasks/` variants | cleanup | Delete working data under `tasks/` only (scoped, not global) |

**macOS extras** (optional):
```bash
"Bash(sips:*)",
"Bash(open:*)"
```

## Working Directories

Everything under `tasks/` is gitignored working data:

| Directory | Created by | What's in it |
|-----------|-----------|-------------|
| `tasks/repos/` | source-extractor | Cloned source repos (iom-console, iomete-kotlin-monorepo, infra) |
| `tasks/raw-data/` | source-extractor | Structured feature data files |
| `tasks/screenshots/` | You | Drop raw screenshots here before running screenshot-processor |

All of these are created on first use. Safe to delete; agents recreate them as needed.

## Troubleshooting

**sharp not found** -- Run `npm install`. It's a devDependency.

**SSH clone fails** -- Your SSH key needs access to the `iomete` GitHub org. Test with `ssh -T git@github.com`.

**humanizer skill not found** -- Install it manually:
```bash
git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer
```
Optional. The language editor still works without it (skips Pass 3).

**Permission prompts on every run** -- Add the commands to your `settings.local.json` (see the Recommended section above).

**tasks/ directory missing** -- Agents create it on first run. Or: `mkdir -p tasks/{repos,raw-data,screenshots}`.

**Agent can't find raw data** -- Run source-extractor first. Doc-writer won't start without `tasks/raw-data/<feature>.md`.

**Screenshots not picked up** -- Put images in `tasks/screenshots/`. Names don't matter; the agent looks at each image to figure out what it is.
