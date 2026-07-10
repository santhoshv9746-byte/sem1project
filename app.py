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
    
