// file4: user_panel.dart
import 'package:flutter/material.dart';
import 'package:poshto/models/user_model.dart';

class UserPanel extends StatelessWidget {
  final List<UserModel> users;

  const UserPanel({super.key, required this.users});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[200],
      child: ListView.builder(
        itemCount: users.length,
        itemBuilder: (context, index) {
          final user = users[index];
          return ListTile(
            leading: CircleAvatar(
              backgroundImage: NetworkImage(user.avatarUrl),
            ),
            title: Text(user.name),
            trailing: Icon(
              Icons.circle,
              color: user.isOnline ? Colors.green : Colors.grey,
              size: 12,
            ),
          );
        },
      ),
    );
  }
}
