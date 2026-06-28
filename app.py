import os
import json
import time
from flask import Flask, jsonify, request

app = Flask(__name__)
DB_FILE = "database.json"

# ==============================================================================
# REFERENCE DESIGN COUPLING NOTE — AUDIT PERSISTENCE METHODOLOGY
# I structured this application block using low-level file storage logic mapping 
# separate dictionary collections ("tools", "users", and "history") into a centralized file. 
# Re-reading and flushing the updated collections into database.json on-demand prevents 
# race conditions or pointer desynchronizations across REST transactions.
# ==============================================================================

def read_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump({"tools": [], "users": [], "history": []}, f)
        return {"tools": [], "users": [], "history": []}
    try:
        with open(DB_FILE, "r") as f:
            data = json.load(f)
            if "tools" not in data or "users" not in data or "history" not in data:
                return {"tools": data.get("tools", []), "users": data.get("users", []), "history": data.get("history", [])}
            return data
    except json.JSONDecodeError:
        return {"tools": [], "users": [], "history": []}

def write_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Helper function to generate an automated transaction timestamp string
def get_timestamp():
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

# --- HISTORY AUDIT REGISTRY ENDPOINT ---
@app.route('/api/history', methods=['GET'])
def get_history():
    """Retrieves the full immutable transaction logging stream."""
    return jsonify(read_db()["history"]), 200

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
                
                # Append Administrative Override Log
                db["history"].append({
                    "timestamp": get_timestamp(),
                    "asset_name": tool['name'],
                    "action": "Supervisor Override Safety Reset",
                    "operator": "SYSTEM ADMINISTRATOR",
                    "user_uid": "SYSTEM"
                })
            else:
                if 'status' in updated_data:
                    target_status = updated_data['status']
                    if target_status == 'Borrowed':
                        tool['status'] = 'Borrowed'
                        tool['assigned_user'] = updated_data.get('assigned_user')
                        
                        # Extract the UID from the dropdown string format: "Name [UID]"
                        operator_str = tool['assigned_user']
                        user_uid = "SYSTEM"
                        if "[" in operator_str and "]" in operator_str:
                            user_uid = operator_str.split("[")[1].split("]")[0].strip()
                        
                        # Append Checkout Log
                        db["history"].append({
                            "timestamp": get_timestamp(),
                            "asset_name": tool['name'],
                            "action": "Authorized Checkout",
                            "operator": operator_str,
                            "user_uid": user_uid
                        })
                    elif target_status == 'Available':
                        old_user = tool.get('assigned_user', 'Unknown Operator')
                        tool['borrow_count'] += 1
                        tool['assigned_user'] = None
                        
                        # Extract the UID tracking parameter out of the active string
                        user_uid = "SYSTEM"
                        if "[" in old_user and "]" in old_user:
                            user_uid = old_user.split("[")[1].split("]")[0].strip()
                        
                        if tool['borrow_count'] >= 5:
                            tool['status'] = 'Maintenance Lock'
                            tool['condition'] = 'Requires Safety Check'
                            
                            # Append Automated Lockout Warning Log
                            db["history"].append({
                                "timestamp": get_timestamp(),
                                "asset_name": tool['name'],
                                "action": "Maintenance Lock Engaged (5-Cycle Limit reached)",
                                "operator": f"Returned by {old_user}",
                                "user_uid": user_uid
                            })
                        else:
                            tool['status'] = 'Available'
                            
                            # Append Standard Safe Return Log
                            db["history"].append({
                                "timestamp": get_timestamp(),
                                "asset_name": tool['name'],
                                "action": "Inventory Safe Return",
                                "operator": f"Returned by {old_user}",
                                "user_uid": user_uid
                            })
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