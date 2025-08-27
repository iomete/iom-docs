---
title: Cypress vs Playwright - E2E Testing Best Practices and Migration Guide
description: Complete guide to E2E testing with Cypress and Playwright. Learn smart locator strategies, reduce test flakiness, and choose between code-based vs no-code testing tools
tags2: [Educational, Technical]
coverImage: img/blog/thumbnails/3.png
authors: vugar
---

import Img from '@site/src/components/Img';

## What is E2E Testing?

End-to-End (E2E) testing simulates **real user interactions** to verify that the entire system — frontend, backend, and integrations — works together as expected. For example, an E2E test might log in a user, submit a form, and confirm the result appears correctly.

**Key benefits:**

- **Early bug detection** - Fixing production bugs can be 100x more expensive than catching them during development
- **Code quality improvement** - Writing tests forces developers to think about edge cases and design better interfaces
- **Team confidence** - Comprehensive tests enable fearless refactoring and feature additions

### Example: Modern Login Test in Playwright

```javascript
// playwright-login.spec.js
test("User can login successfully", async ({ page }) => {
  await page.goto("https://app.example.com");

  // Smart locator strategies - semantic HTML and ARIA
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();

  // Assert successful login
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();
  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

## Our Journey: Cypress → Playwright

In 2021, we chose **Cypress** because it was the most popular E2E testing tool with great community support. However, as our needs evolved, we migrated to **Playwright** for better browser support and stability:

**Cypress:**

- ✅ Easy setup, great debugging
- ❌ Limited browser support, parallelization challenges

**Playwright:**

- ✅ Full browser support (Chrome, Firefox, Safari)
- ✅ Parallel execution, better CI stability
- ✅ Open-source with video recording and trace viewer
- ✅ Smart locator strategies (role, label, text)
- ⚠️ Developer-only tool

**No-Code Alternatives:**

- ✅ AI-powered self-healing selectors
- ✅ Non-technical team members can contribute
- ❌ $200-500/month pricing
- ❌ Limited flexibility for complex scenarios

### Smart Locator Strategies

**What are smart locators?** They're intelligent ways to find elements on a page that won't break when developers change the code. Instead of looking for technical details like CSS classes, smart locators find elements the way a human would - by their visible text, labels, or purpose.

Playwright recommends **user-facing attributes** over technical selectors:

1. **Semantic HTML & ARIA** - Finding buttons, inputs, headings by their role
2. **Visible text** - Finding elements by what users can see
3. **Test IDs** - Only as a last resort when semantic options aren't available

This approach makes tests more resilient to code changes.

---

## Decision Framework

**Choose Playwright if:**

- Your team has developers comfortable with code
- You need complex test scenarios with conditional logic
- Budget is limited (it's free and open-source)
- You want tests to run on your own computers/servers
- You need full control over test execution

We chose Playwright because our engineering team could maintain it, and we needed complex test flows that no-code tools couldn't handle.

**Choose No-Code Tools if:**

- Your QA team or product managers want to create tests without coding
- You need visual regression testing (comparing screenshots)
- You want minimal maintenance with AI-powered self-healing tests
- Quick test creation matters more than customization

Popular examples include **Testim** and **BugBug.io** - tools where you record your actions and they create tests automatically.

**Our Hybrid Approach:**

We use both approaches strategically:
- **80% Playwright tests** for complex technical scenarios that need precise control
- **20% no-code tests** for critical business flows that product managers want to monitor

This combination gives us developer flexibility while allowing non-technical team members to contribute.

---

## Best Practices for Reducing Flakiness

**What is flakiness?** It's when a test passes sometimes and fails other times without any code changes - like a light switch that works randomly. This is frustrating and reduces trust in your tests.

**1. Smart Waiting:**

Instead of waiting a fixed time (like "wait 5 seconds"), smart waiting means waiting for specific conditions (like "wait until the loading spinner disappears"). This makes tests faster and more reliable.

```javascript
// ❌ Bad
await page.waitForTimeout(5000);

// ✅ Good
await page.getByRole("progressbar").waitFor({ state: "hidden" });
```

**2. Stable Locators:**

**What are stable locators?** These are ways to find page elements that won't break when the design changes. Think of it like addressing a letter - using a person's name is more reliable than describing what they're wearing.

```javascript
// ❌ Bad - CSS classes change frequently
await page.click(".btn-primary-new-style");

// ✅ Better - Semantic HTML
await page.getByRole("button", { name: "Submit" }).click();

// ✅ Good - Label association
await page.getByLabel("Email Address").fill("test@example.com");

// ✅ Acceptable - Visible text
await page.getByText("Save Changes").click();

// ⚠️ Last resort - Test IDs
await page.getByTestId("complex-widget").click();
```

**3. Test Isolation:**

Each test should be completely independent - like separate experiments in a lab. This means:
- Tests don't depend on each other
- Each test creates its own test data
- If one test fails, others still run

This prevents a domino effect where one failure causes many tests to fail.

**4. Retry Configuration:**

Sometimes tests fail due to temporary issues (network glitches, slow servers). Retry configuration automatically re-runs failed tests before marking them as failures:

```javascript
export default {
  retries: 2,  // Try up to 3 times total
  use: { trace: "on-first-retry" },  // Record what happened on retry
};
```

This filters out temporary issues from real bugs.

---

## Testing Metrics

| Metric         | Unit Tests   | API Tests    | Integration | E2E                 |
| -------------- | ------------ | ------------ | ----------- | ------------------- |
| Coverage       | 80-90%       | 70-80%       | 60-70%      | Critical paths only |
| Execution Time | < 5 min      | < 10 min     | < 15 min    | < 30 min            |
| Flakiness      | < 1%         | < 2%         | < 3%        | < 5%                |
| Run Frequency  | Every commit | Every commit | Every PR    | Nightly             |

**API Tests** verify that your backend services work correctly - testing the "brain" of your application without the UI.

---

## Key Takeaways

- **Invest heavily** in Unit (70%) and API tests (20%) for stability
- **Keep E2E minimal** (10%) — focus only on critical user flows
- **Choose tools** that match your team's skills and maintenance capacity
- **Playwright works** for us, but we continuously evaluate no-code alternatives

### Recommended Test Distribution

- **Unit Testing:** ~70% – fastest, smallest scope
- **API Testing:** ~20% – verifies business logic & data integrity
- **E2E UI Testing:** ~10% – focused on critical user flows

<Img src="/img/blog/2025-08-15-e2e-testing-cypress-playwright/testing-pyramid-recommended.png" alt="Testing pyramid" maxWidth="700px" centered />
