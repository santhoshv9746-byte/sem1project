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

## AI Attribution & Academic Integrity
To stay fully transparent with DBS Quality Assurance rules and the GenAI Assessment Scale (Category 4), here is exactly how GenAI helped shape this project:

**The Collaborator**: Gemini (Google LLM).

**The AI's Job**: I used Gemini as an architectural sounding board to map out some of the trickier data patterns, such as setting up safe read_db and write_db functions to avoid JSON corruption, structuring user-lookup routes, and scaffolding the asynchronous async/await pipeline in JS.

**My Job** : While AI helped lay the foundational tracks, I wrote and customized all the actual mechanics. The 5-cycle threshold logic, data validation, UI state switching, and live DOM updates were entirely designed, written, and iteratively committed by me.

---

## Project Development Phases
**Phase 1: Backend Architecture & Data Foundations**
1. **Completed Code Assets:** app.py (Storage helpers, core Flask server, and the /api/tools endpoints) and index.html (Header structure and the "Add New Tool" form layout).

2. **GenAI Utilization:** I used Gemini to quickly spin up a baseline Flask server structure. I also leaned on AI patterns to figure out how to safely handle local file-writing on disk and map out the initial routing layout.
