import os
import re
from typing import Dict

import requests


CATEGORIES = [
    "College",
    "Work",
    "Personal",
    "Finance",
    "Shopping",
    "Promotions",
    "Other"
]

PRIORITIES = [
    "Urgent",
    "Important",
    "Normal",
    "Low"
]


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "")
    return text.strip()


def find_deadline(text: str):
    patterns = [
        r"\b(?:today|tonight|tomorrow)\b(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)?",
        r"\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\b",
        r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b",
        r"\b\d{1,2}/\d{1,2}/\d{2,4}\b"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)

    return None


def detect_category(subject: str, body: str) -> str:
    text = f"{subject} {body}".lower()

    rules = {
        "College": [
            "assignment",
            "professor",
            "college",
            "university",
            "student",
            "exam",
            "lab",
            "attendance",
            "semester",
            "class",
            "submission",
            "campus",
            "faculty"
        ],
        "Work": [
            "internship",
            "interview",
            "job",
            "recruiter",
            "resume",
            "office",
            "meeting",
            "project",
            "client",
            "work",
            "application"
        ],
        "Finance": [
            "bank",
            "payment",
            "transaction",
            "account",
            "invoice",
            "refund",
            "credited",
            "debited",
            "upi",
            "statement",
            "amount",
            "card"
        ],
        "Shopping": [
            "order",
            "delivery",
            "delivered",
            "shipment",
            "tracking",
            "cart",
            "purchase",
            "return",
            "package"
        ],
        "Promotions": [
            "sale",
            "offer",
            "discount",
            "newsletter",
            "unsubscribe",
            "deal",
            "limited time",
            "coupon",
            "promotion"
        ],
        "Personal": [
            "family",
            "friend",
            "birthday",
            "dinner",
            "trip",
            "photos",
            "hello",
            "weekend"
        ]
    }

    scores = {category: 0 for category in rules}

    for category, keywords in rules.items():
        for keyword in keywords:
            if keyword in text:
                scores[category] += 1

    best_category = max(scores, key=scores.get)

    if scores[best_category] == 0:
        return "Other"

    return best_category


def detect_priority(subject: str, body: str, category: str) -> str:
    text = f"{subject} {body}".lower()

    urgent_terms = [
        "urgent",
        "immediately",
        "deadline",
        "due today",
        "due tomorrow",
        "expires today",
        "action required",
        "final reminder",
        "last date",
        "interview tomorrow"
    ]

    important_terms = [
        "important",
        "reminder",
        "please respond",
        "application",
        "payment",
        "interview",
        "submission",
        "registration"
    ]

    if any(term in text for term in urgent_terms):
        return "Urgent"

    if any(term in text for term in important_terms):
        return "Important"

    if category in ["College", "Work", "Finance"]:
        return "Important"

    if category in ["Promotions", "Shopping"]:
        return "Low"

    return "Normal"


def detect_action(subject: str, body: str, priority: str) -> bool:
    text = f"{subject} {body}".lower()

    action_terms = [
        "submit",
        "respond",
        "reply",
        "confirm",
        "register",
        "complete",
        "pay",
        "verify",
        "upload",
        "apply",
        "schedule",
        "attend",
        "click",
        "review",
        "action required",
        "please"
    ]

    return (
        any(term in text for term in action_terms)
        or priority in ["Urgent", "Important"]
    )


def make_summary(subject: str, body: str, category: str, deadline):
    clean_body = clean_text(body)

    if deadline:
        if category == "College":
            return f"{subject.replace('.', '')}. A deadline is approaching: {deadline}."
        return f"{subject.replace('.', '')}. The message requires attention around {deadline}."

    if len(clean_body) <= 150:
        return clean_body

    return clean_body[:147].rstrip() + "..."


def suggested_action(category: str, priority: str, action_required: bool, deadline):
    if not action_required:
        if category == "Promotions":
            return "Review later or archive if it is not useful."
        if category == "Shopping":
            return "Keep for reference until the order is complete."
        return "No immediate action needed."

    if deadline:
        return f"Complete the requested action before {deadline}."

    suggestions = {
        "College": "Review the requirement and complete the requested academic task.",
        "Work": "Review the opportunity and respond if you are interested.",
        "Finance": "Verify the transaction and keep the notification for your records.",
        "Personal": "Reply when convenient.",
        "Shopping": "Check the order details and tracking information.",
        "Promotions": "Review the offer only if it is relevant to you.",
        "Other": "Review the message and decide whether a response is needed."
    }

    return suggestions.get(category, "Review the message and decide on the next step.")


def fallback_analysis(subject: str, body: str) -> Dict:
    category = detect_category(subject, body)
    priority = detect_priority(subject, body, category)
    action_required = detect_action(subject, body, priority)

    combined = clean_text(f"{subject}. {body}")
    deadline = find_deadline(combined)

    return {
        "summary": make_summary(subject, body, category, deadline),
        "category": category,
        "priority": priority,
        "action_required": action_required,
        "suggested_action": suggested_action(
            category,
            priority,
            action_required,
            deadline
        ),
        "deadline": deadline,
        "source": "VEYRA local intelligence"
    }


def try_huggingface(subject: str, body: str):
    token = os.getenv("HF_API_TOKEN")
    model = os.getenv(
        "HF_MODEL",
        "Qwen/Qwen2.5-1.5B-Instruct"
    )

    if not token:
        return None

    endpoint = f"https://api-inference.huggingface.co/models/{model}"

    prompt = f"""
You are an email triage assistant.

Analyze this email.

Subject:
{subject}

Body:
{body}

Return ONLY valid JSON with these keys:
summary
category
priority
action_required
suggested_action
deadline

Allowed categories:
College, Work, Personal, Finance, Shopping, Promotions, Other

Allowed priorities:
Urgent, Important, Normal, Low

action_required must be true or false.
deadline should be null when no deadline is present.
""".strip()

    try:
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 300,
                    "temperature": 0.1
                }
            },
            timeout=15
        )

        if response.status_code != 200:
            return None

        data = response.json()

        if isinstance(data, list) and data:
            generated = data[0].get("generated_text", "")
        elif isinstance(data, dict):
            generated = data.get("generated_text", "")
        else:
            return None

        match = re.search(r"\{.*\}", generated, re.DOTALL)

        if not match:
            return None

        import json

        parsed = json.loads(match.group(0))

        if parsed.get("category") not in CATEGORIES:
            return None

        if parsed.get("priority") not in PRIORITIES:
            return None

        return {
            "summary": clean_text(str(parsed.get("summary", ""))),
            "category": parsed["category"],
            "priority": parsed["priority"],
            "action_required": bool(parsed.get("action_required", False)),
            "suggested_action": clean_text(
                str(parsed.get("suggested_action", "Review the message."))
            ),
            "deadline": parsed.get("deadline"),
            "source": "Open-weight AI"
        }

    except Exception:
        return None


def analyze_email(subject: str, body: str) -> Dict:
    ai_result = try_huggingface(subject, body)

    if ai_result:
        return ai_result

    return fallback_analysis(subject, body)