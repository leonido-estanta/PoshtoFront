import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:poshto/main.dart';
import 'package:poshto/models/message_model.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/services/chat_service.dart';
import 'package:provider/provider.dart';
import 'package:signalr_netcore/signalr_client.dart';

class ChatHistory extends StatefulWidget {
  const ChatHistory({super.key});

  @override
  State<ChatHistory> createState() => _ChatHistoryState();
}

class _ChatHistoryState extends State<ChatHistory> {
  final List<MessageModel> _messages = [];
  final ChatService _chatService = ChatService();
  final ScrollController _scrollController = ScrollController();
  late HubConnection _hubConnection;
  int _skip = 0;
  final int _take = 50;
  final storage = const FlutterSecureStorage();
  String? _userId;

  @override
  void initState() {
    super.initState();
    
    _loadMessages();
    _scrollController.addListener(_onScroll);
    _loadUserId();
  }

  void _loadUserId() async {
    _userId = await storage.read(key: 'userId');
  }

  void _initializeSignalR(HubConnection hubConnection) {
    _hubConnection = hubConnection;
    _hubConnection.on("ReceiveMessage", _handleSignalRMessage);
  }

  void _handleSignalRMessage(List<dynamic>? arguments) {
    if (arguments != null && arguments.isNotEmpty) {
      var message = MessageModel.fromJson(arguments[0]);
      setState(() {
        _messages.add(message);
        _messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      });
    }
  }

  void _loadMessages() async {
    List<MessageModel> newMessages = await _chatService.getMessages(_skip, _take);
    if (newMessages.isNotEmpty) {
      setState(() {
        _messages.insertAll(0, newMessages);
        _messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
        _skip += _take;
      });
    }
  }

  void _onScroll() {
    if (_scrollController.position.atEdge && _scrollController.position.pixels == 0) {
      _loadMessages();
    }
  }

  @override
  Widget build(BuildContext context) {
    final hubConnection = Provider.of<ChatHubConnection>(context).connection;
    _initializeSignalR(hubConnection);

    List<UserModel> users = Provider.of<List<UserModel>>(context, listen: false);
    String lastSenderId = '';
    
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.only(bottom: 10.0),
        child: ListView.builder(
          controller: _scrollController,
          itemCount: _messages.length,
          itemBuilder: (context, index) {
            final message = _messages[index];
            final user = users.firstWhere((user) => user.id == message.senderId);
            final isFromMe = message.senderId.toString() == _userId;
            final showAvatar = message.senderId.toString() != lastSenderId;

            if (showAvatar) lastSenderId = message.senderId.toString();

            return Align(
              alignment: isFromMe ? Alignment.centerRight : Alignment.centerLeft,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!isFromMe && showAvatar) CircleAvatar(backgroundImage: NetworkImage(user.avatarUrl)),
                  Container(
                    padding: const EdgeInsets.all(8.0),
                    margin: const EdgeInsets.symmetric(vertical: 2.0, horizontal: 8.0),
                    decoration: BoxDecoration(
                      color: isFromMe ? Colors.lightBlue : Colors.grey[300],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(message.text),
                  ),
                  if (isFromMe && showAvatar) CircleAvatar(backgroundImage: NetworkImage(user.avatarUrl)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }


  @override
  void dispose() {
    _scrollController.dispose();
    _hubConnection.stop();
    super.dispose();
  }
}
