import React from "react";
import Head from "@docusaurus/Head";
import "./style.scss";

const FAQPage = ({ children, pageTitle, pageDescription, faqs }) => {
  const faqData = faqs || [];
  
  if (!faqs) {
    React.Children.forEach(children, (child) => {
      if (child && child.type && child.type.name === 'QuestionWithSchema') {
        const question = child.props.title;
        const answerElement = child.props.children;
        let answer = '';
        
        if (typeof answerElement === 'string') {
          answer = answerElement;
        } else if (React.isValidElement(answerElement)) {
          // Extract text from React elements
          answer = extractTextFromElement(answerElement);
        } else if (Array.isArray(answerElement)) {
          answer = answerElement.map(el => 
            typeof el === 'string' ? el : extractTextFromElement(el)
          ).join(' ');
        }
        
        if (question && answer) {
          faqData.push({ question, answer });
        }
      }
    });
  }

  function extractTextFromElement(element) {
    if (!element) return '';
    if (typeof element === 'string') return element;
    if (element.props && element.props.children) {
      if (typeof element.props.children === 'string') {
        return element.props.children;
      }
      if (Array.isArray(element.props.children)) {
        return element.props.children.map(child => 
          extractTextFromElement(child)
        ).join(' ');
      }
      return extractTextFromElement(element.props.children);
    }
    return '';
  }

  // Only render schema if we have FAQ data
  if (faqData.length === 0) {
    console.warn('FAQPage: No FAQ data found. Make sure to either provide a faqs prop or use QuestionWithSchema components as children.');
    return <div className="faq-page-content">{children}</div>;
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.trim()
      }
    }))
  };

  // Add optional fields only if they exist
  if (pageTitle) {
    faqSchema.name = pageTitle;
  }
  if (pageDescription) {
    faqSchema.description = pageDescription;
  }

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Head>
      <div className="faq-page-content">
        {children}
      </div>
    </>
  );
};

export default FAQPage;