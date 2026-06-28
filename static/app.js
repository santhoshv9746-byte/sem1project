document.addEventListener("DOMContentLoaded", () => {
    const toolForm = document.getElementById("toolForm");
    const inventoryTableBody = document.getElementById("inventoryTableBody");

    // 1. Fetch and render the entire active tool fleet array from the server
    async function loadInventory() {
        try {
            const response = await fetch('/api/tools');
            const tools = await response.json();
            
            // Clear out old temporary rows to keep rendering precise
            inventoryTableBody.innerHTML = "";

            tools.forEach(tool => {
                const row = document.createElement("tr");

                // Highlight maintenance states visually for simple verification
                if (tool.status === "Maintenance Lock") {
                    row.style.backgroundColor = "#ffdddd";
                }

                row.innerHTML = `
                    <td><code>${tool.id}</code></td>
                    <td><strong>${tool.name}</strong></td>
                    <td>${tool.category}</td>
                    <td><span>${tool.status}</span></td>
                    <td><em>${tool.condition}</em></td>
                    <td>${tool.borrow_count} / 5 cycles</td>
                    <td>
                        ${renderActionButtons(tool)}
                    </td>
                `;
                inventoryTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Critical error synching database logs:", error);
        }
    }

    // 2. Generate context-aware action triggers depending on state transitions
    function renderActionButtons(tool) {
        if (tool.status === "Available") {
            return `<button onclick="updateStatus('${tool.id}', 'Borrowed')">Check Out Asset</button>`;
        } else if (tool.status === "Borrowed") {
            return `<button onclick="updateStatus('${tool.id}', 'Available')">Return Asset (Log Cycle)</button>`;
        } else if (tool.status === "Maintenance Lock") {
            return `
                <button onclick="resetAsset('${tool.id}')" style="color: red; font-weight: bold;">
                    Perform Safety Inspection & Reset
                </button>
            `;
        }
        return "";
    }

    // 3. Handle Form Submission to Provision a New Asset
    toolForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("toolName").value.trim();
        const category = document.getElementById("toolCategory").value.trim();

        try {
            const response = await fetch('/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category })
            });

            if (response.ok) {
                toolForm.reset();
                loadInventory(); // Refresh view instantly
            } else {
                alert("Validation error returned from Flask API execution.");
            }
        } catch (error) {
            console.error("Failed adding data item stream:", error);
        }
    });

    // 4. Global scope bindings for button clicks to alter asset status variables
    window.updateStatus = async (id, targetStatus) => {
        try {
            await fetch(`/api/tools/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: targetStatus })
            });
            loadInventory();
        } catch (error) {
            console.error("Status update processing interruption:", error);
        }
    };

    // 5. Explicit supervisor reset interface pathing to clear maintenance safety flags
    window.resetAsset = async (id) => {
        try {
            await fetch(`/api/tools/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_counter: true })
            });
            loadInventory();
        } catch (error) {
            console.error("Supervisor administrative bypass failure:", error);
        }
    };

    // Prime the application layer on entry view initialization
    loadInventory();
});