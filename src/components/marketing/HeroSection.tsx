import Link from "@docusaurus/Link";

import styles from "./HeroSection.module.css";

type Cta = {
  label: string;
  href: string;
};

type HeroSectionProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

// Marketing hero with optional CTAs and compact supporting copy.
export default function HeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {primaryCta || secondaryCta ? (
          <div className={styles.actions}>
            {primaryCta ? (
              primaryCta.href.startsWith('http') ? (
                <a className={`${styles.button} ${styles.primary}`} href={primaryCta.href}>
                  {primaryCta.label}
                </a>
              ) : (
                <Link className={`${styles.button} ${styles.primary}`} to={primaryCta.href}>
                  {primaryCta.label}
                </Link>
              )
            ) : null}
            {secondaryCta ? (
              secondaryCta.href.startsWith('http') ? (
                <a className={`${styles.button} ${styles.secondary}`} href={secondaryCta.href}>
                  {secondaryCta.label}
                </a>
              ) : (
                <Link className={`${styles.button} ${styles.secondary}`} to={secondaryCta.href}>
                  {secondaryCta.label}
                </Link>
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
