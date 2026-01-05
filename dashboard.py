from flask import Flask, render_template, send_from_directory, url_for, jsonify
import os, json, time

app = Flask(__name__)
SAVE_DIR = 'intruders'
STATIC_INTRUDERS = os.path.join('static', 'intruders')
METADATA_PATH = os.path.join(SAVE_DIR, 'metadata.json')

@app.route('/')
def index():
    try:
        with open(METADATA_PATH, 'r') as f:
            data = json.load(f)
    except Exception:
        data = []
    data_sorted = sorted(data, key=lambda x: x.get('timestamp',''), reverse=True)
    return render_template('index.html', intruders=data_sorted)

@app.route('/intruders/<path:filename>')
def intruder_image(filename):
    return send_from_directory(STATIC_INTRUDERS, filename)

# API endpoint to fetch metadata (used for auto-refresh)
@app.route('/api/intruders')
def api_intruders():
    try:
        with open(METADATA_PATH, 'r') as f:
            data = json.load(f)
    except Exception:
        data = []
    data_sorted = sorted(data, key=lambda x: x.get('timestamp',''), reverse=True)
    return jsonify(data_sorted)

if __name__ == '__main__':
    os.makedirs(STATIC_INTRUDERS, exist_ok=True)
    app.run(host='0.0.0.0', port=5000)
