import React from "react";
import Head from "@docusaurus/Head";
import Question from "../Question";
import "./style.scss";

const FAQSection = ({ faqs }) => {
  // Generate FAQ schema markup; prefer explicit answerText when answers are JSX.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => {
      const answerText = typeof faq.answer === "string" ? faq.answer : (faq.answerText || "");
      return {
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answerText
        }
      };
    })
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Head>
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <Question key={index} title={faq.question}>
            {faq.answerContent || faq.answer}
          </Question>
        ))}
      </section>
    </>
  );
};

export default FAQSection;
