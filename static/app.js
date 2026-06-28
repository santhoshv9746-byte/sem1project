document.addEventListener("DOMContentLoaded", () => {
    const toolForm = document.getElementById("toolForm");
    const userForm = document.getElementById("userForm");
    const inventoryGrid = document.getElementById("inventoryGrid");
    const searchBar = document.getElementById("searchBar");
    const userBadgeRegistry = document.getElementById("userBadgeRegistry");
    
    let localCache = [];
    let activeUsers = [];

    async function loadInventory() {
        try {
            const [toolsRes, usersRes] = await Promise.all([
                fetch('/api/tools'),
                fetch('/api/users')
            ]);
            localCache = await toolsRes.json();
            activeUsers = await usersRes.json();
            calculateTelemetryMetrics(localCache);
            renderUserRegistry(activeUsers);
            renderGrid(localCache);
        } catch (error) {
            console.error("AJAX Conn Exception: Asynchronous query stream failure.", error);
        }
    }

    function calculateTelemetryMetrics(tools) {
        document.getElementById("statTotal").textContent = tools.length;
        document.getElementById("statAvailable").textContent = tools.filter(t => t.status === "Available").length;
        document.getElementById("statBorrowed").textContent = tools.filter(t => t.status === "Borrowed").length;
        document.getElementById("statLocked").textContent = tools.filter(t => t.status === "Maintenance Lock").length;
    }

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
                    <input type="text" id="edit-username-${user.uid}" value="${user.name}" class="al-input" style="padding: 4px 8px; font-size: 0.85rem; width: 200px;">
                    <button class="al-btn al-btn--primary" onclick="saveUserInlineEdits('${user.uid}')" style="padding: 4px 10px; font-size: 0.75rem;">Save</button>
                    <button class="al-btn al-btn--secondary" onclick="toggleUserEditMode('${user.uid}')" style="padding: 4px 10px; font-size: 0.75rem;">Cancel</button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="al-btn al-btn--secondary" onclick="toggleUserEditMode('${user.uid}')" style="padding: 4px 10px; font-size: 0.75rem;">Modify</button>
                    <button class="al-btn al-btn--danger" onclick="removeRegisteredUser('${user.uid}')" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1);">Remove</button>
                </div>
            `;
            userBadgeRegistry.appendChild(userRow);
        });
    }

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

    loadInventory();
});