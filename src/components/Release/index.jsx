import Heading from "@theme/Heading";
import styles from "./styles.module.scss";

const SECTION_TYPES = {
  'new-features': { emoji: '🚀', title: 'New Features' },
  'improvements': { emoji: '⚡', title: 'Improvements' },
  'bug-fixes': { emoji: '🐛', title: 'Bug Fixes' },
  'breaking-changes': { emoji: '⚠️', title: 'Breaking Changes' },
  'deprecations': { emoji: '🗑️', title: 'Deprecations' }
};

const Release = ({ name, version, date, children }) => {
  const displayVersion = name ? `${name} - v${version}` : `v${version}`;
  const idVersion = name ? `${name.toLowerCase().replace(/\s+/g, '-')}-v${version}` : `v${version}`;

  return (
    <article className={styles.releaseContainer}>
      <div className={styles.releaseHeader}>
        <div className={styles.releaseDate}>{date}</div>
        {/* Heading registers the anchor that the TOC from plugins/remark-release-toc.js links to */}
        <Heading as="h2" id={idVersion} className={styles.releaseTitle}>
          {displayVersion}
        </Heading>
      </div>
      {children}
    </article>
  );
};

const ReleaseSection = ({ type, title, children }) => {
  const sectionInfo = type ? SECTION_TYPES[type] : null;
  const displayTitle = sectionInfo ? `${sectionInfo.emoji} ${sectionInfo.title}` : title;
  
  return (
    <div className={styles.releaseSection}>
      <h3 className={styles.sectionTitle}>{displayTitle}</h3>
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
};


// Helper components
const NewFeatures = ({ children }) => (
  <ReleaseSection type="new-features">{children}</ReleaseSection>
);

const Improvements = ({ children }) => (
  <ReleaseSection type="improvements">{children}</ReleaseSection>
);

const BugFixes = ({ children }) => (
  <ReleaseSection type="bug-fixes">{children}</ReleaseSection>
);

const BreakingChanges = ({ children }) => (
  <ReleaseSection type="breaking-changes">{children}</ReleaseSection>
);

const Deprecations = ({ children }) => (
  <ReleaseSection type="deprecations">{children}</ReleaseSection>
);

const ReleaseDescription = ({ children }) => (
  <div className="release-description">{children}</div>
);

export { 
  Release,
  ReleaseDescription,
  NewFeatures,
  Improvements,
  BugFixes,
  BreakingChanges,
  Deprecations
};