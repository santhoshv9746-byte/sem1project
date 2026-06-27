# ASSETLOCK

## 📋 ASSESSMENT COVER SHEET
* **Student Name:** Santhosh Vellamuthu
* **Student Number:** 20090020
* **Programme:** MSc in Information Systems with Computing
* **Lecturer Name:** Paul Laird
* **Module/Subject Title:** Programming for Information Systems (B9IS123)
* **Assessment Title:** AssetLock

---

## 🛠️ Project Overview: ToolShare
ToolShare is a centralized web platform engineered to automate neighborhood asset sharing and equipment safety compliance. The system replaces traditional paperwork with real-time equipment allocation, dynamic availability tracking, and automated lifecycle management via an uncomplicated dashboard layout.

### Unique Feature: Usage-Based Safety Lock & Automated Maintenance Engine
To address real-world physical safety concerns inside a shared community environment, this application features a custom usage tracker built into the API backend business logic. 
* Every time a tool is checked out and returned, its system usage cycle increases by 1.
* When a tool hits a threshold of **5 borrow cycles**, the backend automatically triggers a status shift to **"Maintenance Lock"** and marks it as **"Requires Safety Check."**
* The native JavaScript frontend reads this data state from the API and instantly updates the Document Object Model (DOM) to remove the standard borrowing options, completely freezing the asset until an authorized administrator performs a physical safety inspection and executes a manual maintenance reset.

---

## 🛡️ ACADEMIC INTEGRITY & GENAI ATTRIBUTION REGISTER
In strict compliance with Dublin Business School Quality Assurance regulations and the guidelines established under the **Generative Artificial Intelligence Assessment Scale (Category 4: AI Task Completion, Human Evaluation)**, this document registers all external development assistance:

* **Assistance Source:** Co-developed with Gemini (Large Language Model by Google).
* **Scope of Assistance:** AI was used to brainstorm structural code syntax, design the file schema tracking system for `database.json`, and generate the foundational layout for the Flask backend routing matrix.
* **Student Verification:** The design parameters, edge-case validation testing logic, specific usage-based math counter parameters, and final script debugging calibrations were checked, tested, and systematically committed to the repository manually by the student.

---

## 📅 Development Milestones (4-Day Log Flow)
* **Day 1:** Repository Initialization, Storage JSON Schema Architecture, and Core Flask API CRUD Layout.
