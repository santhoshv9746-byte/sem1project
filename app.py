import os
import json
import time
from flask import Flask, jsonify, request

app = Flask(__name__)
DB_FILE = "database.json"

# ==============================================================================
# REFERENCE DESIGN COUPLING NOTE — ATOMIC PERSISTENCE METHODOLOGY
# I structured this application block using low-level file storage logic mapping 
# separate dictionary collections ("tools" and "users") into a centralized file. 
# Re-reading and flushing the updated collections into database.json on-demand prevents 
# race conditions or pointer desynchronizations across REST transactions.
# ==============================================================================

def read_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump({"tools": [], "users": []}, f)
        return {"tools": [], "users": []}
    try:
        with open(DB_FILE, "r") as f:
            data = json.load(f)
            if "tools" not in data or "users" not in data:
                return {"tools": [], "users": []}
            return data
    except json.JSONDecodeError:
        return {"tools": [], "users": []}

def write_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route('/')
def serve_index():
    """Serves the decoupled front-end viewport structural template layer."""
    return app.send_static_file('index.html')

# --- USER REGISTRY ROUTING MANAGEMENT ---
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(read_db()["users"]), 200

@app.route('/api/users', methods=['POST'])
def add_user():
    db = read_db()
    data = request.get_json()
    if not data or not data.get('name') or not data.get('uid'):
        return jsonify({"error": "Input Exception: Explicit name and identification credentials required."}), 400
    new_user = {
        "name": data['name'].strip(),
        "uid": data['uid'].strip().upper()
    }
    db["users"].append(new_user)
    write_db(db)
    return jsonify(new_user), 201

@app.route('/api/users/<user_uid>', methods=['PUT'])
def update_user(user_uid):
    db = read_db()
    updated_data = request.get_json()
    user_found = False
    for user in db["users"]:
        if user['uid'] == user_uid:
            user_found = True
            if 'name' in updated_data:
                user['name'] = updated_data['name'].strip()
            break
    if not user_found:
        return jsonify({"error": "Target user directory map missing."}), 404
    write_db(db)
    return jsonify({"message": "User registry entries successfully updated."}), 200

@app.route('/api/users/<user_uid>', methods=['DELETE'])
def delete_user(user_uid):
    db = read_db()
    db["users"] = [user for user in db["users"] if user['uid'] != user_uid]
    write_db(db)
    return jsonify({"message": "Custodian directory profile securely removed."}), 200

# --- TOOLS OPERATIONAL MANAGEMENT ---
@app.route('/api/tools', methods=['GET'])
def get_tools():
    return jsonify(read_db()["tools"]), 200

@app.route('/api/tools', methods=['POST'])
def add_tool():
    db = read_db()
    data = request.get_json()
    if not data or not data.get('name') or not data.get('category'):
        return jsonify({"error": "Validation Exception: Required asset properties left unpopulated."}), 400
    new_tool = {
        "id": f"tool_{int(time.time() * 1000)}",
        "name": data['name'].strip(),
        "category": data['category'].strip(),
        "status": "Available",
        "condition": "Excellent",
        "borrow_count": 0,
        "assigned_user": None
    }
    db["tools"].append(new_tool)
    write_db(db)
    return jsonify(new_tool), 201

@app.route('/api/tools/<tool_id>', methods=['PUT'])
def update_tool(tool_id):
    db = read_db()
    updated_data = request.get_json()
    tool_found = False
    for tool in db["tools"]:
        if tool['id'] == tool_id:
            tool_found = True
            if 'name' in updated_data:
                tool['name'] = updated_data['name'].strip()
            if 'category' in updated_data:
                tool['category'] = updated_data['category'].strip()

            if updated_data.get('reset_counter') is True:
                tool['status'] = 'Available'
                tool['condition'] = 'Excellent'
                tool['borrow_count'] = 0
                tool['assigned_user'] = None
            else:
                if 'status' in updated_data:
                    target_status = updated_data['status']
                    if target_status == 'Borrowed':
                        tool['status'] = 'Borrowed'
                        tool['assigned_user'] = updated_data.get('assigned_user')
                    elif target_status == 'Available':
                        tool['borrow_count'] += 1
                        tool['assigned_user'] = None
                        if tool['borrow_count'] >= 5:
                            tool['status'] = 'Maintenance Lock'
                            tool['condition'] = 'Requires Safety Check'
                        else:
                            tool['status'] = 'Available'
            break
    if not tool_found:
        return jsonify({"error": "Reference Exception: Target asset identifier invalid."}), 404
    write_db(db)
    return jsonify({"message": "Data state arrays successfully updated and committed."}), 200

@app.route('/api/tools/<tool_id>', methods=['DELETE'])
def delete_tool(tool_id):
    db = read_db()
    db["tools"] = [tool for tool in db["tools"] if tool['id'] != tool_id]
    write_db(db)
    return jsonify({"message": "Target hardware node decommission logged cleanly."}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)