# Prompt Layer

Refine your AI prompts before sending them — directly from ChatGPT, Claude.ai, or any AI interface you use.

---

## About

Most people type a prompt and hit send. Prompt Layer adds a step in between.

It's a Chrome extension that sits inside your AI interface and rewrites your prompt — making it clearer, more specific, and more likely to get a great response — before it ever reaches the model. One click, no copy-pasting, no switching tabs.

Under the hood it uses Claude to do the refinement, guided by a system prompt you control. There's also a standalone FastAPI backend that exposes the same refinement logic as an API, so you can wire it into any tool or workflow you're already building.

**What it solves:**
- Vague prompts that produce generic answers
- Time spent manually rewriting the same prompt multiple times
- The gap between what you mean and what the model understands

---

## How to Use

### 1. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=8000
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. You can explore all endpoints at `http://localhost:8000/docs`.

---

### 2. Install the Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** and select the `chrome_extension/` folder
4. Click the Prompt Layer icon in your toolbar
5. Go to **Settings** and paste your Claude API key

---

### 3. Refine a prompt

1. Open ChatGPT, Claude.ai, or any supported AI interface
2. Type your prompt in the input box
3. Click the **✦ Refine** button that appears next to the mic button
4. Your prompt will be rewritten and replaced automatically — just hit send

---

### 4. Edit the system prompt

The instruction used to refine prompts lives in `backend/systemprompt.txt`. Edit it freely to change how refinement works — no code changes needed.

---

## Architecture & Tech Stack

```
prompt_layer/
├── chrome_extension/     # Browser extension (Manifest V3)
│   ├── background.js     # Service worker — handles API calls to Anthropic
│   ├── content.js        # Injected into AI sites — adds the Refine button
│   ├── popup.html/js     # Extension popup — status + settings
│   └── manifest.json
│
└── backend/              # FastAPI server
    ├── main.py           # App entry point, CORS, route registration
    ├── systemprompt.txt  # System prompt for refinement (editable)
    ├── routes/
    │   ├── health.py     # GET  /health
    │   ├── refine.py     # POST /refine
    │   └── prompts.py    # GET  /prompts  •  POST /prompts
    └── services/
        └── claude.py     # Anthropic SDK wrapper
```

### Tech Stack

| Layer | Technology |
|---|---|
| Chrome Extension | Vanilla JS, Manifest V3 |
| Backend Framework | FastAPI (Python) |
| AI Model | Claude Haiku (`claude-haiku-4-5`) via Anthropic SDK |
| Server | Uvicorn (ASGI) |
| Config | `.env` via `python-dotenv` |

### How a refinement request flows

```
User clicks ✦ Refine
      │
      ▼
content.js (reads prompt text)
      │  chrome.runtime.sendMessage
      ▼
background.js (service worker)
      │  POST https://api.anthropic.com/v1/messages
      ▼
Anthropic API → Claude Haiku
      │  refined text
      ▼
content.js (replaces prompt in textarea)
```

The Chrome extension calls Anthropic directly (no backend needed for the extension). The FastAPI backend is a standalone API you can use to integrate prompt refinement into other tools.
