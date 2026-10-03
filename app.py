from pathlib import Path
import json
import os

from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv

from services.email_intelligence import analyze_email

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "services" / "emails.json"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024


def load_emails():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/emails")
def get_emails():
    return jsonify(load_emails())


@app.post("/api/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}

    subject = str(payload.get("subject", "")).strip()
    body = str(payload.get("body", "")).strip()

    if not subject and not body:
        return jsonify({
            "success": False,
            "message": "Email content is required."
        }), 400

    if len(subject) > 500 or len(body) > 10000:
        return jsonify({
            "success": False,
            "message": "Email content is too long."
        }), 400

    result = analyze_email(subject, body)

    return jsonify({
        "success": True,
        "analysis": result
    })


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "mode": "demo",
        "ai_configured": bool(os.getenv("HF_API_TOKEN"))
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=True
    )