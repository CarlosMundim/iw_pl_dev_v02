# ARCHITECTURE OVERVIEW

## Core Principles

* **Modular, service-oriented architecture** using modern best practices (Next.js, TypeScript, Tailwind, containerisation).
* **API-first design:** All functionality accessible via REST/GraphQL APIs.
* **Separation of Concerns:** UI, business logic, and data are cleanly separated for scalability and testability.

---

## Main Components

* **Frontend:** Next.js (React), using Tailwind for UI. Supports mobile and desktop.
* **Backend:** Node.js/TypeScript, scalable via containerisation (Docker).
* **Database:** PostgreSQL (main), Redis (cache), S3-compatible object storage for files.
* **AI Services:** Microservices for LLMs, embeddings, RAG, and agentic workflows, accessed via internal APIs.
* **Security Layer:** Auth0/Keycloak for SSO, RBAC for internal controls.

---

## Deployment

* Default: Docker Compose (local/dev), Kubernetes (prod).
* Continuous Integration (CI): GitHub Actions for test, lint, build, and deploy.

---

## Further Reading

* [Deployment Guide](../4_DEPLOYMENT/DEPLOYMENT_GUIDE.md)
* [Cloud Architecture](../4_DEPLOYMENT/CLOUD_ARCHITECTURE.md)
* [Business Context](./BUSINESS_CONTEXT.md)
