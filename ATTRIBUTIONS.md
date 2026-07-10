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

#### 2. Student Engineering & Refinements
**Payload Validation Checks:** I personally built the validation rules for incoming data. I refactored the data parser to catch empty form fields right away, forcing an immediate HTTP 400 Bad Request if mandatory fields like name or category are missing.

**Collision-Free Tracking IDs:** I coded an automatic timestamping feature (tool_{timestamp}) using native Python tools to guarantee that every single asset gets a permanently unique database key.
