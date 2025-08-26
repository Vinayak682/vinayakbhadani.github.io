#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Vinayak Bhadani Portfolio Website
Tests all API endpoints with proper data validation and error handling
"""

import requests
import json
import sys
from datetime import datetime
import os
from pathlib import Path

# Load environment variables to get the backend URL
sys.path.append('/app/frontend')
from dotenv import load_dotenv

# Load frontend .env to get the backend URL
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://profile-pro-3.preview.emergentagent.com')

class PortfolioAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, endpoint, method, status, message, data=None):
        """Log test results"""
        result = {
            'endpoint': endpoint,
            'method': method,
            'status': 'PASS' if status else 'FAIL',
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        if data:
            result['data_sample'] = str(data)[:200] + '...' if len(str(data)) > 200 else str(data)
        
        self.test_results.append(result)
        print(f"[{result['status']}] {method} {endpoint}: {message}")
        
    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n=== Testing Health Check Endpoints ===")
        
        # Test GET /api/
        try:
            response = self.session.get(f"{self.base_url}/api/")
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'status' in data:
                    self.log_test('/api/', 'GET', True, f"Health check successful: {data['message']}")
                else:
                    self.log_test('/api/', 'GET', False, "Response missing required fields")
            else:
                self.log_test('/api/', 'GET', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/', 'GET', False, f"Request failed: {str(e)}")
            
        # Test GET /api/health
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            if response.status_code == 200:
                data = response.json()
                if 'status' in data and 'database' in data and 'timestamp' in data:
                    if data['status'] == 'healthy' and data['database'] == 'connected':
                        self.log_test('/api/health', 'GET', True, "Health check with database connectivity successful")
                    else:
                        self.log_test('/api/health', 'GET', False, f"Unhealthy status: {data}")
                else:
                    self.log_test('/api/health', 'GET', False, "Response missing required health fields")
            else:
                self.log_test('/api/health', 'GET', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/health', 'GET', False, f"Request failed: {str(e)}")
    
    def test_profile_endpoint(self):
        """Test profile endpoint"""
        print("\n=== Testing Profile Endpoint ===")
        
        try:
            response = self.session.get(f"{self.base_url}/api/profile")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    profile_data = data['data']
                    required_fields = ['id', 'personal', 'hero', 'about', 'contact']
                    missing_fields = [field for field in required_fields if field not in profile_data]
                    
                    if not missing_fields:
                        # Check personal info structure
                        personal = profile_data.get('personal', {})
                        personal_required = ['name', 'title', 'location', 'phone', 'email', 'linkedin']
                        personal_missing = [field for field in personal_required if field not in personal]
                        
                        if not personal_missing:
                            self.log_test('/api/profile', 'GET', True, 
                                        f"Profile data retrieved successfully for {personal['name']}", 
                                        profile_data)
                        else:
                            self.log_test('/api/profile', 'GET', False, 
                                        f"Personal info missing fields: {personal_missing}")
                    else:
                        self.log_test('/api/profile', 'GET', False, f"Profile missing fields: {missing_fields}")
                else:
                    self.log_test('/api/profile', 'GET', False, "Response missing success flag or data")
            else:
                self.log_test('/api/profile', 'GET', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/profile', 'GET', False, f"Request failed: {str(e)}")
    
    def test_experience_endpoint(self):
        """Test experience endpoint"""
        print("\n=== Testing Experience Endpoint ===")
        
        try:
            response = self.session.get(f"{self.base_url}/api/experience")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    experience_list = data['data']
                    if isinstance(experience_list, list) and len(experience_list) > 0:
                        # Check first experience entry structure
                        exp = experience_list[0]
                        required_fields = ['id', 'company', 'position', 'location', 'duration', 'type', 
                                         'achievements', 'skills', 'impact']
                        missing_fields = [field for field in required_fields if field not in exp]
                        
                        if not missing_fields:
                            self.log_test('/api/experience', 'GET', True, 
                                        f"Retrieved {len(experience_list)} experience entries", 
                                        experience_list[0])
                        else:
                            self.log_test('/api/experience', 'GET', False, 
                                        f"Experience entry missing fields: {missing_fields}")
                    else:
                        self.log_test('/api/experience', 'GET', False, "No experience data found")
                else:
                    self.log_test('/api/experience', 'GET', False, "Response missing success flag or data")
            else:
                self.log_test('/api/experience', 'GET', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/experience', 'GET', False, f"Request failed: {str(e)}")
    
    def test_projects_endpoint(self):
        """Test projects endpoint"""
        print("\n=== Testing Projects Endpoint ===")
        
        try:
            response = self.session.get(f"{self.base_url}/api/projects")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    projects_list = data['data']
                    if isinstance(projects_list, list) and len(projects_list) > 0:
                        # Check first project entry structure
                        project = projects_list[0]
                        required_fields = ['id', 'title', 'company', 'category', 'challenge', 
                                         'approach', 'technologies', 'outcomes', 'impact']
                        missing_fields = [field for field in required_fields if field not in project]
                        
                        if not missing_fields:
                            self.log_test('/api/projects', 'GET', True, 
                                        f"Retrieved {len(projects_list)} project entries", 
                                        projects_list[0])
                        else:
                            self.log_test('/api/projects', 'GET', False, 
                                        f"Project entry missing fields: {missing_fields}")
                    else:
                        self.log_test('/api/projects', 'GET', False, "No project data found")
                else:
                    self.log_test('/api/projects', 'GET', False, "Response missing success flag or data")
            else:
                self.log_test('/api/projects', 'GET', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/projects', 'GET', False, f"Request failed: {str(e)}")
    
    def test_skills_endpoint(self):
        """Test skills endpoint"""
        print("\n=== Testing Skills Endpoint ===")
        
        try:
            response = self.session.get(f"{self.base_url}/api/skills")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    skills_list = data['data']
                    if isinstance(skills_list, list) and len(skills_list) > 0:
                        # Check first skill category structure
                        skill_cat = skills_list[0]
                        required_fields = ['id', 'category', 'title', 'icon', 'skills', 
                                         'color', 'borderColor', 'textColor']
                        missing_fields = [field for field in required_fields if field not in skill_cat]
                        
                        if not missing_fields:
                            total_skills = sum(len(cat.get('skills', [])) for cat in skills_list)
                            self.log_test('/api/skills', 'GET', True, 
                                        f"Retrieved {len(skills_list)} skill categories with {total_skills} total skills", 
                                        skills_list[0])
                        else:
                            self.log_test('/api/skills', 'GET', False, 
                                        f"Skill category missing fields: {missing_fields}")
                    else:
                        self.log_test('/api/skills', 'GET', False, "No skills data found")
                else:
                    self.log_test('/api/skills', 'GET', False, "Response missing success flag or data")
            else:
                self.log_test('/api/skills', 'GET', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/skills', 'GET', False, f"Request failed: {str(e)}")
    
    def test_testimonials_endpoint(self):
        """Test testimonials endpoint"""
        print("\n=== Testing Testimonials Endpoint ===")
        
        try:
            response = self.session.get(f"{self.base_url}/api/testimonials")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    testimonials_list = data['data']
                    if isinstance(testimonials_list, list) and len(testimonials_list) > 0:
                        # Check first testimonial structure
                        testimonial = testimonials_list[0]
                        required_fields = ['id', 'name', 'position', 'company', 'linkedin', 
                                         'content', 'rating', 'relationship']
                        missing_fields = [field for field in required_fields if field not in testimonial]
                        
                        if not missing_fields:
                            avg_rating = sum(t.get('rating', 0) for t in testimonials_list) / len(testimonials_list)
                            self.log_test('/api/testimonials', 'GET', True, 
                                        f"Retrieved {len(testimonials_list)} testimonials with avg rating {avg_rating:.1f}", 
                                        testimonials_list[0])
                        else:
                            self.log_test('/api/testimonials', 'GET', False, 
                                        f"Testimonial missing fields: {missing_fields}")
                    else:
                        self.log_test('/api/testimonials', 'GET', False, "No testimonials data found")
                else:
                    self.log_test('/api/testimonials', 'GET', False, "Response missing success flag or data")
            else:
                self.log_test('/api/testimonials', 'GET', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/testimonials', 'GET', False, f"Request failed: {str(e)}")
    
    def test_contact_endpoint(self):
        """Test contact form submission"""
        print("\n=== Testing Contact Form Endpoint ===")
        
        # Test data for contact form
        contact_data = {
            "name": "Ahmed Hassan",
            "email": "ahmed.hassan@example.com",
            "company": "Supply Chain Solutions LLC",
            "message": "Hi Vinayak, I'm interested in discussing supply chain optimization opportunities for our MENA operations. Your experience with cross-regional logistics would be valuable for our upcoming expansion project."
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/contact",
                json=contact_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'message' in data and 'data' in data:
                    if 'id' in data['data']:
                        self.log_test('/api/contact', 'POST', True, 
                                    f"Contact form submitted successfully: {data['message']}", 
                                    data['data'])
                    else:
                        self.log_test('/api/contact', 'POST', False, "Response missing contact ID")
                else:
                    self.log_test('/api/contact', 'POST', False, "Response missing required fields")
            else:
                self.log_test('/api/contact', 'POST', False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test('/api/contact', 'POST', False, f"Request failed: {str(e)}")
        
        # Test invalid contact data
        invalid_data = {
            "name": "",  # Empty name
            "email": "invalid-email",  # Invalid email
            "message": ""  # Empty message
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/contact",
                json=invalid_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 422:  # Validation error expected
                self.log_test('/api/contact', 'POST', True, "Validation correctly rejected invalid data")
            elif response.status_code == 200:
                self.log_test('/api/contact', 'POST', False, "Should have rejected invalid data but didn't")
            else:
                self.log_test('/api/contact', 'POST', False, f"Unexpected response: HTTP {response.status_code}")
        except Exception as e:
            self.log_test('/api/contact', 'POST', False, f"Invalid data test failed: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for invalid endpoints"""
        print("\n=== Testing Error Handling ===")
        
        # Test non-existent endpoint
        try:
            response = self.session.get(f"{self.base_url}/api/nonexistent")
            if response.status_code == 404:
                self.log_test('/api/nonexistent', 'GET', True, "404 error correctly returned for invalid endpoint")
            else:
                self.log_test('/api/nonexistent', 'GET', False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test('/api/nonexistent', 'GET', False, f"Error handling test failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"Starting comprehensive API testing for: {self.base_url}")
        print("=" * 60)
        
        self.test_health_endpoints()
        self.test_profile_endpoint()
        self.test_experience_endpoint()
        self.test_projects_endpoint()
        self.test_skills_endpoint()
        self.test_testimonials_endpoint()
        self.test_contact_endpoint()
        self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['status'] == 'PASS')
        failed = sum(1 for result in self.test_results if result['status'] == 'FAIL')
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if result['status'] == 'FAIL':
                    print(f"  - {result['method']} {result['endpoint']}: {result['message']}")
        
        return passed, failed, total

def main():
    """Main function to run the tests"""
    print("Vinayak Bhadani Portfolio API Testing Suite")
    print("=" * 60)
    
    tester = PortfolioAPITester(BACKEND_URL)
    passed, failed, total = tester.run_all_tests()
    
    # Exit with appropriate code
    if failed == 0:
        print("\n✅ All tests passed! Backend API is fully functional.")
        sys.exit(0)
    else:
        print(f"\n❌ {failed} tests failed. Please check the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()