import os
import json
import time
from flask import Flask, jsonify, request

app = Flask(__name__)
DB_FILE = "database.json"
