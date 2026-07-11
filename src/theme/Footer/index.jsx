import React, { useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.scss";

const ADDRESS =
  "1049 El Monte Avenue, Mountain View, CA 94040, United States of America";

// The small "eye" marker in front of section headings (matches iomete.com eyebrows).
function EyebrowEye() {
  return (
    <svg
      className={styles.eyebrowEye}
      viewBox="0 0 10 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0.375 15H6.90187C7.08042 15 7.24562 14.9048 7.33479 14.75L9.93292 10.25C10.0223 10.0952 10.0223 9.90479 9.93292 9.75L7.335 5.25C7.24562 5.09521 7.08062 5 6.90187 5H0.375C0.167917 5 0 5.16792 0 5.375V14.625C0 14.8321 0.167917 15 0.375 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Diagonal arrow shown next to links that open in a new tab.
function ExternalArrow() {
  return (
    <svg
      className={styles.linkIcon}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15.81 14.48V8.82001C15.81 8.47001 15.53 8.20001 15.19 8.20001H9.52V9.45001H13.67L8.37 14.75L9.25 15.63L14.55 10.33V14.48H15.81Z"
        fill="currentColor"
      />
    </svg>
  );
}

const SOCIAL_ICONS = {
  linkedin: (
    <>
      <path d="M10.02 8.48H12.71V9.71H12.75C13.12 9 14.04 8.25 15.4 8.25C18.24 8.25 18.76 10.12 18.76 12.55V17.5H15.96V13.12C15.96 12.07 15.94 10.73 14.5 10.73C13.06 10.73 12.82 11.87 12.82 13.05V17.51H10.02V8.48Z" />
      <path d="M5.45998 8.48H8.26998V17.5H5.45998V8.48ZM6.85998 4C7.75998 4 8.48998 4.73 8.48998 5.62C8.48998 6.51 7.75998 7.25 6.85998 7.25C5.95998 7.25 5.22998 6.52 5.22998 5.62C5.22998 4.72 5.95998 4 6.85998 4Z" />
    </>
  ),
  github: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.01 3.01C7.03 3.01 3 7.06 3 12.08C3 16.09 5.58 19.49 9.16 20.69C9.61 20.78 9.77 20.49 9.77 20.25C9.77 20.04 9.76 19.32 9.76 18.57C7.25 19.11 6.73 17.49 6.73 17.49C6.33 16.44 5.73 16.17 5.73 16.17C4.91 15.61 5.79 15.61 5.79 15.61C6.7 15.67 7.18 16.54 7.18 16.54C7.99 17.92 9.28 17.53 9.8 17.29C9.87 16.7 10.11 16.3 10.37 16.07C8.37 15.86 6.27 15.08 6.27 11.59C6.27 10.6 6.63 9.79 7.19 9.16C7.1 8.93 6.79 8 7.28 6.76C7.28 6.76 8.04 6.52 9.76 7.69C10.49 7.49 11.25 7.39 12.01 7.39C12.77 7.39 13.55 7.5 14.26 7.69C15.98 6.52 16.74 6.76 16.74 6.76C17.23 8.01 16.92 8.94 16.83 9.16C17.41 9.79 17.75 10.6 17.75 11.59C17.75 15.08 15.65 15.84 13.63 16.07C13.96 16.36 14.24 16.9 14.24 17.75C14.24 18.97 14.23 19.94 14.23 20.24C14.23 20.48 14.39 20.77 14.84 20.68C18.42 19.48 21 16.08 21 12.07C21.01 7.05 16.97 3 12.01 3V3.01Z"
    />
  ),
  x: (
    <path d="M19.38 4.5H17.52L12.83 9.96L9.08 4.5H4.62L10.35 12.83L4.62 19.5H6.47L11.17 14.03L14.92 19.48V19.5H19.38L13.65 11.16L19.38 4.5ZM17.09 18.29H15.67L6.92 5.71H8.33L17.09 18.29Z" />
  ),
  youtube: (
    <path d="M20.63 7.66995C20.42 6.88995 19.81 6.28995 19.03 6.06995C17.62 5.69995 12 5.69995 12 5.69995C12 5.69995 6.38 5.69995 4.97 6.06995C4.19 6.27995 3.59 6.88995 3.37 7.66995C3 9.07995 3 12 3 12C3 12 3 14.93 3.37 16.33C3.58 17.11 4.19 17.71 4.97 17.93C6.38 18.3 12 18.3 12 18.3C12 18.3 17.62 18.3 19.03 17.93C19.81 17.72 20.41 17.11 20.63 16.33C21 14.92 21 12 21 12C21 12 21 9.06995 20.63 7.66995ZM10.2 14.7V9.29995L14.88 12L10.2 14.7Z" />
  ),
};

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/iomete/", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com/iomete", icon: "github" },
  { label: "X (Twitter)", href: "https://x.com/iometedata/", icon: "x" },
  { label: "YouTube", href: "https://www.youtube.com/@iomete", icon: "youtube" },
];

function FooterLink({ label, href, external }) {
  return (
    <a
      href={href}
      className={styles.link}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span>{label}</span>
      {external && <ExternalArrow />}
    </a>
  );
}

function FooterBox({ title, children }) {
  return (
    <div className={styles.box}>
      <div className={styles.eyebrow}>
        <EyebrowEye />
        <span>{title}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.linkWrap}>{children}</div>
    </div>
  );
}

function AddressCopyButton() {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      className={`${styles.link} ${styles.copyButton}`}
      onClick={copyAddress}
      title="Copy address"
    >
      <span>{ADDRESS}</span>
      <span className={`${styles.copiedTooltip} ${copied ? styles.copiedTooltipVisible : ""}`}>
        copied
      </span>
    </button>
  );
}

export default function Footer() {
  const logoWhite = useBaseUrl("/logo-white.svg");
  const docsUrl = useBaseUrl("/");
  const blogUrl = useBaseUrl("/blog");

  const columns = [
    {
      title: "Company",
      links: [
        { label: "Why IOMETE", href: "https://iomete.com/" },
        { label: "About us", href: "https://iomete.com/about-us" },
        { label: "Careers", href: "https://app.dover.com/jobs/iomete", external: true },
        { label: "Investors", href: "https://iomete.com/about-us#investors" },
      ],
    },
    {
      title: "Product",
      links: [
        { label: "Data platform", href: "https://iomete.com/product/data-platform/design-principles" },
        { label: "Deployment", href: "https://iomete.com/product/deployment" },
        { label: "Architecture", href: "https://iomete.com/product/architecture/open-source" },
        { label: "Product roadmap", href: "https://iomete.com/roadmap" },
        { label: "Documentation", href: docsUrl },
        { label: "GitHub", href: "https://github.com/iomete", external: true },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "IOMETE blog", href: blogUrl },
        { label: "Partner program", href: "https://iomete.com/partner-program" },
        { label: "FAQ", href: "https://iomete.com/faq" },
        {
          label: "Trust center",
          href: "https://app.vanta.com/iomete.com/trust/mh7heslsoonlhblghsro7g",
          external: true,
        },
      ],
    },
    {
      title: "Policies",
      links: [
        { label: "Privacy policy", href: "https://iomete.com/policies/privacy-policy" },
        { label: "Cookie policy", href: "https://iomete.com/policies/cookie-policy" },
        {
          label: "Software License Agreement",
          href: "https://iomete.com/policies/software-license-agreement",
        },
      ],
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {columns.map((column) => (
            <FooterBox key={column.title} title={column.title}>
              {column.links.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </FooterBox>
          ))}

          <FooterBox title="Contact us">
            <FooterLink label="Get in touch" href="https://iomete.com/contact-us" />
            <AddressCopyButton />
            <div className={styles.socialWrap}>
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label={social.label}
                >
                  <svg
                    className={styles.socialIcon}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    {SOCIAL_ICONS[social.icon]}
                  </svg>
                </a>
              ))}
            </div>
          </FooterBox>
        </div>

        <div className={styles.copyrightRow}>
          <div className={styles.copyrightLeft}>
            <a href="https://iomete.com" className={styles.brand} aria-label="IOMETE">
              <img src={logoWhite} alt="IOMETE" width={140} height={24} />
            </a>
            <div className={styles.copyright}>
              © {new Date().getFullYear()} IOMETE Inc. All Rights Reserved.
            </div>
          </div>
          <button type="button" className={styles.topBtn} onClick={scrollToTop}>
            <span>Back to top</span>
            <svg
              className={styles.topIcon}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10.5251 3.3335H9.4834V16.6668H10.5251V3.3335Z" fill="currentColor" />
              <path
                d="M15.0833 9.15856L10 4.07523L4.91668 9.15856L4.18335 8.42523L9.64168 2.96689C9.84168 2.76689 10.175 2.76689 10.375 2.96689L15.8333 8.42523L15.1 9.15856H15.0833Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
