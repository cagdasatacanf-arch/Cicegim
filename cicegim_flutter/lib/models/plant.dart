class Plant {
  final String id;
  final String commonName;
  final String scientificName;
  final int wateringInterval;
  final String healthStatus;
  final String careTips;
  final String imagePath;
  final DateTime lastWatered;

  Plant({
    required this.id,
    required this.commonName,
    required this.scientificName,
    required this.wateringInterval,
    required this.healthStatus,
    required this.careTips,
    required this.imagePath,
    required this.lastWatered,
  });

  // Convert Plant to JSON for storage
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'commonName': commonName,
      'scientificName': scientificName,
      'wateringInterval': wateringInterval,
      'healthStatus': healthStatus,
      'careTips': careTips,
      'imagePath': imagePath,
      'lastWatered': lastWatered.toIso8601String(),
    };
  }

  // Create Plant from JSON
  factory Plant.fromJson(Map<String, dynamic> json) {
    return Plant(
      id: json['id'] as String,
      commonName: json['commonName'] as String,
      scientificName: json['scientificName'] as String,
      wateringInterval: json['wateringInterval'] as int,
      healthStatus: json['healthStatus'] as String,
      careTips: json['careTips'] as String,
      imagePath: json['imagePath'] as String,
      lastWatered: DateTime.parse(json['lastWatered'] as String),
    );
  }

  // Get days since last watered
  int getDaysSinceWatered() {
    return DateTime.now().difference(lastWatered).inDays;
  }

  // Check if plant needs water
  bool needsWater() {
    return getDaysSinceWatered() >= wateringInterval;
  }

  // Create copy with updated fields
  Plant copyWith({
    String? id,
    String? commonName,
    String? scientificName,
    int? wateringInterval,
    String? healthStatus,
    String? careTips,
    String? imagePath,
    DateTime? lastWatered,
  }) {
    return Plant(
      id: id ?? this.id,
      commonName: commonName ?? this.commonName,
      scientificName: scientificName ?? this.scientificName,
      wateringInterval: wateringInterval ?? this.wateringInterval,
      healthStatus: healthStatus ?? this.healthStatus,
      careTips: careTips ?? this.careTips,
      imagePath: imagePath ?? this.imagePath,
      lastWatered: lastWatered ?? this.lastWatered,
    );
  }
}
