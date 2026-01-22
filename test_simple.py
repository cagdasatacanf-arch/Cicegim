#!/usr/bin/env python3
"""
Simple direct test of Gemini API key
"""
import sys
try:
    import requests
except ImportError:
    print("Installing requests...")
    import os
    os.system(f"{sys.executable} -m pip install -q requests")
    import requests

# Load key
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('GEMINI_API_KEY='):
            api_key = line.split('=', 1)[1].strip()
            break

print(f"Testing API Key: {api_key}")
print("=" * 60)

# Direct test
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
data = {"contents": [{"parts": [{"text": "Hello"}]}]}

response = requests.post(url, json=data)

print(f"Status Code: {response.status_code}")
print(f"Headers: {dict(response.headers)}")
print(f"\nResponse Text:\n{response.text[:500]}")

if response.status_code == 200:
    print("\n✅ SUCCESS!")
    print(f"Response: {response.json()}")
else:
    print(f"\n❌ FAILED with status {response.status_code}")
    print("\nThis API key is not working. You need to:")
    print("1. Visit https://aistudio.google.com/app/apikey")
    print("2. Create a new API key")
    print("3. Update .env file with the new key")
