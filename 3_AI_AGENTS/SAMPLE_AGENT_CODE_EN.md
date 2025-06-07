# Sample Agent Code

## Job Matching AI Agent

### Core Matching Algorithm
```python
# job_matcher.py
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple
import pandas as pd

class JobMatcher:
    def __init__(self):
        self.skill_vectorizer = TfidfVectorizer(stop_words='english')
        self.text_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.skill_weights = {
            'required': 1.0,
            'preferred': 0.7,
            'nice_to_have': 0.3
        }
    
    def calculate_match_score(
        self,
        candidate: Dict,
        job: Dict
    ) -> Dict[str, float]:
        """Calculate comprehensive match score between candidate and job."""
        
        # Skill matching (40% weight)
        skill_score = self._calculate_skill_match(
            candidate['skills'], 
            job['requirements']['skills']
        )
        
        # Experience matching (30% weight)
        experience_score = self._calculate_experience_match(
            candidate['experience'], 
            job['requirements']['experience']
        )
        
        # Education matching (15% weight)
        education_score = self._calculate_education_match(
            candidate['education'], 
            job['requirements']['education']
        )
        
        # Location matching (10% weight)
        location_score = self._calculate_location_match(
            candidate['location'], 
            job['location']
        )
        
        # Text similarity (5% weight)
        text_score = self._calculate_text_similarity(
            candidate['summary'], 
            job['description']
        )
        
        # Calculate weighted overall score
        overall_score = (
            skill_score * 0.40 +
            experience_score * 0.30 +
            education_score * 0.15 +
            location_score * 0.10 +
            text_score * 0.05
        )
        
        return {
            'overall_score': min(overall_score, 100),
            'skill_score': skill_score,
            'experience_score': experience_score,
            'education_score': education_score,
            'location_score': location_score,
            'text_score': text_score,
            'recommendation': self._get_recommendation(overall_score)
        }
    
    def _calculate_skill_match(
        self, 
        candidate_skills: List[Dict], 
        job_skills: List[Dict]
    ) -> float:
        """Calculate skill matching score."""
        if not job_skills:
            return 80.0  # Default score if no specific skills required
        
        total_weight = 0
        matched_weight = 0
        
        for job_skill in job_skills:
            skill_name = job_skill['name'].lower()
            requirement_level = job_skill.get('level', 'intermediate')
            importance = job_skill.get('importance', 'required')
            
            weight = self.skill_weights.get(importance, 0.5)
            total_weight += weight
            
            # Find matching candidate skill
            candidate_skill = next(
                (cs for cs in candidate_skills 
                 if cs['name'].lower() == skill_name), 
                None
            )
            
            if candidate_skill:
                # Calculate level match
                level_match = self._calculate_skill_level_match(
                    candidate_skill.get('level', 'beginner'),
                    requirement_level
                )
                matched_weight += weight * level_match
        
        return (matched_weight / total_weight * 100) if total_weight > 0 else 0
    
    def _calculate_skill_level_match(
        self, 
        candidate_level: str, 
        required_level: str
    ) -> float:
        """Calculate how well candidate skill level matches requirement."""
        level_hierarchy = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        }
        
        candidate_value = level_hierarchy.get(candidate_level.lower(), 1)
        required_value = level_hierarchy.get(required_level.lower(), 2)
        
        if candidate_value >= required_value:
            return 1.0
        elif candidate_value == required_value - 1:
            return 0.7
        else:
            return 0.3
    
    def _calculate_experience_match(
        self, 
        candidate_exp: List[Dict], 
        job_requirements: Dict
    ) -> float:
        """Calculate experience matching score."""
        required_years = job_requirements.get('min_years', 0)
        required_roles = job_requirements.get('roles', [])
        
        # Calculate total years of experience
        total_years = sum(exp.get('duration_years', 0) for exp in candidate_exp)
        
        # Years score (0-100)
        years_score = min(total_years / max(required_years, 1) * 100, 100)
        
        # Role relevance score
        role_score = 0
        if required_roles:
            relevant_years = 0
            for exp in candidate_exp:
                exp_title = exp.get('title', '').lower()
                if any(role.lower() in exp_title for role in required_roles):
                    relevant_years += exp.get('duration_years', 0)
            
            role_score = min(relevant_years / max(required_years, 1) * 100, 100)
        else:
            role_score = years_score
        
        return (years_score * 0.4 + role_score * 0.6)
    
    def _calculate_location_match(
        self, 
        candidate_location: Dict, 
        job_location: Dict
    ) -> float:
        """Calculate location compatibility score."""
        # Remote work handling
        if job_location.get('remote', False):
            return 100.0
        
        if candidate_location.get('willing_to_relocate', False):
            return 90.0
        
        # Same city
        if (candidate_location.get('city', '').lower() == 
            job_location.get('city', '').lower()):
            return 100.0
        
        # Same state/region
        if (candidate_location.get('state', '').lower() == 
            job_location.get('state', '').lower()):
            return 75.0
        
        # Same country
        if (candidate_location.get('country', '').lower() == 
            job_location.get('country', '').lower()):
            return 50.0
        
        return 20.0
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on overall score."""
        if score >= 85:
            return "Strong Match - Recommend Interview"
        elif score >= 70:
            return "Good Match - Consider for Interview"
        elif score >= 55:
            return "Potential Match - Review Carefully"
        else:
            return "Poor Match - Consider Other Candidates"

# Usage Example
def main():
    matcher = JobMatcher()
    
    # Sample candidate
    candidate = {
        'id': 'candidate_123',
        'name': 'John Doe',
        'skills': [
            {'name': 'Python', 'level': 'advanced', 'years': 5},
            {'name': 'JavaScript', 'level': 'intermediate', 'years': 3},
            {'name': 'React', 'level': 'advanced', 'years': 4},
            {'name': 'SQL', 'level': 'intermediate', 'years': 3}
        ],
        'experience': [
            {
                'title': 'Senior Software Engineer',
                'company': 'Tech Corp',
                'duration_years': 3,
                'description': 'Developed web applications using React and Python'
            },
            {
                'title': 'Software Engineer',
                'company': 'StartupXYZ',
                'duration_years': 2,
                'description': 'Full-stack development with modern technologies'
            }
        ],
        'education': [
            {
                'degree': 'Bachelor',
                'field': 'Computer Science',
                'institution': 'State University'
            }
        ],
        'location': {
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'USA',
            'willing_to_relocate': False
        },
        'summary': 'Experienced software engineer with expertise in web development'
    }
    
    # Sample job
    job = {
        'id': 'job_456',
        'title': 'Senior Full Stack Developer',
        'company': 'Innovation Labs',
        'description': 'Looking for experienced developer to build scalable web applications',
        'requirements': {
            'skills': [
                {'name': 'Python', 'level': 'advanced', 'importance': 'required'},
                {'name': 'React', 'level': 'intermediate', 'importance': 'required'},
                {'name': 'JavaScript', 'level': 'intermediate', 'importance': 'required'},
                {'name': 'Docker', 'level': 'intermediate', 'importance': 'preferred'}
            ],
            'experience': {
                'min_years': 4,
                'roles': ['Software Engineer', 'Full Stack Developer']
            },
            'education': {
                'min_level': 'Bachelor',
                'fields': ['Computer Science', 'Engineering']
            }
        },
        'location': {
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'USA',
            'remote': False
        }
    }
    
    # Calculate match
    match_result = matcher.calculate_match_score(candidate, job)
    
    print(f"Match Results:")
    print(f"Overall Score: {match_result['overall_score']:.1f}%")
    print(f"Skill Match: {match_result['skill_score']:.1f}%")
    print(f"Experience Match: {match_result['experience_score']:.1f}%")
    print(f"Education Match: {match_result['education_score']:.1f}%")
    print(f"Location Match: {match_result['location_score']:.1f}%")
    print(f"Recommendation: {match_result['recommendation']}")

if __name__ == "__main__":
    main()
```

## Resume Analysis Agent

### Resume Parser and Analyzer
```python
# resume_analyzer.py
import re
import spacy
from typing import Dict, List, Optional
import dateutil.parser as date_parser
from datetime import datetime
import json

class ResumeAnalyzer:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.skill_keywords = self._load_skill_keywords()
        self.education_keywords = self._load_education_keywords()
    
    def analyze_resume(self, resume_text: str) -> Dict:
        """Comprehensive resume analysis."""
        doc = self.nlp(resume_text)
        
        analysis = {
            'personal_info': self._extract_personal_info(resume_text, doc),
            'work_experience': self._extract_work_experience(resume_text, doc),
            'education': self._extract_education(resume_text, doc),
            'skills': self._extract_skills(resume_text, doc),
            'achievements': self._extract_achievements(resume_text, doc),
            'quality_score': self._calculate_quality_score(resume_text),
            'suggestions': self._generate_suggestions(resume_text),
            'ats_score': self._calculate_ats_score(resume_text)
        }
        
        return analysis
    
    def _extract_personal_info(self, text: str, doc) -> Dict:
        """Extract personal information from resume."""
        info = {}
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        info['email'] = emails[0] if emails else None
        
        # Extract phone number
        phone_pattern = r'[\+]?[1-9]?[\d\s\-\(\)]{10,}'
        phones = re.findall(phone_pattern, text)
        info['phone'] = phones[0] if phones else None
        
        # Extract name (first person mentioned or from email)
        persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
        info['name'] = persons[0] if persons else None
        
        # Extract LinkedIn URL
        linkedin_pattern = r'linkedin\.com/in/[\w\-]+'
        linkedin = re.search(linkedin_pattern, text)
        info['linkedin'] = linkedin.group(0) if linkedin else None
        
        # Extract location
        locations = [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]]
        info['location'] = locations[0] if locations else None
        
        return info
    
    def _extract_work_experience(self, text: str, doc) -> List[Dict]:
        """Extract work experience with improved accuracy."""
        experiences = []
        
        # Split text into sections
        sections = self._split_into_sections(text)
        experience_section = self._find_experience_section(sections)
        
        if not experience_section:
            return experiences
        
        # Extract individual jobs
        job_entries = self._split_experience_entries(experience_section)
        
        for entry in job_entries:
            experience = self._parse_job_entry(entry)
            if experience:
                experiences.append(experience)
        
        return experiences
    
    def _parse_job_entry(self, entry: str) -> Optional[Dict]:
        """Parse individual job entry."""
        lines = [line.strip() for line in entry.split('\n') if line.strip()]
        if len(lines) < 2:
            return None
        
        experience = {}
        
        # First line usually contains title and company
        first_line = lines[0]
        title_company = self._extract_title_company(first_line)
        experience.update(title_company)
        
        # Look for dates in first few lines
        dates = self._extract_employment_dates(entry)
        experience.update(dates)
        
        # Remaining lines are description
        description_lines = lines[1:]
        if dates.get('date_line_index'):
            description_lines = lines[dates['date_line_index'] + 1:]
        
        experience['description'] = '\n'.join(description_lines)
        experience['achievements'] = self._extract_job_achievements(description_lines)
        
        return experience
    
    def _extract_skills(self, text: str, doc) -> Dict:
        """Extract technical and soft skills."""
        skills = {
            'technical': [],
            'soft': [],
            'tools': [],
            'languages': []
        }
        
        text_lower = text.lower()
        
        # Technical skills
        for skill in self.skill_keywords['technical']:
            if skill.lower() in text_lower:
                skills['technical'].append(skill)
        
        # Programming languages
        for lang in self.skill_keywords['languages']:
            if lang.lower() in text_lower:
                skills['languages'].append(lang)
        
        # Tools and frameworks
        for tool in self.skill_keywords['tools']:
            if tool.lower() in text_lower:
                skills['tools'].append(tool)
        
        # Soft skills
        for skill in self.skill_keywords['soft']:
            if skill.lower() in text_lower:
                skills['soft'].append(skill)
        
        return skills
    
    def _calculate_quality_score(self, text: str) -> Dict:
        """Calculate resume quality score."""
        scores = {}
        
        # Length score (1-2 pages ideal)
        word_count = len(text.split())
        if 300 <= word_count <= 800:
            scores['length'] = 10
        elif 200 <= word_count < 300 or 800 < word_count <= 1000:
            scores['length'] = 8
        else:
            scores['length'] = 5
        
        # Quantified achievements
        number_pattern = r'\d+\.?\d*\s*(%|percent|dollar|\$|million|thousand|k\b)'
        quantified_achievements = len(re.findall(number_pattern, text, re.IGNORECASE))
        scores['quantified_achievements'] = min(quantified_achievements * 2, 10)
        
        # Action verbs
        action_verbs = [
            'achieved', 'built', 'created', 'developed', 'improved', 'led',
            'managed', 'optimized', 'reduced', 'increased', 'implemented'
        ]
        action_verb_count = sum(1 for verb in action_verbs if verb in text.lower())
        scores['action_verbs'] = min(action_verb_count, 10)
        
        # Contact information completeness
        contact_score = 0
        if '@' in text:  # Email
            contact_score += 3
        if re.search(r'\d{3}[\-\.\s]\d{3}[\-\.\s]\d{4}', text):  # Phone
            contact_score += 3
        if 'linkedin' in text.lower():  # LinkedIn
            contact_score += 2
        if any(word in text.lower() for word in ['address', 'location', 'city']):  # Location
            contact_score += 2
        scores['contact_info'] = contact_score
        
        # Overall score
        scores['overall'] = (
            scores['length'] * 0.2 +
            scores['quantified_achievements'] * 0.3 +
            scores['action_verbs'] * 0.3 +
            scores['contact_info'] * 0.2
        )
        
        return scores
    
    def _generate_suggestions(self, text: str) -> List[str]:
        """Generate improvement suggestions."""
        suggestions = []
        
        # Check for quantified achievements
        number_pattern = r'\d+\.?\d*\s*(%|percent|dollar|\$|million|thousand|k\b)'
        if len(re.findall(number_pattern, text, re.IGNORECASE)) < 3:
            suggestions.append("Add more quantified achievements (numbers, percentages, dollar amounts)")
        
        # Check for action verbs
        action_verbs = ['achieved', 'built', 'created', 'developed', 'improved']
        if not any(verb in text.lower() for verb in action_verbs):
            suggestions.append("Start bullet points with strong action verbs")
        
        # Check length
        word_count = len(text.split())
        if word_count < 300:
            suggestions.append("Resume appears too short - add more detail about your experience")
        elif word_count > 1000:
            suggestions.append("Resume appears too long - consider condensing to 1-2 pages")
        
        # Check for contact info
        if '@' not in text:
            suggestions.append("Add a professional email address")
        
        if not re.search(r'\d{3}[\-\.\s]\d{3}[\-\.\s]\d{4}', text):
            suggestions.append("Add a phone number")
        
        return suggestions
    
    def _load_skill_keywords(self) -> Dict[str, List[str]]:
        """Load skill keywords database."""
        return {
            'technical': [
                'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js',
                'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
                'Machine Learning', 'Data Science', 'Artificial Intelligence'
            ],
            'languages': [
                'Python', 'JavaScript', 'Java', 'C++', 'C#', 'Ruby', 'Go',
                'PHP', 'Swift', 'Kotlin', 'TypeScript', 'R', 'Scala'
            ],
            'tools': [
                'Git', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Azure',
                'Google Cloud', 'Terraform', 'Ansible', 'MongoDB', 'PostgreSQL'
            ],
            'soft': [
                'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
                'Project Management', 'Time Management', 'Adaptability'
            ]
        }

# Usage Example
def main():
    analyzer = ResumeAnalyzer()
    
    sample_resume = """
    John Doe
    john.doe@email.com | (555) 123-4567 | San Francisco, CA
    linkedin.com/in/johndoe
    
    EXPERIENCE
    
    Senior Software Engineer | Tech Corp | 2020 - Present
    • Developed and maintained web applications using React and Python
    • Improved system performance by 40% through code optimization
    • Led a team of 5 developers on critical projects
    • Reduced deployment time by 60% by implementing CI/CD pipelines
    
    Software Engineer | StartupXYZ | 2018 - 2020
    • Built scalable backend services using Node.js and MongoDB
    • Increased user engagement by 25% through feature development
    • Collaborated with cross-functional teams on product roadmap
    
    EDUCATION
    Bachelor of Science in Computer Science | State University | 2018
    
    SKILLS
    Technical: Python, JavaScript, React, Node.js, SQL, AWS, Docker
    """
    
    analysis = analyzer.analyze_resume(sample_resume)
    
    print("Resume Analysis Results:")
    print(f"Personal Info: {json.dumps(analysis['personal_info'], indent=2)}")
    print(f"Quality Score: {analysis['quality_score']['overall']:.1f}/10")
    print(f"Suggestions: {analysis['suggestions']}")

if __name__ == "__main__":
    main()
```

## Voice Assistant Integration

### Speech Processing Agent
```python
# voice_assistant.py
import asyncio
import json
from typing import Dict, List, Optional
import speech_recognition as sr
import pyttsx3
from openai import OpenAI
import webrtcvad
import pyaudio
import wave

class VoiceAssistant:
    def __init__(self, api_key: str):
        self.openai_client = OpenAI(api_key=api_key)
        self.recognizer = sr.Recognizer()
        self.tts_engine = pyttsx3.init()
        self.vad = webrtcvad.Vad(2)  # Voice activity detection
        self.is_listening = False
        
        # Configure TTS
        self.tts_engine.setProperty('rate', 150)
        self.tts_engine.setProperty('volume', 0.9)
    
    async def process_voice_command(self, audio_data: bytes) -> Dict:
        """Process voice input and return response."""
        try:
            # Convert audio to text
            text = await self._speech_to_text(audio_data)
            
            if not text:
                return {
                    'success': False,
                    'error': 'Could not understand audio'
                }
            
            # Process with NLU
            intent_data = await self._analyze_intent(text)
            
            # Generate response
            response = await self._generate_response(intent_data)
            
            # Convert response to speech
            audio_response = await self._text_to_speech(response['message'])
            
            return {
                'success': True,
                'transcription': text,
                'intent': intent_data,
                'response': response,
                'audio_response': audio_response
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _speech_to_text(self, audio_data: bytes) -> Optional[str]:
        """Convert speech to text using Whisper."""
        try:
            # Save audio data temporarily
            with open('temp_audio.wav', 'wb') as f:
                f.write(audio_data)
            
            # Use OpenAI Whisper for transcription
            with open('temp_audio.wav', 'rb') as audio_file:
                transcript = self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="en"
                )
            
            return transcript.text
            
        except Exception as e:
            print(f"Speech to text error: {e}")
            return None
    
    async def _analyze_intent(self, text: str) -> Dict:
        """Analyze intent from transcribed text."""
        system_prompt = """
        You are a job platform assistant. Analyze the user's request and extract:
        1. Intent (job_search, application_status, profile_update, etc.)
        2. Entities (job titles, locations, skills, etc.)
        3. Confidence score
        
        Return JSON format with intent, entities, and confidence.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            return {
                'intent': 'general_inquiry',
                'entities': [],
                'confidence': 0.5,
                'error': str(e)
            }
    
    async def _generate_response(self, intent_data: Dict) -> Dict:
        """Generate appropriate response based on intent."""
        intent = intent_data.get('intent', 'general_inquiry')
        entities = intent_data.get('entities', [])
        
        if intent == 'job_search':
            return await self._handle_job_search(entities)
        elif intent == 'application_status':
            return await self._handle_application_status(entities)
        elif intent == 'profile_update':
            return await self._handle_profile_update(entities)
        else:
            return {
                'message': "I can help you search for jobs, check application status, or update your profile. What would you like to do?",
                'type': 'clarification'
            }
    
    async def _handle_job_search(self, entities: List[Dict]) -> Dict:
        """Handle job search intent."""
        job_title = None
        location = None
        
        for entity in entities:
            if entity.get('type') == 'job_title':
                job_title = entity.get('value')
            elif entity.get('type') == 'location':
                location = entity.get('value')
        
        if not job_title:
            return {
                'message': "What type of job are you looking for?",
                'type': 'clarification',
                'expected_input': 'job_title'
            }
        
        # Simulate job search (in production, call actual job search API)
        message = f"I found several {job_title} positions"
        if location:
            message += f" in {location}"
        message += ". Would you like me to read the top matches or send them to your app?"
        
        return {
            'message': message,
            'type': 'job_results',
            'data': {
                'job_title': job_title,
                'location': location,
                'count': 5
            }
        }
    
    async def _text_to_speech(self, text: str) -> bytes:
        """Convert text to speech audio."""
        try:
            # Use OpenAI TTS
            response = self.openai_client.audio.speech.create(
                model="tts-1",
                voice="nova",
                input=text
            )
            
            return response.content
            
        except Exception as e:
            print(f"Text to speech error: {e}")
            # Fallback to local TTS
            return self._local_text_to_speech(text)
    
    def _local_text_to_speech(self, text: str) -> bytes:
        """Fallback local text to speech."""
        self.tts_engine.save_to_file(text, 'temp_speech.wav')
        self.tts_engine.runAndWait()
        
        with open('temp_speech.wav', 'rb') as f:
            return f.read()

# WebSocket handler for real-time voice interaction
class VoiceWebSocketHandler:
    def __init__(self, voice_assistant: VoiceAssistant):
        self.voice_assistant = voice_assistant
        self.audio_buffer = bytearray()
        
    async def handle_audio_chunk(self, websocket, chunk: bytes):
        """Handle incoming audio chunk."""
        self.audio_buffer.extend(chunk)
        
        # Process when we have enough audio (e.g., 3 seconds)
        if len(self.audio_buffer) > 48000 * 3:  # 3 seconds at 16kHz
            result = await self.voice_assistant.process_voice_command(
                bytes(self.audio_buffer)
            )
            
            # Send response back to client
            await websocket.send(json.dumps(result))
            
            # Clear buffer
            self.audio_buffer.clear()

# Usage example
async def main():
    voice_assistant = VoiceAssistant(api_key="your-openai-api-key")
    
    # Simulate processing voice command
    with open('sample_audio.wav', 'rb') as f:
        audio_data = f.read()
    
    result = await voice_assistant.process_voice_command(audio_data)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
```

## Multi-Language Support Agent

### Translation and Localization
```python
# multilingual_agent.py
from typing import Dict, List, Optional
import openai
from googletrans import Translator
import json

class MultilingualAgent:
    def __init__(self, openai_api_key: str):
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        self.translator = Translator()
        
        self.supported_languages = {
            'en': 'English',
            'es': 'Spanish',
            'pt': 'Portuguese',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'ja': 'Japanese',
            'zh': 'Chinese',
            'ko': 'Korean',
            'ar': 'Arabic'
        }
        
        self.job_terminology = self._load_job_terminology()
    
    async def translate_job_posting(
        self, 
        job_posting: Dict, 
        target_language: str
    ) -> Dict:
        """Translate job posting to target language."""
        translated_posting = job_posting.copy()
        
        # Translate main fields
        fields_to_translate = ['title', 'description', 'requirements']
        
        for field in fields_to_translate:
            if field in job_posting:
                translated_posting[field] = await self._translate_with_context(
                    job_posting[field],
                    target_language,
                    context='job_posting'
                )
        
        # Translate nested requirements
        if 'requirements' in job_posting and isinstance(job_posting['requirements'], dict):
            for req_key, req_value in job_posting['requirements'].items():
                if isinstance(req_value, str):
                    translated_posting['requirements'][req_key] = await self._translate_with_context(
                        req_value,
                        target_language,
                        context='job_requirements'
                    )
        
        return translated_posting
    
    async def _translate_with_context(
        self, 
        text: str, 
        target_language: str, 
        context: str = 'general'
    ) -> str:
        """Translate text with professional context."""
        
        # Use specialized terminology
        terminology_prompt = self._get_terminology_prompt(context, target_language)
        
        system_prompt = f"""
        You are a professional translator specializing in job and career content.
        Translate the following text to {self.supported_languages.get(target_language, target_language)}.
        
        Context: {context}
        
        Requirements:
        1. Maintain professional tone
        2. Use appropriate industry terminology
        3. Preserve formatting and structure
        4. Ensure cultural appropriateness
        5. Keep technical terms accurate
        
        {terminology_prompt}
        
        Return only the translated text.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.2
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            # Fallback to Google Translate
            return self._fallback_translation(text, target_language)
    
    def _get_terminology_prompt(self, context: str, target_language: str) -> str:
        """Get context-specific terminology guidance."""
        if context == 'job_posting' and target_language in self.job_terminology:
            terms = self.job_terminology[target_language]
            return f"Use these preferred translations: {json.dumps(terms, indent=2)}"
        return ""
    
    def _fallback_translation(self, text: str, target_language: str) -> str:
        """Fallback translation using Google Translate."""
        try:
            result = self.translator.translate(text, dest=target_language)
            return result.text
        except Exception:
            return text  # Return original if translation fails
    
    async def localize_currency_and_dates(
        self, 
        content: Dict, 
        target_language: str,
        target_country: str
    ) -> Dict:
        """Localize currency, dates, and cultural references."""
        localized_content = content.copy()
        
        # Currency conversion and formatting
        if 'salary' in content:
            localized_content['salary'] = await self._localize_salary(
                content['salary'],
                target_country
            )
        
        # Date formatting
        if 'dates' in content:
            localized_content['dates'] = self._localize_dates(
                content['dates'],
                target_language
            )
        
        return localized_content
    
    def _load_job_terminology(self) -> Dict[str, Dict[str, str]]:
        """Load job-specific terminology for each language."""
        return {
            'es': {
                'Software Engineer': 'Ingeniero de Software',
                'Data Scientist': 'Científico de Datos',
                'Product Manager': 'Gerente de Producto',
                'Full-time': 'Tiempo Completo',
                'Remote': 'Remoto',
                'Experience': 'Experiencia',
                'Requirements': 'Requisitos',
                'Benefits': 'Beneficios'
            },
            'pt': {
                'Software Engineer': 'Engenheiro de Software',
                'Data Scientist': 'Cientista de Dados',
                'Product Manager': 'Gerente de Produto',
                'Full-time': 'Tempo Integral',
                'Remote': 'Remoto',
                'Experience': 'Experiência',
                'Requirements': 'Requisitos',
                'Benefits': 'Benefícios'
            },
            'fr': {
                'Software Engineer': 'Ingénieur Logiciel',
                'Data Scientist': 'Data Scientist',
                'Product Manager': 'Chef de Produit',
                'Full-time': 'Temps Plein',
                'Remote': 'Télétravail',
                'Experience': 'Expérience',
                'Requirements': 'Exigences',
                'Benefits': 'Avantages'
            }
        }

# Usage Example
async def main():
    agent = MultilingualAgent(openai_api_key="your-api-key")
    
    job_posting = {
        'title': 'Senior Software Engineer',
        'description': 'We are looking for an experienced software engineer to join our team...',
        'requirements': {
            'experience': '5+ years of software development experience',
            'skills': 'Python, JavaScript, React, SQL',
            'education': 'Bachelor\'s degree in Computer Science or related field'
        },
        'salary': {
            'min': 100000,
            'max': 150000,
            'currency': 'USD'
        }
    }
    
    # Translate to Spanish
    spanish_posting = await agent.translate_job_posting(job_posting, 'es')
    print("Spanish Translation:")
    print(json.dumps(spanish_posting, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

These sample agent implementations provide a foundation for building sophisticated AI-powered features in the iWORKZ platform. Each agent can be extended and customized based on specific requirements and use cases.
