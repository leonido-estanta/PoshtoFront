import 'package:flutter/material.dart';
import 'package:poshto/main.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/models/voice_channel_model.dart';
import 'package:poshto/notifiers/voice_channel_notifier.dart';
import 'package:poshto/pages/app_header.dart';
import 'package:poshto/pages/voice_channels.dart';
import 'package:poshto/pages/side_bar.dart';
import 'package:poshto/pages/control_panel.dart';
import 'package:provider/provider.dart';

class CallPage extends StatefulWidget {
  const CallPage({super.key});

  @override
  State<CallPage> createState() => _CallPageState();
}

class _CallPageState extends State<CallPage> {
  VoiceChannelModel? currentChannel;

  @override
  Widget build(BuildContext context) {
    return Consumer<VoiceChannelNotifier>(
      builder: (context, notifier, child) {
        currentChannel = notifier.currentChannel;
        final hubConnection = Provider.of<VoiceHubConnection>(context);
        final allUsers = Provider.of<List<UserModel>>(context);
        final users = allUsers.where((user) => currentChannel?.connectedUsers.contains(user.id) ?? false).toList();

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
          body: Row(
            children: [
              Expanded(
                flex: 1,
                child: Column(
                  children: [
                    Expanded(child: VoiceChannels(hubConnection: hubConnection.connection)),
                    const ControlPanel(),
                  ],
                ),
              ),
              Expanded(
                flex: 3,
                child: Container(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Text(
                        currentChannel?.name ?? 'Select a channel',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      Expanded(
                        child: GridView.builder(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            childAspectRatio: 1,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                          ),
                          itemCount: users.length,
                          itemBuilder: (context, index) {
                            final user = users[index];
                            return Column(
                              children: [
                                Expanded(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.0),
                                      image: DecorationImage(
                                        fit: BoxFit.cover,
                                        image: NetworkImage(user.avatarUrl),
                                      ),
                                    ),
                                  ),
                                ),
                                Text(user.name),
                              ],
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SideBarPage(currentChannel: currentChannel, currentUsers: allUsers),
            ],
          ),
        );
      },
    );
  }
}
