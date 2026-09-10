# Budget Lens

Build a web application called "BudgetLens" — a simple, visual expense tracker that helps users understand their spending without needing to learn any spreadsheet formulas.

CORE CONCEPT:

The user simply logs an expense (amount, category, optional note, date) in a few taps. The app automatically calculates totals, detects spending patterns, and shows everything through clear charts and plain-language insights — no formulas, no manual calculations, nothing technical required from the user.

DESIGN REQUIREMENTS:

- Clean, modern, mobile-responsive design that works well on both desktop and phone browsers.

- Use a calming color palette — a primary color like a soft teal or emerald green (representing financial health), with a clean white/light gray background, and a warm red/orange accent color reserved specifically for "overspending" warnings.

- Use clear typography, generous spacing, and rounded cards — avoid a cluttered, spreadsheet-like appearance since the whole point is to feel simpler than Excel.

- Include a simple, friendly logo/wordmark for "BudgetLens" in the top navigation bar.

CORE FEATURES:

1. Add Expense (the primary action):

   - A prominent "+ Add Expense" button, always easily accessible (e.g., a floating action button).

   - Fields: Amount (required, numeric), Category (required — provide a dropdown with common categories: Food, Transport, Bills, Shopping, Entertainment, Health, Education, Rent, Other), Date (defaults to today, but editable), and an optional short note.

   - Saving an expense should be fast — one or two taps, no unnecessary steps.

2. Dashboard / Home Screen (the main view):

   - Show the current month's total spending prominently at the top.

   - Show a comparison to the previous month (e.g., "You've spent 15% more than last month" with a small up/down arrow indicator).

   - Display an automatically generated pie chart or donut chart showing spending broken down by category for the current month.

   - Display a bar chart or line chart showing daily or weekly spending trends within the current month.

   - Show a simple list of recent expenses below the charts, each with category icon, amount, date, and note.

3. Automatic Insights (this is the key differentiator from Excel — must feel "smart" without being complicated):

   - Automatically detect and display simple, plain-language insights such as:

     - "You've spent the most on [Category] this month."

     - "Your spending on [Category] increased by X% compared to last month."

     - "You're on track to spend more than last month if this pace continues."

     - "No expenses logged in [Category] this month — nice!"

   - These insights should update automatically as new expenses are added — no user calculation required.

4. Monthly History / Browse Past Months:

   - Allow the user to switch between months (e.g., a simple month selector) to view past spending, with the same charts and insights recalculated for that month.

5. Category Management:

   - Allow the user to see a breakdown of total spending per category, sorted from highest to lowest, with a simple horizontal bar showing relative proportion.

6. Data Persistence:

   - Since this is a personal tool with no login/signup required, store all data locally in the browser (using local storage or a similar client-side storage method) so the user's data persists between visits without needing an account.

   - Include a simple "Export Data" or "Clear All Data" option in a settings/menu area, in case the user wants to reset or back up their data.

TECHNICAL PREFERENCES:

- Build this as a React web application with a clean component structure.

- Use a charting library (such as Recharts or Chart.js) to render the pie/donut and bar/line charts — make sure the charts are responsive and render correctly on mobile screen sizes.

- No backend, database, or user authentication is needed for this version — everything should work client-side with local browser storage.

- Ensure the app loads fast and works smoothly with no lag when adding expenses or switching between months.

IMPORTANT: Please make sure the insights logic (category totals, month-over-month comparison, "most spent category" detection) is calculated correctly and tested with a few sample expenses before considering this complete — this automatic insight generation is the core value of the app, so it must work reliably.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://spending-lens-clear.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/12e7335b-7a89-4eba-a5c0-705e647c1017).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
