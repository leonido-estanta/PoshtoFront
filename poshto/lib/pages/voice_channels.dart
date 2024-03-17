import 'package:flutter/material.dart';
import 'package:poshto/models/voice_channel_model.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/notifiers/voice_channel_notifier.dart';
import 'package:poshto/services/voice_channel_service.dart';
import 'package:provider/provider.dart';
import 'package:signalr_netcore/signalr_client.dart';

class VoiceChannels extends StatefulWidget {
  final HubConnection hubConnection;

  const VoiceChannels({
    super.key,
    required this.hubConnection
  });

  @override
  _VoiceChannelsState createState() => _VoiceChannelsState();
}

class _VoiceChannelsState extends State<VoiceChannels> {
  late List<VoiceChannelModel> channels;
  late List<UserModel> users;

  @override
  void initState() {
    super.initState();

    channels = Provider.of<List<VoiceChannelModel>>(context, listen: false);
    users = Provider.of<List<UserModel>>(context, listen: false);

    widget.hubConnection.on('VoiceConnect', _handleConnect);
    widget.hubConnection.on('VoiceDisconnect', _handleDisconnect);
  }

  void _handleConnect(List<Object?>? args) {
    if (args == null) return;
    var data = args[0] as Map<String, dynamic>;
    var userId = data['userId'] as int;
    var channelId = data['channelId'] as int;

    var channelIndex = channels.indexWhere((c) => c.id == channelId);
    if (channelIndex != -1) {
      setState(() {
        channels[channelIndex].connectedUsers.add(userId);
      });
    }

    context.read<VoiceChannelModel?>()!.value = channels[channelIndex];
  }

  void _handleDisconnect(List<Object?>? args) {
    if (args == null) return;
    var data = args[0] as Map<String, dynamic>;
    var userId = data['userId'] as int;
    var channelId = data['channelId'] as int;

    var channelIndex = channels.indexWhere((c) => c.id == channelId);
    if (channelIndex != -1) {
      setState(() {
        channels[channelIndex].connectedUsers.remove(userId);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<List<VoiceChannelModel>, List<UserModel>>(
      builder: (context, channels, users, child) {
        final voiceChannelService = Provider.of<VoiceChannelService>(context, listen: false);
        return ListView.builder(
          itemCount: channels.length,
          itemBuilder: (context, index) {
            final channel = channels[index];
            final channelUsers = users.where((user) => channel.connectedUsers.contains(user.id)).toList();

            return ListTile(
              title: Text(channel.name),
              onTap: () async {
                await voiceChannelService.connectUserToChannel(channel.id);
                Provider.of<VoiceChannelModel?>(context, listen: false)?.value = channel;
                _handleTapChannel(channel);
              },
              subtitle: Row(
                children: channelUsers
                    .map((user) => Padding(
                          padding: const EdgeInsets.only(right: 4.0),
                          child: CircleAvatar(
                            backgroundImage: NetworkImage(user.avatarUrl),
                            radius: 15,
                          ),
                        ))
                    .toList(),
              ),
            );
          },
        );
      },
    );
  }

  void _handleTapChannel(VoiceChannelModel channel) {
    final notifier = Provider.of<VoiceChannelNotifier>(context, listen: false);
    notifier.setCurrentChannel(channel);
  }

  @override
  void dispose() {
    widget.hubConnection.off('VoiceConnect', method: _handleConnect);
    widget.hubConnection.off('VoiceDisconnect', method: _handleDisconnect);
    super.dispose();
  }
}