import React from "react";

type SectionTone = "default" | "subtle";

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: SectionTone;
  className?: string;
  background?: string;
};

export default function Section2({
  title,
  description,
  children,
  tone = "default",
  className,
  background,
}: SectionProps) {
  const sectionClassName = `py-8 rounded max-[720px]:py-10 bg-[var(--base-50)] font-inter text-[var(--base-700)] ${
    tone === "subtle" ? "bg-white border-t border-b border-[var(--base-200)]" : ""
  } ${className ?? ""}`;

  return (
    <section className={sectionClassName} style={background ? { background } : undefined}>
      <div className="max-w-[77rem] mx-auto px-6">
        <header className="mb-8">
          <h2 className="m-0 mb-3 text-[clamp(28px,3vw,32px)] leading-[35px] text-[var(--base-950)] font-archivo font-light">
            {title}
          </h2>
          {description ? (
            <p className="max-w-[780px] m-0 text-[var(--base-700)] text-[14px] leading-[18.2px] tracking-[-0.14px]">
              {description}
            </p>
          ) : null}
        </header>
        <div className="grid gap-6">{children}</div>
      </div>
    </section>
  );
}
