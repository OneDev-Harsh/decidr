# Decidr. — Enterprise Decision Intelligence Platform

> **Transform high-stakes uncertainty into auditable strategic clarity.**  
> Decidr is an enterprise-grade decision intelligence environment that combines advanced multi-agent reasoning, interactive scenario analysis, cognitive blindspot auditing, and auditable governance pipelines. Built for organizations that require traceably clear, evidence-backed strategic actions.

---

## 💎 Core Capabilities

### 🧠 1. Analytical Intelligence & Multi-Agent Reasoning
Decidr leverages a decoupled agent network to process evidence and generate insights:
- **Scenario Matrix**: Interactive scenario modeling dynamically generated from unstructured evidence to map alternate future states and evaluate enterprise readiness.
- **Blindspot Audit**: AI-driven analysis that evaluates cognitive vulnerabilities, biases, and unstated assumptions behind current strategies.
- **Contradiction Intelligence**: A production-safe, auditable reasoning layer that exposes evidential, assumptions, scenario, and logical contradictions.
- **Recommendation Engine**: Multi-agent recommendation pathways detailing confidence ratings, impact metrics, and trade-offs.

### 🛡️ 2. Auditable Collaborative Governance
Designed around strict corporate compliance and traceability standards:
- **Git-style Proposal Workflow**: Create, edit, and audit strategic proposals with an integrated workspace review and owner/admin merge governance loop.
- **Decision Timeline**: An immutable ledger capturing all project modifications, evidence ingests, and proposal decisions in a beautiful chronological timeline.
- **Activity Logs**: Auditable traceability maps showing user actions, agent triggers, and collaboration logs.

### 👥 3. Real-Time Distributed Collaboration
High-fidelity collaborative environment:
- **Multiplayer Presence**: Real-time cursor and activity tracking of workspace collaborators powered by WebSocket pub/sub layers.
- **Contextual Discussions**: Highly organized debate channels embedded directly on proposals, recommendations, and evidence chunks.
- **Granular Permissions**: Workspace invites and robust access controls (Owners, Admins, and Collaborators).

---

## 🛠️ The Tech Stack

Decidr is engineered with a cutting-edge front-end stack combined with an integrated Backend-as-a-Service (BaaS) layer:

* **Framework**: [Next.js 15](https://nextjs.org/) (React 19, Turbopack, App Router)
* **Styling**: Tailwind CSS 3.4 (Strictly locked premium theme: *Crimson Ink*)
* **Animations**: [Framer Motion 12](https://www.framer.com/motion/) (Smooth glassmorphic transitions and micro-interactions)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Backend Infrastructure**: Powered by **InsForge**
  * **Database**: PostgreSQL with PostgREST dynamic API layer.
  * **Realtime**: WebSocket-driven Pub/Sub for chat, invites, and collaborator presence.
  * **Authentication**: Secure JWT tokens supporting email/password and OAuth (GitHub/Google).
  * **Storage**: Scalable object storage for evidence documents.
  * **AI & Tracing**: Dynamic completions supporting Claude, Gemini, and DeepSeek, backed by built-in audit traces.

---

## 🚀 Local Development Setup

To run Decidr locally in your workspace, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and inject your **InsForge** backend credentials:
```env
NEXT_PUBLIC_INSFORGE_URL=https://q85rkesr.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-insforge-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in local development mode with hot-reloading.