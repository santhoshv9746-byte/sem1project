document.addEventListener("DOMContentLoaded", () => {
    let tools = [];
    let users = [];

    async function refreshData() {
        const toolsRes = await fetch('/api/tools');
        const usersRes = await fetch('/api/users');
        tools = await toolsRes.json();
        users = await usersRes.json();
        
        renderUsers();
        renderTools(tools);
    }

    function renderUsers() {
        const container = document.getElementById("userList");
        container.innerHTML = "";
        users.forEach(u => {
            const div = document.createElement("div");
            div.className = "user-row";
            div.innerHTML = `
                <span>${u.name} (ID: ${u.uid})</span>
                <button onclick="deleteUser('${u.uid}')" style="color:red; margin-left:10px;">Remove</button>
            `;
            container.appendChild(div);
        });
    }

    function renderTools(list) {
        const container = document.getElementById("inventoryContainer");
        container.innerHTML = "";

        list.forEach(t => {
            const div = document.createElement("div");
            div.className = "card";
        
            let actionHTML = "";
            if(t.status === "Available") {
              let options = `<option value="">-- Assign User --</option>`;
              users.forEach(u => options += `<option value="${u.name}">${u.name}</option>`);
              actionHTML = `
                <select id="select-${t.id}">${options}</select>
                <button onclick="checkoutTool('${t.id}')">Check Out</button>
              `;
            } else if (t.status === "Borrowed") {
                actionHTML = `<button onclick="returnTool('${t.id}')">Return Tool</button>`;
            } else if (t.status === "Maintenance Lock") {
                actionHTML = `<button onclick="resetTool('${t.id}')" style="background:orange;">Reset Maintenance</button>`;
            }

            div.innerHTML = `
                <h3>${t.name} <small>(${t.category})</small></h3>
                <p>Status: <strong style="color:${t.status === 'Maintenance Lock' ? 'red' : 'green'};">${t.status}</strong> | Usage Count: ${t.borrow_count}/5</p>
                <p>Current User: ${t.assigned_user || 'None'}</p>
                <div>${actionHTML}</div>
                <button onclick="deleteTool('${t.id}')" style="margin-top:15px; color:red; border:1px solid red; background:none; cursor:pointer;">Delete Tool from System</button>
            `;
            container.appendChild(div):
        });
    }

    toolForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await fetch('/api/tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById("toolName").value,
                category: document.getElementById("toolCategory").value
            })
        });
        toolForm.reset();
        refreshData();
    });

    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById("newUserName").value,
                uid: document.getElementById("newUserID").value
            })
        });
        userForm.reset();
        refreshData();
    });
