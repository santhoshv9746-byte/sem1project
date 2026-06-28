document.addEventListener("DOMContentLoaded", () => {
    const toolForm = document.getElementById("toolForm");
    const userForm = document.getElementById("userForm");
    const inventoryGrid = document.getElementById("inventoryGrid");
    const searchBar = document.getElementById("searchBar");
    const userBadgeRegistry = document.getElementById("userBadgeRegistry");
    const complianceHistoryLog = document.getElementById("complianceHistoryLog");
    
    // Client-side visual caches representing database state blocks locally in browser
    let localCache = [];
    let activeUsers = [];
    let localHistoryCache = []; // Persistent storage for parsing records locally on demand

    // --- FUNCTION A: REST ASYNC HOOK RECOVERY (READ SYNCING PIPELINE WITH HISTORY) ---
    async function loadInventory() {
        try {
            // Simultaneously fetch tools, users directory, and transaction history
            const [toolsRes, usersRes, historyRes] = await Promise.all([
                fetch('/api/tools'),
                fetch('/api/users'),
                fetch('/api/history')
            ]);
            localCache = await toolsRes.json();
            activeUsers = await usersRes.json();
            localHistoryCache = await historyRes.json();
            
            // Decoupling step: trigger data calculators and populate interface structural grids
            calculateTelemetryMetrics(localCache);
            renderUserRegistry(activeUsers);
            renderGrid(localCache);
        } catch (error) {
            console.error("AJAX Conn Exception: Asynchronous query stream failure.", error);
        }
    }

    // --- FUNCTION B: TELEMETRY SYSTEM CALCULATOR ENGINE ---
    function calculateTelemetryMetrics(tools) {
        document.getElementById("statTotal").textContent = tools.length;
        document.getElementById("statAvailable").textContent = tools.filter(t => t.status === "Available").length;
        document.getElementById("statBorrowed").textContent = tools.filter(t => t.status === "Borrowed").length;
        document.getElementById("statLocked").textContent = tools.filter(t => t.status === "Maintenance Lock").length;
    }

    // --- FUNCTION C: CUSTODIAN BUBBLE DATA MAP DISPATCHER WITH ISOLATED LOG TRIGGERS ---
    function renderUserRegistry(users) {
        userBadgeRegistry.innerHTML = "";
        if (users.length === 0) {
            userBadgeRegistry.innerHTML = `<span style="color: var(--al-muted); font-size: 0.85rem; padding-left: 4px;">No authorized custodians registered inside active directory infrastructure.</span>`;
            return;
        }
        
        users.forEach(user => {
            const userRow = document.createElement("div");
            userRow.style.display = "flex";
            userRow.style.alignItems = "center";
            userRow.style.justifyContent = "space-between";
            userRow.style.background = "var(--al-input)";
            userRow.style.padding = "10px 16px";
            userRow.style.borderRadius = "10px";
            userRow.style.border = "1px solid var(--al-border)";
            userRow.style.width = "100%";

            userRow.innerHTML = `
                <div id="user-view-${user.uid}" style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #a5b4fc; font-weight: 600; font-size: 0.9rem;">👤 ${user.name}</span>
                    <code style="font-size: 0.75rem; color: var(--al-muted);">[ID: ${user.uid}]</code>
                </div>
                <div id="user-edit-${user.uid}" style="display: none; align-items: center; gap: 10px; flex: 1;">
                    <input type="text" id="edit-username-${user.uid}" value="${user.name}" class="al-input" style="padding: 4px 8px; font-size: 0.85rem; width: 140px;">
                    <button class="al-btn al-btn--primary" onclick="saveUserInlineEdits('${user.uid}')" style="padding: 4px 8px; font-size: 0.75rem;">Save</button>
                    <button class="al-btn al-btn--secondary" onclick="toggleUserEditMode('${user.uid}')" style="padding: 4px 8px; font-size: 0.75rem;">Cancel</button>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="al-btn" onclick="viewSpecificUserHistory('${user.uid}', '${user.name}')" style="padding: 4px 10px; font-size: 0.75rem; background-color: rgba(245, 158, 11, 0.15); color: var(--al-amber); border: 1px solid rgba(245, 158, 11, 0.3);">History</button>
                    <button class="al-btn al-btn--secondary" onclick="toggleUserEditMode('${user.uid}')" style="padding: 4px 10px; font-size: 0.75rem;">Modify</button>
                    <button class="al-btn al-btn--danger" onclick="removeRegisteredUser('${user.uid}')" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1);">Remove</button>
                </div>
            `;
            userBadgeRegistry.appendChild(userRow);
        });
    }

    // --- FUNCTION C2: CONDITIONAL CLIENT ARRAY LOG FILTER AND OVERLAY INJECTOR ---
    window.viewSpecificUserHistory = (uid, name) => {
        // Mutate the slide drawer title component dynamically to indicate scope focus
        document.getElementById("drawerTitle").innerHTML = `📜 Logs: ${name} <code style="font-size:0.8rem; color:var(--al-muted);">[${uid}]</code>`;
        
        complianceHistoryLog.innerHTML = "";
        
        // Isolate specific entry logs where unique identifier markers match the selector query
        const filteredEntries = localHistoryCache.filter(entry => entry.user_uid === uid);

        if (filteredEntries.length === 0) {
            complianceHistoryLog.innerHTML = `<span style="color: var(--al-muted); font-size: 0.85rem; padding: 12px 4px;">No checkout or return activities logged for this custodian.</span>`;
        } else {
            // Build visual timeline layers stacking recent audit trails onto the top viewport
            filteredEntries.slice().reverse().forEach(entry => {
                const row = document.createElement("div");
                row.style.fontSize = "0.82rem";
                row.style.padding = "10px 12px";
                row.style.background = "#141b2d";
                row.style.borderRadius = "8px";
                row.style.borderLeft = "3px solid var(--al-blue)";
                row.style.display = "flex";
                row.style.flexDirection = "column";
                row.style.gap = "4px";
                row.style.fontFamily = "monospace";

                if (entry.action.includes("Lock")) {
                    row.style.borderLeftColor = "var(--al-crimson)";
                    row.style.background = "rgba(239, 68, 68, 0.05)";
                } else if (entry.action.includes("Reset")) {
                    row.style.borderLeftColor = "var(--al-emerald)";
                }

                row.innerHTML = `
                    <div style="display: flex; justify-content: space-between; color: var(--al-muted); font-size: 0.72rem;">
                        <span>${entry.timestamp}</span>
                    </div>
                    <div style="color: var(--al-text); font-weight: 500;">
                        <strong style="color: #fff;">${entry.asset_name}</strong>: ${entry.action}
                    </div>
                `;
                complianceHistoryLog.appendChild(row);
            });
        }

        // Engage CSS rules to pull sliding drawer layout forward visibly
        document.getElementById("historyDrawer").classList.add("active");
    };

    // --- FUNCTION D: CORE HIGH-FIDELITY LAYOUT PANEL MATRIX RENDERER ---
    function renderGrid(tools) {
        inventoryGrid.innerHTML = ""; 
        tools.forEach(tool => {
            const card = document.createElement("div");
            card.className = "al-asset-card";

            let statusClass = "available";
            if (tool.status === "Borrowed") statusClass = "borrowed";
            if (tool.status === "Maintenance Lock") statusClass = "lock";

            let pipTrackHTML = "";
            for (let i = 0; i < 5; i++) {
                if (i < tool.borrow_count) {
                    pipTrackHTML += `<span class="al-cycle-pip ${tool.borrow_count >= 5 ? 'al-cycle-pip--max' : 'al-cycle-pip--on'}"></span>`;
                } else {
                    pipTrackHTML += `<span class="al-cycle-pip"></span>`;
                }
            }

            card.innerHTML = `
                <div>
                    <div class="al-card-top">
                        <span class="badge-status ${statusClass}">${tool.status}</span>
                        <code style="font-size:0.72rem; opacity:0.85; color:var(--al-muted);">${tool.id}</code>
                    </div>
                    <div id="view-mode-${tool.id}">
                        <h3 style="margin:12px 0 2px 0; font-size:1.2rem; font-weight:700; letter-spacing:-0.01em;">${tool.name}</h3>
                        <span class="al-asset-category">// COMPLEX FLUID CLUSTER: ${tool.category}</span>
                    </div>
                    <div id="edit-mode-${tool.id}" style="display:none; flex-direction:column; gap:8px; margin-top:10px;">
                        <input type="text" id="edit-name-${tool.id}" value="${tool.name}" class="al-input" style="padding:6px 10px;">
                        <input type="text" id="edit-cat-${tool.id}" value="${tool.category}" class="al-input" style="padding:6px 10px;">
                        <button class="al-btn al-btn--primary" onclick="saveInlineEdits('${tool.id}')" style="padding:6px; font-size:0.75rem;">Confirm Modifications Matrix</button>
                    </div>
                    <div class="al-meta-box">Hardware Safe Integrity: <strong style="color:${tool.condition === 'Excellent' ? 'var(--al-emerald)' : 'var(--al-crimson)'};">${tool.condition}</strong></div>
                    <div class="al-meta-box">Current Fleet Custodian: <code>${tool.assigned_user || 'SYSTEM STORAGE DEPOT (SECURE)'}</code></div>
                </div>
                <div>
                    <div style="font-size:0.78rem; color:var(--al-muted); margin-bottom:4px; text-align:right; font-weight:500;">
                        Lifecycle Run Threshold: <strong>${tool.borrow_count} / 5 Runs</strong>
                    </div>
                    <div class="al-cycle-track" style="margin-bottom:15px;">
                        ${pipTrackHTML}
                    </div>
                    ${renderInteractionButtons(tool)}
                    <div class="card-actions-row" style="margin-top: 10px;">
                        <button class="al-btn al-btn--secondary" onclick="toggleEditMode('${tool.id}')" style="font-size:0.78rem; padding:8px;">Edit Node</button>
                        <button class="al-btn al-btn--danger" onclick="decommissionNode('${tool.id}')" style="font-size:0.78rem; padding:8px;">Decommission</button>
                    </div>
                </div>
            `;
            inventoryGrid.appendChild(card);
        });
    }

    // --- FUNCTION E: CONDITIONAL COMPONENT ACTION HOOK CONTROLLER ---
    function renderInteractionButtons(tool) {
        if (tool.status === "Available") {
            let optionsHTML = `<option value="">-- Select Registered Operator --</option>`;
            activeUsers.forEach(user => {
                optionsHTML += `<option value="${user.name} [${user.uid}]">${user.name} (${user.uid})</option>`;
            });
            return `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <select id="assign-${tool.id}" class="al-input" style="padding:8px 10px; font-size:0.85rem; background-color: var(--al-input); color: var(--al-text); border: 1px solid var(--al-border); border-radius:10px;">
                        ${optionsHTML}
                    </select>
                    <button class="al-btn al-btn--emerald" onclick="processCheckOut('${tool.id}')" style="width:100%; padding:8px; font-size:0.85rem;">Authorize Deployment Out</button>
                </div>
            `;
        } else if (tool.status === "Borrowed") {
            return `<button class="al-btn al-btn--amber" onclick="processReturn('${tool.id}')" style="width:100%; padding:10px; color: #0b0f19;">Process Safe Operational Return</button>`;
        } else if (tool.status === "Maintenance Lock") {
            return `<button class="al-btn al-btn--crimson" onclick="processReset('${tool.id}')" style="width:100%; padding:10px; font-weight:bold; letter-spacing:0.02em;">AUTHORIZE SECURITY SAFETY RESET</button>`;
        }
        return "";
    }

    toolForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("toolName").value.trim();
        const category = document.getElementById("toolCategory").value.trim();
        const response = await fetch('/api/tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category })
        });
        if (response.ok) {
            toolForm.reset();
            loadInventory();
        }
    });

    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("newUserName").value.trim();
        const uid = document.getElementById("newUserID").value.trim();
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, uid })
        });
        if (response.ok) {
            userForm.reset();
            loadInventory();
        }
    });

    searchBar.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = localCache.filter(tool => 
            tool.name.toLowerCase().includes(query) || 
            tool.category.toLowerCase().includes(query)
        );
        renderGrid(filtered);
    });

    window.processCheckOut = async (id) => {
        const selectedUser = document.getElementById(`assign-${id}`).value;
        if (!selectedUser) {
            alert("Security Clearance Error: An authenticated directory custodian must be selected prior to hardware allocation.");
            return;
        }
        await fetch(`/api/tools/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Borrowed', assigned_user: selectedUser })
        });
        loadInventory();
    };

    window.processReturn = async (id) => {
        await fetch(`/api/tools/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Available', assigned_user: null })
        });
        loadInventory();
    };

    window.processReset = async (id) => {
        await fetch(`/api/tools/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reset_counter: true })
        });
        loadInventory();
    };

    window.decommissionNode = async (id) => {
        if (confirm("Critical Decommission Warning: Erase target record array index completely from datastore files?")) {
            await fetch(`/api/tools/${id}`, { method: 'DELETE' });
            loadInventory();
        }
    };

    window.toggleEditMode = (id) => {
        const viewDiv = document.getElementById(`view-mode-${id}`);
        const editDiv = document.getElementById(`edit-mode-${id}`);
        const isEditing = editDiv.style.display === "flex";
        viewDiv.style.display = isEditing ? "block" : "none";
        editDiv.style.display = isEditing ? "none" : "flex";
    };

    window.saveInlineEdits = async (id) => {
        const updatedName = document.getElementById(`edit-name-${id}`).value.trim();
        const updatedCat = document.getElementById(`edit-cat-${id}`).value.trim();
        if (!updatedName || !updatedCat) {
            alert("Validation Exception: Character inputs cannot evaluate to empty objects.");
            return;
        }
        await fetch(`/api/tools/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: updatedName, category: updatedCat })
        });
        loadInventory();
    };

    window.toggleUserEditMode = (uid) => {
        const viewEl = document.getElementById(`user-view-${uid}`);
        const editEl = document.getElementById(`user-edit-${uid}`);
        const isEditing = editEl.style.display === "flex";
        viewEl.style.display = isEditing ? "flex" : "none";
        editEl.style.display = isEditing ? "none" : "flex";
    };

    window.saveUserInlineEdits = async (uid) => {
        const revisedName = document.getElementById(`edit-username-${uid}`).value.trim();
        if (!revisedName) {
            alert("Validation Intercept: Name parameter field cannot remain blank.");
            return;
        }
        await fetch(`/api/users/${uid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: revisedName })
        });
        loadInventory();
    };

    window.removeRegisteredUser = async (uid) => {
        if (confirm(`Directory Eviction Warning: Permanently drop operator reference [${uid}] out of authorization records?`)) {
            await fetch(`/api/users/${uid}`, { method: 'DELETE' });
            loadInventory();
        }
    };

    window.toggleHistoryDrawer = () => {
        document.getElementById("historyDrawer").classList.remove("active");
    };

    // Load datastore elements upon interface terminal session instantiation
    loadInventory();
});