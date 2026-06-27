# ==============================================================================
# 🛡️ ASSIGNMENT ATTRIBUTION & GENAI DISCLOSURE STATEMENT
# ==============================================================================
# Module: Programming for Information Systems (B9IS123)
# Lecturer: Paul Laird
# Assignment Title: Local Community Tool Library Management System (ToolShare)
# Student Name: Santhosh Vellamuthu
#
# ACKNOWLEDGEMENT OF ASSISTANCE:
# In compliance with Dublin Business School Quality Assurance guidelines and the 
# Generative AI Assessment Scale (Level 4: Task Completion & Co-pilot), this code 
# was co-developed with Gemini (Large Language Model by Google). 
# 
# External assistance was utilized to design the basic Flask boilerplate architecture 
# and structural handling for JSON file persistence. All specific business logic 
# parameters—including the Automated Usage-Based Safety Lockout rules, condition state 
# counters, and routing edge cases—were customized, evaluated, and verified by the student.
# ==============================================================================

from flask import Flask, jsonify, request
import json
import os
import time

app = Flask(__name__)
DATA_FILE = 'database.json'

# Helper function to read data from the local JSON storage file
def read_db():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

# Helper function to overwrite data to the local JSON storage file
def write_db(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)


# ------------------------------------------------------------------------------
# 1. READ ALL METHOD (GET /api/tools)
# ------------------------------------------------------------------------------
@app.route('/api/tools', methods=['GET'])
def get_tools():
    """Fetches and returns the current community inventory array."""
    return jsonify(read_db()), 200


# ------------------------------------------------------------------------------
# 2. CREATE METHOD (POST /api/tools)
# ------------------------------------------------------------------------------
@app.route('/api/tools', methods=['POST'])
def add_tool():
    """Registers a new piece of equipment into the database storage layer."""
    db = read_db()
    new_tool = request.json
    
    # Moderate error checking / verification
    if not new_tool.get('name') or not new_tool.get('category'):
        return jsonify({"error": "Missing required fields: name and category are required."}), 400
        
    # Generate unique ID and establish initial application properties
    new_tool['id'] = f"tool_{int(time.time())}"
    new_tool['status'] = "Available"
    new_tool['condition'] = "Excellent"
    new_tool['borrow_count'] = 0
    
    db.append(new_tool)
    write_db(db)
    return jsonify(new_tool), 201


# ------------------------------------------------------------------------------
# 3. UPDATE METHOD WITH SAFETY LOGIC (PUT /api/tools/<tool_id>)
# ------------------------------------------------------------------------------
@app.route('/api/tools/<tool_id>', methods=['PUT'])
def update_tool(tool_id):
    """
    Updates item properties. Implements unique automated maintenance logic:
    Increments borrow count upon return; forces a safety lockout if threshold is met.
    """
    db = read_db()
    updated_data = request.json
    
    for tool in db:
        if tool['id'] == tool_id:
            
            # UNIQUE FEATURE LOGIC: Handle Return Event Trigger
            if tool['status'] == 'Borrowed' and updated_data.get('status') == 'Available':
                tool['borrow_count'] += 1
                
                # Check if the tool has met safety utilization limit
                if tool['borrow_count'] >= 5:
                    tool['status'] = 'Maintenance Lock'
                    tool['condition'] = 'Requires Safety Check'
                else:
                    tool['status'] = 'Available'
            
            # HANDLE ADMIN MAINTENANCE RESET ACTION
            elif updated_data.get('reset_counter') is True:
                tool['status'] = 'Available'
                tool['condition'] = 'Excellent'
                tool['borrow_count'] = 0
                
            # STANDARD STATUS TOGGLE (e.g., Checking out an available tool)
            else:
                tool['status'] = updated_data.get('status', tool['status'])
                tool['condition'] = updated_data.get('condition', tool['condition'])
            
            write_db(db)
            return jsonify(tool), 200
            
    return jsonify({"error": f"Tool with ID {tool_id} could not be located."}), 404


# ------------------------------------------------------------------------------
# 4. DELETE METHOD (DELETE /api/tools/<tool_id>)
# ------------------------------------------------------------------------------
@app.route('/api/tools/<tool_id>', methods=['DELETE'])
def delete_tool(tool_id):
    """Decommissions and physically removes a tool item out of the inventory system."""
    db = read_db()
    filtered_db = [tool for tool in db if tool['id'] != tool_id]
    
    if len(filtered_db) == len(db):
        return jsonify({"error": "Target item not found in inventory directory."}), 404
        
    write_db(filtered_db)
    return jsonify({"message": "Equipment successfully removed from platform registry."}), 200


if __name__ == '__main__':
    # Runs backend local server interface on port 5000
    app.run(debug=True, port=5000)