import Link from "@docusaurus/Link";

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
    <section className="py-20 pb-16 bg-[var(--base-50)] border-b border-[var(--base-200)] font-inter text-[var(--base-700)]">
      <div className="max-w-[77rem] mx-auto px-6">
        {eyebrow ? (
          <p className="m-0 mb-3 text-[0.7rem] tracking-[0.12em] uppercase text-[var(--base-700)] font-mono">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="m-0 mb-4 text-[clamp(36px,5vw,48px)] leading-[43.2px] text-[var(--base-950)] font-archivo font-light">
          {title}
        </h1>
        <p className="max-w-[720px] m-0 text-[14px] leading-[18.2px] tracking-[-0.14px] text-[var(--base-700)]">
          {subtitle}
        </p>
        {primaryCta || secondaryCta ? (
          <div className="flex flex-wrap gap-3 mt-7">
            {primaryCta ? (
              <Link
                className="flex justify-center items-center h-9 px-2.5 text-base font-medium tracking-[-0.03em] leading-none whitespace-nowrap no-underline border border-transparent transition-all duration-300 bg-[var(--fluoro-400)] text-[var(--base-950)] hover:bg-[var(--fluoro-500)] hover:no-underline"
                to={primaryCta.href}
              >
                {primaryCta.label}
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link
                className="flex justify-center items-center h-9 px-2.5 text-base font-medium tracking-[-0.03em] leading-none whitespace-nowrap no-underline border border-transparent transition-all duration-300 bg-[var(--base-950)] text-[var(--base-50)] hover:bg-[var(--base-800)] hover:no-underline"
                to={secondaryCta.href}
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
