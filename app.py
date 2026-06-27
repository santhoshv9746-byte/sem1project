# ==============================================================================
# 🛡️ ASSIGNMENT ATTRIBUTION & CORE LOGIC DECLARATION
# ==============================================================================
# Module: Programming for Information Systems (B9IS123)
# Lecturer: Paul Laird
# Assignment Title: AssetLock - Community Tool Library Management System
# Student Name: Santhosh Vellamuthu
#
# DESIGN & IMPLEMENTATION VERIFICATION:
# The core operational mechanics, logic architecture, state transitions, and custom 
# lifecycle safety limits in this system were engineered and implemented by the student. 
# Generative AI (Gemini) was consulted strictly as a development co-pilot for 
# syntax reference, basic Flask framework initialization boilerplate, and standard error-safe 
# JSON file stream handling. All such code fragments are explicitly marked inline below.
# ==============================================================================

from flask import Flask, jsonify, request
import json
import os
import time

app = Flask(__name__)
DATA_FILE = 'database.json'

# Helper function to read data from the local JSON storage file
# REFERENCE: [AI-Assisted Boilerplate] Standard pattern for try/except JSON parsing
def read_db():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

# Helper function to overwrite data to the local JSON storage file
# REFERENCE: [AI-Assisted Boilerplate] Standard serialization wrapper
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
    
    # Enforce strict field requirements for inventory health
    if not new_tool.get('name') or not new_tool.get('category'):
        return jsonify({"error": "Missing required fields: name and category are required."}), 400
        
    # Standardize metadata schema for runtime records
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
            
            # CORE SYSTEM BUSINESS LOGIC: Monitor borrow loops and capture return transactions
            if tool['status'] == 'Borrowed' and updated_data.get('status') == 'Available':
                tool['borrow_count'] += 1
                
                # Evaluate tool fatigue threshold for community safety compliance
                if tool['borrow_count'] >= 5:
                    tool['status'] = 'Maintenance Lock'
                    tool['condition'] = 'Requires Safety Check'
                else:
                    tool['status'] = 'Available'
            
            # Reset workflow engine parameters once safety check passes
            elif updated_data.get('reset_counter') is True:
                tool['status'] = 'Available'
                tool['condition'] = 'Excellent'
                tool['borrow_count'] = 0
                
            # Handle typical data property transitions
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
    
    # Isolate targets out of current runtime array sequence
    filtered_db = [tool for tool in db if tool['id'] != tool_id]
    
    if len(filtered_db) == len(db):
        return jsonify({"error": "Target item not found in inventory directory."}), 404
        
    write_db(filtered_db)
    return jsonify({"message": "Equipment successfully removed from platform registry."}), 200


if __name__ == '__main__':
    # REFERENCE: [AI-Assisted Boilerplate] Standard localized routing configuration
    app.run(debug=True, port=5000)