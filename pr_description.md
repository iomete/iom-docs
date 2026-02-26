### Summary
Rewrites the Virtual Lakehouses user guide as "Compute Clusters" — new terminology, fully expanded content, and a complete screenshot refresh (30 old images removed, 38 new light+dark images added).

### Context
The product renamed "Virtual Lakehouses" to "Compute Clusters" and significantly expanded the UI surface. The existing doc was a shallow overview that no longer matched the current UI or terminology.

### Implementation
- `docs/user-guide/virtual-lakehouses.md`: full rewrite covering cluster list view, 6-tab create form (General, Configurations, Dependencies, Docker Settings, Tags, Review & Create), 6-tab detail view (Details, Connections, Logs, K8s Events, Activity, Configuration), cluster states (driver + executor), and management actions (configure, start, restart, terminate, delete)
- Replaced `static/img/user-guide/virtual-lakehouse/` (30 images) with `static/img/user-guide/virtual-lakehouses/` (38 light+dark images)
- Updated anchor cross-references in `node-types.md` and `volumes.md`: `#create-a-new-lakehouse` → `#creating-a-compute-cluster`
- Added `playwright`, `sharp`, `dotenv` as dev dependencies for screenshot tooling
- Updated `.gitignore` to exclude `.env`, `tasks/`, `scripts/`
- Refreshed `sql-editor/query-history` screenshots (light + dark)
