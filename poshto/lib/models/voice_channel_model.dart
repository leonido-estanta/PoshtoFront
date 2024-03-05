class VoiceChannelModel {
  final String id;
  final String name;
  final List<String> userIds; // IDs of users in this channel

  VoiceChannelModel({
    required this.id,
    required this.name,
    required this.userIds,
  });
}
