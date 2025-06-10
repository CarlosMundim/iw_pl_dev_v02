#!/usr/bin/env python3

"""
iWORKZ Platform Demo Data Generator
==================================

Generates realistic demo data for stakeholder presentations.
Creates users, jobs, applications, and interactions to showcase platform capabilities.
"""

import json
import random
import requests
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List
from faker import Faker
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DemoDataGenerator:
    """Generates comprehensive demo data for the platform"""
    
    def __init__(self):
        self.fake = Faker()
        self.base_url = "http://localhost:3001"
        self.session = requests.Session()
        self.session.timeout = 30
        
        # Generated data storage
        self.generated_users = []
        self.generated_companies = []
        self.generated_jobs = []
        self.generated_applications = []
        
        # Demo data templates
        self.skill_categories = {
            'programming': ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'C#', 'PHP', 'Ruby'],
            'frontend': ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind CSS'],
            'backend': ['Node.js', 'Django', 'Flask', 'Express.js', 'Spring Boot', 'ASP.NET', 'Ruby on Rails'],
            'database': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle', 'SQL Server'],
            'cloud': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
            'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
            'data_science': ['Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn'],
            'design': ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI/UX Design']
        }
        
        self.job_titles = [
            "Senior Software Engineer", "Full Stack Developer", "Data Scientist", "DevOps Engineer",
            "Product Manager", "UX Designer", "Machine Learning Engineer", "Backend Developer",
            "Frontend Developer", "Mobile Developer", "Cloud Architect", "Security Engineer",
            "QA Engineer", "Technical Lead", "Engineering Manager", "Platform Engineer",
            "Site Reliability Engineer", "Data Engineer", "Business Analyst", "Scrum Master"
        ]
        
        self.company_types = [
            "Technology Startup", "Enterprise Software", "E-commerce", "Fintech", "Healthcare Tech",
            "EdTech", "Gaming", "SaaS", "AI/ML Company", "Consulting", "Financial Services",
            "Media & Entertainment", "Automotive", "Aerospace", "Telecommunications"
        ]
        
        self.locations = [
            "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
            "Los Angeles, CA", "Chicago, IL", "Denver, CO", "Atlanta, GA", "Remote",
            "London, UK", "Toronto, Canada", "Berlin, Germany", "Amsterdam, Netherlands",
            "Singapore", "Sydney, Australia", "Tokyo, Japan", "Tel Aviv, Israel"
        ]

    def generate_company_data(self, count: int = 50) -> List[Dict]:
        """Generate realistic company data"""
        logger.info(f"Generating {count} companies...")
        
        companies = []
        
        for i in range(count):
            company = {
                'id': str(uuid.uuid4()),
                'name': self.fake.company(),
                'description': self.fake.text(max_nb_chars=500),
                'industry': random.choice(self.company_types),
                'size': random.choice(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
                'location': random.choice(self.locations),
                'website': f"https://www.{self.fake.domain_name()}",
                'founded': random.randint(1995, 2023),
                'logo_url': f"https://api.dicebear.com/7.x/initials/svg?seed={i}&backgroundColor=random",
                'benefits': random.sample([
                    'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401k Matching',
                    'Flexible PTO', 'Remote Work', 'Stock Options', 'Learning Budget',
                    'Gym Membership', 'Free Meals', 'Wellness Programs', 'Parental Leave'
                ], k=random.randint(4, 8)),
                'tech_stack': self._generate_tech_stack(),
                'culture': random.sample([
                    'Innovation-focused', 'Collaborative', 'Fast-paced', 'Data-driven',
                    'Customer-centric', 'Inclusive', 'Learning-oriented', 'Agile'
                ], k=random.randint(2, 4))
            }
            companies.append(company)
        
        self.generated_companies = companies
        return companies

    def generate_user_data(self, count: int = 200) -> List[Dict]:
        """Generate realistic user/candidate data"""
        logger.info(f"Generating {count} users...")
        
        users = []
        
        for i in range(count):
            first_name = self.fake.first_name()
            last_name = self.fake.last_name()
            
            # Generate experience level
            experience_years = random.randint(0, 15)
            experience_level = 'Entry' if experience_years < 2 else 'Mid' if experience_years < 5 else 'Senior'
            
            user = {
                'id': str(uuid.uuid4()),
                'email': f"{first_name.lower()}.{last_name.lower()}@{self.fake.free_email_domain()}",
                'firstName': first_name,
                'lastName': last_name,
                'phone': self.fake.phone_number(),
                'location': random.choice(self.locations),
                'title': random.choice(self.job_titles),
                'experience_years': experience_years,
                'experience_level': experience_level,
                'skills': self._generate_user_skills(),
                'education': self._generate_education(),
                'salary_expectation': self._generate_salary(experience_years),
                'availability': random.choice(['Immediately', '2 weeks', '1 month', '2 months']),
                'work_preference': random.choice(['Remote', 'Hybrid', 'On-site', 'Flexible']),
                'bio': self.fake.text(max_nb_chars=300),
                'linkedin_url': f"https://linkedin.com/in/{first_name.lower()}-{last_name.lower()}-{random.randint(100, 999)}",
                'github_url': f"https://github.com/{first_name.lower()}{last_name.lower()}{random.randint(10, 99)}",
                'portfolio_url': f"https://{first_name.lower()}{last_name.lower()}.dev" if random.random() > 0.7 else None,
                'created_at': self.fake.date_time_between(start_date='-2y', end_date='now').isoformat(),
                'profile_picture': f"https://api.dicebear.com/7.x/avataaars/svg?seed={first_name}{last_name}&backgroundColor=random"
            }
            users.append(user)
        
        self.generated_users = users
        return users

    def generate_job_data(self, count: int = 100) -> List[Dict]:
        """Generate realistic job posting data"""
        logger.info(f"Generating {count} jobs...")
        
        if not self.generated_companies:
            self.generate_company_data()
        
        jobs = []
        
        for i in range(count):
            company = random.choice(self.generated_companies)
            title = random.choice(self.job_titles)
            
            # Generate experience requirement
            exp_required = random.randint(0, 10)
            seniority = 'Entry Level' if exp_required < 2 else 'Mid Level' if exp_required < 5 else 'Senior Level'
            
            job = {
                'id': str(uuid.uuid4()),
                'title': title,
                'company_id': company['id'],
                'company_name': company['name'],
                'description': self._generate_job_description(title),
                'requirements': self._generate_job_requirements(title),
                'nice_to_have': self._generate_nice_to_have(),
                'responsibilities': self._generate_responsibilities(title),
                'location': random.choice(self.locations),
                'remote_ok': random.choice([True, False, True]),  # Bias toward remote-friendly
                'job_type': random.choice(['full-time', 'part-time', 'contract', 'internship']),
                'seniority_level': seniority,
                'experience_required': exp_required,
                'salary_min': self._generate_salary_range(exp_required)[0],
                'salary_max': self._generate_salary_range(exp_required)[1],
                'equity': random.choice([True, False]),
                'benefits': company['benefits'][:random.randint(3, 6)],
                'tech_stack': company['tech_stack'][:random.randint(3, 8)],
                'team_size': random.randint(2, 20),
                'department': random.choice(['Engineering', 'Product', 'Data', 'Design', 'DevOps', 'Security']),
                'posted_date': self.fake.date_time_between(start_date='-3m', end_date='now').isoformat(),
                'application_deadline': (datetime.now() + timedelta(days=random.randint(7, 60))).isoformat(),
                'status': random.choice(['active', 'active', 'active', 'paused', 'filled']),  # Bias toward active
                'urgency': random.choice(['low', 'medium', 'high']),
                'views': random.randint(50, 1000),
                'applications_count': random.randint(5, 100),
                'interview_process': [
                    'Application Review',
                    'Phone/Video Screen',
                    'Technical Assessment',
                    'Team Interview',
                    'Final Round'
                ][:random.randint(3, 5)]
            }
            jobs.append(job)
        
        self.generated_jobs = jobs
        return jobs

    def generate_application_data(self, count: int = 500) -> List[Dict]:
        """Generate realistic job application data"""
        logger.info(f"Generating {count} applications...")
        
        if not self.generated_users:
            self.generate_user_data()
        if not self.generated_jobs:
            self.generate_job_data()
        
        applications = []
        
        for i in range(count):
            user = random.choice(self.generated_users)
            job = random.choice(self.generated_jobs)
            
            # Calculate match score (simulate AI matching)
            match_score = self._calculate_demo_match_score(user, job)
            
            application = {
                'id': str(uuid.uuid4()),
                'user_id': user['id'],
                'job_id': job['id'],
                'candidate_name': f"{user['firstName']} {user['lastName']}",
                'job_title': job['title'],
                'company_name': job['company_name'],
                'applied_date': self.fake.date_time_between(start_date='-2m', end_date='now').isoformat(),
                'status': random.choice([
                    'applied', 'under_review', 'phone_screen', 'technical_interview',
                    'final_interview', 'offer_extended', 'hired', 'rejected', 'withdrawn'
                ]),
                'match_score': match_score,
                'cover_letter': self._generate_cover_letter(user, job),
                'resume_url': f"https://demo-resumes.iworkz.com/{user['id']}.pdf",
                'interview_notes': self._generate_interview_notes() if random.random() > 0.7 else None,
                'rejection_reason': self._generate_rejection_reason() if random.random() > 0.8 else None,
                'source': random.choice(['iWORKZ Platform', 'LinkedIn', 'Company Website', 'Referral', 'Job Board']),
                'recruiter_notes': self.fake.text(max_nb_chars=200) if random.random() > 0.6 else None
            }
            applications.append(application)
        
        self.generated_applications = applications
        return applications

    def _generate_tech_stack(self) -> List[str]:
        """Generate a realistic tech stack for a company"""
        stack = []
        
        # Add programming languages
        stack.extend(random.sample(self.skill_categories['programming'], k=random.randint(2, 4)))
        
        # Add frontend/backend based on company type
        if random.random() > 0.3:  # Most companies need frontend
            stack.extend(random.sample(self.skill_categories['frontend'], k=random.randint(1, 3)))
        
        stack.extend(random.sample(self.skill_categories['backend'], k=random.randint(1, 2)))
        stack.extend(random.sample(self.skill_categories['database'], k=random.randint(1, 3)))
        stack.extend(random.sample(self.skill_categories['cloud'], k=random.randint(1, 4)))
        
        return list(set(stack))  # Remove duplicates

    def _generate_user_skills(self) -> List[str]:
        """Generate realistic skills for a user"""
        skills = []
        
        # Primary skill category based on job title preferences
        primary_categories = random.choices(
            list(self.skill_categories.keys()),
            weights=[3, 2, 2, 1, 2, 1, 1, 1],  # Bias toward programming, frontend, backend
            k=random.randint(2, 4)
        )
        
        for category in primary_categories:
            skills.extend(random.sample(
                self.skill_categories[category], 
                k=random.randint(1, min(3, len(self.skill_categories[category])))
            ))
        
        return list(set(skills))[:random.randint(5, 12)]  # Limit total skills

    def _generate_education(self) -> List[Dict]:
        """Generate education history"""
        education = []
        
        # Primary degree
        degrees = ['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Arts', 'PhD']
        fields = [
            'Computer Science', 'Software Engineering', 'Information Technology',
            'Electrical Engineering', 'Mathematics', 'Physics', 'Business Administration',
            'Data Science', 'Cybersecurity', 'Information Systems'
        ]
        
        primary_degree = {
            'degree': random.choice(degrees),
            'field': random.choice(fields),
            'school': self.fake.company() + ' University',
            'graduation_year': random.randint(2010, 2023),
            'gpa': round(random.uniform(3.0, 4.0), 2) if random.random() > 0.5 else None
        }
        education.append(primary_degree)
        
        # Additional certifications
        if random.random() > 0.6:
            certifications = [
                'AWS Certified Solutions Architect', 'Google Cloud Professional',
                'Certified Kubernetes Administrator', 'PMP Certification',
                'Cisco Certified Network Professional', 'Microsoft Azure Fundamentals'
            ]
            education.append({
                'degree': 'Certification',
                'field': random.choice(certifications),
                'school': 'Professional Certification',
                'graduation_year': random.randint(2020, 2024)
            })
        
        return education

    def _generate_salary(self, experience_years: int) -> Dict:
        """Generate salary expectation based on experience"""
        base_salary = 70000 + (experience_years * 8000)
        variation = random.randint(-10000, 15000)
        
        return {
            'min': max(50000, base_salary + variation - 10000),
            'max': base_salary + variation + 20000,
            'currency': 'USD',
            'negotiable': random.choice([True, False])
        }

    def _generate_salary_range(self, experience_required: int) -> tuple:
        """Generate salary range for job posting"""
        base_salary = 80000 + (experience_required * 10000)
        variation = random.randint(-15000, 20000)
        
        min_salary = max(60000, base_salary + variation - 15000)
        max_salary = base_salary + variation + 25000
        
        return (min_salary, max_salary)

    def _generate_job_description(self, title: str) -> str:
        """Generate realistic job description"""
        templates = {
            'software_engineer': "We are seeking a talented {title} to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions that drive our business forward.",
            'data_scientist': "Join our data team as a {title} and help us unlock insights from our vast datasets. You'll work on machine learning models, statistical analysis, and data visualization.",
            'product_manager': "As a {title}, you'll drive product strategy and roadmap execution. You'll work closely with engineering, design, and business stakeholders.",
            'designer': "We're looking for a creative {title} to help shape our user experience. You'll work on user research, wireframing, prototyping, and visual design."
        }
        
        # Simple keyword matching for template selection
        template_key = 'software_engineer'  # default
        if 'data' in title.lower():
            template_key = 'data_scientist'
        elif 'product' in title.lower() or 'manager' in title.lower():
            template_key = 'product_manager'
        elif 'design' in title.lower() or 'ux' in title.lower():
            template_key = 'designer'
        
        base_description = templates[template_key].format(title=title)
        additional_text = self.fake.text(max_nb_chars=300)
        
        return f"{base_description}\n\n{additional_text}"

    def _generate_job_requirements(self, title: str) -> List[str]:
        """Generate job requirements based on title"""
        base_requirements = [
            f"{random.randint(2, 8)}+ years of experience in software development",
            "Strong problem-solving and analytical skills",
            "Excellent communication and teamwork abilities",
            "Bachelor's degree in Computer Science or related field"
        ]
        
        # Add technical requirements based on title
        if 'frontend' in title.lower() or 'ui' in title.lower():
            base_requirements.extend([
                "Experience with React, Vue.js, or Angular",
                "Proficiency in HTML, CSS, and JavaScript",
                "Knowledge of responsive design principles"
            ])
        elif 'backend' in title.lower() or 'api' in title.lower():
            base_requirements.extend([
                "Experience with RESTful API development",
                "Knowledge of database design and optimization",
                "Familiarity with cloud platforms (AWS, Azure, GCP)"
            ])
        elif 'data' in title.lower():
            base_requirements.extend([
                "Experience with Python and data science libraries",
                "Knowledge of machine learning algorithms",
                "SQL and database querying skills"
            ])
        
        return base_requirements[:random.randint(4, 7)]

    def _generate_nice_to_have(self) -> List[str]:
        """Generate nice-to-have qualifications"""
        options = [
            "Experience with microservices architecture",
            "Knowledge of DevOps practices and CI/CD",
            "Familiarity with agile development methodologies",
            "Open source contributions",
            "Experience mentoring junior developers",
            "Knowledge of security best practices",
            "Experience with automated testing",
            "Familiarity with container technologies (Docker, Kubernetes)"
        ]
        return random.sample(options, k=random.randint(2, 4))

    def _generate_responsibilities(self, title: str) -> List[str]:
        """Generate job responsibilities"""
        base_responsibilities = [
            "Collaborate with cross-functional teams to deliver high-quality solutions",
            "Participate in code reviews and maintain coding standards",
            "Contribute to technical architecture decisions",
            "Stay up-to-date with industry trends and best practices"
        ]
        
        if 'senior' in title.lower() or 'lead' in title.lower():
            base_responsibilities.extend([
                "Mentor junior team members",
                "Lead technical design discussions",
                "Drive technical strategy and roadmap planning"
            ])
        
        return base_responsibilities[:random.randint(4, 6)]

    def _calculate_demo_match_score(self, user: Dict, job: Dict) -> int:
        """Calculate a realistic match score for demo purposes"""
        score = 0
        
        # Skill matching (40% weight)
        user_skills = set(skill.lower() for skill in user['skills'])
        job_requirements = set(req.lower() for req in job.get('tech_stack', []))
        
        if job_requirements:
            skill_match = len(user_skills.intersection(job_requirements)) / len(job_requirements)
            score += skill_match * 40
        else:
            score += 20  # Default score if no tech stack specified
        
        # Experience matching (30% weight)
        exp_diff = abs(user['experience_years'] - job['experience_required'])
        if exp_diff <= 1:
            score += 30
        elif exp_diff <= 3:
            score += 20
        else:
            score += 10
        
        # Location matching (20% weight)
        if job['location'] == 'Remote' or user['work_preference'] == 'Remote':
            score += 20
        elif job['location'] == user['location']:
            score += 20
        else:
            score += 5
        
        # Random factor (10% weight) for realism
        score += random.randint(0, 10)
        
        return min(100, max(0, int(score)))

    def _generate_cover_letter(self, user: Dict, job: Dict) -> str:
        """Generate a realistic cover letter"""
        return f"""Dear Hiring Manager,

I am writing to express my interest in the {job['title']} position at {job['company_name']}. With {user['experience_years']} years of experience in software development and expertise in {', '.join(user['skills'][:3])}, I believe I would be a valuable addition to your team.

{self.fake.text(max_nb_chars=200)}

I am particularly excited about this opportunity because of your company's innovative approach and commitment to excellence. I would welcome the chance to discuss how my skills and experience can contribute to your team's success.

Thank you for your consideration.

Best regards,
{user['firstName']} {user['lastName']}"""

    def _generate_interview_notes(self) -> str:
        """Generate interview notes"""
        notes = [
            "Candidate showed strong technical skills and problem-solving abilities.",
            "Good communication skills and team fit.",
            "Impressed with candidate's experience and project portfolio.",
            "Some gaps in specific technology experience but eager to learn.",
            "Strong cultural fit with collaborative mindset."
        ]
        return random.choice(notes)

    def _generate_rejection_reason(self) -> str:
        """Generate rejection reason"""
        reasons = [
            "Position filled by another candidate",
            "Looking for more senior experience",
            "Technical skills not aligned with current needs",
            "Budget constraints",
            "Team composition considerations"
        ]
        return random.choice(reasons)

    def save_demo_data(self) -> Dict:
        """Save all generated data to files"""
        logger.info("Saving demo data to files...")
        
        data_summary = {
            'generation_timestamp': datetime.utcnow().isoformat(),
            'companies': len(self.generated_companies),
            'users': len(self.generated_users),
            'jobs': len(self.generated_jobs),
            'applications': len(self.generated_applications)
        }
        
        # Save individual data files
        files_created = []
        
        if self.generated_companies:
            company_file = '/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/demo_data_companies.json'
            with open(company_file, 'w') as f:
                json.dump(self.generated_companies, f, indent=2)
            files_created.append(company_file)
        
        if self.generated_users:
            users_file = '/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/demo_data_users.json'
            with open(users_file, 'w') as f:
                json.dump(self.generated_users, f, indent=2)
            files_created.append(users_file)
        
        if self.generated_jobs:
            jobs_file = '/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/demo_data_jobs.json'
            with open(jobs_file, 'w') as f:
                json.dump(self.generated_jobs, f, indent=2)
            files_created.append(jobs_file)
        
        if self.generated_applications:
            applications_file = '/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/demo_data_applications.json'
            with open(applications_file, 'w') as f:
                json.dump(self.generated_applications, f, indent=2)
            files_created.append(applications_file)
        
        # Save summary
        summary_file = '/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/demo_data_summary.json'
        data_summary['files_created'] = files_created
        with open(summary_file, 'w') as f:
            json.dump(data_summary, f, indent=2)
        
        logger.info(f"Demo data saved! Generated {data_summary['companies']} companies, {data_summary['users']} users, {data_summary['jobs']} jobs, {data_summary['applications']} applications")
        
        return data_summary

    def generate_all_demo_data(self) -> Dict:
        """Generate complete demo dataset"""
        logger.info("🎭 Starting Demo Data Generation for iWORKZ Platform")
        
        # Generate data in dependency order
        self.generate_company_data(50)
        self.generate_user_data(200)
        self.generate_job_data(100)
        self.generate_application_data(500)
        
        # Save to files
        summary = self.save_demo_data()
        
        logger.info("🎉 Demo data generation completed!")
        return summary

def main():
    """Main execution function"""
    generator = DemoDataGenerator()
    summary = generator.generate_all_demo_data()
    
    print("\n" + "="*60)
    print("🎭 DEMO DATA GENERATION COMPLETE")
    print("="*60)
    print(f"📊 Companies: {summary['companies']}")
    print(f"👥 Users: {summary['users']}")
    print(f"💼 Jobs: {summary['jobs']}")
    print(f"📝 Applications: {summary['applications']}")
    print(f"📄 Files created: {len(summary['files_created'])}")
    print("\nDemo data is ready for stakeholder presentations! 🚀")

if __name__ == "__main__":
    main()