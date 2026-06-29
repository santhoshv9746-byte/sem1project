import os
import json
import time
from flask import Flask, jsonify, request

app = Flask(__name__)
DB_FILE = "database.json"

# NOTE: The basic read/write file structure boilerplate was referenced using AI,
# but manually verified and configured to handle local JSON arrays safely.
def read_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump({"tools": [], "users": [], "history": []}, f)
    with open(DB_FILE, "r") as f:
        return json.load(f)

def write_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    return app.send_static_file('index.html')

# --- API ROUTES FOR TOOLS ---
@app.route('/api/tools', methods=['GET', 'POST'])
def handle_tools():
    db = read_db()
    if request.method == 'POST':
        data = request.get_json()
        if not data.get('name') or not data.get('category'):
            return jsonify({"error": "Missing data"}), 400
        
        new_tool = {
            "id": f"tool_{int(time.time())}", # Used standard timestamping for unique IDs
            "name": data['name'].strip(),
            "category": data['category'].strip(),
            "status": "Available",
            "borrow_count": 0,
            "assigned_user": None
        }
        db["tools"].append(new_tool)
        write_db(db)
        return jsonify(new_tool), 201
    return jsonify(db["tools"]), 200

@app.route('/api/tools/<tool_id>', methods=['PUT', 'DELETE'])
def update_delete_tool(tool_id):
    db = read_db()
    tool = next((t for t in db["tools"] if t['id'] == tool_id), None)
    
    if not tool:
        return jsonify({"error": "Not found"}), 404

    if request.method == 'DELETE':
        db["tools"] = [t for t in db["tools"] if t['id'] != tool_id]
        write_db(db)
        return jsonify({"message": "Deleted"}), 200

    # PUT Method
    data = request.get_json()
    
    # Manually implemented counter increments and safety threshold intercepts
    if data.get('reset_counter'):
        tool.update({"status": "Available", "borrow_count": 0, "assigned_user": None})
    elif 'status' in data:
        tool['status'] = data['status']
        tool['assigned_user'] = data.get('assigned_user')
        if data['status'] == 'Available':
            tool['borrow_count'] += 1
            # Safety Intercept Lockout mechanism (5 Cycles Limit)
            if tool['borrow_count'] >= 5:
                tool['status'] = 'Maintenance Lock'

    write_db(db)
    return jsonify({"message": "Updated"}), 200

# --- API ROUTES FOR USERS ---
# NOTE: Referenced AI patterns to map out the secondary multi-collection user endpoints cleanly.
@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    db = read_db()
    if request.method == 'POST':
        data = request.get_json()
        if not data.get('name') or not data.get('uid'):
            return jsonify({"error": "Missing data"}), 400
        new_user = {"name": data['name'].strip(), "uid": data['uid'].strip()}
        db["users"].append(new_user)
        write_db(db)
        return jsonify(new_user), 201
    return jsonify(db["users"]), 200

@app.route('/api/users/<uid>', methods=['DELETE'])
def delete_user(uid):
    db = read_db()
    db["users"] = [u for u in db["users"] if u['uid'] != uid]
    write_db(db)
    return jsonify({"message": "User deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)