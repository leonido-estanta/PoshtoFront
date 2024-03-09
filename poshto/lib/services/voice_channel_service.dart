import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:poshto/models/voice_channel_model.dart';
import 'dart:convert';

class VoiceChannelService {
  final String _baseUrl = 'https://localhost:7219';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<List<VoiceChannelModel>> getChannels() async {
    String? authToken = await _storage.read(key: 'authToken');
    var response = await http.get(
      Uri.parse('$_baseUrl/VoiceChannel/List'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
    );
    if (response.statusCode == 200) {
      List<dynamic> channelsJson = json.decode(response.body);
      List<VoiceChannelModel> channels = [];
      for (var channelJson in channelsJson) {
        VoiceChannelModel channel = VoiceChannelModel.fromJson(channelJson);
        channel.connectedUsers = await getConnectedUsers(channel.id);
        channels.add(channel);
      }
      return channels;
    } else {
      throw Exception('Failed to load channels');
    }
  }

  Future<List<int>> getConnectedUsers(int channelId) async {
    String? authToken = await _storage.read(key: 'authToken');
    var response = await http.get(
      Uri.parse('$_baseUrl/VoiceChannel/ConnectedUsers/$channelId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
    );
    if (response.statusCode == 200) {
      List<dynamic> usersJson = json.decode(response.body);
      List<int> connectedUsersIds = usersJson.cast<int>();
      return connectedUsersIds;
    } else {
      throw Exception('Failed to load connected users');
    }
  }

  Future<void> connectUserToChannel(int channelId) async {
    String? authToken = await _storage.read(key: 'authToken');
    var response = await http.post(
      Uri.parse('$_baseUrl/VoiceChannel/Connect/$channelId'),
      headers: {
        'Authorization': 'Bearer $authToken',
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to connect to channel');
    }
  }

  Future<void> disconnectUserFromChannel(int channelId) async {
    String? authToken = await _storage.read(key: 'authToken');
    var response = await http.post(
      Uri.parse('$_baseUrl/VoiceChannel/Disconnect/$channelId'),
      headers: {
        'Authorization': 'Bearer $authToken',
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to disconnect from channel');
    }
  }
}
