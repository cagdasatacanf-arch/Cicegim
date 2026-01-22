#!/usr/bin/env python3
"""
Test script to verify Gemini API key is working correctly
"""
import os
import sys

try:
    import requests
except ImportError:
    print("Installing requests library...")
    os.system(f"{sys.executable} -m pip install requests -q")
    import requests

def test_gemini_api():
    # Load API key from .env file
    api_key = None
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('GEMINI_API_KEY='):
                    api_key = line.split('=', 1)[1].strip()
                    break
    except FileNotFoundError:
        print("❌ Error: .env file not found")
        return False

    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in .env file")
        return False

    print(f"✓ API Key loaded: {api_key[:10]}...{api_key[-4:]}")

    # First, try to list available models to verify API key
    print("\n1. Testing API key validity by listing models...")
    list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

    try:
        response = requests.get(list_url, timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            models = response.json()
            print(f"   ✓ API key is valid! Found {len(models.get('models', []))} models")
        else:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   Error: {e}")

    # Try v1 endpoint
    print("\n2. Testing content generation (v1 endpoint)...")
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={api_key}"

    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{
            "parts": [{
                "text": "Say hello in one word"
            }]
        }]
    }

    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result:
                text_response = result['candidates'][0]['content']['parts'][0]['text']
                print(f"\n✅ SUCCESS! API key is working correctly!")
                print(f"   Gemini Response: {text_response}")
                return True
        else:
            print(f"   Response: {response.text[:300]}")

    except Exception as e:
        print(f"   Error: {e}")

    # Try gemini-1.5-flash model
    print("\n3. Testing with gemini-1.5-flash model...")
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"

    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result:
                text_response = result['candidates'][0]['content']['parts'][0]['text']
                print(f"\n✅ SUCCESS! API key is working correctly!")
                print(f"   Gemini Response: {text_response}")
                return True
        else:
            print(f"   Response: {response.text[:300]}")

    except Exception as e:
        print(f"   Error: {e}")

    print("\n❌ API key test failed. Possible issues:")
    print("   - API key may not be activated in Google AI Studio")
    print("   - Gemini API may not be enabled for this key")
    print("   - API key may have restrictions (IP, referrer, etc.)")
    print("\nTo fix:")
    print("   1. Visit https://aistudio.google.com/app/apikey")
    print("   2. Verify your API key is active")
    print("   3. Check if there are any usage restrictions")

    return False

if __name__ == "__main__":
    print("=" * 60)
    print("Gemini API Key Test")
    print("=" * 60)
    success = test_gemini_api()
    print("=" * 60)
    sys.exit(0 if success else 1)
