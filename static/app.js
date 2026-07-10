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
