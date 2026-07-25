# 🔧 ToolShare Admin Platform

##  Assessment Cover Sheet
* **Student Name:** Santhosh Vellamuthu
* **Student Number:** 20090020
* **Programme:** MSc in Information Systems with Computing
* **Lecturer Name:** Paul Laird
* **Module/Subject Title:** Programming for Information Systems (B9IS123)
* **Assessment Title:** ToolShare Asset Management System

---

##  Project Overview
**ToolShare** is a web app designed to make borrowing tools simple, safe, and entirely paperless. Instead of dealing with messy physical sign-out sheets or guessing who currently has the lawnmower, our live dashboard lets us to see exactly what’s available in real time. Because safety matters while sharing any tools, the app works in the background to automatically track tool wear and trigger maintenance flags, ensuring everything checked out is actually safe to use.

Under the hood, ToolShare is built on a fast, lightweight Python/Flask backend paired with a fully responsive, mobile-friendly frontend. I also set up a continuous deployment pipeline in the cloud, meaning any time I push a code improvement, the updates roll out live instantly without a hitch.

### Feature Spotlight: Smart Safety Locks
To make sure nobody borrows a broken weed wacker, I built an automated usage tracker directly into the backend. Every checkout-and-return cycle bumps a tool's counter up by 1. The moment a tool hits 5 cycles, the backend automatically triggers a **"Maintenance Lock"** and flags it as **"Requires Inspection."** JavaScript instantly catches this on the frontend, hiding the checkout buttons and slapping a warning label on the item. It stays locked down until a supervisor physically inspects the tool and resets the counter.

---

## Tech Stack & System Architecture
The platform is built as a lightweight, cohesive application using five core technologies:

1. **Python (Backend)**: Handles the core logic in app.py, managing data flow between the user interface and our storage layer.

2. **JSON (Datastore)**: Serves as our nimble database (database.json), organizing clean records for tools, users, and histories.

3. **HTML5 (Frontend Structure)**: Forms the skeleton of the app via index.html, rendering the inventory tables, forms, and status cards.

4. **CSS3 (Styling)**: Powers the layout in style.css, utilizing distinct alert colors to make locked tools stand out visually.

5. **JavaScript (Frontend Logic)**: Drives the live, dynamic updates in app.js—like searching, filtering, and checking out items—without annoying page reloads.

---

## API Summary

| API Endpoint | Method | Purpose | Authentication Required |
| :--- | :--- | :--- | :--- |
| `/` | GET | Serves the main frontend dashboard (`index.html`). | No |
| `/api/tools` | GET | Fetches all active tools stored in the system inventory. | No |
| `/api/tools` | POST | Registers a new asset tool into the system datastore. | No |
| `/api/tools/<tool_id>` | PUT | Updates a tool's status (Check-out, Return, or Maintenance Reset). | No |
| `/api/tools/<tool_id>` | DELETE | Permanently purges a specific tool asset from the system. | No |
| `/api/users` | GET | Fetches a list of all registered tool-borrowing members. | No |
| `/api/users` | POST | Enrolls a new user validation profile into the system records. | No |
| `/api/users/<uid>` | DELETE | Removes a member's profile authorization data by User ID. | No |

---

## Project Development Phases
**Phase 1: Backend Architecture & Data Foundations**
1. **Completed Code Assets:** app.py (Storage helpers, core Flask server, and the /api/tools endpoints) and index.html (Header structure and the "Add New Tool" form layout).

2. **GenAI Utilization:** I used Gemini to quickly spin up a baseline Flask server structure. I also leaned on AI patterns to figure out how to safely handle local file-writing on disk and map out the initial routing layout.

3. **Modifications & Refinement:**

  * **Data Validation:** I refactored the incoming data parsers to block empty form submissions,       making sure the server throws a clear HTTP 400 bad request if any critical info is missing.
   
  * **Dynamic Unique IDs:** I set up a custom timestamping system (tool_{timestamp}) to guarantee that no two items ever accidentally share the same ID.
   
  * **Database Schema Strategy:** I added an empty history array inside database.json  during this phase as a placeholder for future audit logs. To keep the focus on getting the core safety lockout engine working first, this key is currently left alone by the live backend routes.

**Phase 2: Safety Lockout Engine & User Operations**
1. **Completed Code Assets:** app.py (Lockout verification logic, /api/users endpoints) and index.html (New User Form section and User List container layout).

2. **Modifications & Refinement:**

 * **Safety Lockout Engine:** I personally engineered the conditional tracking logic inside the PUT handler to monitor tool returns. The code checks the payload sequences on every return and automatically triggers a strict Maintenance Lock the exact moment an item crosses its 5-use limit.

* **User Relationship Wiring:** I built clean lookup arrays to handle user profile creation safely. This ensures administrators can easily link registered users to active tools without risking any broken arrays or backend crashes.

 **Phase 3: Live User Interface & Dynamic Cards**
1. **Completed Code Assets:** `app.js` and `style.css` - Dynamic UI template loops, form handlers, and API action connectors and Base layout framework and asset card configurations.

2. **GenAI Utilization:** I used Gemini to quickly skwtch a simple,unstyled layout template for the forms and users lists. I also used it to outline a clean JAvaScript `async/await` structure for communicating with our backend APIs, along with a basic CSS layout scheme.

3. **Custom Modifications & Refinement:**

* **Custom Frontend State Logic** (`app.js`): I completely rewrote the dynamic card system to alter the visible interface instantly depending on the current database state. I programmed specific condition switches to toggle standard dropdown selectors when tools are Available, replace options with a simple return button when Borrowed, and automatically swap in a high-priority "Reset Maintenance" button if a tool gets locked out.

* **Instant Visual UI Alerting:** I configured the frontend renderer to catch safety status shifts on the fly. I programmed inline style overrides inside the template literal script, forcing text alerts to render bold red and locking down the checkout buttons whenever a tool crosses into the maintenance state.

* **Data Refresh Synchronization:** I wired up data refresh chains across all checkout, creation, return, and removal functions. Every successful action triggers an immediate, seamless database re-read, refreshing the UI instantly without forcing a full, frustrating browser reload.

### **Phase 4: Optimization, Code Simplification & Final Verification**
* **Completed Code Assets:** `app.js` (Real-time search bar engine), `style.css` (Visual alignment polish), general codebase formatting.
 
* **Custom Modifications & Refinement:** I ran manual tests across all endpoint error responses to make sure things fail gracefully. I also built the instant frontend string matcher for the search bar, stripped out redundant function chains to keep the scripts lean, cleared out any leftover structural placeholders, and did a final verification pass to ensure it runs completely clean ahead of the project review.
