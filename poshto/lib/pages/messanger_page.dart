import 'package:flutter/material.dart';
import 'package:poshto/models/message_model.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/models/voice_channel_model.dart';
import 'package:poshto/services/user_service.dart';
import 'package:poshto/services/voice_channel_service.dart';
import 'chat_history.dart';
import 'chat_input.dart';
import 'user_panel.dart';
import 'voice_channels.dart';
import 'control_panel.dart';
import 'package:signalr_netcore/signalr_client.dart';

class MessengerPage extends StatefulWidget {
  const MessengerPage({super.key});

  @override
  _MessengerPageState createState() => _MessengerPageState();
}

class _MessengerPageState extends State<MessengerPage> {
  final UserService _userService = UserService();
  final VoiceChannelService _voiceChannelService = VoiceChannelService();
  late List<UserModel> users = [];
  final List<MessageModel> messages = [];
  late List<VoiceChannelModel> channels = [];
  late HubConnection _hubConnection;

  @override
  void initState() {
    super.initState();
    _loadUsers();
    _loadChannels();
    _initSignalR();
  }

  Future<void> _initSignalR() async {
    _hubConnection = HubConnectionBuilder().withUrl('https://localhost:7219/voiceHub').build();
    await _hubConnection.start();
  }

  Future<void> _loadUsers() async {
    try {
      var fetchedUsers = await _userService.getUsers();
      setState(() {
        users = fetchedUsers;
      });
    } catch (e) {
      print(e);
    }
  }

  Future<void> _loadChannels() async {
    try {
      var fetchedChannels = await _voiceChannelService.getChannels();
      setState(() {
        channels = fetchedChannels;
      });
    } catch (e) {
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messenger'),
      ),
      body: users.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      Expanded(child: VoiceChannels(channels: channels, users: users, hubConnection: _hubConnection)),
                      const ControlPanel(),
                    ],
                  ),
                ),
                Expanded(
                  flex: 6,
                  child: Column(
                    children: [
                      Expanded(child: ChatHistory(users: users)),
                      const ChatInput(),
                    ],
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: UserPanel(users: users),
                ),
              ],
            ),
    );
  }
}
