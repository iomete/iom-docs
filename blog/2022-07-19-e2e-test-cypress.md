---
slug: e2e-tests-with-cypress-for-front-end
title: E2E tests with Cypress for front-end
authors: mikayil
hide_table_of_contents: true
tags: [Engineering]
image: /img/blog/2022-07-19-e2e-test-cypress/before-cypress.png
description: Nowadays, it is an industry standard to write tests for your code. Such popularity is not just a trend, it is backed by the observation that tests bring stability and scalability to code.
---

<head>
  <title>E2E tests with Cypress for front-end | iomete blog</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="googlebot" content="noindex"/>
</head>

## Table of contents:
1. Introduction
2. Why should you consider e2e testing?
3. Why did we choose Cypress for e2e testing?
4. Challenges and concealed difficulties when testing with Cypress
5. Final thoughts

<!-- truncate -->

## Introduction

Nowadays, it is an industry standard to write tests for your code. Such popularity is not just a trend, it is backed by the observation that tests bring stability and scalability to code. Tests help to keep your code clean and modular while at the same time enabling developers to refactor without implicit errors in unexpected parts of the application. Tests tend to describe the functionality of an application in a clear and concise way and for that reason, they are usually used as some kind of documentation. There is practically no downside to writing tests.

There are different methodologies of testing, however, we are going to focus on sharing our experience with the [Cypress](https://www.cypress.io/) testing tool which we use for e2e testing, *although it can be used for component testing purposes too.*

## But first, let’s clarify why the differences between e2e and other testing methods.

Why should you consider e2e testing?
Having a lot of testing types at your disposal, why should someone also consider writing e2e testing too? **e2e** (end-to-end) testing type is particularly useful in cases you want to test your system imitating real user behavior. All normal user interactions like typing, clicking, scrolling, and others happen as if they were performed by real users. This is useful when you want to test your app like one whole system (front-end and back-end together) as if it is made by a QA engineer manually.

**First of all, let’s outline the main features of the most popular testing methodologies:**

- Unit
- Integration
- End-to-End

**Unit** testing is the technique for testing one unit of your codebase in isolation. When writing unit tests it is common to [mock](https://en.wikipedia.org/wiki/Mock_object) and [stub](https://en.wikipedia.org/wiki/Method_stub) dependencies of your unit in order to make testing easier while at the same time help to focus on the functionality of your unit instead of worrying about testing dependencies too. Unit tests are known for their speed and stability and this is the main reason why it’s usually recommended to give preference to unit tests when you’re deciding which test type should you focus on more. While being fast and reliable in terms of testing components, unit tests don’t ensure that your component will be working correctly in real-world scenarios together in integration with other components of the system. You rarely see one code component working in total isolation in real-world apps and even if you’ve tested your component from A to Z it doesn’t mean that it is going to work properly in combination with other parts of your application.

And that’s where **integration** tests enter the scene! Integration tests methodology implies testing several components in combination and focusing on making sure that several components work well in synergy. Nonetheless, there is still a need for mocks and stubs because we still need to focus on the main parts of the interaction of components without making our lives difficult by thinking about all the dependencies and application state. This makes them a little bit artificial too, not that it is something bad, it is just sometimes not something we need.

In contrast to this, **end-to-end** tests offer us the ability to test a system as it is: as a user would interact with it. No isolation, just the system as a whole. And in some regard, e2e tests can be perceived as an integration testing methodology subtype, because of their characteristic of testing multiple components of the system together.

That’s what we needed in our case. We wanted to add these tests to our arsenal. Tests that will give us confidence that all parts of our system work properly and we wanted to run them as a part of our continuous integration process. For that goal, we opted in for [Cypress](https://www.cypress.io/) which primarily focuses on giving a range of tools to write, debug and support e2e test suites.


## Why did we choose Cypress for e2e testing?
In order to choose the right tool for e2e testing, we should first outline the main pros and cons of those tools and compare their main features.

Here are the e2e testing tools which we were choosing from:

- Protractor
- Rainforest QA
- Cypress

## Protractor
In our case, we were planning to write the e2e tests for the Angular application and we had several options to choose from. In the past, we had experience with the [Protractor](https://www.protractortest.org/#/) which is an e2e tool designed especially for Angular apps and built on top of [Selenium](https://www.selenium.dev/).

![Protractor](/img/blog/2022-07-19-e2e-test-cypress/protractor.png)

The main attraction of this tool is its Angular orientation. This means that [Protractor](https://www.protractortest.org/#/) is aware of the internal mechanism of the Angular framework which enables testing framework-specific elements. However, it has its own drawbacks. First of all, it is based on Selenium which makes its configuration a little bit tedious. In addition, it is supposed to wait for pending tasks and there is no need to place manually and wait for them to finish but in reality, this mechanism is not stable and often you find yourself struggling to find what caused your tests to fail and why particular element can’t be found. This results in not so much a pleasant experience and spending a lot of time. Moreover, there are no convenient debugging tools at your disposal and you can’t just replay your tests and check out the video or screenshots in order to locate the reasons behind your errors (at least there weren’t at a time when the author was using this tool).

Here goes a sample code for [Protractor](https://www.protractortest.org/#/):

```javascript
describe('angularjs homepage todo list', function () {
    it('should add a todo', function () {
        browser.get('https://angularjs-.org');
        element(by.model('todoList.todoText')).sendKeys('write first protractor test');
        element(by.css('[value="add"]')).click();
        var todoList = element.all(by.repeater('todo in todoList.todos'));
        expect(todoList.count()).toEqual(3);
        expect(todoList.get(2).getText()).toEqual('write first protractor test');
        // You wrote your first test, cross it off the list   
        todoList.get(2).element(by.css('input')).click();
        var completedAmount = element.all(by.css('.done-true'));
        expect(completedAmount.count()).toEqual(2);
    });
})
```

## Rainforest QA
At one stage of our considerations, we were looking at one popular e2e testing tool named [Rainforest QA](https://www.rainforestqa.com/). This tool represents a comprehensive all-in-one paid solution for e2e testing. However, this tool is a no-code solution mostly for QA engineers where you write your test for UI by clicking on interface elements and selecting actions for them.

![Rainforest QA](/img/blog/2022-07-19-e2e-test-cypress/rainforestqa.gif)

This is great in terms of using systems without the need to dive into code level and add custom attributes to elements in order to be able to get hold of UI elements. This may speed up the testing process when testing is done mainly by QA engineers or if the system to be tested is quite simple and no complex testing scenario is required. In addition to that, elements are retrieved by visual representation and text content which means that if the design of a particular UI element changes your tests will probably break. The specificity of this testing tool wasn’t a good fit for our case. We aimed for more stability and independence from the visuals of our UI elements. Despite the fact that [Rainforest QA](https://www.rainforestqa.com/) has great tooling and support it is still more QA engineer oriented.

![](/img/blog/2022-07-19-e2e-test-cypress/rainforest-qa-dashboard.png)

### Cypress
Looking back at our experience with e2e testing tools we looked at end-to-end testing as something painful, non-stable, and time-consuming. We wanted to find a tool that will help us eliminate those difficulties and make testing intuitive and effective. In our searches, we came across a [Cypress](https://www.cypress.io/) testing tool that was gaining popularity very fast throughout the community. We decided to give it a shot (**SPOILER**: it turned out to be the right decision).

![Before cypress](/img/blog/2022-07-19-e2e-test-cypress/before-cypress.png)

**The features we found to be the most attractive for our team:**

- Great documentation. Everything you’ll ever need and more is right here and written in a clear way. We were able to find the answers to all the questions we had.
- Works in a browser which makes the testing experience blazing fast and almost the same as a real user one’s.

:::info
Most testing tools operate by running outside of the browser and executing remote commands across the network. Cypress is the exact opposite. Cypress is executed in the same run loop as your application. Behind Cypress is a Node.js server process. Cypress and the Node.js process constantly communicate, synchronize, and perform tasks on behalf of each other. Having access to both parts (front and back) gives us the ability to respond to your application's events in real time, while at the same time work outside of the browser for tasks that require a higher privilege.
:::

- Automatic waits and retry-ability eradicate the need in placing waits/sleeps manually and greatly contribute to the testing stability.

:::info
Cypress executes the vast majority of its commands inside the browser, so there is no network lag. Commands execute and drive your application as fast as its capable of rendering. To deal with modern JavaScript frameworks with complex UI's, you use assertions to tell Cypress what the desired state of your application is. Cypress will automatically wait for your application to reach this state before moving on. You are completely insulated from fussing with manual waits or retries. Cypress automatically waits for elements to exist and will never yield you stale elements that have been detached from the DOM.
:::

- The ability to record videos and make screenshots of your tests increases debug-ability and ensures that bugs won’t go unnoticed.

:::info
Above all else, Cypress has been built for usability. There are hundreds of custom error messages describing the exact reason Cypress failed your test. There is a rich UI that visually shows you the command execution, assertions, network requests, spies, stubs, page loads, or URL changes. Cypress takes snapshots of your application and enables you to time travel back to the state it was in when commands ran. You can use the Dev Tools while your tests run, you can see every console message, and every network request. You can inspect elements, and you can even use debugger statements in your spec code or your application code. There is no fidelity loss - you can use all the tools you're already comfortable with. This enables you to test and develop all at the same time. If you’re using the [Dashboard](https://www.cypress.io/dashboard), you have access to even more detailed insights on your tests’ performance, helping you to optimize your runs, and ship faster with more confidence.
:::

*For more detailed information about key features of Cypress please refer to the [official site](https://www.cypress.io/).*

## Challenges and concealed difficulties when testing with Cypress
You may think that having a tool like Cypress at your disposal you won’t encounter any difficulties in your daily e2e tests at all. Sorry to disappoint you but as it happens, there are always some caveats even in the case of perfect tools. In this section, we will cover some of the pitfalls that we encountered while using Cypress and writing e2e tests overall.

## Challenges of constructing the application state before tests
Commonly when writing the e2e test you find yourself in a situation where your module to be tested relies on some other module elsewhere in your application. In these cases, you have to make sure that before your test run you have the required application state in place.

:::info
Imagine you're testing the functionality of a Shopping Cart. To test this, you need the ability to add products to that cart. Well where do the products come from? Should you use your UI to login to the admin area, and then create all of the products including their descriptions, categories, and images? Once that's done should you then visit each product and add each one to the shopping cart? No. You shouldn't do that.
:::

This is something related to e2e testing itself, more than Cypress, on the opposite - Cypress offers some ways to handle this difficulty by giving tools to send direct API requests, seed database with data, and recommends having special API routes dedicated for testing. You can even create mocks, stubs, and spies in order to make your life easier. **However, this raises the question:** Is it something you really want when you’re doing end-to-end tests? In our case, the whole point of doing e2e tests was that we wanted to make sure that our application works properly with all its parts working with each other as intended. That meant that mocking, stubbing, and other replacements for real application parts weren’t suitable for us. That left only one choice for us - make sure to create all the dependencies before tests and remove them afterward. This solution is not so elegant and makes tests somewhat coupled with each other but as a makeshift solution, it helped us break the deadlock.

Overall, this is the most challenging part of the e2e test which we recommend keeping in mind if you are going to do e2e tests.

## Periodic instability
Although Cypress has a mechanism of “wait and retry” for querying UI elements, that tangibly contributes to the stability of e2e tests, unfortunately, sometimes tests fail just for no apparent reason! And debug-ability of Cypress doesn’t help the situation a lot too… Errors don’t happen when you manually perform the same actions that your test suite performs. In order to get rid of this kind of error, all you need to do is just rerun the test. This makes the situation even more strange and inspires anxious thoughts like:

💡

*What if my tests fail in a CI environment?*

💡

*How will I know that an error is an actual error and not just a fit of instability?*

Cases like these sometimes make you question the whole point of e2e testing.

## Element is detached
Another bewildering error that we encountered was the following:

CypressError: cy.click() failed because this element is detached from the DOM.

After spending a lot of time to find the reason behind this error and google-ing we found this issue on Github. It turns out the reason behind this is that framework (Angular in our case) happened to swap the queried DOM element to the new one (re-rendering). And this process is not something a user can control. As a result, there are tons of “clutch” solutions out there on the internet with an official solution yet to be presented by the Cypress team. This issue is dated back to May 12, 2020. Moreover, the team doesn’t promise it to be resolved in the near future, which is saddening.

![](/img/blog/2022-07-19-e2e-test-cypress/comment.png)

## Final thoughts
Although Cypress fixed a lot of problems of modern e2e testing and made it a lot easier and more stable, in our opinion there is still a lot of work to do until e2e testing is something you can rely on.

![](/img/blog/2022-07-19-e2e-test-cypress/test-has-been-broken.png)

Writing stable, decoupled, idempotent end-to-end tests is still no small feat. While Cypress helps you overcome most of the difficulties related to specifics of e2e testing, you should bear in mind that it is not a silver bullet and some things just come with the nature of tests themselves.

In the end, should you spend your time on e2e tests? It is your decision to make, but we would recommend having some e2e tests in a form of [smoke testing](https://en.wikipedia.org/wiki/Smoke_testing_(software)), however, we do not recommend investing a lot of time into them. It is good to have some e2e tests but we think that unit testing is still the most reliable and fastest testing type.

