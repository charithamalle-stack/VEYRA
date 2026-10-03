from google_auth_oauthlib.flow import Flow
from flask import session, redirect


from pathlib import Path
import json
import os

from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv

from services.email_intelligence import analyze_email

load_dotenv()
GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly"
]
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "https://veyra-vxs3.onrender.com/oauth/callback"
)



BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "services" / "emails.json"

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024


def load_emails():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/")
def index():
    return render_template("index.html")
@app.get("/login")
def login():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=GOOGLE_SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI,
    )

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )

    session["oauth_state"] = state

    return redirect(authorization_url)


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
@app.get("/oauth/callback")
def oauth_callback():
    return "Google OAuth callback reached successfully."


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=True
    )