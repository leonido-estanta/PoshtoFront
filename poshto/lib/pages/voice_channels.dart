import 'package:flutter/material.dart';
import 'package:poshto/models/voice_channel_model.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/services/voice_channel_service.dart';
import 'package:provider/provider.dart';
import 'package:signalr_netcore/signalr_client.dart';

class VoiceChannels extends StatefulWidget {
  final List<VoiceChannelModel> channels;
  final List<UserModel> users;
  final HubConnection hubConnection;

  const VoiceChannels({
    super.key,
    required this.channels,
    required this.users,
    required this.hubConnection,
  });

  @override
  _VoiceChannelsState createState() => _VoiceChannelsState();
}

class _VoiceChannelsState extends State<VoiceChannels> {
  @override
  void initState() {
    super.initState();
    widget.hubConnection.on('VoiceConnect', _handleConnect);
    widget.hubConnection.on('VoiceDisconnect', _handleDisconnect);
  }

  void _handleConnect(List<Object?>? args) {
    if (args == null) return;
    var data = args[0] as Map<String, dynamic>;
    var userId = data['userId'] as int;
    var channelId = data['channelId'] as int;

    var channelIndex = widget.channels.indexWhere((c) => c.id == channelId);
    if (channelIndex != -1) {
      setState(() {
        widget.channels[channelIndex].connectedUsers.add(userId);
      });
    }
  }

  void _handleDisconnect(List<Object?>? args) {
    if (args == null) return;
    var data = args[0] as Map<String, dynamic>;
    var userId = data['userId'] as int;
    var channelId = data['channelId'] as int;

    var channelIndex = widget.channels.indexWhere((c) => c.id == channelId);
    if (channelIndex != -1) {
      setState(() {
        widget.channels[channelIndex].connectedUsers.remove(userId);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final voiceChannelService = Provider.of<VoiceChannelService>(context, listen: false);

    return Container(
      color: Colors.grey[200],
      child: ListView.builder(
        itemCount: widget.channels.length,
        itemBuilder: (context, index) {
          final channel = widget.channels[index];
          final channelUsers = widget.users.where((user) => channel.connectedUsers.contains(user.id)).toList();

          return ListTile(
            title: Text(channel.name),
            onTap: () async {
              await voiceChannelService.connectUserToChannel(channel.id);
            },
            subtitle: Row(
              children: channelUsers
                  .map((user) => Padding(
                        padding: const EdgeInsets.only(right: 4.0),
                        child: CircleAvatar(
                          backgroundImage: NetworkImage(user.avatarUrl),
                          radius: 10,
                        ),
                      ))
                  .toList(),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    widget.hubConnection.off('VoiceConnect', method: _handleConnect);
    widget.hubConnection.off('VoiceDisconnect', method: _handleDisconnect);
    super.dispose();
  }
}