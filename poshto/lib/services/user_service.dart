import 'dart:convert';
import 'package:poshto/models/user_model.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class UserService {
  final String _baseUrl = 'https://localhost:7219';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<List<UserModel>> getUsers() async {
    var response = await http.get(
      Uri.parse('$_baseUrl/User/List'),
      headers: {
        'Content-Type': 'application/json'
      },
    );
    if (response.statusCode == 200) {
      List<dynamic> usersJson = json.decode(response.body);
      List<UserModel> users = usersJson.map((json) => UserModel.fromJson(json)).toList();
      return users;
    } else {
      throw Exception('Failed to load users');
    }
  }
}