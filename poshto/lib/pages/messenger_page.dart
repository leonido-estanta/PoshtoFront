import 'package:flutter/material.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/notifiers/voice_channel_notifier.dart';
import 'package:poshto/pages/app_header.dart';
import 'package:poshto/pages/side_bar.dart';
import 'package:poshto/pages/chat_history.dart';
import 'package:poshto/pages/chat_input.dart';
import 'package:provider/provider.dart';

class MessengerPage extends StatefulWidget {
  const MessengerPage({super.key});

  @override
  _MessengerPageState createState() => _MessengerPageState();
}

class _MessengerPageState extends State<MessengerPage> {
  @override
  Widget build(BuildContext context) {
    final currentUsers = Provider.of<List<UserModel>>(context);
    return Consumer<VoiceChannelNotifier>(
      builder: (context, notifier, child) {
        final currentChannel = notifier.currentChannel;
        return Scaffold(
          appBar: AppHeader(
            selectedIndex: 0,
            onItemSelected: (index) {
              if (index == 0) {
                Navigator.pushReplacementNamed(context, '/messenger');
              } else if (index == 1) {
                Navigator.pushReplacementNamed(context, '/call');
              }
            },
          ),
          body: currentUsers.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : Row(
                  children: [
                    const Expanded(
                      flex: 6,
                      child: Column(
                        children: [
                          Expanded(child: ChatHistory()),
                          ChatInput(),
                        ],
                      ),
                    ),
                    SideBarPage(currentChannel: currentChannel, currentUsers: currentUsers),
                  ],
                ),
        );
      },
    );
  }
}
