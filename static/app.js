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
