import 'package:flutter/material.dart';
import 'package:poshto/models/message_model.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/models/voice_channel_model.dart';
import 'package:poshto/services/user_service.dart';
import 'chat_history.dart';
import 'chat_input.dart';
import 'user_panel.dart';
import 'voice_channels.dart';
import 'control_panel.dart';

class MessengerPage extends StatefulWidget {
  MessengerPage({Key? key}) : super(key: key);

  @override
  _MessengerPageState createState() => _MessengerPageState();
}

class _MessengerPageState extends State<MessengerPage> {
  final UserService _userService = UserService();
  late List<UserModel> users = [];
  final List<MessageModel> messages = [
    MessageModel(
      id: 1,
      senderId: 1,
      text: 'Test message1',
      timestamp: DateTime.now(),
      isFromMe: true,
    ),
    MessageModel(
      id: 2,
      senderId: 3,
      text: 'Test message2',
      timestamp: DateTime.now(),
      isFromMe: false,
    ),
  ];
  final List<VoiceChannelModel> channels = [
    VoiceChannelModel(
      id: '1',
      name: 'Voice1',
      userIds: ['1', '3']
    ),
    VoiceChannelModel(
      id: '2',
      name: 'Voice2',
      userIds: []
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadUsers();
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
                      Expanded(child: VoiceChannels(channels: channels, users: users)),
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
