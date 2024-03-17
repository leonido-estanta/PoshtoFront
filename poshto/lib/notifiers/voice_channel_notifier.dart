import 'package:flutter/material.dart';
import 'package:poshto/models/voice_channel_model.dart';

class VoiceChannelNotifier with ChangeNotifier {
  VoiceChannelModel? _currentChannel;

  VoiceChannelModel? get currentChannel => _currentChannel;

  void setCurrentChannel(VoiceChannelModel channel) {
    _currentChannel = channel;
    notifyListeners();
  }
}
