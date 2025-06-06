# API Keys Setup Guide

## Overview
Comprehensive guide for setting up and managing API keys for AI services used in the iWORKZ platform.

## Required AI Services

### OpenAI GPT Services
**Purpose**: Text generation, completion, embeddings, and Whisper speech-to-text
**Pricing**: Pay-per-use, $0.002/1K tokens for GPT-3.5-turbo

#### Setup Steps
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account and verify email
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy and store securely

```bash
# Environment Variable
OPENAI_API_KEY=sk-your-secret-key-here

# Usage Limits (recommended)
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_MODEL=gpt-3.5-turbo
```

#### Usage Example
```javascript
// Node.js Integration
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Analyze this resume...' }],
  model: 'gpt-3.5-turbo',
  max_tokens: 1000,
  temperature: 0.3
});
```

### Anthropic Claude
**Purpose**: Advanced reasoning, analysis, and content generation
**Pricing**: $0.008/1K input tokens, $0.024/1K output tokens

#### Setup Steps
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account and complete verification
3. Generate API key in Dashboard
4. Set usage limits and billing alerts

```bash
# Environment Variable
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Configuration
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
```

#### Usage Example
```python
# Python Integration
import anthropic

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),
)

message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    temperature=0.3,
    messages=[
        {"role": "user", "content": "Evaluate this job candidate..."}
    ]
)
```

### Google Cloud AI Platform
**Purpose**: Translation, natural language processing, speech services
**Pricing**: Various per-service pricing

#### Setup Steps
1. Create [Google Cloud Project](https://console.cloud.google.com/)
2. Enable AI Platform API
3. Create service account
4. Download JSON credentials file
5. Enable required APIs:
   - Cloud Translation API
   - Cloud Natural Language API
   - Cloud Speech-to-Text API

```bash
# Environment Variables
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_TRANSLATE_API_KEY=your-translate-key
```

#### Usage Example
```javascript
// Google Cloud Translation
const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const [translation] = await translate.translate(text, targetLanguage);
```

### Azure Cognitive Services
**Purpose**: Speech services, text analytics, computer vision
**Pricing**: Pay-per-transaction model

#### Setup Steps
1. Create [Azure Account](https://portal.azure.com/)
2. Create Cognitive Services resource
3. Get endpoint URL and subscription key
4. Configure regional endpoint

```bash
# Environment Variables
AZURE_COGNITIVE_SERVICES_KEY=your-subscription-key
AZURE_COGNITIVE_SERVICES_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_SPEECH_KEY=your-speech-key
AZURE_SPEECH_REGION=your-region
```

### HuggingFace
**Purpose**: Open-source models, embeddings, specialized NLP tasks
**Pricing**: Free tier available, paid for intensive usage

#### Setup Steps
1. Create [HuggingFace account](https://huggingface.co/)
2. Generate access token in settings
3. Choose models for specific tasks

```bash
# Environment Variable
HUGGINGFACE_API_TOKEN=hf_your-token-here

# Model Configuration
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
HF_CLASSIFICATION_MODEL=microsoft/DialoGPT-medium
```

#### Usage Example
```python
# HuggingFace Integration
from transformers import pipeline

# Load model with authentication
classifier = pipeline(
    "text-classification",
    model="your-model-name",
    use_auth_token=os.environ.get("HUGGINGFACE_API_TOKEN")
)

result = classifier("This is a great job opportunity!")
```

## Vector Database Services

### Pinecone
**Purpose**: Vector search and similarity matching
**Pricing**: Free tier: 1M vectors, paid plans start at $70/month

#### Setup Steps
1. Sign up at [Pinecone](https://www.pinecone.io/)
2. Create new project
3. Get API key and environment
4. Create index for your use case

```bash
# Environment Variables
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=job-matching-index
```

#### Usage Example
```python
# Pinecone Integration
import pinecone

pinecone.init(
    api_key=os.environ.get("PINECONE_API_KEY"),
    environment=os.environ.get("PINECONE_ENVIRONMENT")
)

index = pinecone.Index("job-matching-index")

# Upsert vectors
index.upsert(vectors=[
    ("job_1", embedding_vector, {"title": "Software Engineer"})
])

# Query similar vectors
results = index.query(query_vector, top_k=10)
```

### Weaviate
**Purpose**: Open-source vector database with GraphQL API
**Pricing**: Free self-hosted, cloud plans available

```bash
# Environment Variables
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-key
```

## External Service APIs

### SendGrid (Email)
**Purpose**: Transactional and marketing emails
**Pricing**: Free tier: 100 emails/day, paid plans start at $14.95/month

```bash
# Environment Variables
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@iworkz.com
SENDGRID_TEMPLATE_ID=d-your-template-id
```

### Twilio (SMS/Voice)
**Purpose**: SMS notifications and voice calls
**Pricing**: Pay-per-message/call model

```bash
# Environment Variables
TWILIO_ACCOUNT_SID=AC-your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Stripe (Payments)
**Purpose**: Payment processing for premium features
**Pricing**: 2.9% + $0.30 per transaction

```bash
# Environment Variables
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## Security Best Practices

### Environment Management
```bash
# Development Environment
cp .env.example .env.development
# Add development API keys

# Staging Environment
cp .env.example .env.staging
# Add staging API keys with limited quotas

# Production Environment
cp .env.example .env.production
# Add production API keys with full quotas
```

### Key Rotation Strategy
```bash
# Rotate keys every 90 days
# Script for automated rotation
#!/bin/bash

# Backup current keys
cp .env.production .env.backup.$(date +%Y%m%d)

# Update with new keys
# Restart services with new configuration
docker-compose restart

# Verify all services are working
./scripts/health-check.sh
```

### Access Control
```yaml
# IAM Policies for API Key Management
policies:
  - name: "ai-service-access"
    effect: "Allow"
    actions:
      - "secretsmanager:GetSecretValue"
      - "secretsmanager:DescribeSecret"
    resources:
      - "arn:aws:secretsmanager:*:*:secret:iworkz/ai-keys/*"
    
  - name: "key-rotation"
    effect: "Allow" 
    actions:
      - "secretsmanager:UpdateSecret"
      - "secretsmanager:RotateSecret"
    resources:
      - "arn:aws:secretsmanager:*:*:secret:iworkz/ai-keys/*"
```

## Cost Management

### Usage Monitoring
```javascript
// API Usage Tracking
const apiUsageTracker = {
  openai: {
    tokensUsed: 0,
    requestCount: 0,
    dailyLimit: 100000,
    monthlyBudget: 500
  },
  anthropic: {
    tokensUsed: 0,
    requestCount: 0,
    dailyLimit: 50000,
    monthlyBudget: 300
  }
};

// Track usage before API calls
const trackUsage = (service, tokens) => {
  apiUsageTracker[service].tokensUsed += tokens;
  apiUsageTracker[service].requestCount += 1;
  
  if (apiUsageTracker[service].tokensUsed > apiUsageTracker[service].dailyLimit) {
    throw new Error(`Daily limit exceeded for ${service}`);
  }
};
```

### Budget Alerts
```bash
# Set up billing alerts
# AWS CloudWatch alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "AI-API-Costs" \
  --alarm-description "Alert when AI API costs exceed budget" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold
```

## Development Setup Script

```bash
#!/bin/bash
# setup-ai-keys.sh

echo "Setting up iWORKZ AI API Keys..."

# Create .env file from template
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file from template"
fi

# Check for required API keys
required_keys=(
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY" 
  "GOOGLE_APPLICATION_CREDENTIALS"
  "PINECONE_API_KEY"
)

missing_keys=()

for key in "${required_keys[@]}"; do
  if ! grep -q "^$key=" .env || grep -q "^$key=$" .env; then
    missing_keys+=("$key")
  fi
done

if [ ${#missing_keys[@]} -gt 0 ]; then
  echo "Missing required API keys:"
  for key in "${missing_keys[@]}"; do
    echo "  - $key"
  done
  echo ""
  echo "Please update your .env file with the required API keys."
  echo "Refer to API_KEYS_GUIDE.md for setup instructions."
  exit 1
fi

echo "All required API keys are configured!"
echo "Run 'npm run test:ai-services' to verify connectivity."
```

## Testing API Connectivity

```javascript
// test-api-keys.js
const testAPIConnectivity = async () => {
  const tests = [];
  
  // Test OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await openai.models.list();
    tests.push({ service: 'OpenAI', status: 'OK' });
  } catch (error) {
    tests.push({ service: 'OpenAI', status: 'FAILED', error: error.message });
  }
  
  // Test Anthropic
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    });
    tests.push({ service: 'Anthropic', status: 'OK' });
  } catch (error) {
    tests.push({ service: 'Anthropic', status: 'FAILED', error: error.message });
  }
  
  // Test Pinecone
  try {
    pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    });
    await pinecone.listIndexes();
    tests.push({ service: 'Pinecone', status: 'OK' });
  } catch (error) {
    tests.push({ service: 'Pinecone', status: 'FAILED', error: error.message });
  }
  
  console.table(tests);
  
  const failedTests = tests.filter(test => test.status === 'FAILED');
  if (failedTests.length > 0) {
    console.error('Some API connections failed. Check your API keys and network connectivity.');
    process.exit(1);
  } else {
    console.log('All API connections successful!');
  }
};

testAPIConnectivity();
```

## Troubleshooting Common Issues

### Invalid API Key
```bash
# Verify key format
echo $OPENAI_API_KEY | grep -E '^sk-[a-zA-Z0-9]{48}$'

# Test with curl
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

### Rate Limiting
```javascript
// Implement exponential backoff
const makeAPICall = async (apiFunction, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      throw error;
    }
  }
};
```

### Network Issues
```bash
# Test connectivity
curl -I https://api.openai.com/v1/models
curl -I https://api.anthropic.com/v1/messages

# Check firewall rules
sudo ufw status
sudo iptables -L

# Test DNS resolution
nslookup api.openai.com
nslookup api.anthropic.com
```

Remember to keep API keys secure, rotate them regularly, and monitor usage to prevent unexpected costs.