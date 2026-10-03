# VEYRA

## New Era of Viewing and Managing Emails

VEYRA is an email intelligence command center designed around one question:

> What actually deserves my attention today?

Built as a Hacktoberfest 2026 Build for a Friend prototype.

---

## The Problem

People increasingly use multiple email accounts for college, work and personal communication.

The problem is not simply receiving emails.

The problem is identifying:

- what matters
- what can wait
- what requires action
- what has a deadline
- what is simply noise

Traditional inboxes make users scan everything.

VEYRA puts the attention layer first.

---

## The Solution

VEYRA analyzes demo email content and presents:

- short summaries
- categories
- priority
- action requirements
- deadlines
- suggested next actions

The signature experience is the Attention Center.

Instead of asking:

"How many unread emails do I have?"

VEYRA asks:

"What actually deserves my attention today?"

---

## Features

### Dashboard

Shows:

- total emails
- unread emails
- important emails
- emails requiring action
- Attention Center
- recent emails
- category breakdown
- productivity insight

### Today

Three attention-oriented sections:

- Needs Your Attention
- Read Later
- Already Handled

### Inbox

Includes:

- search
- category filters
- unread filter
- important filter
- needs-action filter
- priority badges
- category badges

### Email Intelligence

VEYRA analyzes:

- summary
- category
- priority
- action required
- deadline
- suggested action

### Multi-account concept

The prototype visually represents:

- Personal
- College
- Work

Real Gmail and Outlook synchronization is intentionally not implemented.

### Email actions

Demo users can:

- mark as read
- mark important
- archive
- add to tasks

---

## AI Architecture

VEYRA separates email intelligence from the interface.

The intelligence layer is:

`services/email_intelligence.py`

The system supports two modes.

### Mode 1 — Open-weight AI

If a Hugging Face API token is configured, VEYRA can request analysis from a configurable open-weight model.

The default model configuration is:

`Qwen/Qwen2.5-1.5B-Instruct`

### Mode 2 — Local fallback

If the AI API is unavailable, VEYRA automatically uses its local deterministic analysis engine.

The fallback detects:

- categories
- priorities
- action signals
- deadlines

This means an unavailable AI service does not break the application.

The fallback is intentionally presented as VEYRA intelligence rather than pretending that a model was used.

---

## Security

This is a prototype.

VEYRA does not:

- ask for Gmail passwords
- ask for Outlook passwords
- store email credentials
- implement fake OAuth
- expose API keys to frontend JavaScript
- claim that demo accounts are real accounts

The optional AI API token remains server-side in `.env`.

Email content displayed by the frontend is inserted using safe text rendering rather than unsafe HTML injection.

Input size is also validated by the Flask backend.

---

## Technology

- Python
- Flask
- HTML5
- CSS3
- Vanilla JavaScript
- JSON
- Hugging Face Inference API (optional)
- Gunicorn for deployment

No frontend framework is required.

---

## Running Locally

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd veyra