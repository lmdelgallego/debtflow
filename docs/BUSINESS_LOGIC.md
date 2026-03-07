# DebtFlow — Business Logic

## 1. Product Purpose

DebtFlow is a micro-SaaS that helps users understand their real monthly cash flow and prioritize debt repayment using the **Avalanche Method**.

The product is designed for users with:
- fixed and/or variable income
- multiple debts
- a need for a simple, actionable repayment plan
- no desire to use complex spreadsheets

The core promise is:
> show the user how much money is actually available for debt repayment each month, and which debt to attack first.

---

## 2. Core Domain Concepts

### User
A registered person who owns financial data:
- incomes
- expenses
- debts
- subscription status

Each user must only access their own data.

---

### Income
Represents a monthly source of money.

Fields:
- `type`: `fixed` | `variable`
- `amount`

Rules:
- amount must be >= 0
- a user can have multiple incomes
- all incomes are summed to calculate total monthly income

---

### Expense
Represents a monthly outgoing payment.

Fields:
- `name`
- `type`: `fixed` | `variable`
- `amount`

Rules:
- amount must be >= 0
- a user can have multiple expenses
- all expenses are summed to calculate total monthly expenses

---

### Debt
Represents a liability the user wants to repay.

Fields:
- `name`
- `balance`
- `interestRate`
- `minimumPayment`
- `paymentDay`

Rules:
- `balance >= 0`
- `interestRate >= 0`
- `minimumPayment >= 0`
- `paymentDay` must be between 1 and 31
- debts with `balance = 0` are ignored by the repayment engine

---

### Subscription
Controls whether the user can access the full dashboard and repayment planning.

Possible statuses:
- `trial`
- `active`
- `inactive`

Rules:
- users in `trial` or `active` can use the planner
- users in `inactive` may be blocked by paywall rules

---

## 3. Main Business Goal

The main business logic of the app is to compute a **monthly debt repayment plan**.

The system must answer:
1. How much money does the user earn every month?
2. How much money does the user spend every month?
3. How much money is left to attack debt?
4. Which debt should be attacked first?
5. How should the monthly debt budget be distributed?

---

## 4. Financial Calculation Model

### 4.1 Total Income
Formula:

`totalIncome = sum(all incomes.amount)`

---

### 4.2 Total Expenses
Formula:

`totalExpenses = sum(all expenses.amount)`

---

### 4.3 Monthly Budget Available for Debt
Formula:

`monthlyDebtBudget = totalIncome - totalExpenses - savings`

Where:
- `savings` is optional
- if savings is not provided, it can default to `0`

Rules:
- if result is negative, set it to `0`
- if result is `0`, user is in a no-budget state and cannot meaningfully accelerate debt repayment

---

## 5. Debt Prioritization Strategy

DebtFlow uses the **Avalanche Method** by default.

### Avalanche Method
Debts are ordered by:
1. highest interest rate first
2. if two debts have the same interest rate, smaller balance first

This means:
- all active debts receive their minimum payment
- all extra money goes to the highest-interest debt
- when a debt is fully paid, the extra money rolls into the next debt

This is the main repayment strategy of the app.

---

## 6. Repayment Modes

The repayment engine has 3 modes.

### 6.1 NORMAL
Condition:
- `monthlyDebtBudget >= sum(all minimum payments)`

Behavior:
- pay minimum to every active debt
- allocate all remaining money to the top-priority debt
- if top-priority debt is fully covered, move remaining extra to the next debt

---

### 6.2 CRISIS_NO_MINIMUMS
Condition:
- `monthlyDebtBudget > 0`
- `monthlyDebtBudget < sum(all minimum payments)`

Behavior:
- user cannot cover all minimum payments
- available budget is prorated across debts based on their minimum payments
- user should be warned that they are in financial distress

This mode is not “healthy”; it is defensive.

---

### 6.3 NO_BUDGET
Condition:
- `monthlyDebtBudget == 0`

Behavior:
- no debt payment recommendation beyond showing the situation
- all recommended payments can be `0`
- user should be warned that income, expenses, or savings assumptions must change

---

## 7. Avalanche Allocation Rules

### Step 1
Filter only active debts:

- only debts with `balance > 0` are included

### Step 2
Sort debts:

- highest `interestRate` first
- tie-break by lowest `balance`

### Step 3
Calculate:

- `sumMinimums = sum(debt.minimumPayment for all active debts)`

### Step 4
Compare budget vs minimums:
- if budget == 0 → `NO_BUDGET`
- if budget < sumMinimums → `CRISIS_NO_MINIMUMS`
- otherwise → `NORMAL`

### Step 5 (NORMAL)
- assign each debt its `minimumPayment`
- compute `remaining = monthlyDebtBudget - sumMinimums`
- iterate through debts in priority order
- add extra payment to the current debt
- never recommend paying more than the remaining balance
- if a debt is fully covered, move the rest to the next one

### Step 6
Return:
- totals
- ordered debts
- recommended payments
- next target debt
- repayment mode

---

## 8. Recommended Output Shape

The planner should return:

- `income`
- `expenses`
- `savings`
- `monthlyDebtBudget`
- `sumMinimums`
- `deficitToMinimums`
- `remainingAfterMinimums`
- `orderedDebts`
- `recommendedPayments`
- `nextTargetDebtId`
- `mode`

Each recommended payment should include:
- debt id
- debt name
- minimum payment
- recommended payment
- extra applied
- projected balance after payment

---

## 9. Business Rules That Must Not Be Broken

### Data Ownership
- every record belongs to a single user
- users must never access another user’s data
- row-level security should enforce this

### No Overpayment
- recommended payment must never exceed current debt balance

### No Negative Values
- income, expense, balance, rate, minimum payment must never be negative

### Ignore Closed Debts
- debts with `balance = 0` should not affect repayment order

### Budget Floor
- monthly debt budget cannot be negative
- negative values must be clamped to `0`

### Single Source of Truth
- repayment plans should be calculated from DB data owned by the authenticated user
- the frontend should not be trusted as the source of financial truth

---

## 10. UX Intent Behind the Logic

The product should feel:
- brutally simple
- actionable
- clear in less than 10 seconds

The user should immediately understand:
- total income
- total expenses
- available money for debt
- debt to attack first
- payment distribution

This is not a generic budgeting app.
This is a **debt attack tool**.

---

## 11. MVP Scope

### Included in MVP
- authentication
- CRUD for incomes
- CRUD for expenses
- CRUD for debts
- avalanche repayment calculation
- dashboard with recommendation
- paywall / subscription gating

### Explicitly Excluded from MVP
- bank integrations
- automatic transaction import
- advanced analytics
- mobile app
- AI coaching
- debt snowball strategy
- amortization tables with exact monthly interest accrual
- investment planning
- complex categorization

---

## 12. Future Business Logic Possibilities

Not for MVP, but possible later:
- support both Avalanche and Snowball strategies
- monthly historical snapshots
- exact payoff timeline simulation
- alerts for payment dates
- debt negotiation recommendations
- emergency mode suggestions
- local currency formatting by country
- onboarding presets by region (LATAM, US, etc.)

---

## 13. AI Implementation Guidance

When implementing features for DebtFlow, always prioritize:
1. correctness of financial calculations
2. simplicity of the user experience
3. clean API contracts
4. data isolation per user
5. avoiding overengineering

When in doubt:
- prefer a simpler model
- do not invent advanced finance features
- do not add bank integrations
- do not redesign the product into a full budgeting suite

DebtFlow’s MVP exists to do one thing extremely well:
> tell the user how to attack debt this month.

---

## 14. Example Mental Model

Example:
- total income = 17,000,000
- total expenses = 7,000,000
- savings = 500,000

Then:

`monthlyDebtBudget = 9,500,000`

If all debt minimums sum to `8,000,000`, then:
- all minimums are covered
- extra `1,500,000` goes to the highest-interest debt

If highest-interest debt only needs `700,000` extra to close:
- assign `700,000`
- move remaining `800,000` to the next debt

This rollover behavior is essential.

---

## 15. Final Principle

DebtFlow should always optimize for:
- less confusion
- faster action
- faster debt exit

If a feature does not help the user repay debt faster or understand their debt better, it probably does not belong in the MVP.
