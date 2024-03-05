import 'dart:convert';
import 'package:poshto/models/message_model.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ChatService {
  final String _baseUrl = 'https://localhost:7219';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<List<MessageModel>> getMessages(int skip, int take) async {
    String? authToken = await _storage.read(key: 'authToken');
    var response = await http.get(
      Uri.parse('$_baseUrl/Chat/Get?skip=$skip&take=$take'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
    );
    if (response.statusCode == 200) {
      List<dynamic> messagesJson = json.decode(response.body);
      List<MessageModel> messages = messagesJson.map((json) => MessageModel.fromJson(json)).toList();
      return messages;
    } else {
      throw Exception('Failed to load messages');
    }
  }

  Future<void> sendMessage(String text) async {
    String? authToken = await _storage.read(key: 'authToken');
    var response = await http.post(
      Uri.parse('$_baseUrl/Chat/Add'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
      body: jsonEncode({'text': text}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to send message');
    }
  }
}