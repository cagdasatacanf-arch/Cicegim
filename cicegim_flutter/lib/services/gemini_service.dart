import 'dart:io';
import 'dart:typed_data';
import 'package:google_generative_ai/google_generative_ai.dart';

class GeminiService {
  static const String apiKey = String.fromEnvironment('GEMINI_API_KEY',
      defaultValue: 'AIzaSyDeVTbNzlYKnYplW8rtVrvB6eYvgfKq5FE');

  late final GenerativeModel _model;

  GeminiService() {
    _model = GenerativeModel(
      model: 'gemini-2.0-flash-exp',
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      ),
    );
  }

  Future<Map<String, dynamic>> identifyPlant(String imagePath) async {
    try {
      // Read image file
      final imageFile = File(imagePath);
      final imageBytes = await imageFile.readAsBytes();

      // Create prompt
      final prompt = '''
Bir bitki uzmanısın. Gönderilen fotoğraftaki bitkiyi tanı.
Yanıtı sadece şu JSON formatında ver:
{
  "commonName": "Bitki Türkçe Adı",
  "scientificName": "Scientific Name",
  "wateringInterval": 7,
  "healthStatus": "İyi/Sorunlu",
  "careTips": "Kısa bakım önerisi"
}
''';

      // Create content with image and text
      final content = [
        Content.multi([
          TextPart(prompt),
          DataPart('image/jpeg', imageBytes),
        ])
      ];

      // Generate response with retry logic
      final response = await _generateWithRetry(content);

      // Parse JSON from response
      final text = response.text ?? '';
      final jsonMatch = RegExp(r'\{[\s\S]*\}').firstMatch(text);

      if (jsonMatch == null) {
        throw Exception('Geçerli JSON yanıtı alınamadı');
      }

      // Parse and return JSON
      final jsonString = jsonMatch.group(0)!;
      return _parseJsonString(jsonString);

    } catch (e) {
      throw Exception('Bitki tanıma hatası: ${e.toString()}');
    }
  }

  Future<GenerateContentResponse> _generateWithRetry(
    List<Content> content, {
    int maxRetries = 5,
    Duration initialDelay = const Duration(seconds: 1),
  }) async {
    int retries = 0;
    Duration delay = initialDelay;

    while (true) {
      try {
        final response = await _model.generateContent(content);
        return response;
      } catch (e) {
        retries++;
        if (retries >= maxRetries) {
          rethrow;
        }
        await Future.delayed(delay);
        delay *= 2; // Exponential backoff
      }
    }
  }

  Map<String, dynamic> _parseJsonString(String jsonString) {
    // Remove markdown code blocks if present
    String cleaned = jsonString
        .replaceAll('```json', '')
        .replaceAll('```', '')
        .trim();

    // Simple JSON parsing (you'd use dart:convert in production)
    final map = <String, dynamic>{};

    // Extract values using regex (simplified)
    final commonNameMatch = RegExp(r'"commonName"\s*:\s*"([^"]*)"').firstMatch(cleaned);
    final scientificNameMatch = RegExp(r'"scientificName"\s*:\s*"([^"]*)"').firstMatch(cleaned);
    final wateringIntervalMatch = RegExp(r'"wateringInterval"\s*:\s*(\d+)').firstMatch(cleaned);
    final healthStatusMatch = RegExp(r'"healthStatus"\s*:\s*"([^"]*)"').firstMatch(cleaned);
    final careTipsMatch = RegExp(r'"careTips"\s*:\s*"([^"]*)"').firstMatch(cleaned);

    map['commonName'] = commonNameMatch?.group(1) ?? 'Bilinmeyen Bitki';
    map['scientificName'] = scientificNameMatch?.group(1) ?? 'Unknown';
    map['wateringInterval'] = int.tryParse(wateringIntervalMatch?.group(1) ?? '7') ?? 7;
    map['healthStatus'] = healthStatusMatch?.group(1) ?? 'İyi';
    map['careTips'] = careTipsMatch?.group(1) ?? 'Düzenli su verin ve güneş ışığına dikkat edin.';

    return map;
  }
}
