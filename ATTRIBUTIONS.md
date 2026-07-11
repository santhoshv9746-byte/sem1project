---
# Academic Integrity & Generative AI Attributions Log
This register is a straightforward, transparent breakdown of where generative AI was used to help bounce ideas around, set up boilerplate code, or scaffold the initial architecture for the **ToolShare Asset Management System** master's project.

---
## Milestone Timeline Register
### Phase 1: Backend Architecture & Data Layer Setup
**Scope:** Local Data Persistence, Flask REST API Foundations, and Tool Inventory Base Models.

#### 1. Generative Assistance Disclosure
**Assisted Components:** Core setup of app.py and the local array structures inside database.json.

**AI Engine Model:** Gemini Architecture Core

**Interaction Strategy:** I asked the assistant to sketch out a lightweight Python Flask microserver template. Specifically, I used AI-generated patterns to establish the boilerplate for local file-handling (read_db and write_db) so the app can read and write JSON records safely without corrupting the file stream on disk.

#### 2. Custom Design Enhancements
**Payload Validation Checks:** I personally built the validation rules for incoming data. I refactored the data parser to catch empty form fields right away, forcing an immediate HTTP 400 Bad Request if mandatory fields like name or category are missing.

**Collision-Free Tracking IDs:** I coded an automatic timestamping feature (tool_{timestamp}) using native Python tools to guarantee that every single asset gets a permanently unique database key.

**Architectural Schema Resolution:** I mapped out the base layout for database.json. While I included a history array placeholder as a blueprint for future audit logs, I focused the actual business logic strictly on the tools array state to keep the core assignment requirements clean and functional.

---
### Phase 2: Safety Intercept Lockout Engine & User Routing
**Scope:** Business Logic Constraints,Rental Counters,and User Lifecycle Controls.

#### Generative Assistance Disclosure
**Assisted Components:** Secondary multi-collection mapping templates for user lookup routing.

**AI Engine Model:** Gemini Architecture Core

**Interaction Strategy:** I consulted the AI model to look at different structural approaches for running side-by-side collections (tools vs. users) within a single, flat-file JSON structure.

#### 2. Custom Design Enhancements
**Automated Safety Interceptor:** Designed and coded the conditional lockout rule inside the `PUT` tool route. Built the engine to monitor usage count, intercepting standard return requests to automatically switch tool visibility status to `Maintenance Lock` as soon as a tool hits **5 borrow cycles**.

**Automated Mutation Refactoring:** Wrote the custom inline filter arrays to safely purge single elements (deleting a user or tool) out of the data layers without breaking index sequences.

---
