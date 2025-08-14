# Release Notes Guidelines

## Structure

Use standardized components instead of custom sections:

```jsx
<Release version="X.Y.Z" date="Month DD, YYYY">
  <NewFeatures>
    // New functionality
  </NewFeatures>
  
  <Improvements>
    // Enhancements to existing features
  </Improvements>
  
  <BugFixes>
    // Bug fixes
  </BugFixes>
  
  <Deprecations>
    // Deprecated features (optional)
  </Deprecations>
  
  <BreakingChanges>
    // Breaking changes (optional)
  </BreakingChanges>
</Release>
```

## Content Guidelines

### Categorization
- **NewFeatures**: Completely new functionality or major feature additions
- **Improvements**: Enhancements, optimizations, or UI/UX improvements to existing features
- **BugFixes**: Bug fixes, patches, and issue resolutions
- **Deprecations**: Features being phased out
- **BreakingChanges**: Changes that break backward compatibility

### Writing Style
- Use **bold** for feature/component names
- Start with feature category: `**Component Name**: Description`
- Use past tense: "Added support for..." not "Add support for..."
- Be specific and technical - assume engineering audience
- Include configuration details when relevant (e.g., `values.yaml`)

### Examples
```markdown
<NewFeatures>
  - **Job Orchestrator [Beta]**: Priority-based scheduling with resource-aware execution. Enable with `jobOrchestrator.enabled` in `values.yaml`.
  - **API Improvements**: Token management operations now exposed in REST API/Swagger.
</NewFeatures>

<Improvements>
  - **Job resource accounting using tags**: Tags that are attached to the spark jobs will be propagated to the pod as labels, which could be used for resource management of jobs categorized by specific tags.
       <Img src="/img/k8s/tag-pod-label-propagation.png" alt="Job Tag As a Pod Label" />
  - **UI Improvements**: SQL Editor now supports multiple tabs with different compute/catalog combinations.
</Improvements>

<BugFixes>
  - Fixed resource quota display issue where priority class quota showed instead of namespace quota.
  - Resolved USE command failures for users with limited database access by adding catalog-level privileges.
</BugFixes>
```