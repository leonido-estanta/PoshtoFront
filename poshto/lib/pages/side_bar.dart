import 'package:flutter/material.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/models/voice_channel_model.dart';

class SideBarPage extends StatefulWidget {
  final VoiceChannelModel? currentChannel;
  final List<UserModel> currentUsers;

  const SideBarPage({super.key, required this.currentChannel, required this.currentUsers});

  @override
  State<SideBarPage> createState() => _SideBarPageState();
}

class _SideBarPageState extends State<SideBarPage> {
  List<Widget> _widgets = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateWidgets();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _updateWidgets();
  }

  @override
  void didUpdateWidget(covariant SideBarPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentChannel != widget.currentChannel || oldWidget.currentUsers != widget.currentUsers) {
      _updateWidgets();
    }
  }

  void _updateWidgets() {
    setState(() {
      _widgets = [
        if (widget.currentChannel != null)
          CurrentChannelWidget(channel: widget.currentChannel!, users: widget.currentUsers, key: UniqueKey()),
        UserListWidget(users: widget.currentUsers, key: UniqueKey()),
        DraggableWidget(height: 100, key: UniqueKey()),
        DraggableWidget(height: 200, key: UniqueKey()),
        DraggableWidget(height: 100, key: UniqueKey()),
        DraggableWidget(height: 200, key: UniqueKey())
      ];
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: MediaQuery.of(context).size.width * 0.2,
      child: ReorderableListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        buildDefaultDragHandles: false,
        onReorder: (oldIndex, newIndex) {
          setState(() {
            if (newIndex > oldIndex) {
              newIndex--;
            }
            final item = _widgets.removeAt(oldIndex);
            _widgets.insert(newIndex, item);
          });
        },
        children: _widgets.map((widget) {
          return Padding(
            key: ValueKey('padding_${_widgets.indexOf(widget)}'),
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: ReorderableDragStartListener(
                index: _widgets.indexOf(widget),
                child: widget,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class CurrentChannelWidget extends StatelessWidget {
  final VoiceChannelModel channel;
  final List<UserModel> users;

  const CurrentChannelWidget({required this.channel, required this.users, required super.key});

  @override
  Widget build(BuildContext context) {
    final channelUsers = users.where((user) => channel.connectedUsers.contains(user.id)).toList();

    return Container(
      height: 100,
      decoration: BoxDecoration(
        color: Colors.green,
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
            title: Text(channel.name),
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
            )
          )
    );
  }
}

class UserListWidget extends StatelessWidget {
  final List<UserModel> users;

  const UserListWidget({required this.users, required super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 250,
      decoration: BoxDecoration(
        color: Colors.green,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Container(
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
    )
    );
  }
}

class DraggableWidget extends StatelessWidget {
  final double height;

  const DraggableWidget({required this.height, required super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.blue,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Center(
        child: ElevatedButton(
          onPressed: () {},
          child: const Text('Click Me'),
        ),
      ),
    );
  }
}