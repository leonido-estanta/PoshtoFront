class MessageModel {
  final int id;
  final int senderId;
  final String text;
  final DateTime timestamp;
  final bool isFromMe;

  MessageModel({
    required this.id,
    required this.senderId,
    required this.text,
    required this.timestamp,
    this.isFromMe = false,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'],
      senderId: json['senderId'],
      text: json['text'],
      timestamp: DateTime.parse(json['timestamp']),
      isFromMe: json['isFromMe'],
    );
  }
}