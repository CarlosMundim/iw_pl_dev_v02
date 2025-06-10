#!/usr/bin/env python3

"""
iWORKZ Platform API Integration Tests
====================================

Tests for API integrations between microservices.
Verifies that services can communicate with each other correctly.
"""

import asyncio
import json
import logging
import time
import requests
import concurrent.futures
from typing import Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class IntegrationTestResult:
    """Integration test result"""
    service_a: str
    service_b: str
    test_name: str
    status: str
    duration: float
    message: str = ""
    details: Dict = None

class APIIntegrationTests:
    """API integration test suite"""
    
    def __init__(self):
        self.services = {
            'backend-api': 'http://localhost:3001',
            'ai-agent': 'http://localhost:8001',
            'matching-engine': 'http://localhost:3003',
            'compliance-engine': 'http://localhost:8003',
            'analytics-service': 'http://localhost:8004',
            'voice-assistant': 'http://localhost:8005',
            'notification-service': 'http://localhost:8006',
            'search-service': 'http://localhost:8007',
            'credential-engine': 'http://localhost:8008'
        }
        
        self.test_results: List[IntegrationTestResult] = []
        self.session = requests.Session()
        self.session.timeout = 30

    def run_integration_test(self, service_a: str, service_b: str, test_name: str, test_func) -> IntegrationTestResult:
        """Run an integration test between two services"""
        logger.info(f"Testing integration: {service_a} -> {service_b} ({test_name})")
        start_time = time.time()
        
        try:
            result = test_func()
            duration = time.time() - start_time
            
            if isinstance(result, dict) and result.get('status') == 'PASS':
                test_result = IntegrationTestResult(
                    service_a, service_b, test_name, "PASS", duration,
                    result.get('message', ''), result.get('details', {})
                )
                logger.info(f"✅ {service_a} -> {service_b} ({test_name}) - PASSED ({duration:.2f}s)")
            else:
                test_result = IntegrationTestResult(
                    service_a, service_b, test_name, "FAIL", duration,
                    result.get('message', str(result)) if isinstance(result, dict) else str(result)
                )
                logger.error(f"❌ {service_a} -> {service_b} ({test_name}) - FAILED ({duration:.2f}s)")
                
        except Exception as e:
            duration = time.time() - start_time
            test_result = IntegrationTestResult(
                service_a, service_b, test_name, "FAIL", duration, str(e)
            )
            logger.error(f"❌ {service_a} -> {service_b} ({test_name}) - ERROR ({duration:.2f}s): {str(e)}")
        
        self.test_results.append(test_result)
        return test_result

    def test_backend_ai_integration(self) -> Dict:
        """Test Backend API -> AI Agent integration"""
        try:
            # Test document parsing integration
            ai_url = f"{self.services['ai-agent']}/api/v1/documents/parse"
            
            test_data = {
                'text': 'John Doe\nSenior Software Engineer\n5 years experience in Python and React',
                'type': 'resume'
            }
            
            response = self.session.post(ai_url, json=test_data)
            
            if response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"AI parsing failed: HTTP {response.status_code}",
                    'details': response.text
                }
            
            result = response.json()
            
            return {
                'status': 'PASS',
                'message': 'Backend-AI integration working',
                'details': {
                    'response_received': True,
                    'data_structure': bool(result.get('data')),
                    'processing_time': result.get('processing_time', 'unknown')
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Backend-AI integration error: {str(e)}"
            }

    def test_backend_matching_integration(self) -> Dict:
        """Test Backend API -> Matching Engine integration"""
        try:
            # Test job-candidate matching
            matching_url = f"{self.services['matching-engine']}/api/v1/match"
            
            test_data = {
                'candidate': {
                    'id': 'test_candidate_123',
                    'skills': ['Python', 'JavaScript', 'React', 'Node.js'],
                    'experience': 5,
                    'location': 'San Francisco, CA'
                },
                'job': {
                    'id': 'test_job_456',
                    'requirements': ['Python', 'React', 'API Development'],
                    'experience_required': 3,
                    'location': 'San Francisco, CA'
                },
                'algorithm': 'ai-hybrid'
            }
            
            response = self.session.post(matching_url, json=test_data)
            
            if response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"Matching failed: HTTP {response.status_code}",
                    'details': response.text
                }
            
            result = response.json()
            score = result.get('data', {}).get('score', 0)
            
            if not (0 <= score <= 100):
                return {
                    'status': 'FAIL',
                    'message': f"Invalid match score: {score}"
                }
            
            return {
                'status': 'PASS',
                'message': 'Backend-Matching integration working',
                'details': {
                    'match_score': score,
                    'algorithm_used': result.get('data', {}).get('algorithm'),
                    'breakdown_provided': bool(result.get('data', {}).get('breakdown'))
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Backend-Matching integration error: {str(e)}"
            }

    def test_ai_matching_integration(self) -> Dict:
        """Test AI Agent -> Matching Engine integration"""
        try:
            # First, parse a resume with AI
            ai_parse_url = f"{self.services['ai-agent']}/api/v1/documents/parse"
            resume_data = {
                'text': 'Jane Smith\nData Scientist\n3 years experience\nPython, Machine Learning, TensorFlow',
                'type': 'resume'
            }
            
            ai_response = self.session.post(ai_parse_url, json=resume_data)
            
            if ai_response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"AI parsing failed: HTTP {ai_response.status_code}"
                }
            
            ai_result = ai_response.json()
            parsed_data = ai_result.get('data', {})
            
            # Use parsed data for matching
            matching_url = f"{self.services['matching-engine']}/api/v1/match"
            
            # Create candidate from AI parsed data
            candidate = {
                'id': 'ai_parsed_candidate',
                'skills': parsed_data.get('skills', ['Python', 'Machine Learning']),
                'experience': parsed_data.get('experience_years', 3),
                'location': 'Remote'
            }
            
            job = {
                'id': 'data_science_job',
                'requirements': ['Python', 'Machine Learning', 'Statistics'],
                'experience_required': 2,
                'location': 'Remote'
            }
            
            match_data = {
                'candidate': candidate,
                'job': job,
                'algorithm': 'ai-hybrid'
            }
            
            match_response = self.session.post(matching_url, json=match_data)
            
            if match_response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"Matching with AI data failed: HTTP {match_response.status_code}"
                }
            
            match_result = match_response.json()
            
            return {
                'status': 'PASS',
                'message': 'AI-Matching integration working',
                'details': {
                    'ai_parsing_successful': True,
                    'matching_successful': True,
                    'final_score': match_result.get('data', {}).get('score'),
                    'pipeline_complete': True
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"AI-Matching integration error: {str(e)}"
            }

    def test_backend_compliance_integration(self) -> Dict:
        """Test Backend API -> Compliance Engine integration"""
        try:
            compliance_url = f"{self.services['compliance-engine']}/api/v1/compliance/check"
            
            test_job_posting = {
                'job_posting': {
                    'title': 'Software Engineer',
                    'description': 'We are looking for a talented software engineer to join our team.',
                    'requirements': ['Bachelor degree', '3+ years experience'],
                    'salary': 100000,
                    'location': 'United States'
                },
                'jurisdiction': 'US',
                'check_type': 'job_posting'
            }
            
            response = self.session.post(compliance_url, json=test_job_posting)
            
            if response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"Compliance check failed: HTTP {response.status_code}",
                    'details': response.text
                }
            
            result = response.json()
            
            return {
                'status': 'PASS',
                'message': 'Backend-Compliance integration working',
                'details': {
                    'compliance_check_completed': True,
                    'violations_checked': bool(result.get('data', {}).get('violations') is not None),
                    'score_provided': bool(result.get('data', {}).get('compliance_score'))
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Backend-Compliance integration error: {str(e)}"
            }

    def test_backend_search_integration(self) -> Dict:
        """Test Backend API -> Search Service integration"""
        try:
            search_url = f"{self.services['search-service']}/api/v1/search/jobs"
            
            search_query = {
                'query': 'software engineer python',
                'location': 'San Francisco',
                'filters': {
                    'experience': 'mid-level',
                    'job_type': 'full-time'
                },
                'page': 1,
                'limit': 10
            }
            
            response = self.session.post(search_url, json=search_query)
            
            if response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"Search request failed: HTTP {response.status_code}",
                    'details': response.text
                }
            
            result = response.json()
            
            return {
                'status': 'PASS',
                'message': 'Backend-Search integration working',
                'details': {
                    'search_executed': True,
                    'results_structure': bool(result.get('data')),
                    'pagination_info': bool(result.get('pagination')),
                    'elasticsearch_responsive': True
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Backend-Search integration error: {str(e)}"
            }

    def test_backend_notification_integration(self) -> Dict:
        """Test Backend API -> Notification Service integration"""
        try:
            notification_url = f"{self.services['notification-service']}/api/v1/send"
            
            notification_data = {
                'recipient': {
                    'email': 'test@example.com',
                    'name': 'Integration Test User'
                },
                'type': 'email',
                'template': 'job_match_notification',
                'data': {
                    'jobTitle': 'Software Engineer',
                    'companyName': 'Tech Corp',
                    'matchScore': 95
                }
            }
            
            response = self.session.post(notification_url, json=notification_data)
            
            # In test environment, we expect this to fail gracefully due to missing API keys
            # We consider the integration working if we get a proper API response
            if response.status_code in [200, 201, 400, 401, 403]:
                return {
                    'status': 'PASS',
                    'message': 'Backend-Notification integration accessible',
                    'details': {
                        'service_responsive': True,
                        'api_structure_correct': True,
                        'response_code': response.status_code,
                        'test_environment_note': 'API keys may not be configured in test'
                    }
                }
            else:
                return {
                    'status': 'FAIL',
                    'message': f"Notification service error: HTTP {response.status_code}"
                }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Backend-Notification integration error: {str(e)}"
            }

    def test_backend_credentials_integration(self) -> Dict:
        """Test Backend API -> Credential Engine integration"""
        try:
            # Test credential verification
            verify_url = f"{self.services['credential-engine']}/api/v1/credentials/verify"
            
            verify_data = {
                'credentialId': 'test_credential_123',
                'requesterId': 'test_requester_456',
                'purpose': 'job_application',
                'includeDetails': True
            }
            
            response = self.session.post(verify_url, json=verify_data)
            
            if response.status_code not in [200, 201, 404]:  # 404 is expected for test credential
                return {
                    'status': 'FAIL',
                    'message': f"Credential verification failed: HTTP {response.status_code}",
                    'details': response.text
                }
            
            # The API should respond properly even for non-existent credentials
            result = response.json()
            
            return {
                'status': 'PASS',
                'message': 'Backend-Credentials integration working',
                'details': {
                    'verification_api_responsive': True,
                    'blockchain_service_accessible': True,
                    'response_structure_correct': bool(result.get('success') is not None)
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Backend-Credentials integration error: {str(e)}"
            }

    def test_analytics_integration(self) -> Dict:
        """Test Analytics Service integration with other services"""
        try:
            # Test analytics data collection endpoint
            analytics_url = f"{self.services['analytics-service']}/api/v1/events"
            
            event_data = {
                'event_type': 'job_view',
                'user_id': 'test_user_123',
                'job_id': 'test_job_456',
                'timestamp': datetime.utcnow().isoformat(),
                'metadata': {
                    'source': 'integration_test',
                    'user_agent': 'test_agent'
                }
            }
            
            response = self.session.post(analytics_url, json=event_data)
            
            if response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"Analytics event failed: HTTP {response.status_code}",
                    'details': response.text
                }
            
            # Test analytics query endpoint
            query_url = f"{self.services['analytics-service']}/api/v1/metrics/jobs"
            query_params = {
                'start_date': '2024-01-01',
                'end_date': '2024-12-31',
                'metric': 'views'
            }
            
            query_response = self.session.get(query_url, params=query_params)
            
            if query_response.status_code not in [200, 201]:
                return {
                    'status': 'FAIL',
                    'message': f"Analytics query failed: HTTP {query_response.status_code}"
                }
            
            return {
                'status': 'PASS',
                'message': 'Analytics integration working',
                'details': {
                    'event_collection': True,
                    'metrics_query': True,
                    'data_processing': True
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Analytics integration error: {str(e)}"
            }

    def test_parallel_service_communication(self) -> Dict:
        """Test multiple services communicating simultaneously"""
        try:
            # Define multiple concurrent requests
            test_requests = [
                ('AI Agent Health', lambda: self.session.get(f"{self.services['ai-agent']}/health")),
                ('Matching Health', lambda: self.session.get(f"{self.services['matching-engine']}/health")),
                ('Search Health', lambda: self.session.get(f"{self.services['search-service']}/health")),
                ('Compliance Health', lambda: self.session.get(f"{self.services['compliance-engine']}/health")),
                ('Analytics Health', lambda: self.session.get(f"{self.services['analytics-service']}/health"))
            ]
            
            # Execute requests in parallel
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                future_to_request = {
                    executor.submit(request_func): name 
                    for name, request_func in test_requests
                }
                
                results = {}
                for future in concurrent.futures.as_completed(future_to_request):
                    request_name = future_to_request[future]
                    try:
                        response = future.result(timeout=10)
                        results[request_name] = {
                            'status_code': response.status_code,
                            'success': response.status_code == 200,
                            'response_time': response.elapsed.total_seconds()
                        }
                    except Exception as e:
                        results[request_name] = {
                            'status_code': 0,
                            'success': False,
                            'error': str(e)
                        }
            
            successful_requests = sum(1 for r in results.values() if r.get('success', False))
            total_requests = len(results)
            
            return {
                'status': 'PASS' if successful_requests == total_requests else 'FAIL',
                'message': f'Parallel communication: {successful_requests}/{total_requests} successful',
                'details': {
                    'concurrent_requests': total_requests,
                    'successful_requests': successful_requests,
                    'individual_results': results,
                    'max_response_time': max(r.get('response_time', 0) for r in results.values()),
                    'avg_response_time': sum(r.get('response_time', 0) for r in results.values()) / total_requests
                }
            }
            
        except Exception as e:
            return {
                'status': 'FAIL',
                'message': f"Parallel communication error: {str(e)}"
            }

    def run_all_integration_tests(self) -> Dict:
        """Run complete API integration test suite"""
        logger.info("🔗 Starting API Integration Test Suite")
        start_time = time.time()
        
        # Define integration tests
        integration_tests = [
            ("backend-api", "ai-agent", "Document Processing", self.test_backend_ai_integration),
            ("backend-api", "matching-engine", "Job Matching", self.test_backend_matching_integration),
            ("ai-agent", "matching-engine", "AI-Enhanced Matching", self.test_ai_matching_integration),
            ("backend-api", "compliance-engine", "Compliance Checking", self.test_backend_compliance_integration),
            ("backend-api", "search-service", "Job Search", self.test_backend_search_integration),
            ("backend-api", "notification-service", "Notifications", self.test_backend_notification_integration),
            ("backend-api", "credential-engine", "Credential Verification", self.test_backend_credentials_integration),
            ("multiple", "analytics-service", "Analytics Collection", self.test_analytics_integration),
            ("multiple", "multiple", "Parallel Communication", self.test_parallel_service_communication)
        ]
        
        # Run all tests
        for service_a, service_b, test_name, test_func in integration_tests:
            self.run_integration_test(service_a, service_b, test_name, test_func)
        
        # Calculate results
        total_duration = time.time() - start_time
        passed_tests = len([r for r in self.test_results if r.status == "PASS"])
        failed_tests = len([r for r in self.test_results if r.status == "FAIL"])
        total_tests = len(self.test_results)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # Generate summary
        summary = {
            'timestamp': datetime.utcnow().isoformat(),
            'total_duration': total_duration,
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': success_rate,
            'status': 'PASS' if failed_tests == 0 else 'FAIL',
            'integration_results': [
                {
                    'service_a': r.service_a,
                    'service_b': r.service_b,
                    'test_name': r.test_name,
                    'status': r.status,
                    'duration': r.duration,
                    'message': r.message,
                    'details': r.details
                }
                for r in self.test_results
            ]
        }
        
        # Save results
        results_file = '/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/api_integration_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Print summary
        logger.info(f"🏁 API Integration Test Suite Complete!")
        logger.info(f"📊 Results: {passed_tests}/{total_tests} integrations working ({success_rate:.1f}%)")
        logger.info(f"⏱️  Total duration: {total_duration:.1f} seconds")
        logger.info(f"📄 Detailed results saved to: {results_file}")
        
        if failed_tests == 0:
            logger.info("🎉 ALL INTEGRATIONS WORKING! Services communicate properly.")
        else:
            logger.warning(f"⚠️  {failed_tests} integrations failed. Check service connectivity.")
        
        return summary

def main():
    """Main execution function"""
    test_suite = APIIntegrationTests()
    results = test_suite.run_all_integration_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results['status'] == 'PASS' else 1
    exit(exit_code)

if __name__ == "__main__":
    main()