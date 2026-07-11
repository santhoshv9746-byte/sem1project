import os
import json
import time
from flask import Flask, jsonify, request

app = Flask(__name__)
DB_FILE = "database.json"

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

@app.route('/api/tools', methods=['GET', 'POST'])
def handle_tools():
    db = read_db()
    if request.method == 'POST':
        data = request.get_json()

        if not data.get('name') or not data.get('category'):
            return jsonify({"error": "Missing data"}), 400

        new_tool = {
            "id": f"tool_{int(time.time())}", # Collision-free unique IDs via timestamp
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
        return jsonify({"message": "Deleted"}),200

    data = request.get_json()
        









