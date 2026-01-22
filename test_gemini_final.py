#!/usr/bin/env python3
"""
Test Gemini API key using google-generativeai package
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
print("Gemini API Key Test")
print("=" * 60)
print(f"✓ API Key loaded: {api_key[:10]}...{api_key[-4:]}")

try:
    import google.generativeai as genai

    print("\n✓ Google Generative AI package imported")

    # Configure the API key
    genai.configure(api_key=api_key)
    print("✓ API key configured")

    # List available models
    print("\nFetching available models...")
    models = genai.list_models()
    model_names = [m.name for m in models if 'generateContent' in m.supported_generation_methods]

    if model_names:
        print(f"✓ Found {len(model_names)} models available")
        print(f"  Using: {model_names[0]}")

        # Test with a simple prompt
        print("\nSending test prompt to Gemini...")
        model = genai.GenerativeModel(model_names[0])
        response = model.generate_content("Say hello in one word")

        print("\n" + "=" * 60)
        print("✅ SUCCESS! API key is working correctly!")
        print("=" * 60)
        print(f"Gemini Response: {response.text}")
        print("=" * 60)
    else:
        print("❌ No models available with this API key")
        sys.exit(1)

except ImportError as e:
    print(f"\n❌ Error: Failed to import google.generativeai")
    print(f"   {e}")
    print("\nPlease install: pip install google-generativeai")
    sys.exit(1)

except Exception as e:
    print("\n" + "=" * 60)
    print("❌ API Test Failed")
    print("=" * 60)
    print(f"Error Type: {type(e).__name__}")
    print(f"Error: {e}")
    print("\nPossible issues:")
    print("  - API key may not be activated in Google AI Studio")
    print("  - API key may have restrictions (IP, referrer, etc.)")
    print("  - Gemini API may not be enabled for this project")
    print("\nTo fix:")
    print("  1. Visit https://aistudio.google.com/app/apikey")
    print("  2. Verify your API key is active and has no restrictions")
    print("  3. Try creating a new API key if needed")
    print("=" * 60)
    sys.exit(1)
