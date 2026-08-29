<<<<<<< HEAD
# AskCET
 AI-powered college information assistant that answers student questions using Retrieval-Augmented Generation (RAG). The chatbot retrieves relevant information from uploaded college documents, PDFs, notices, FAQs, and other resources before generating an answer.
=======
# AskCET 🎓 — AI-Powered RAG College Information Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql)](https://github.com/pgvector/pgvector)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-API-8E44AD?logo=google)](https://ai.google.dev/)

**AskCET** is a full-stack, enterprise-grade AI information assistant built specifically for college communities. Powered by **Retrieval-Augmented Generation (RAG)**, AskCET semantic-searches official college documentation (academic regulations, exam timetables, hostel rules, fee structures, notices, and course guides) to provide **source-grounded, hallucinatory-resistant answers** with explicit document page citations.

---

## 🌟 Key Features

- 🧠 **True RAG Pipeline**: Uses vector embeddings (`text-embedding-004`) to retrieve contextual document chunks prior to generation (`gemini-1.5-flash`).
- 📌 **Verifiable Source Citations**: Every response lists precise reference sources (Document Name, Category/Department, and Page Number).
- 🛡️ **Unknown-Question Guardrails**: Prevents AI hallucination when information is missing from official documents, instructing students to contact the administration.
- ⚡ **Streaming Chat Interface**: Low-latency, real-time AI response streaming with markdown and code formatting.
- 🔐 **Role-Based Access Control (RBAC)**: Distinct permissions for **Students** (ask questions, chat history) and **Admins** (document management, processing status, analytics).
- 📂 **Admin Document Ingestion Engine**: Supports uploading PDFs, DOCX, and TXT files with automatic text extraction, semantic chunking, and embedding indexing.
- 💬 **Conversation Management**: Multi-session chat history, title auto-generation, conversation rename/deletion, and continuous dialog memory.
- 👍 **Feedback System**: Upvote/downvote responses with issue reporting to continuously evaluate and improve retrieval quality.

---

## 🏗️ Architecture & Technology Stack

```
 ┌────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │ Student / Admin│ ────> │ Next.js 14 App  │ ────> │  Prisma ORM     │
 │ Frontend UI    │       │  API Routes     │       │  & PostgreSQL   │
 └────────────────┘       └────────┬────────┘       └────────┬────────┘
                                   │                         │
                                   ▼                         ▼
                          ┌─────────────────┐       ┌─────────────────┐
                          │ Google Gemini   │       │ Vector DB       │
                          │ Embeddings & LLM│ <───> │ (pgvector)      │
                          └─────────────────┘       └─────────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14+ (App Router), React 18, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Framer Motion, Radix UI / Shadcn UI |
| **Database & Vectors** | PostgreSQL + `pgvector` extension, Prisma ORM |
| **Authentication** | NextAuth.js (v5 / Auth.js) with JWT & Role-Based Access (`student`, `admin`) |
| **AI & Embeddings** | `@google/generative-ai` (`gemini-1.5-flash` & `text-embedding-004`) |
| **Document Processors** | `pdf-parse` (PDF extraction), `mammoth` (DOCX extraction) |
| **Containerization** | Docker Compose for local PostgreSQL + `pgvector` instance |

---

## 📋 Prerequisites

Before setting up AskCET locally, ensure you have installed:

1. **Node.js**: `v18.17.0` or higher (`v20.x` recommended) — [Download Node.js](https://nodejs.org/)
2. **npm** / **pnpm** / **bun**: Package manager included with Node.js
3. **Docker Desktop**: For running PostgreSQL with `pgvector` locally — [Download Docker](https://www.docker.com/products/docker-desktop/)
4. **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Local Quick Start & Installation

Follow these steps to run AskCET on your local machine:

### 1. Clone & Navigate to Repository

```bash
git clone https://github.com/your-username/askcet.git
cd askcet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the template `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
# Server Config
PORT=3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_nextauth_key_min_32_chars

# Database (PostgreSQL with pgvector)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/askcet?schema=public"

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# RAG Settings
EMBEDDING_MODEL=text-embedding-004
LLM_MODEL=gemini-1.5-flash
MAX_CHUNK_SIZE=800
CHUNK_OVERLAP=150
SIMILARITY_THRESHOLD=0.65
TOP_K_RESULTS=5
```

### 4. Start PostgreSQL with `pgvector`

Launch PostgreSQL container via Docker Compose:

```bash
docker compose up -d
```

Verify that the database container is running:
```bash
docker ps
```

### 5. Run Database Migrations & Seed Data

Push the Prisma schema to PostgreSQL and enable the `pgvector` extension:

```bash
npx prisma db push
```

*(Optional)* Seed initial admin credentials and sample college document data:

```bash
npx prisma db seed
```

### 6. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
- **Student Chat App**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Default Demo Accounts

If you ran `npm run seed`, you can sign in with the following default test accounts:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `student123` | Chat, Search, History, Feedback |
| **Admin** | `admin@college.edu` | `admin123` | Ingestion, Document Management, Analytics |

---

## 📁 Repository Structure

```
askcet/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── (auth)/                 # Auth routes (login, register)
│   ├── (dashboard)/            # Student & Admin layout routes
│   │   ├── admin/              # Admin Document Management Dashboard
│   │   └── chat/               # Main Student AI Chat Interface
│   ├── api/                    # Backend REST API Endpoints
│   │   ├── admin/documents/    # Upload, process & delete documents
│   │   ├── chat/               # RAG Query Processing & Streaming API
│   │   ├── conversations/      # History management
│   │   └── feedback/           # User feedback route
│   ├── layout.tsx              # Root Layout with Providers
│   └── page.tsx                # Landing Page
├── components/                 # Reusable UI Components
│   ├── admin/                  # Document Table, Upload Modal, Processing Status
│   ├── chat/                   # Message List, Chat Box, Source Pill, Suggested Prompts
│   ├── ui/                     # Buttons, Cards, Inputs, Dialogs (Radix/Shadcn)
│   └── shared/                 # Navbar, Sidebar, Footer, Auth Guard
├── lib/                        # Core Utilities & Backend Logic
│   ├── ai/                     # Gemini Client, Embedding Generator, Prompt Templates
│   ├── db/                     # Prisma Client instance
│   ├── rag/                    # Text Extraction, Chunking, Vector Search Engine
│   └── utils/                  # Helper functions & formatting
├── prisma/                     # Database Schema & Migrations
│   ├── schema.prisma           # Relational + Vector Schema
│   └── seed.ts                 # Sample Data Seeder
├── docker-compose.yml          # PostgreSQL + pgvector Docker Setup
├── .env.example                # Environment Variable Template
├── package.json
└── README.md
```

---

## ⚡ Document Ingestion Workflow

1. **Upload**: Administrator uploads a PDF, DOCX, or TXT file via `/admin`.
2. **Text Extraction**: Server extracts raw text using `pdf-parse` or `mammoth`.
3. **Cleaning & Chunking**: Content is split into semantic paragraphs (800 chars, 150 char overlap) preserving section headers.
4. **Vector Embedding**: Each chunk is transformed into a 768-dimensional vector via Gemini `text-embedding-004`.
5. **Storage**: Vector and associated metadata (`document_name`, `page_number`, `category`) are stored in `DocumentChunk` table with `pgvector`.
6. **Query Time**: Student asks a question ➔ Question is embedded ➔ Cosine similarity vector search finds Top-5 relevant chunks ➔ Context is formatted into system prompt ➔ Gemini streams grounded answer with citations.

---

## 🧪 Running Tests & Quality Check

```bash
# Run ESLint check
npm run lint

# Run Type checking
npm run type-check

# Run RAG retrieval quality evaluation script
npm run eval:rag
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

---

## 🤝 Support & Feedback

If you encounter issues or have suggestions, please open an Issue on GitHub or submit a Pull Request.

**Built with ❤️ for College Students & Developers**
>>>>>>> 08f3273 (initial commit: askCET application)
