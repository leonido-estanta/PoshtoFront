import 'package:flutter/material.dart';
import 'package:poshto/pages/messanger_page.dart';
import 'package:poshto/services/animated_border_highlight_container.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'services/voice_channel_service.dart';


void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<VoiceChannelService>(create: (_) => VoiceChannelService())
      ],
      child: MaterialApp(
        home: const Scaffold(
          body: Center(
            child: MainContent(),
          ),
        ),
        routes: {
          '/messenger': (context) => const MessengerPage(),
        },
      ),
    );
  }
}

class MainContent extends StatefulWidget {
  const MainContent({super.key});

  @override
  State<MainContent> createState() => _MainContentState();
}

class _MainContentState extends State<MainContent> {
  final storage = const FlutterSecureStorage();
  bool isSwapped = false;
  List<bool> fieldsEnabled = List.filled(8, true);

  bool isFieldEnabled(int index) {
    return fieldsEnabled[index];
  }

  Future<void> loginRequest(String seed) async {
  final response = await http.post(Uri.parse('https://localhost:7219/Auth/Login?seedPhrase=$seed'));
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    await storage.write(key: 'authToken', value: data['token']);
    await storage.write(key: 'userId', value: data['user']['id'].toString());
  } else {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${response.body}')));
  }
}


  Future registerRequest(String seed) async {
    final response = await http.post(Uri.parse('https://localhost:7219/Auth/Register?seedPhrase=$seed'));
    if (response.statusCode != 200) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${response.body}')));
    }
  }

  void handleRegister() async {
    if (!isSwapped) {
      setState(() {
        isSwapped = true;
      });
      final response = await http.get(Uri.parse('https://localhost:7219/Generator/Generate'));
      if (response.statusCode == 200) {
        List<String> phrases = List<String>.from(response.body.split(' '));
        for (var i = 0; i < phrases.length; i++) {
          AnimatedBorderHighlightContainerState.controllers[i].text = phrases[i];
          fieldsEnabled[i] = false;
        }
      } else {
        ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Error fetching phrases')));
      }
    } else {
      var seed = AnimatedBorderHighlightContainerState.controllers.map((e) => e.text).join(' ');
      await registerRequest(seed);
      await loginRequest(seed);
      Navigator.of(context).pushNamed('/messenger');
    }
  }

  @override
  Widget build(BuildContext context) {
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
                  await loginRequest(seed);
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
