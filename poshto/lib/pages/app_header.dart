import 'package:flutter/material.dart';

class AppHeader extends StatefulWidget implements PreferredSizeWidget {
  final int selectedIndex;
  final Function(int) onItemSelected;

  const AppHeader({
    super.key,
    required this.selectedIndex,
    required this.onItemSelected,
  });

  @override
  State<AppHeader> createState() => _AppHeaderState();

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class _AppHeaderState extends State<AppHeader> {
  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text('Application'),
      actions: [
        IconButton(
          icon: Icon(Icons.chat, color: widget.selectedIndex == 0 ? Colors.blue : Colors.grey),
          onPressed: () => widget.onItemSelected(0),
        ),
        IconButton(
          icon: Icon(Icons.call, color: widget.selectedIndex == 1 ? Colors.blue : Colors.grey),
          onPressed: () => widget.onItemSelected(1),
        ),
      ],
    );
  }
}