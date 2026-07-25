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

## 🗄️ JSON Database Schema

Data is stored locally in structured arrays inside a quick little JSON file(`database.json`).

### 1. `tools` Structure
Tracks individual equipment assets, current operational availability, and safety usage limits.

| Field | Data Type | Constraints / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | STRING | Unique Identifier (`tool_{timestamp}`) | Automatically generated custom unique ID for each tool. |
| `name` | STRING | NOT NULL | The public name/model description of the tool. |
| `category` | STRING | NOT NULL | Categorization group (e.g., Power Tools, Gardening). |
| `status` | STRING | `Available`, `Borrowed`, or `Maintenance Lock` | Current operational state of the asset. |
| `borrow_count` | INTEGER | DEFAULT `0`, Limit `5` | Tracking counter incremented on every return to trigger safety locks. |
| `assigned_user` | STRING / NULL | Matches a user's `name` or `null` | The name of the member currently borrowing the tool. |

### 2. `users` Structure
Manages active members profiles and usage stats.

| Field | Data Type | Constraints / Format | Description |
| :--- | :--- | :--- | :--- |
| `name` | STRING | Letters and spaces only, UNIQUE | Full name profile handle used during tool assignment. |
| `uid` | STRING | Numbers only, UNIQUE | Custom system unique identification key for the member. |

### 3. `history` Structure
*   **Data Type:** ARRAY
*   **Description:** An empty array schema configuration reserved for future audit logs and historical checkout tracking metrics.

---
## CRUD Operations

ToolShare securely manages user profiles and tools listings using a quick local CRUD setup driven by async endpoints.

* **CREATE (Register Assets & Users):** 
  * **Tools:** When an administrator adds an item, the frontend passes a payload via a `POST` request. The backend strips whitespace, assigns an atomic timestamp identifier (`tool_{timestamp}`), sets the defaults (`status: "Available"`, `borrow_count: 0`), and appends the object to the JSON array.
    * **Endpoint:** `POST /api/tools`
  * **Users:** Validates incoming payloads to ensure usernames contain letters/spaces only, UIDs are purely numeric, and both values are structurally unique before writing to disk.
    * **Endpoint:** `POST /api/users`

* **READ (Fetch Live State Matrices):** 
  * The frontend initiates parallel asynchronous `fetch()` operations to read the database arrays. The UI template parsing engine consumes this raw dataset to dynamically construct the dashboard tables, state-dependent action cards, and responsive search bar filters on the fly.
    * **Endpoints:** `GET /api/tools` and `GET /api/users`

* **UPDATE (Lifecycle State Transitions & Safety Tripping):** 
  * Coordinates all status movements (`Available` $\leftrightarrow$ `Borrowed`). When an item is returned, the backend increments the `borrow_count` metric by 1. The moment the threshold hits **5 cycles**, the core logic locks the status to `Maintenance Lock`. The UI catches this shift, strips checkout abilities, and shows a "Reset Maintenance" button.
    * **Endpoint:** `PUT /api/tools/<tool_id>`

* **DELETE (System Asset & Account Purging):** 
  * **Tools:** Destroys a tool configuration object immediately by filtering its unique tracking ID out of the persistent array.
    * **Endpoint:** `DELETE /api/tools/<tool_id>`
  * **Users:** Evicts member authorization profiles out of the user data matrix using the account's unique UID string.
    * **Endpoint:** `DELETE /api/users/<uid>`
---
## Ubuntu Server Deployment Guide (GCP)
    GCP server configurations:

        Instance name: instance-2009xcxx-app
        instance type: 2 vCPU + 4 GB memory
        OS : Ubuntu 24.04 LTS Minimal
        Ports: allow HTTPS, HTTP, Custom port as needed by application 5000
        External IP address
        custom ssh key to login to server
---
## Configuration to Run Application in Ubuntu Server

     reference: https://docs.vultr.com/how-to-install-flask-on-ubuntu-24-04
     
     sudo apt update && sudo apt upgrade -y
     sudo apt-get install python3-pip -y
     sudo apt install python3.12-venv -y
     python3 -m venv venv
     source venv/bin/activate
     pip3 install -r requirements.txt
     python3 app.py

---
<div align="center">

<img width="1516" height="849" alt="image" src="https://github.com/user-attachments/assets/c18fa61e-1780-4bf0-afda-5a9503e4eaba" />

<img width="1606" height="848" alt="image" src="https://github.com/user-attachments/assets/a3c022e1-52a8-45bb-8375-560f82c8b209" />

</div>

---

## 📌 References and Sources

### Python, Flask & Frontend Architecture Documentation:
* (https://www.w3schools.com/)
* (https://www.geeksforgeeks.org/python/flask-tutorial/)
* (https://developer.mozilla.org/en-US/docs/Web/CSS)
* (https://www.youtube.com/watch?v=rOg9YYdZ8Mo)
* (https://www.youtube.com/watch?v=dRtGaH0vtYg)

### Readme File updates:
* *README.md Structure and Layout Blueprint*  
  Adapted with permission from repository structure designed by classmate krishna / GitHub: @krishnazen27

### Gemini AI used chats:
* (https://share.gemini.google/isLns2ZcGcEf)
* (https://share.gemini.google/3pV0a5BKHO3v)
* (https://share.gemini.google/CTTyZ72VTdeI)
* https://share.gemini.google/MxZt2iK5ALgs

