import 'package:flutter/material.dart';
import 'package:poshto/models/user_model.dart';
import 'package:poshto/models/voice_channel_model.dart';
import 'package:poshto/notifiers/voice_channel_notifier.dart';
import 'package:poshto/pages/call_page.dart';
import 'package:poshto/pages/messenger_page.dart';
import 'package:poshto/services/animated_border_highlight_container.dart';
import 'dart:async';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:poshto/services/auth_service.dart';
import 'package:poshto/services/user_service.dart';
import 'package:provider/provider.dart';
import 'package:signalr_netcore/hub_connection.dart';
import 'package:signalr_netcore/hub_connection_builder.dart';
import 'services/voice_channel_service.dart';
import 'package:rxdart/rxdart.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  _MainAppState createState() => _MainAppState();
}

class ChatHubConnection {
  final HubConnection connection;

  ChatHubConnection(this.connection);
}

class VoiceHubConnection {
  final HubConnection connection;

  VoiceHubConnection(this.connection);
}


class _MainAppState extends State<MainApp> {
  late HubConnection chatConnection = HubConnectionBuilder().withUrl('https://localhost:7219/chatHub').build();
  late HubConnection voiceConnection = HubConnectionBuilder().withUrl('https://localhost:7219/voiceHub').build();

  late ChatHubConnection chatHubConnection = ChatHubConnection(chatConnection);
  late VoiceHubConnection voiceHubConnection = VoiceHubConnection(voiceConnection);

  late UserService userService;
  late VoiceChannelService voiceChannelService;
  final BehaviorSubject<List<VoiceChannelModel>> _channelStreamController = BehaviorSubject();
  final BehaviorSubject<List<UserModel>> _userStreamController = BehaviorSubject();

  @override
  void initState() {
    super.initState();
    userService = UserService();
    voiceChannelService = VoiceChannelService();

    initHubConnection();
    initChannelsAndUsers();
  }

  Future<void> initHubConnection() async {
    await chatHubConnection.connection.start();
    await voiceHubConnection.connection.start();
  }

  void initChannelsAndUsers() async {
    var channels = await voiceChannelService.getChannels();
    var usersList = await userService.getUsers();
    _channelStreamController.add(channels);
    _userStreamController.add(usersList);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<VoiceChannelService>(create: (_) => voiceChannelService),
        Provider<AuthService>(create: (_) => AuthService()),
        Provider<UserService>(create: (_) => userService),
        StreamProvider<List<VoiceChannelModel>>(create: (_) => _channelStreamController.stream, initialData: const []),
        StreamProvider<List<UserModel>>(create: (_) => _userStreamController.stream, initialData: const []),
        Provider<ChatHubConnection>(create: (_) => chatHubConnection),
        Provider<VoiceHubConnection>(create: (_) => voiceHubConnection),
        ChangeNotifierProvider(create: (_) => VoiceChannelNotifier())
      ],
      child: MaterialApp(
        home: const Scaffold(
          body: Center(
            child: MainContent(),
          ),
        ),
        routes: {
          '/messenger': (context) => const MessengerPage(),
          '/call': (context) => const CallPage(),
        },
      ),
    );
  }

  @override
  void dispose() {
    chatHubConnection.connection.stop();
    voiceHubConnection.connection.stop();
    _channelStreamController.close();
    _userStreamController.close();
    super.dispose();
  }
}

class MainContent extends StatefulWidget {
  const MainContent({super.key});

  @override
  State<MainContent> createState() => _MainContentState();
}

class _MainContentState extends State<MainContent> {
  late final Stream<List<VoiceChannelModel>> voiceChannelStream;
  late final Stream<List<UserModel>> userStream;
  final storage = const FlutterSecureStorage();
  bool isSwapped = false;
  List<bool> fieldsEnabled = List.filled(8, true);
  late final List<VoiceChannelModel> voiceChannels;
  late final List<UserModel> users;

  @override
  void initState() {
    super.initState();
    voiceChannels = Provider.of<List<VoiceChannelModel>>(context, listen: false);
    users = Provider.of<List<UserModel>>(context, listen: false);
  }

  bool isFieldEnabled(int index) {
    return fieldsEnabled[index];
  }

  Future<void> handleRegister() async {
    final authService = Provider.of<AuthService>(context, listen: false);

    if (!isSwapped) {
      setState(() {
        isSwapped = true;
      });
      List<String>? phrases = await authService.generateSeed(context);
      if (phrases != null) {
        for (var i = 0; i < phrases.length; i++) {
          AnimatedBorderHighlightContainerState.controllers[i].text = phrases[i];
          fieldsEnabled[i] = false;
        }
      }
    } else {
      var seed = AnimatedBorderHighlightContainerState.controllers.map((e) => e.text).join(' ');
      await authService.registerRequest(context, seed);
      await authService.loginRequest(context, seed);
      Navigator.of(context).pushNamed('/messenger');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);

    return Stack(
      alignment: Alignment.center,
      children: [
        Center(child: AnimatedBorderHighlightContainer(isFieldEnabled: isFieldEnabled)),

        AnimatedAlign(
          alignment: isSwapped ? Alignment.centerRight : Alignment.centerLeft,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
          child: Padding(
            padding: const EdgeInsets.only(left: 300, right: 300),
            child: CenterButton(
              title: 'Register',
              onPressed: () {
                handleRegister();
              },
            ),
          ),
        ),
        AnimatedAlign(
          alignment: isSwapped ? Alignment.centerLeft : Alignment.centerRight,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
          child: Padding(
            padding: const EdgeInsets.only(left: 300, right: 300),
            child: CenterButton(
              title: 'Login',
              onPressed: () async {
                if (isSwapped) {
                  setState(() {
                    isSwapped = false;
                    for (int i = 0; i < AnimatedBorderHighlightContainerState.controllers.length; i++) {
                      AnimatedBorderHighlightContainerState.controllers[i].clear();
                      fieldsEnabled[i] = true;
                    }
                  });
                } else {
                  var seed = AnimatedBorderHighlightContainerState.controllers.map((e) => e.text).join(' ');
                  await authService.loginRequest(context, seed);
                  Navigator.of(context).pushNamed('/messenger');
                }
              },
            ),
          ),
        ),
      ],
    );
  }
}

class CenterButton extends StatelessWidget {
  final String title;
  final VoidCallback onPressed;

  const CenterButton({super.key, required this.title, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(title),
    );
  }
}