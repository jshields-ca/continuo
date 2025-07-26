---
title: Sprint 2 Test Notes
subtitle: Continuo Testing - Started July 25, 2025
---
# Sprint 2 Test Notes

Referencing [/docs/SPRINT\_2\_TESTING\_PLAN.md](/docs/SPRINT_2_TESTING_PLAN.md)

## 1.1 - Customer Database (BUS-2)

- Customer Creation
    - no fields marked as required. Should mark required fields as required.
    - Can create a duplicate customer. Should be duplicate customer prevention.
    - When you enter 'www.businessname.com' or 'businessname.com' it doesn't automatically format the URL correctly, and requries the user to add http:// or https://.
- Can't use the blue eye under the actions column on the Customers page to see details
    ```
    Uncaught Error: Objects are not valid as a React child (found: object with keys {}). If you meant to render a collection of children, use an array instead.
    ```
    
    ```
        throwOnInvalidObjectType webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:5225
    ```
    
    ```
        reconcileChildFibersImpl webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:6160
    ```
    
    ```
        createChildReconciler webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:6200
    ```
    
    ```
        reconcileChildren webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:8754
    ```
    
    ```
        beginWork webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:10951
    ```
    
    ```
        runWithFiberInDEV webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:876
    ```
    
    ```
        performUnitOfWork webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:15678
    ```
    
    ```
        workLoopSync webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:15498
    ```
    
    ```
        renderRootSync webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:15478
    ```
    
    ```
        performWorkOnRoot webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14985
    ```
    
    ```
        performSyncWorkOnRoot webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16782
    ```
    
    ```
        flushSyncWorkAcrossRoots_impl webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16628
    ```
    
    ```
        processRootScheduleInMicrotask webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16666
    ```
    
    ```
        scheduleImmediateRootScheduleTask webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16801
    ```
    
    ```
     react-dom-client.development.js:5224:1
    ```
    
    ```
        throwOnInvalidObjectType react-dom-client.development.js:5224
    ```
    
    ```
        reconcileChildFibersImpl react-dom-client.development.js:6159
    ```
    
    ```
        createChildReconciler react-dom-client.development.js:6199
    ```
    
    ```
        reconcileChildren react-dom-client.development.js:8753
    ```
    
    ```
        beginWork react-dom-client.development.js:10950
    ```
    
    ```
        runWithFiberInDEV react-dom-client.development.js:875
    ```
    
    ```
        performUnitOfWork react-dom-client.development.js:15677
    ```
    
    ```
        workLoopSync react-dom-client.development.js:15497
    ```
    
    ```
        renderRootSync react-dom-client.development.js:15477
    ```
    
    ```
        performWorkOnRoot react-dom-client.development.js:14984
    ```
    
    ```
        performSyncWorkOnRoot react-dom-client.development.js:16781
    ```
    
    ```
        flushSyncWorkAcrossRoots_impl react-dom-client.development.js:16627
    ```
    
    ```
        processRootScheduleInMicrotask react-dom-client.development.js:16665
    ```
    
    ```
        scheduleImmediateRootScheduleTask react-dom-client.development.js:16800
    ```
    

- Able to successfully edit the customer status from ACTIVE, INACTIVE, PROSPECT or LEAD.
- Able to edit customer fields successfully.
- There is no field for customer address, only website address.
- Unsure if there is any validation on the fields.
- Filtering tests:
    - able to filter successfully by searching name
    - able to filter by status for active or lead. Unable to filter by status for Inactive or Prospect, it shows no results.
    - able to filter by industry - however, if no industry was entered, it doesn't show up unless all industries are selected.
    - I added 11 companies, did not see any pagination. Confirm it is implemented.
- Able to delete customer; unsure how to confirm it was deleted.

## 1.2 Contact Management (BUS-3)

- Contact Creation
    - Can create contact with customer association
    - No marked required fields
    - Role is not required, it likely should be.
    - Can edit role assignment or assign role as expected.
    - Validation check: email is validated/checked. Phone number is not (was able to enter ad2dasd as a phone number).
- Contact Relationships
    - Unable to edit contact relationships, once they are created they can't be switched to another customer from the one they were originally associated with.
    - Able to edit contact roles
    - Unable to verify contact / customer relationships, they are not listed in the customers page table.
    - **ERROR** - unable to open Customer Details via blue eye button under actions on customers page.
    
    ```
    Objects are not valid as a React child (found: object with keys {}). If you meant to render a collection of children, use an array instead.
    ```
    
    ```
    src/app/dashboard/customers/page.tsx (249:5) @ handleViewCustomer
    ```
    
    ```
      247 |
    ```
    
    ```
     248 | const handleViewCustomer = (customer: any) => {
    ```
    
    ```
    > 249 | setViewingCustomer(customer);
    ```
    
    ```
     | ^
    ```
    
    ```
     250 | setShowCustomerModal(true);
    ```
    
    ```
     251 | };
    ```
    
    ```
     252 |
    ```
    
- Contact Search & Filtering
    - Able to search customers by name
    - Able to filter by customer
    - Able to filter by role
    - Unable to test pagination, unsure how many contacts need to be added for it to add pagination

## 1.3 Lead Management (BUS-3)

- Lead Creation
    - Can create lead successfully
    - Unable to create opportunity details when you create a lead, have to create the lead first, then add an opportunity. Workflow improvement needed.
    - Without a 'Source' selected when creating a lead, an error is produced.

```
[GraphQL error]: Message: Variable "$input" got invalid value "" at "input.source"; Value "" does not exist in "LeadSource" enum., Location: undefined, Path: undefined <anonymous code>:1:147461
```

```
[Network error]: ServerError: Response not successful: Received status code 400 <anonymous code>:1:147461
```

```
Error creating lead:ApolloError: Response not successful: Received status code 400
```

```
    ApolloError webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/errors/index.js:50
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:218
```

```
    notifySubscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:141
```

```
    onNotify webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:180
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:233
```

```
    makeCallback webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/asyncMap.js:32
```

```
    notifySubscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:141
```

```
    onNotify webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:180
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:233
```

```
    iterateObserversSafely webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/iteration.js:11
```

```
    iterateObserversSafely webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/iteration.js:11
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/Concast.js:84
```

```
    notifySubscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:141
```

```
    onNotify webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:180
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:233
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/error/index.js:68
```

```
    notifySubscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:141
```

```
    onNotify webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:180
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:233
```

```
    notifySubscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:141
```

```
    onNotify webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:180
```

```
    error webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:233
```

```
    handleError webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/parseAndCheckHttpResponse.js:183
```

```
    createHttpLink webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/createHttpLink.js:164
```

```
    promise callback*createHttpLink/</< webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/createHttpLink.js:162
```

```
    Subscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:194
```

```
    subscribe webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:268
```

```
    setContext webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/context/index.js:24
```

```
    promise callback*setContext/</< webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/context/index.js:20
```

```
    Subscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:194
```

```
    subscribe webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:268
```

```
    onError webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/error/index.js:21
```

```
    Subscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:194
```

```
    subscribe webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:268
```

```
    complete webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/Concast.js:119
```

```
    start webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/Concast.js:160
```

```
    Concast webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/Concast.js:145
```

```
    getObservableFromLink webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:789
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:159
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:158
```

```
    step webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:183
```

```
    verb webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:164
```

```
    __awaiter webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:157
```

```
    __awaiter webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:153
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:118
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/ApolloClient.js:264
```

```
    execute webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/react/hooks/useMutation.js:106
```

```
    handleCreateLead webpack-internal:///(app-pages-browser)/./src/app/dashboard/leads/page.tsx:353
```

```
    executeDispatch webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16922
```

```
    runWithFiberInDEV webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:876
```

```
    processDispatchQueue webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16972
```

```
    dispatchEventForPluginEventSystem webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17573
```

```
    batchedUpdates$1 webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:3313
```

```
    dispatchEventForPluginEventSystem webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17126
```

```
    dispatchEvent webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:21309
```

```
    dispatchDiscreteEvent webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:21277
```

```
    addTrappedEventListener webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17073
```

```
    listenToNativeEvent webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17008
```

```
    listenToAllSupportedEvents webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17021
```

```
    listenToAllSupportedEvents webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17018
```

```
    hydrateRoot webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:25690
```

```
    hydrate webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:220
```

```
    startTransition React
```

```
    hydrate webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:219
```

```
    <anonymous> webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js:16
```

```
    appBootstrap webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-bootstrap.js:62
```

```
    loadScriptsInSequence webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-bootstrap.js:23
```

```
    appBootstrap webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-bootstrap.js:56
```

```
    <anonymous> webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js:13
```

```
    NextJS 7
```

```
Caused by: ServerError: Response not successful: Received status code 400
```

```
    throwServerError webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/utils/throwServerError.js:6
```

```
    parseJsonBody webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/parseAndCheckHttpResponse.js:133
```

```
    parseAndCheckHttpResponse webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/parseAndCheckHttpResponse.js:189
```

```
    promise callback*parseAndCheckHttpResponse/< webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/parseAndCheckHttpResponse.js:189
```

```
    createHttpLink webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/createHttpLink.js:155
```

```
    promise callback*createHttpLink/</< webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/http/createHttpLink.js:147
```

```
    Subscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:194
```

```
    subscribe webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:268
```

```
    setContext webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/context/index.js:24
```

```
    promise callback*setContext/</< webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/context/index.js:20
```

```
    Subscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:194
```

```
    subscribe webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:268
```

```
    onError webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/link/error/index.js:21
```

```
    Subscription webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:194
```

```
    subscribe webpack-internal:///(app-pages-browser)/./node_modules/zen-observable-ts/module.js:268
```

```
    complete webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/Concast.js:119
```

```
    start webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/Concast.js:160
```

```
    Concast webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/utilities/observables/Concast.js:145
```

```
    getObservableFromLink webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:789
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:159
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:158
```

```
    step webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:183
```

```
    verb webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:164
```

```
    __awaiter webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:157
```

```
    __awaiter webpack-internal:///(app-pages-browser)/./node_modules/tslib/tslib.es6.mjs:153
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/QueryManager.js:118
```

```
    mutate webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/core/ApolloClient.js:264
```

```
    execute webpack-internal:///(app-pages-browser)/./node_modules/@apollo/client/react/hooks/useMutation.js:106
```

```
    handleCreateLead webpack-internal:///(app-pages-browser)/./src/app/dashboard/leads/page.tsx:353
```

```
    executeDispatch webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16922
```

```
    runWithFiberInDEV webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:876
```

```
    processDispatchQueue webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16972
```

```
    dispatchEventForPluginEventSystem webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17573
```

```
    batchedUpdates$1 webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:3313
```

```
    dispatchEventForPluginEventSystem webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17126
```

```
    dispatchEvent webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:21309
```

```
    dispatchDiscreteEvent webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:21277
```

```
    addTrappedEventListener webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17073
```

```
    listenToNativeEvent webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17008
```

```
    listenToAllSupportedEvents webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17021
```

```
    listenToAllSupportedEvents webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17018
```

```
    hydrateRoot webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:25690
```

```
    hydrate webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:220
```

```
    startTransition React
```

```
    hydrate webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:219
```

```
    <anonymous> webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js:16
```

```
    appBootstrap webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-bootstrap.js:62
```

```
    loadScriptsInSequence webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-bootstrap.js:23
```

```
    appBootstrap webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-bootstrap.js:56
```

```
    <anonymous> webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js:13
```

```
    NextJS 7
```

- Lead Creation and Lead Pipeline
    - When adding an opportunity, there is no field validation. Was able to create an opportunity with no Amount added, no expected close date. Amount should be a required field.
    - Clearly identify required fields in 'Add An Opportunity' or 'Edit Opportunity'.
    - Opportunities able to be edited through all opportunity statuses.
    - Lead scoring is editable, and manual. No guidance or recommendations on how to use this field for users. Opportunity for UX improvement.
- Lead Activities
    - Activities are created when changes are made to opportunities, or opportunties are added only.
    - The history does show the changes, but also lists details when no change has occured, such as 'Amount: $35 -> $35'. Should only list changes in the activities tab details.

## 2.1 Chart of Accounts (BUS-5)

- Account Creation
    - Able to create a parent and child account.
    - The hierarchy between parent and child is broken in the Chart of Accounts Page. The Parent is indented and the Child below it is not.
    - When an account is created with a duplicate account code, the error is put out in console, not to the user.
    - Created one of every account type and category successfully.
- Account Management
    - Able to edit details, but can only edit the account name and account description, and change the 'Taxable' toggle.
    - No option to change account hierarchy.
    - No option to change account status.
    - Unfamiliar with account numbering, but can confirm, the account number is unique; cannot be reused by another account.
- Account Balance Calculations
    - Balance calculations not working, some accounts not being included in total.
    - Unsure how to test reconciliation, no button or options.
    - no financial reporting options beyond exporting the CSV file of the chart of accounts. missing module/function?

## 2.2 Transaction Management (BUS-6)

- Transaction Creation
    - Able to create transactions and pick an account to assign to.
    - Can create Credit or Debit transactions.
    - Categories working; but it is not a required field, or a drop down. Perhaps better as something the user can setup and choose from a pre-defined list created by the business owner/admin?
    - Transaction History has a 'Create' entry, where it has null -> new value. What is best practice? I assume to not have history unless something changes from initial creation?
    - Transactions assigned to created (not system) accounts, do not show up updated in the Chart of Accounts. Need to verify that transactions, regardless of which account they are assigned to, update the balance and account appropriately.
    - No account history to view to be able to see history of transactions or if they are applying correctly.
- Transaction Editing
    - Able to edit transaction details, such as Credit or Debit, Amount, Description, REference, Category and Date.
    - Unable to edit transaction account.
    - No transaction status shown. Unable to edit transaction status.
    - When edits are made, the history isn't updated. It shows the initial 'CREATE' history, but not the edits. SHould show up immediately after making the edit.
- Transaction History
    - Able to view history of transaction.
    - No search function or field on the Transaction page to test. Needs to be added.
    - Unable to test audit trail accuracy due to lack of history entries when edits are made.
    - No option to export a transaction.

## 2.3 Invoice Generation (BUS-7)

- Invoice Creation
    - Able to create invoice successfully. Slight delay from when you click Create Invoice to when it goes to the next screen.
    - No max character count shown for Invoice Notes when Creating Invoice
    - Light grey text on white background used on view Invoice page under Issue Date, Due Date, Currency, Subtotal, Tax, VAT and Total.
    - Below Bill To: Company Name, there is two brackets that seem out of place {}
    - Tax rate seems to be calculated correctly on the Create Invoice screen.
    - On the view invoice screen - Tax is being incorrectly calculated. When 11 is entered as a tax rate, it should be counted as 11%. It is not doing that right now, it looks to be multiplying the subtotal by 11.
    - On the view invoice screen - VAT is being incorrectly calculated. When VAT rate is entered, it should be considered as a percentage. It is currently multiplying the line item total by the VAT rate entered, which is incorrect.
- Invoice Management & Invoice Detail / Edit Pages
    - When editing an invoice Invoice Item, the Invoice Item line jumps downwards when you start to enter date. Not ideal for users.
    - The tax rate seem to be calculated correctly on the Edit Invoice screen.
    - There are some item with light grey text on a white background on the Edit Invoice screen, including Total.
    - No option to change Invoice STatus on the Edit Invoice screen.
    - When you click 'send' it shows as sent, but unsure if anything is actually happening. Changes status to 'Sent'.
    - When I click 'Void' button, it changes status to Void.
    - Can click to download Invoice, but doesn't actually bring up a PDF. Just a web display of the Invoice. WHen I click 'Print/Save As PDF', it brings up the default browser options to print or print to PDF. Ideally the system should generate a PDF.
    - THe Preview PDF takes you the same web based preview of just the invoice, not a PDF. Clicking on the 'Download PDF' brings you to the default browser options to print or print to PDF. Should be a generated PDF from within the system.
    - Send email button does nothing. No errors.
    - When Invoices are created, they do not show up on the Invoices page immediately (or at all). Should be instantly updated with any invoices or changes.
- Invoice History & Audit Trail
    - able to view invoice history
    - when editing an invoice, the history is not updated immediately.
    - User attrition appears to work for the entries that were there before any edits were made during testing.