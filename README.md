# 🏟️ Stadium AI Assistant
### AI-Powered Smart Stadium Assistant using Gemini + Retrieval-Augmented Generation (RAG)

An intelligent stadium assistant built for **Smart Stadium & Tournament Operations**, enabling spectators to instantly access accurate information about stadium navigation, accessibility, parking, emergency services, transportation, food courts, rules, and more through natural language conversations.

Unlike traditional chatbots, this assistant uses **Retrieval-Augmented Generation (RAG)** with **Google Gemini** and **Qdrant Vector Database** to generate responses grounded in official stadium knowledge.

---

# 🚀 Features

- 🤖 AI-powered conversational assistant
- 🧠 Retrieval-Augmented Generation (RAG)
- 📚 Vector search using Qdrant
- ✨ Gemini 2.5 Flash integration
- 🗺️ Stadium navigation assistance
- 🚪 Gate & section information
- 🚗 Parking guidance
- ♿ Accessibility assistance
- 🚑 Emergency response guidance
- 🍔 Food court recommendations
- 🚇 Transportation information
- 📖 Stadium rules & prohibited items
- ⚡ Charging stations
- 🚻 Restroom locations
- 💧 Water stations
- 🛍️ Merchandise stores

---

# 🏗️ System Architecture

```
                   +----------------------+
                   |    React Frontend    |
                   +----------+-----------+
                              |
                              |
                    REST API (FastAPI)
                              |
                              |
                  +-----------v------------+
                  |     Gemini Service     |
                  +-----------+------------+
                              |
                              |
                   Retrieves Relevant Context
                              |
                              |
                    +---------v----------+
                    |   RAG Service      |
                    +---------+----------+
                              |
                              |
                    Similarity Search
                              |
                              |
                    +---------v----------+
                    |   Qdrant Vector DB |
                    +---------+----------+
                              |
                    Embedded Documents
                              |
                    Gemini Embeddings
                              |
                    Stadium Knowledge Base
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- React Router
- Firebase Authentication

## Backend

- FastAPI
- Python
- Google Gemini API
- LangChain
- Qdrant
- dotenv

## AI Stack

- Gemini 2.5 Flash
- Gemini Embedding Model
- Retrieval-Augmented Generation (RAG)
- Qdrant Vector Database

---

# 📂 Project Structure

```
backend
│
├── KnowledgeBase
│   ├── events
│   ├── services
│   └── stadium
│
├── app
│   ├── api
│   ├── auth
│   ├── models
│   ├── prompts
│   ├── rag
│   ├── services
│   └── main.py
│
└── requirements.txt


frontend
│
├── src
│   ├── components
│   ├── pages
│   ├── context
│   ├── services
│   └── assets
│
└── package.json
```

---

# 📚 Knowledge Base

The assistant currently indexes over **300+ structured stadium documents** covering:

- Stadium Sections
- Gates
- Parking Zones
- Food Courts
- Medical Centers
- Information Desks
- Restrooms
- Charging Stations
- Water Stations
- Elevators
- Merchandise Stores
- Transportation
- Accessibility
- Stadium Rules
- Emergency Procedures
- Event Schedule
- Announcements

Each knowledge object is embedded and stored individually for high-quality semantic retrieval.

---

# 🧠 RAG Pipeline

```
JSON Knowledge Base
        │
        ▼
Document Loader
        │
        ▼
Document Formatting
        │
        ▼
Gemini Embeddings
        │
        ▼
Qdrant Vector Database
        │
        ▼
Similarity Search
        │
        ▼
Relevant Context
        │
        ▼
Gemini 2.5 Flash
        │
        ▼
Grounded Response
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/<your-username>/<repo>.git

cd <repo>
```

---

# Backend Setup

Create a virtual environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env`

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

QDRANT_URL=http://localhost:6333

QDRANT_API_KEY=
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Running Backend

```bash
uvicorn app.main:app --reload
```

Backend API

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# Building the Knowledge Base

After updating any JSON files, rebuild the vector database.

```bash
python app/rag/ingest.py
```

This will

- Parse all JSON files
- Generate embeddings
- Upload documents to Qdrant

---

# Example Queries

```
Where can I charge my laptop?

Nearest medical center

Where is Gate A?

Which entrance is wheelchair accessible?

Where should VIP visitors park?

Can I bring a drone?

Nearest food court

How do I reach Section C?

Emergency exits near Section B
```

---

# API

## POST `/chat`

### Request

```json
{
    "message":"Where can I charge my laptop?"
}
```

### Response

```json
{
    "response":"You can charge your laptop at North Charging Hub (CS-01)..."
}
```

---

# AI Workflow

```
User Query
      │
      ▼
Embedding
      │
      ▼
Qdrant Search
      │
      ▼
Top-K Stadium Documents
      │
      ▼
Gemini Prompt
      │
      ▼
Grounded Response
```

---

# Current Capabilities

- Stadium Navigation
- Parking Guidance
- Accessibility Assistance
- Emergency Information
- Food & Dining
- Transportation
- Rules & Regulations
- Facility Lookup
- Semantic Search
- Context-Aware AI Responses

---

# Future Enhancements

- Voice Assistant
- Indoor Live Navigation
- Real-time Crowd Density
- Live Parking Availability
- Live Queue Monitoring
- Multi-language Support
- QR Code Navigation
- Push Notifications
- Event Recommendations
- Personalized Visitor Experience

---

# License

This project was developed as part of the Virtual PromptWars challenge-4.

---

# Author

**Ajay B**

AIML Engineer

Built using ❤️ with **FastAPI**, **React**, **Google Gemini**, **LangChain**, and **Qdrant**.