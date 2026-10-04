# VEYRA

## New Era of Viewing and Managing Emails

> **Your inbox is full. Your attention shouldn't be.**

VEYRA is an AI-powered email intelligence dashboard built around one simple question:

> **What actually deserves my attention today?**

Instead of making users scan dozens of unread emails, VEYRA turns email overload into an **attention-first workflow** by identifying important messages, summarizing them, detecting required actions and deadlines, and organizing them by priority.

Built as a **Hacktoberfest 2026 — Build for a Friend** prototype.

---

## The Problem

Most people don't have an email problem.

They have an **attention problem**.

Students and professionals often manage separate accounts for:

* College
* Work
* Personal communication
* Shopping and services

Important messages can easily get buried under newsletters, promotions, notifications and routine emails.

A traditional inbox mainly tells you:

**"You have unread emails."**

VEYRA asks a more useful question:

**"Which emails actually need you right now?"**

---

## The Solution

VEYRA adds an intelligence layer between the user and their inbox.

For each email, VEYRA can determine:

* **Summary** — What is this email about?
* **Category** — College, Work, Personal, Finance, Shopping, etc.
* **Priority** — Urgent, Important, Normal or Low
* **Action required** — Does the user need to do something?
* **Deadline** — Is there a time-sensitive requirement?
* **Suggested action** — What should the user do next?

The result is an **Attention Center** that surfaces the emails that deserve attention instead of simply displaying everything chronologically.

---

# ⭐ The Attention Center

The main idea behind VEYRA is simple:

> **Don't organize the inbox first. Organize the user's attention first.**

The dashboard highlights emails that require attention and separates them into useful states:

### Needs Your Attention

Emails requiring an action, response or time-sensitive decision.

### Read Later

Emails that matter but don't need immediate attention.

### Already Handled

Emails that have effectively been dealt with or no longer require action.

This makes VEYRA useful as a daily decision-making layer rather than another email client.

---

## Core Features

### 📊 Intelligence Dashboard

The dashboard provides an overview of:

* Total emails
* Unread emails
* Important emails
* Emails requiring action
* Attention Center
* Recent emails
* Category distribution
* Productivity insight

### 📅 Today View

A focused view designed around today's priorities:

* Needs Your Attention
* Read Later
* Already Handled

### 📥 Smart Inbox

Users can:

* Search emails
* Filter by category
* Filter unread messages
* Filter important messages
* Filter emails requiring action
* View priority indicators
* View category indicators

### 🧠 Email Intelligence

VEYRA analyzes email content for:

* Summary
* Category
* Priority
* Action requirement
* Deadline
* Suggested next action

### 👥 Multiple Account Concept

The prototype represents multiple inbox contexts:

* Personal
* College
* Work

The current prototype uses sample email data rather than connecting directly to users' real accounts.

### ⚡ Email Actions

The demo interface supports:

* Mark as read
* Mark important
* Archive
* Add to tasks

---

# 🤖 AI Architecture

VEYRA separates its email intelligence layer from the user interface.

The main intelligence implementation is located in:

`services/email_intelligence.py`

VEYRA supports two analysis modes.

## 1. Open-Weight AI

When a Hugging Face API token is configured, VEYRA can use a configurable open-weight model for email analysis.

The default model configuration is:

`Qwen/Qwen2.5-1.5B-Instruct`

The AI layer can generate structured email intelligence such as summaries, categories, priorities and actions.

## 2. Local Intelligence Fallback

If the AI service is unavailable, VEYRA automatically falls back to a deterministic local analysis engine.

The fallback can identify signals related to:

* Categories
* Priorities
* Required actions
* Deadlines

This architecture keeps the application functional even when the external AI service is unavailable.

**Important:** VEYRA does not pretend that an AI model was used when the fallback engine is active.

---

# 🔐 Security & Privacy

VEYRA is currently a prototype and intentionally avoids unsafe shortcuts.

The application:

* Does not request Gmail passwords
* Does not request Outlook passwords
* Does not store email credentials
* Does not implement fake OAuth
* Does not expose API keys to frontend JavaScript
* Keeps optional AI credentials server-side
* Uses environment variables for secrets
* Validates backend input size
* Uses safe text rendering for email content
* Clearly separates demo data from real account integration

The project also includes Google OAuth setup work, but **real Gmail synchronization is not presented as a completed feature**.

This is intentional: the prototype focuses on demonstrating the product experience without pretending to have access to a user's real inbox.

---

# 🏗️ Architecture

```text
                    VEYRA
                      │
          ┌───────────┴───────────┐
          │                       │
      Flask App             Web Interface
          │                 HTML / CSS / JS
          │
          ▼
   Email Intelligence
          │
     ┌────┴─────┐
     │          │
     ▼          ▼
Hugging Face   Local
Open-Weight   Fallback
    AI         Engine
     │          │
     └────┬─────┘
          │
          ▼
   Structured Email
    Intelligence
          │
          ▼
   Attention Center
```

This separation allows the intelligence layer to evolve independently from the interface.

---

# 🛠️ Technology Stack

### Backend

* Python
* Flask
* Gunicorn

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Data

* JSON
* Sample email dataset

### AI

* Hugging Face Inference API
* Qwen/Qwen2.5-1.5B-Instruct
* Local deterministic fallback

### Deployment

* Render

No frontend framework is required.

---

# 🚀 Running Locally

## 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd VEYRA
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Configure environment variables

Create a `.env` file based on `.env.example`.

Optional AI configuration can be added through environment variables rather than placing credentials directly in the source code.

## 4. Run the application

```bash
python app.py
```

Open the local address shown by Flask in your browser.

---

# 🌐 Live Demo

The deployed VEYRA prototype is available through the **Homepage link on this GitHub repository**.

The demo currently uses sample email data so visitors can explore the complete experience without providing personal email credentials.

---

# 🧪 Prototype vs Future Version

## Available in the current prototype

* Email intelligence dashboard
* Attention Center
* Today view
* Email categorization
* Priority detection
* Action detection
* Deadline detection
* AI-assisted analysis
* Local fallback intelligence
* Search and filtering
* Demo email actions
* Multi-account concept
* Deployed web application

## Future Improvements

### Gmail Integration

Secure OAuth-based Gmail connection and real-time inbox synchronization.

### Outlook Integration

Secure Microsoft account integration.

### Personalized Intelligence

Learn individual user preferences and improve prioritization over time.

### Real-Time Inbox

Continuously analyze incoming messages and update the Attention Center.

### Mobile Application

Bring VEYRA's attention-first workflow to mobile devices.

### Smarter Task Management

Automatically convert actionable emails into tasks and reminders.

---

# 💡 Why VEYRA?

VEYRA is not designed to replace Gmail or Outlook.

It is designed to sit **above the inbox** and answer the question those platforms don't always answer clearly:

> **What should I pay attention to right now?**

The goal is not to help users read more emails.

The goal is to help them **spend less attention deciding what matters**.

---

# 🏆 Hacktoberfest 2026

Built for the **Hacktoberfest 2026 — Build for a Friend** challenge.

VEYRA was created around a real everyday problem:

**Email overload makes it difficult to identify what actually deserves attention.**

The project focuses on combining:

* Human-centered problem solving
* AI-assisted email intelligence
* Practical productivity
* Privacy-conscious design
* A functional deployed prototype

---

# 📁 Project Structure

```text
VEYRA/
│
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
│
├── services/
│   ├── email_intelligence.py
│   ├── emails.json
│   ├── __init__.py
│   └── README.md
│
├── static/
│   ├── css/
│   └── js/
│
└── templates/
    └── ...
```

---

# 📌 Project Status

**Status: Working prototype**

VEYRA currently demonstrates the complete attention-first email experience using sample data.

Real Gmail and Outlook synchronization is planned as a future feature rather than being falsely represented as completed functionality.

---

## Built with a simple idea:

> **Your inbox contains information. VEYRA helps you find what deserves your attention.**
