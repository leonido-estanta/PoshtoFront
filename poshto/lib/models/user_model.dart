class UserModel {
  final int id;
  final String name;
  final String avatarUrl;
  final bool isOnline;

  UserModel({
    required this.id,
    required this.name,
    required this.avatarUrl,
    required this.isOnline,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      avatarUrl: json['avatarUrl'],
      isOnline: json['isOnline']
    );
  }
}
