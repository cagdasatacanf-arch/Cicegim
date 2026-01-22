#!/usr/bin/env python3
"""
Test Gemini API key using official Google Generative AI SDK
"""
import os
import sys

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
    sys.exit(1)

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in .env file")
    sys.exit(1)

print("=" * 60)
print("Gemini API Key Test (Official SDK)")
print("=" * 60)
print(f"✓ API Key loaded: {api_key[:10]}...{api_key[-4:]}")

# Set environment variable for SDK
os.environ['GOOGLE_API_KEY'] = api_key

try:
    from google import genai
    from google.genai import types

    print("\n✓ Google Generative AI SDK imported successfully")

    # Initialize client
    print("\nInitializing Gemini client...")
    client = genai.Client(api_key=api_key)

    print("✓ Client initialized")

    # Test with a simple prompt
    print("\nSending test prompt to Gemini...")
    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents='Say hello in one word'
    )

    print("\n" + "=" * 60)
    print("✅ SUCCESS! API key is working correctly!")
    print("=" * 60)
    print(f"Gemini Response: {response.text}")
    print("=" * 60)

except ImportError as e:
    print(f"\n❌ Error: Failed to import google-genai SDK")
    print(f"   {e}")
    print("\nPlease install: pip install -U google-genai")
    sys.exit(1)

except Exception as e:
    print("\n" + "=" * 60)
    print("❌ API Test Failed")
    print("=" * 60)
    print(f"Error: {e}")
    print("\nPossible issues:")
    print("  - API key may not be activated in Google AI Studio")
    print("  - API key may have restrictions")
    print("  - Network connectivity issues")
    print("\nTo fix:")
    print("  1. Visit https://aistudio.google.com/app/apikey")
    print("  2. Verify your API key is active")
    print("  3. Check for any restrictions")
    print("=" * 60)
    sys.exit(1)
