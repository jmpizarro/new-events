#!/usr/bin/env python3
"""
Valencia Events Backend API Test Suite
Tests all backend endpoints comprehensively
"""

import requests
import json
import sys
from datetime import datetime
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BASE_URL}/api"
print(f"🔗 Testing backend at: {API_BASE}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def add_result(self, test_name, passed, message=""):
        self.results.append({
            'test': test_name,
            'passed': passed,
            'message': message
        })
        if passed:
            self.passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed += 1
            print(f"❌ {test_name}: {message}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n📊 Test Summary: {self.passed}/{total} passed")
        if self.failed > 0:
            print("\n❌ Failed Tests:")
            for result in self.results:
                if not result['passed']:
                    print(f"  - {result['test']}: {result['message']}")

def test_health_check():
    """Test /api/health endpoint"""
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'status' in data and data['status'] == 'healthy':
                return True, "Health check passed"
            else:
                return False, f"Invalid health response: {data}"
        else:
            return False, f"Health check failed with status {response.status_code}"
    except Exception as e:
        return False, f"Health check error: {str(e)}"

def test_get_all_events():
    """Test /api/events endpoint"""
    try:
        response = requests.get(f"{API_BASE}/events", timeout=10)
        if response.status_code == 200:
            events = response.json()
            if isinstance(events, list) and len(events) > 0:
                # Verify event structure
                event = events[0]
                required_fields = ['id', 'title', 'date', 'location', 'description', 'imageUrl', 'source']
                for field in required_fields:
                    if field not in event:
                        return False, f"Missing field '{field}' in event"
                return True, f"Retrieved {len(events)} events successfully"
            else:
                return False, "No events returned or invalid format"
        else:
            return False, f"Get events failed with status {response.status_code}"
    except Exception as e:
        return False, f"Get events error: {str(e)}"

def test_get_specific_event():
    """Test /api/events/{event_id} endpoint"""
    try:
        # First get all events to get a valid ID
        response = requests.get(f"{API_BASE}/events", timeout=10)
        if response.status_code != 200:
            return False, "Could not get events list for ID test"
        
        events = response.json()
        if not events:
            return False, "No events available for ID test"
        
        event_id = events[0]['id']
        
        # Test getting specific event
        response = requests.get(f"{API_BASE}/events/{event_id}", timeout=10)
        if response.status_code == 200:
            event = response.json()
            if event['id'] == event_id:
                return True, f"Retrieved specific event: {event['title']}"
            else:
                return False, "Event ID mismatch"
        else:
            return False, f"Get specific event failed with status {response.status_code}"
    except Exception as e:
        return False, f"Get specific event error: {str(e)}"

def test_get_events_by_date():
    """Test /api/events/date/{date} endpoint"""
    try:
        # First get all events to get a valid date
        response = requests.get(f"{API_BASE}/events", timeout=10)
        if response.status_code != 200:
            return False, "Could not get events list for date test"
        
        events = response.json()
        if not events:
            return False, "No events available for date test"
        
        test_date = events[0]['date']
        
        # Test getting events by date
        response = requests.get(f"{API_BASE}/events/date/{test_date}", timeout=10)
        if response.status_code == 200:
            date_events = response.json()
            if isinstance(date_events, list):
                return True, f"Retrieved {len(date_events)} events for date {test_date}"
            else:
                return False, "Invalid response format for date events"
        else:
            return False, f"Get events by date failed with status {response.status_code}"
    except Exception as e:
        return False, f"Get events by date error: {str(e)}"

def test_get_summaries():
    """Test /api/summaries endpoint"""
    try:
        response = requests.get(f"{API_BASE}/summaries", timeout=10)
        if response.status_code == 200:
            summaries = response.json()
            if isinstance(summaries, list) and len(summaries) > 0:
                # Verify summary structure
                summary = summaries[0]
                required_fields = ['id', 'summary', 'start_date', 'end_date', 'event_types']
                for field in required_fields:
                    if field not in summary:
                        return False, f"Missing field '{field}' in summary"
                return True, f"Retrieved {len(summaries)} summaries successfully"
            else:
                return False, "No summaries returned or invalid format"
        else:
            return False, f"Get summaries failed with status {response.status_code}"
    except Exception as e:
        return False, f"Get summaries error: {str(e)}"

def test_get_latest_summary():
    """Test /api/summaries/latest endpoint"""
    try:
        response = requests.get(f"{API_BASE}/summaries/latest", timeout=10)
        if response.status_code == 200:
            summary = response.json()
            required_fields = ['id', 'summary', 'start_date', 'end_date', 'event_types']
            for field in required_fields:
                if field not in summary:
                    return False, f"Missing field '{field}' in latest summary"
            return True, f"Retrieved latest summary: {summary['start_date']} to {summary['end_date']}"
        else:
            return False, f"Get latest summary failed with status {response.status_code}"
    except Exception as e:
        return False, f"Get latest summary error: {str(e)}"

def test_admin_login_valid():
    """Test /api/admin/login with valid credentials"""
    try:
        login_data = {
            "username": "admin",
            "password": "valencia2025"
        }
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'token' in data and data['token'] == 'admin_token_valencia':
                return True, "Admin login successful with valid credentials"
            else:
                return False, f"Invalid token response: {data}"
        else:
            return False, f"Admin login failed with status {response.status_code}"
    except Exception as e:
        return False, f"Admin login error: {str(e)}"

def test_admin_login_invalid():
    """Test /api/admin/login with invalid credentials"""
    try:
        login_data = {
            "username": "admin",
            "password": "wrongpassword"
        }
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        if response.status_code == 401:
            return True, "Admin login correctly rejected invalid credentials"
        else:
            return False, f"Admin login should have returned 401, got {response.status_code}"
    except Exception as e:
        return False, f"Admin login invalid test error: {str(e)}"

def get_admin_token():
    """Helper function to get admin token"""
    try:
        login_data = {
            "username": "admin",
            "password": "valencia2025"
        }
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        if response.status_code == 200:
            return response.json()['token']
        return None
    except:
        return None

def test_admin_config_get():
    """Test /api/admin/config GET with valid token"""
    try:
        token = get_admin_token()
        if not token:
            return False, "Could not get admin token for config test"
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/admin/config", headers=headers, timeout=10)
        if response.status_code == 200:
            config = response.json()
            required_fields = ['id', 'city', 'categories', 'openai_api_key', 'valencia_events_prompt', 'valencia_summary_prompt']
            for field in required_fields:
                if field not in config:
                    return False, f"Missing field '{field}' in admin config"
            return True, f"Retrieved admin config for city: {config['city']}"
        else:
            return False, f"Get admin config failed with status {response.status_code}"
    except Exception as e:
        return False, f"Get admin config error: {str(e)}"

def test_admin_config_put():
    """Test /api/admin/config PUT with valid token"""
    try:
        token = get_admin_token()
        if not token:
            return False, "Could not get admin token for config update test"
        
        # First get current config
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/admin/config", headers=headers, timeout=10)
        if response.status_code != 200:
            return False, "Could not get current config for update test"
        
        config = response.json()
        # Update a field
        config['city'] = 'Valencia Test'
        
        # Update config
        response = requests.put(f"{API_BASE}/admin/config", json=config, headers=headers, timeout=10)
        if response.status_code == 200:
            return True, "Admin config updated successfully"
        else:
            return False, f"Update admin config failed with status {response.status_code}"
    except Exception as e:
        return False, f"Update admin config error: {str(e)}"

def test_admin_config_unauthorized():
    """Test /api/admin/config without token"""
    try:
        response = requests.get(f"{API_BASE}/admin/config", timeout=10)
        if response.status_code == 401:
            return True, "Admin config correctly rejected unauthorized access"
        else:
            return False, f"Admin config should have returned 401, got {response.status_code}"
    except Exception as e:
        return False, f"Admin config unauthorized test error: {str(e)}"

def test_generate_events_no_api_key():
    """Test /api/admin/generate-events without OpenAI API key"""
    try:
        token = get_admin_token()
        if not token:
            return False, "Could not get admin token for generate events test"
        
        headers = {"Authorization": f"Bearer {token}"}
        request_data = {
            "start_date": "2025-07-15",
            "end_date": "2025-07-20"
        }
        response = requests.post(f"{API_BASE}/admin/generate-events", json=request_data, headers=headers, timeout=10)
        if response.status_code == 400:
            data = response.json()
            if "OpenAI API key not configured" in data.get('detail', ''):
                return True, "Generate events correctly failed without API key"
            else:
                return False, f"Unexpected error message: {data}"
        else:
            return False, f"Generate events should have returned 400, got {response.status_code}"
    except Exception as e:
        return False, f"Generate events test error: {str(e)}"

def test_generate_summary_no_api_key():
    """Test /api/admin/generate-summary without OpenAI API key"""
    try:
        token = get_admin_token()
        if not token:
            return False, "Could not get admin token for generate summary test"
        
        headers = {"Authorization": f"Bearer {token}"}
        request_data = {
            "start_date": "2025-07-15",
            "end_date": "2025-07-20"
        }
        response = requests.post(f"{API_BASE}/admin/generate-summary", json=request_data, headers=headers, timeout=10)
        if response.status_code == 400:
            data = response.json()
            if "OpenAI API key not configured" in data.get('detail', ''):
                return True, "Generate summary correctly failed without API key"
            else:
                return False, f"Unexpected error message: {data}"
        else:
            return False, f"Generate summary should have returned 400, got {response.status_code}"
    except Exception as e:
        return False, f"Generate summary test error: {str(e)}"

def test_invalid_endpoint():
    """Test invalid endpoint returns 404"""
    try:
        response = requests.get(f"{API_BASE}/invalid-endpoint", timeout=10)
        if response.status_code == 404:
            return True, "Invalid endpoint correctly returned 404"
        else:
            return False, f"Invalid endpoint should have returned 404, got {response.status_code}"
    except Exception as e:
        return False, f"Invalid endpoint test error: {str(e)}"

def test_invalid_event_id():
    """Test getting non-existent event returns 404"""
    try:
        response = requests.get(f"{API_BASE}/events/non-existent-id", timeout=10)
        if response.status_code == 404:
            return True, "Non-existent event correctly returned 404"
        else:
            return False, f"Non-existent event should have returned 404, got {response.status_code}"
    except Exception as e:
        return False, f"Invalid event ID test error: {str(e)}"

def main():
    """Run all backend tests"""
    print("🚀 Starting Valencia Events Backend API Tests")
    print("=" * 60)
    
    results = TestResults()
    
    # Basic API Health Check
    print("\n🏥 Health Check Tests")
    passed, message = test_health_check()
    results.add_result("Health Check", passed, message)
    
    # Events API Testing
    print("\n📅 Events API Tests")
    passed, message = test_get_all_events()
    results.add_result("Get All Events", passed, message)
    
    passed, message = test_get_specific_event()
    results.add_result("Get Specific Event", passed, message)
    
    passed, message = test_get_events_by_date()
    results.add_result("Get Events by Date", passed, message)
    
    # Summary API Testing
    print("\n📝 Summary API Tests")
    passed, message = test_get_summaries()
    results.add_result("Get All Summaries", passed, message)
    
    passed, message = test_get_latest_summary()
    results.add_result("Get Latest Summary", passed, message)
    
    # Admin Authentication
    print("\n🔐 Admin Authentication Tests")
    passed, message = test_admin_login_valid()
    results.add_result("Admin Login Valid", passed, message)
    
    passed, message = test_admin_login_invalid()
    results.add_result("Admin Login Invalid", passed, message)
    
    # Admin Configuration
    print("\n⚙️ Admin Configuration Tests")
    passed, message = test_admin_config_get()
    results.add_result("Admin Config GET", passed, message)
    
    passed, message = test_admin_config_put()
    results.add_result("Admin Config PUT", passed, message)
    
    passed, message = test_admin_config_unauthorized()
    results.add_result("Admin Config Unauthorized", passed, message)
    
    # OpenAI Integration Setup
    print("\n🤖 OpenAI Integration Tests")
    passed, message = test_generate_events_no_api_key()
    results.add_result("Generate Events No API Key", passed, message)
    
    passed, message = test_generate_summary_no_api_key()
    results.add_result("Generate Summary No API Key", passed, message)
    
    # Error Handling
    print("\n❌ Error Handling Tests")
    passed, message = test_invalid_endpoint()
    results.add_result("Invalid Endpoint", passed, message)
    
    passed, message = test_invalid_event_id()
    results.add_result("Invalid Event ID", passed, message)
    
    # Print summary
    print("\n" + "=" * 60)
    results.summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())