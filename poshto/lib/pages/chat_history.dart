import 'package:flutter/material.dart';
import 'package:poshto/models/message_model.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/services/chat_service.dart';

class ChatHistory extends StatefulWidget {
  final List<UserModel> users;

  const ChatHistory({super.key, required this.users});

  @override
  State<ChatHistory> createState() => _ChatHistoryState();
}

class _ChatHistoryState extends State<ChatHistory> {
  final List<MessageModel> _messages = [];
  final ChatService _chatService = ChatService();
  final ScrollController _scrollController = ScrollController();
  int _skip = 0;
  final int _take = 50;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _scrollController.addListener(_onScroll);
  }

  void _loadMessages() async {
    List<MessageModel> messages = await _chatService.getMessages(_skip, _take);
    setState(() {
      _messages.addAll(messages);
    });
    _skip += _take;
  }

  void _onScroll() {
    if (_scrollController.position.maxScrollExtent == _scrollController.offset) {
      _loadMessages();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[200],
      child: ListView.builder(
        itemCount: _messages.length,
        itemBuilder: (context, index) {
          final message = _messages[index];
          final user = widget.users.firstWhere((user) => user.id == message.senderId);
          return Align(
            alignment: message.isFromMe ? Alignment.centerRight : Alignment.centerLeft,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!message.isFromMe) CircleAvatar(backgroundImage: NetworkImage(user.avatarUrl)),
                Container(
                  padding: const EdgeInsets.all(8.0),
                  margin: const EdgeInsets.symmetric(vertical: 2.0, horizontal: 8.0),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(message.text),
                ),
                if (message.isFromMe) CircleAvatar(backgroundImage: NetworkImage(user.avatarUrl)),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}