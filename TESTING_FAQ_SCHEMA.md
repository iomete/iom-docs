# Testing FAQ Schema Markup

## 1. Google Rich Results Test

**URL**: https://search.google.com/test/rich-results

### Steps:
1. Deploy your changes or run your site locally
2. Go to the Rich Results Test
3. Enter your URL (e.g., `https://docs.iomete.com/docs/community-deployment/overview`)
4. Click "Test URL"
5. Look for "FAQ" in the detected structured data types
6. Check for any errors or warnings

### What to look for:
- ✅ "FAQ" should appear under "Detected structured data"
- ✅ No errors in the validation
- ✅ Preview should show your questions and answers

## 2. Local Testing Before Deployment

### Using Browser DevTools:
1. Open your page in a browser
2. Right-click → "View Page Source" 
3. Search for `application/ld+json`
4. You should see JSON-LD scripts like:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Can I run IOMETE on a single node?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes. IOMETE can run on a single node..."
    }
  }]
}
```

## 3. Schema Markup Validator

**URL**: https://validator.schema.org/

### Steps:
1. Copy the JSON-LD from your page source
2. Paste it into the validator
3. Check for validation errors

## 4. Google Search Console (After Deployment)

After your site is indexed:
1. Go to Google Search Console
2. Navigate to "Enhancements" → "FAQ"
3. Monitor for:
   - Valid FAQ pages
   - Pages with warnings
   - Pages with errors

## 5. Test Commands for Local Development

### Start Docusaurus locally:
```bash
cd /Users/mammadmammadli/Projects/IOMETE/iom-docs
npm run start
```

### Test URLs locally:
- http://localhost:3000/docs/community-deployment/overview
- http://localhost:3000/docs/user-guide/data-security/data-security-api

### Check the rendered HTML:
```bash
# After starting the dev server, in another terminal:
curl -s http://localhost:3000/docs/community-deployment/overview | grep -A 20 "application/ld+json"
```

## 6. Browser Extensions

Install these Chrome extensions for quick testing:
- **Structured Data Testing Tool** by Google
- **Schema Markup Validator** 
- **SEO META in 1 CLICK**

## 7. Quick Validation Checklist

✅ **Check Page Source**:
- [ ] JSON-LD scripts are present
- [ ] No JavaScript errors in console
- [ ] Schema is properly formatted

✅ **Validate Structure**:
- [ ] @context is "https://schema.org"
- [ ] @type is "FAQPage"
- [ ] mainEntity contains Question items
- [ ] Each Question has name and acceptedAnswer
- [ ] Each Answer has @type "Answer" and text

✅ **Content Requirements**:
- [ ] Questions are clear and specific
- [ ] Answers are complete and helpful
- [ ] No promotional language
- [ ] Content matches what's visible on page

## 8. Common Issues and Fixes

### Issue: "No structured data detected"
**Fix**: Ensure components are imported and used correctly

### Issue: "Missing required field 'name'"
**Fix**: Check that all questions have title/name property

### Issue: "Invalid JSON-LD"
**Fix**: Validate JSON syntax, check for missing commas or quotes

### Issue: Schema not showing in dev mode
**Fix**: Some hydration issues in dev; test with production build:
```bash
npm run build
npm run serve
```

## 9. Test the Actual Implementation

Let's verify the files we modified have the correct imports:

```bash
# Check if imports are correct
grep -n "FAQPage\|QuestionWithSchema" docs/community-deployment/overview.md
grep -n "FAQPage\|QuestionWithSchema" docs/user-guide/data-security/data-security-api.md
```

## 10. Production Testing

Once deployed to production:
1. Use Google's URL Inspection tool in Search Console
2. Request indexing for updated pages
3. Monitor FAQ enhancement reports (may take days/weeks to appear)
4. Check actual search results for rich snippets

## Expected Timeline

- **Immediate**: Schema visible in testing tools
- **1-2 weeks**: Google indexes the structured data
- **2-4 weeks**: Rich snippets may start appearing in search results
- **Ongoing**: Monitor Search Console for performance data