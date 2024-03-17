class VoiceChannelModel {
  final int id;
  final String name;
  List<int> connectedUsers = [];

  VoiceChannelModel({
    required this.id,
    required this.name,
  });

  factory VoiceChannelModel.fromJson(Map<String, dynamic> json) {
    return VoiceChannelModel(
      id: json['id'],
      name: json['name'],
    );
  }

  set value(VoiceChannelModel value) {
    connectedUsers = value.connectedUsers;
  }

}
