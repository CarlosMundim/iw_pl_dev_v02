# Investors Website

## Overview

A dedicated website for investors featuring company information, financial data, investment opportunities, and direct engagement tools. Designed for performance, transparency, and a world-class investor experience, the site supports global outreach and high-impact communication.

## Tech Stack

* **Framework**: Next.js 14 (Static Site Generation)
* **Language**: TypeScript
* **Styling**: Tailwind CSS + Custom Animations
* **CMS**: Contentful / Strapi (headless, multi-language ready)
* **Analytics**: Google Analytics 4, with event-based reporting
* **SEO**: Advanced Next.js SEO optimisation, Open Graph tags
* **Deployment**: Vercel or AWS S3 + CloudFront (CDN)

## Development Setup

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev

# Generate static site
npm run build
npm run export

# Serve static files
npm run serve
```

## Key Features

* Ultra-fast static site generation for global performance
* SEO and accessibility optimised
* Real-time financial data visualisation (integrated with backend or third-party API)
* Investor document library (reports, decks, legal, press)
* Newsletter subscription and automated alerts
* Contact forms with validation, anti-spam, and optional chatbot
* Download centre for compliance and financial documents
* Investor FAQ and automated responses

## Content Management

* Fully decoupled headless CMS (Contentful/Strapi)
* Content versioning, scheduling, and approval workflows
* Multi-language and localised content
* Rich text editing with image/video/media asset management
* Secure, role-based access for content authors and legal

## Page Structure

```
├── Home Page (Key facts, highlights, call to action)
├── About Us (Leadership, history, governance)
├── Investment Opportunities (Deal room, portfolio, process)
├── Financial Reports (Annual, quarterly, ESG, KPIs)
├── News & Insights (Press releases, updates, blog)
├── ESG Impact (Sustainability, social impact, SDGs)
├── Contact Us (Form, team directory, office locations)
├── Legal Information (Compliance, terms, privacy)
└── Investor Portal (future: login, dashboard, Q&A)
```

## Performance Features

* Static page generation and CDN edge delivery
* Image optimisation and on-the-fly format selection
* Lazy loading, prioritised rendering
* Core Web Vitals/Google Lighthouse target: 95+
* Progressive Web App ready
* Accessibility (WCAG 2.1 AA+) and responsive across all devices

## Analytics & Tracking

* Google Analytics 4 and tag manager integration
* Custom events for document downloads, form submissions, and newsletter joins
* Conversion funnel and attribution tracking
* Session recording (optional: FullStory/Hotjar)
* User behaviour and cohort analysis

## What’s Next (Phase 2+ backlog)

* Investor Portal (secure login, private document vault, Q\&A)
* Automated financial data sync (backend API integration)
* Enhanced data visualisations (interactive charts, ESG dashboard)
* Multilingual rollout (Japanese, Chinese, Korean)
* Accessibility audits and certification
* Deeper CRM/IR tool integration (Salesforce, IRM)
* Investor chatbot with voice and real-time support
* Legal/ESG compliance auto-checks on uploads

---

Carlos, this document will evolve as the platform grows. Every update, every feature, and every learning will be added here for full continuity. Let’s keep the ambition global and the UX world-class. Next: the Japanese version!
