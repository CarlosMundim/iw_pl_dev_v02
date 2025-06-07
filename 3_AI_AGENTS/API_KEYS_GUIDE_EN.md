API Keys Setup Guide
Overview
Comprehensive guide for setting up and managing API keys for all AI and digital services powering the iWORKZ platform. This guide supports global deployments for sectors including healthcare, homecare, IT/AI, services, engineering, manufacturing, financial services, F&B, BPO, and more.

1. Required AI & Cloud Services
OpenAI GPT Services
Purpose: Generative AI for text, code, CV parsing, scoring, embeddings, and speech-to-text (Whisper)

Industries: All (job matching, compliance, talent analytics, AI chat, etc.)

Pricing: Pay-per-use (see OpenAI pricing)

Setup Steps
Go to OpenAI Platform

Register and verify your account

Generate your API key in "API Keys"

Store your API key securely (use a password manager or a secure vault)

bash
Copy
Edit
# Environment Variables
OPENAI_API_KEY=sk-your-secret-key-here
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_MODEL=gpt-3.5-turbo
Usage Example
javascript
Copy
Edit
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const completion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Analyze this resume...' }],
  model: 'gpt-3.5-turbo',
  max_tokens: 1000,
  temperature: 0.3
});
Anthropic Claude
Purpose: Advanced reasoning, analysis, long-form content, and compliance checks.

Industries: Regulated industries (finance, health), where robust compliance and explanations are essential.

Pricing: Anthropic pricing

Setup Steps
Register at Anthropic Console

Verify your account

Generate your API key

Set API usage limits (recommended)

bash
Copy
Edit
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
Usage Example
python
Copy
Edit
import anthropic
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    temperature=0.3,
    messages=[{"role": "user", "content": "Evaluate this job candidate..."}]
)
Google Cloud AI Platform
Purpose: Multilingual translation, natural language processing, and speech-to-text.

Industries: Homecare, international BPO, F&B (menus), multi-country platforms.

Pricing: Google AI pricing

Setup Steps
Create Google Cloud Project

Enable AI APIs (Translation, NLP, Speech-to-Text)

Create a service account and download the JSON credentials

Set relevant environment variables

bash
Copy
Edit
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_TRANSLATE_API_KEY=your-translate-key
Usage Example
javascript
Copy
Edit
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const [translation] = await translate.translate(text, targetLanguage);
Azure Cognitive Services
Purpose: Speech, text analytics, and image processing.

Industries: Healthcare (voice notes), F&B (menu reading), Financial services (OCR), etc.

Pricing: Azure Cognitive pricing

Setup Steps
Register on Azure Portal

Create Cognitive Services resource

Obtain endpoint URL and API key

bash
Copy
Edit
AZURE_COGNITIVE_SERVICES_KEY=your-subscription-key
AZURE_COGNITIVE_SERVICES_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_SPEECH_KEY=your-speech-key
AZURE_SPEECH_REGION=your-region
HuggingFace
Purpose: Specialised models for compliance, sentiment, or industry-specific NLP.

Industries: Manufacturing, services, finance (fraud detection, contract reading).

Pricing: Free tier for research/sandboxing, paid for high usage.

Setup Steps
Register at HuggingFace

Generate and copy access token

bash
Copy
Edit
HUGGINGFACE_API_TOKEN=hf_your-token-here
Usage Example
python
Copy
Edit
from transformers import pipeline
classifier = pipeline("text-classification", model="your-model", use_auth_token=os.environ.get("HUGGINGFACE_API_TOKEN"))
result = classifier("This is a great job opportunity!")
2. Vector Database Services
Pinecone
Purpose: Fast vector search (e.g. candidate-job matching).

Industries: AI-powered job placement, candidate ranking, large-scale BPO.

Setup Steps
Register at Pinecone

Create project and get API key

bash
Copy
Edit
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=job-matching-index
Usage Example
python
Copy
Edit
import pinecone
pinecone.init(api_key=os.environ.get("PINECONE_API_KEY"), environment=os.environ.get("PINECONE_ENVIRONMENT"))
index = pinecone.Index("job-matching-index")
index.upsert(vectors=[("job_1", embedding_vector, {"title": "Software Engineer"})])
results = index.query(query_vector, top_k=10)
Weaviate
Purpose: Open-source vector DB, GraphQL support.

Industries: Knowledge graph, compliance search, etc.

bash
Copy
Edit
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-key
3. External Service APIs
SendGrid (Email)
Purpose: Transactional & notification emails (job alerts, interview invites, payslips, etc.)

bash
Copy
Edit
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@iworkz.com
SENDGRID_TEMPLATE_ID=d-your-template-id
Twilio (SMS/Voice)
Purpose: SMS notifications for security, urgent job matches, voice interview reminders.

bash
Copy
Edit
TWILIO_ACCOUNT_SID=AC-your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
Stripe (Payments)
Purpose: Payment processing (premium services, B2B subscriptions, onboarding fees).

bash
Copy
Edit
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
4. Security & Cost Management
Environment Management
Never commit .env files to source control

Store keys in secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)

Rotate keys every 90 days or as required

Budget Monitoring
Set usage and cost alerts (AWS CloudWatch, GCP Billing, Azure Monitor)

Regularly review API usage and deactivate unused keys

Troubleshooting & Testing
Always verify API keys with minimal test calls before production use

Use sample scripts (see above) for each provider

5. Setup & Health Check Scripts
Setup
bash
Copy
Edit
#!/bin/bash
echo "Setting up iWORKZ AI API Keys..."
cp .env.example .env 2>/dev/null || true
# ... (see previous example for full script)
Connectivity Test (Example)
javascript
Copy
Edit
// See previous 'test-api-keys.js' block for a full multi-provider script
6. Troubleshooting Common Issues
Invalid API Key: Double check key format, regenerate if in doubt.

Rate Limiting: Respect provider rate limits; use exponential backoff on 429 errors.

Network Issues: Check VPN, proxy, firewall, DNS as relevant.

Permission Denied: Ensure service accounts and roles are correctly set for secret/key access.

Remember: Keep all keys secure, rotate often, and monitor usage daily to avoid service interruptions and compliance risks.
