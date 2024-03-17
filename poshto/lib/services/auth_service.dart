import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<void> loginRequest(BuildContext context, String seed) async {
    final response = await http.post(Uri.parse('https://localhost:7219/Auth/Login?seedPhrase=$seed'));
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      await storage.write(key: 'authToken', value: data['token']);
      await storage.write(key: 'userId', value: data['user']['id'].toString());
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${response.body}')));
    }
  }

  Future<void> registerRequest(BuildContext context, String seed) async {
    final response = await http.post(Uri.parse('https://localhost:7219/Auth/Register?seedPhrase=$seed'));
    if (response.statusCode != 200) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${response.body}')));
    }
  }

  Future<List<String>?> generateSeed(BuildContext context) async {
    final response = await http.get(Uri.parse('https://localhost:7219/Generator/Generate'));
    if (response.statusCode == 200) {
      String body = response.body;
      List<String> phrases = List<String>.from(body.split(' '));
      return phrases;
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Error fetching phrases')));
      return null;
    }
  }
}