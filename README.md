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
**ToolShare** is an app that makes borrowing tools easy, safe, and entirely paperless. Instead of physical clipboards or who has the lawnower, our lives dashboard lets us see whats available instantly. it automatically tracks maintenance and safety checks in the background, so we always know the gear we are borrowing is safe to use.

Built on a fast Python/Flask backbone with a mobile-friendly interface. ToolShare stays updated automatically. Everytime we improve the code, our cloud pipeline pushes the updates live instantly without breaking a sweat.

### 🛡️ Unique Feature: Usage-Based Safety Lock & Inspection Engine
To address real-world safety concerns inside a shared community environment, this application features an automated usage-tracking mechanism built directly into the backend business logic:
* Every time a tool is checked out and returned, its operational cycle counter increments by `1`.
* When an asset hits a threshold of **5 borrow cycles**, the backend controller automatically intercepts the data state, triggers a status shift to **"Maintenance Lock"**, and flags the record as **"Requires Inspection."**
* The JavaScript frontend instantly updates the Document Object Model (DOM) to strip away active checkout controls, freezing the node from public deployment until an authorized supervisor performs a physical safety check and executes a manual maintenance reset.

---

## 📊 Technical Architecture & Language Stack
The platform functions as a single, unified monolithic web application structured across four core technologies:
1. **Python (Backend):** Powers `app.py` to handle the REST API routing logic, HTTP request processing, and sequential updates to the data layer.
2. **JSON (Datastore):** Acts as the flat-file database storage layer (`database.json`), maintaining independent collections for `tools`, `users`, and system transaction records.
3. **HTML5 (Frontend Structure):** Provides the clean semantic layout matrix inside `index.html` to render forms, user tables, and status cards.
4. **CSS3 (Design Styles):** Implements a clean, readable light corporate framework inside `style.css` for clear visual margins and intuitive status coloring.
5. **JavaScript (Frontend Logic):** Executes asynchronous API calls, manages form interactions, filters arrays in real-time based on search parameters, and dynamically mutates viewport grid blocks without requiring page reloads.

---

## 🛡️ Academic Integrity & GenAI Attribution Register
In strict compliance with Dublin Business School Quality Assurance regulations and the guidelines established under the **Generative Artificial Intelligence Assessment Scale (Category 4: AI Task Completion, Human Evaluation)**, this document registers all external development assistance:

* **Assistance Source:** Co-developed with Gemini (Large Language Model by Google).
* **Scope of Assistance:** AI assistance was utilized to brainstorm structural code syntax, design the file schema tracking system for `database.json`, and generate the foundational layout for the Flask backend routing matrix.
* **Student Verification:** The structural parameters, edge-case validation testing logic, specific usage-based math counter parameters, and final script debugging calibrations were checked, tested, and systematically committed to the repository manually by the student.

---

## 📅 Development Milestones
* **Day 1:** Repository Initialization, Storage JSON Schema Architecture, and Core Flask API CRUD Layout.
* **Day 2:** User Management Expansion, Client-Side API Integration, and Dynamic Real-Time Data Syncing.
* **Day 3:** Core Code Refactoring for Production Optimization, Structural Code Simplification, and Sequential Commit Log Pipeline.
