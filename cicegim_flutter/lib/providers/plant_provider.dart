import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/plant.dart';
import '../services/gemini_service.dart';

class PlantProvider with ChangeNotifier {
  List<Plant> _plants = [];
  bool _isLoading = false;
  String? _error;

  final GeminiService _geminiService = GeminiService();
  final Uuid _uuid = const Uuid();

  List<Plant> get plants => _plants;
  bool get isLoading => _isLoading;
  String? get error => _error;

  PlantProvider() {
    _loadPlants();
  }

  // Load plants from local storage
  Future<void> _loadPlants() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final plantsJson = prefs.getString('cicegim_plants');

      if (plantsJson != null) {
        final List<dynamic> decoded = json.decode(plantsJson);
        _plants = decoded.map((json) => Plant.fromJson(json)).toList();
        notifyListeners();
      }
    } catch (e) {
      _error = 'Bitkiler yüklenemedi: ${e.toString()}';
      notifyListeners();
    }
  }

  // Save plants to local storage
  Future<void> _savePlants() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final plantsJson = json.encode(_plants.map((p) => p.toJson()).toList());
      await prefs.setString('cicegim_plants', plantsJson);
    } catch (e) {
      _error = 'Bitkiler kaydedilemedi: ${e.toString()}';
      notifyListeners();
    }
  }

  // Identify plant from image
  Future<void> identifyPlant(String imagePath) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _geminiService.identifyPlant(imagePath);

      final newPlant = Plant(
        id: _uuid.v4(),
        commonName: result['commonName'] as String,
        scientificName: result['scientificName'] as String,
        wateringInterval: result['wateringInterval'] as int,
        healthStatus: result['healthStatus'] as String,
        careTips: result['careTips'] as String,
        imagePath: imagePath,
        lastWatered: DateTime.now(),
      );

      _plants.insert(0, newPlant);
      await _savePlants();

      _isLoading = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  // Mark plant as watered
  Future<void> waterPlant(String plantId) async {
    final index = _plants.indexWhere((p) => p.id == plantId);
    if (index != -1) {
      _plants[index] = _plants[index].copyWith(
        lastWatered: DateTime.now(),
      );
      await _savePlants();
      notifyListeners();
    }
  }

  // Delete plant
  Future<void> deletePlant(String plantId) async {
    _plants.removeWhere((p) => p.id == plantId);
    await _savePlants();
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
