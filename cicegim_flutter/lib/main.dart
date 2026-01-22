import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_screen.dart';
import 'providers/plant_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => PlantProvider()),
      ],
      child: const CicegimApp(),
    ),
  );
}

class CicegimApp extends StatelessWidget {
  const CicegimApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Çiçeğim',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1B4332),
          primary: const Color(0xFF1B4332),
          secondary: const Color(0xFF2D6A4F),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAF8),
        textTheme: GoogleFonts.interTextTheme(),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          iconTheme: IconThemeData(color: Color(0xFF1B4332)),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
