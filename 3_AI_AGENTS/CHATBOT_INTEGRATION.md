# Chatbot Integration Guide

## Overview
Comprehensive guide for integrating AI-powered chatbots across the iWORKZ platform to enhance user experience and automate support.

## Chatbot Architecture

### Core Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Chat Widget   │    │  Mobile Chat    │
│   (Web App)     │    │   (Embedded)    │    │    (App)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Chat Gateway   │
                    │   (Socket.io)   │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NLU Engine    │    │  Dialog Manager │    │  Response Gen   │
│   (Intent/NER)  │    │   (Flow Logic)  │    │   (Templates)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Knowledge Base │
                    │   (Vector DB)   │
                    └─────────────────┘
```

## Chat Widget Implementation

### Frontend Integration
```typescript
// Chat Widget Component
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
  type: 'text' | 'quick_reply' | 'carousel' | 'form';
  metadata?: any;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const newSocket = io('/chat', {
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    newSocket.on('bot_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      setTyping(false);
    });

    newSocket.on('bot_typing', () => {
      setTyping(true);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !socket) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputText,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    socket.emit('user_message', {
      message: inputText,
      userId: getCurrentUserId(),
      sessionId: getSessionId()
    });

    setInputText('');
    setTyping(true);
  };

  return (
    <div className={`chat-widget ${isOpen ? 'open' : 'closed'}`}>
      {/* Chat UI implementation */}
    </div>
  );
};
```

### Backend Chat Handler
```typescript
// Chat Socket Handler
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { NLUService } from './nlu.service';
import { DialogManager } from './dialog.manager';

export class ChatHandler {
  constructor(
    private io: Server,
    private chatService: ChatService,
    private nluService: NLUService,
    private dialogManager: DialogManager
  ) {}

  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);

    socket.on('user_message', async (data) => {
      try {
        await this.processUserMessage(socket, data);
      } catch (error) {
        console.error('Error processing message:', error);
        socket.emit('bot_message', {
          id: Date.now().toString(),
          sender: 'bot',
          message: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          type: 'text'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  }

  private async processUserMessage(socket: Socket, data: any) {
    const { message, userId, sessionId } = data;

    // Emit typing indicator
    socket.emit('bot_typing');

    // Save user message
    await this.chatService.saveMessage({
      sessionId,
      userId,
      sender: 'user',
      message,
      timestamp: new Date()
    });

    // Process with NLU
    const nluResult = await this.nluService.analyze(message);
    
    // Get response from dialog manager
    const response = await this.dialogManager.processIntent(
      nluResult,
      userId,
      sessionId
    );

    // Save bot response
    await this.chatService.saveMessage({
      sessionId,
      userId,
      sender: 'bot',
      message: response.message,
      timestamp: new Date(),
      metadata: response.metadata
    });

    // Send response to user
    socket.emit('bot_message', {
      id: Date.now().toString(),
      sender: 'bot',
      message: response.message,
      timestamp: new Date(),
      type: response.type,
      metadata: response.metadata
    });
  }
}
```

## Natural Language Understanding

### Intent Classification
```typescript
// NLU Service
export class NLUService {
  private intentClassifier: any;
  private entityExtractor: any;

  async analyze(message: string): Promise<NLUResult> {
    // Preprocess message
    const cleanMessage = this.preprocessText(message);

    // Classify intent
    const intent = await this.classifyIntent(cleanMessage);
    
    // Extract entities
    const entities = await this.extractEntities(cleanMessage);
    
    // Sentiment analysis
    const sentiment = await this.analyzeSentiment(cleanMessage);

    return {
      intent: intent.name,
      confidence: intent.confidence,
      entities,
      sentiment,
      originalText: message,
      processedText: cleanMessage
    };
  }

  private async classifyIntent(text: string): Promise<IntentResult> {
    // Use trained model or external API
    const intents = [
      'job_search',
      'profile_update',
      'application_status',
      'interview_scheduling',
      'salary_inquiry',
      'technical_support',
      'general_inquiry'
    ];

    // Simplified classification logic
    // In production, use ML models or services like Rasa, Dialogflow
    if (text.includes('job') || text.includes('position')) {
      return { name: 'job_search', confidence: 0.85 };
    }
    if (text.includes('application') || text.includes('applied')) {
      return { name: 'application_status', confidence: 0.80 };
    }
    // ... more intent matching logic

    return { name: 'general_inquiry', confidence: 0.60 };
  }

  private async extractEntities(text: string): Promise<Entity[]> {
    const entities: Entity[] = [];

    // Job titles
    const jobTitleRegex = /(software engineer|developer|designer|manager|analyst)/gi;
    const jobTitleMatches = text.match(jobTitleRegex);
    if (jobTitleMatches) {
      jobTitleMatches.forEach(match => {
        entities.push({
          type: 'job_title',
          value: match,
          confidence: 0.9
        });
      });
    }

    // Location
    const locationRegex = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const locationMatches = text.match(locationRegex);
    if (locationMatches) {
      locationMatches.forEach(match => {
        entities.push({
          type: 'location',
          value: match.replace('in ', ''),
          confidence: 0.8
        });
      });
    }

    return entities;
  }
}
```

## Dialog Management

### Conversation Flow Manager
```typescript
// Dialog Manager
export class DialogManager {
  constructor(
    private knowledgeBase: KnowledgeBase,
    private jobService: JobService,
    private userService: UserService
  ) {}

  async processIntent(
    nluResult: NLUResult,
    userId: string,
    sessionId: string
  ): Promise<BotResponse> {
    const { intent, entities, confidence } = nluResult;

    // Get conversation context
    const context = await this.getConversationContext(sessionId);

    switch (intent) {
      case 'job_search':
        return this.handleJobSearch(entities, userId, context);
      
      case 'application_status':
        return this.handleApplicationStatus(entities, userId, context);
      
      case 'profile_update':
        return this.handleProfileUpdate(entities, userId, context);
      
      case 'interview_scheduling':
        return this.handleInterviewScheduling(entities, userId, context);
      
      case 'technical_support':
        return this.handleTechnicalSupport(entities, userId, context);
      
      default:
        return this.handleGeneralInquiry(nluResult, userId, context);
    }
  }

  private async handleJobSearch(
    entities: Entity[],
    userId: string,
    context: ConversationContext
  ): Promise<BotResponse> {
    const jobTitle = entities.find(e => e.type === 'job_title')?.value;
    const location = entities.find(e => e.type === 'location')?.value;

    if (!jobTitle) {
      return {
        message: "What type of job are you looking for?",
        type: 'text',
        metadata: {
          requiresInput: true,
          expectedIntent: 'job_search_details'
        }
      };
    }

    // Search for jobs
    const jobs = await this.jobService.searchJobs({
      title: jobTitle,
      location: location,
      userId: userId,
      limit: 5
    });

    if (jobs.length === 0) {
      return {
        message: `I couldn't find any ${jobTitle} positions${location ? ` in ${location}` : ''}. Would you like me to search for similar roles or set up a job alert?`,
        type: 'quick_reply',
        metadata: {
          quickReplies: [
            { text: 'Search similar roles', payload: 'search_similar' },
            { text: 'Set up job alert', payload: 'create_alert' },
            { text: 'Try different search', payload: 'new_search' }
          ]
        }
      };
    }

    const jobCards = jobs.map(job => ({
      title: job.title,
      subtitle: `${job.company} • ${job.location}`,
      imageUrl: job.company.logo,
      buttons: [
        { text: 'View Details', type: 'web_url', url: `/jobs/${job.id}` },
        { text: 'Apply Now', type: 'postback', payload: `apply_${job.id}` }
      ]
    }));

    return {
      message: `I found ${jobs.length} ${jobTitle} positions for you:`,
      type: 'carousel',
      metadata: {
        cards: jobCards
      }
    };
  }

  private async handleApplicationStatus(
    entities: Entity[],
    userId: string,
    context: ConversationContext
  ): Promise<BotResponse> {
    const applications = await this.jobService.getUserApplications(userId);
    
    if (applications.length === 0) {
      return {
        message: "You haven't submitted any applications yet. Would you like to search for jobs?",
        type: 'quick_reply',
        metadata: {
          quickReplies: [
            { text: 'Search Jobs', payload: 'job_search' },
            { text: 'Update Profile', payload: 'profile_update' }
          ]
        }
      };
    }

    const recentApplications = applications.slice(0, 5);
    const statusSummary = recentApplications.map(app => 
      `• ${app.jobTitle} at ${app.company} - ${app.status}`
    ).join('\n');

    return {
      message: `Here are your recent applications:\n\n${statusSummary}\n\nWould you like details on any specific application?`,
      type: 'text',
      metadata: {
        applications: recentApplications
      }
    };
  }
}
```

## Knowledge Base Integration

### Vector Search for FAQ
```typescript
// Knowledge Base Service
export class KnowledgeBase {
  constructor(private vectorDB: VectorDatabase) {}

  async findAnswer(query: string): Promise<KBResult | null> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Search similar documents
    const results = await this.vectorDB.search(queryEmbedding, {
      limit: 5,
      threshold: 0.8
    });

    if (results.length === 0) {
      return null;
    }

    const bestMatch = results[0];
    
    return {
      answer: bestMatch.content,
      confidence: bestMatch.score,
      source: bestMatch.metadata.source,
      relatedQuestions: results.slice(1, 3).map(r => r.metadata.question)
    };
  }

  async addFAQ(question: string, answer: string, category: string) {
    const embedding = await this.generateEmbedding(question);
    
    await this.vectorDB.insert({
      id: generateId(),
      embedding,
      content: answer,
      metadata: {
        question,
        category,
        source: 'faq',
        lastUpdated: new Date()
      }
    });
  }
}
```

## Multi-Channel Deployment

### Web Integration
```html
<!-- Website Integration -->
<script>
  window.iWORKZChat = {
    apiKey: 'your-api-key',
    theme: 'light',
    position: 'bottom-right',
    greeting: 'Hi! How can I help you find your next opportunity?',
    triggers: [
      {
        type: 'time',
        value: 30000, // 30 seconds
        message: 'Need help getting started?'
      },
      {
        type: 'page',
        value: '/jobs',
        message: 'Looking for a specific type of job?'
      }
    ]
  };

  (function() {
    var script = document.createElement('script');
    script.src = 'https://chat.iworkz.com/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

### Mobile App Integration
```typescript
// React Native Chat Integration
import { ChatSDK } from '@iworkz/chat-sdk';

const MobileChat: React.FC = () => {
  const [chatVisible, setChatVisible] = useState(false);

  useEffect(() => {
    ChatSDK.initialize({
      apiKey: 'your-api-key',
      userId: getCurrentUserId(),
      pushToken: getPushToken()
    });
  }, []);

  const openChat = () => {
    ChatSDK.showChat({
      initialMessage: 'Hi! I need help with...',
      theme: 'mobile-optimized'
    });
  };

  return (
    <TouchableOpacity onPress={openChat}>
      <ChatIcon />
    </TouchableOpacity>
  );
};
```

## Analytics and Monitoring

### Chat Analytics
```typescript
// Analytics Service
export class ChatAnalytics {
  async trackConversation(sessionId: string, metrics: ConversationMetrics) {
    await this.analyticsDB.insert({
      sessionId,
      userId: metrics.userId,
      startTime: metrics.startTime,
      endTime: metrics.endTime,
      messageCount: metrics.messageCount,
      intentsSolved: metrics.intentsSolved,
      escalatedToHuman: metrics.escalatedToHuman,
      satisfactionScore: metrics.satisfactionScore,
      timestamp: new Date()
    });
  }

  async generateInsights(): Promise<ChatInsights> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const metrics = await this.analyticsDB.aggregate([
      { $match: { timestamp: { $gte: last30Days } } },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          avgMessagesPerConversation: { $avg: '$messageCount' },
          resolutionRate: { 
            $avg: { 
              $cond: [{ $eq: ['$escalatedToHuman', false] }, 1, 0] 
            }
          },
          avgSatisfactionScore: { $avg: '$satisfactionScore' }
        }
      }
    ]);

    return metrics[0];
  }
}
```

## Configuration and Deployment

### Environment Configuration
```bash
# Chat Service Configuration
CHAT_SERVICE_PORT=8004
SOCKET_IO_CORS_ORIGINS=https://app.iworkz.com,https://iworkz.com

# NLU Configuration
NLU_SERVICE_URL=http://localhost:8005
INTENT_CONFIDENCE_THRESHOLD=0.7

# Knowledge Base
VECTOR_DB_URL=http://localhost:8006
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# External Integrations
DIALOGFLOW_PROJECT_ID=iworkz-chatbot
RASA_API_URL=http://localhost:5005
```

### Docker Deployment
```dockerfile
# Chat Service Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8004

CMD ["npm", "run", "start:prod"]
```

The complete chatbot integration provides intelligent, context-aware assistance across all platform touchpoints while maintaining conversation history and learning from user interactions.