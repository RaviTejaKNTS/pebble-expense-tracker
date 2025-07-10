# Pebble Expense Tracker

This is a super lightweight expense tracker built with plain HTML, CSS and JavaScript.
All screens now use Google's Material Web Components library for a bold Material 3 look. A sidebar lists Home, Categories and Settings. Clicking a link loads that page inside the drawer which expands to a darker panel matching the add button, and a close button collapses it again.
The Home page centers the total you've spent today so it's easy to see at a glance.
Click the floating "+" button in the bottom right corner to expand a colored pop-up form and add an expense without leaving the page. The amount field is focused automatically for speedy entry and you can move through the form with the down arrow key. Tap the date button to smoothly expand an inline calendar. After choosing a day, the calendar collapses back into the button. Tap the category button to reveal a grid of chips for quick selection. Use the close icon or press Esc to dismiss the form.
All data is stored in your browser using `localStorage` so it works completely offline. You can choose the currency symbol from the Settings panel's searchable dropdown and it will be used everywhere.

Open `index.html` in your browser to start using it. No build step or dependencies are required.
