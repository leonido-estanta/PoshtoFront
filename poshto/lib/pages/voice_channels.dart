// file5: voice_channels.dart (Updated)
import 'package:flutter/material.dart';
import '../models/voice_channel_model.dart';
import '../models/user_model.dart';

class VoiceChannels extends StatelessWidget {
  final List<VoiceChannelModel> channels;
  final List<UserModel> users;

  const VoiceChannels({super.key, required this.channels, required this.users});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[200],
      child: ListView.builder(
        itemCount: channels.length,
        itemBuilder: (context, index) {
          final channel = channels[index];
          final channelUsers = users.where((user) => channel.userIds.contains(user.id)).toList();
          return ListTile(
            title: Text(channel.name),
            onTap: () {},
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
}
