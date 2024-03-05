import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AnimatedBorderHighlightContainer extends StatefulWidget {
  final bool Function(int) isFieldEnabled;
  const AnimatedBorderHighlightContainer({super.key, required this.isFieldEnabled});

  @override
  State<AnimatedBorderHighlightContainer> createState() =>
      AnimatedBorderHighlightContainerState();
}

class AnimatedBorderHighlightContainerState
    extends State<AnimatedBorderHighlightContainer>
    with SingleTickerProviderStateMixin {
  static final List<TextEditingController> controllers =
      List.generate(8, (index) => TextEditingController());
  late AnimationController _animationController;
  late Animation<double> _borderAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _borderAnimation = Tween<double>(begin: 0.0, end: 0.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.linear),
    );

    for (var controller in controllers) {
      controller.addListener(_checkFields);
      controller.addListener(() => _handlePaste(controller));
    }
  }

  void _handlePaste(TextEditingController controller) async {
    if (!controller.text.contains(' ')) return;
    ClipboardData? data = await Clipboard.getData(Clipboard.kTextPlain);
    final pastedText = data?.text ?? '';
    final words = pastedText.split(RegExp('\\s+')).where((word) => word.isNotEmpty).toList();
    if (words.length > 1 && words.length <= controllers.length) {
      for (int i = 0; i < controllers.length; i++) {
        if (i < words.length) {
          controllers[i].text = words[i];
        } else {
          controllers[i].clear();
        }
      }
    }
  }

  void _checkFields() {
    int filledFields = controllers.where((c) => c.text.isNotEmpty).length;
    _borderAnimation = Tween<double>(
      begin: _borderAnimation.value,
      end: filledFields / controllers.length,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.linear),
    );

    _animationController
      ..reset()
      ..forward();
  }

  @override
  void dispose() {
    for (var controller in controllers) {
      controller.dispose();
    }
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _borderAnimation,
      builder: (context, child) {
        return CustomPaint(
          painter: BorderPainter(progress: _borderAnimation.value),
          child: Container(
            width: 400,
            height: 115,
            padding: const EdgeInsets.all(8),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 4,
                mainAxisSpacing: 4,
                childAspectRatio: (1 / 0.5),
              ),
              itemCount: controllers.length,
              itemBuilder: (BuildContext context, int index) {
                return TextField(
                  controller: controllers[index],
                  readOnly: !widget.isFieldEnabled(index),
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }
}

class BorderPainter extends CustomPainter {
  final double progress;

  BorderPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    double lengthPerSide = (size.width * 2 + size.height * 2) * progress;
    Path path = Path();

    if (lengthPerSide <= size.width) {
      path.moveTo(0, 0);
      path.lineTo(lengthPerSide, 0);
    } else if (lengthPerSide <= size.width + size.height) {
      path.moveTo(0, 0);
      path.lineTo(size.width, 0);
      path.lineTo(size.width, lengthPerSide - size.width);
    } else if (lengthPerSide <= size.width * 2 + size.height) {
      path.moveTo(0, 0);
      path.lineTo(size.width, 0);
      path.lineTo(size.width, size.height);
      path.lineTo(size.width - (lengthPerSide - size.width - size.height), size.height);
    } else {
      path.moveTo(0, 0);
      path.lineTo(size.width, 0);
      path.lineTo(size.width, size.height);
      path.lineTo(0, size.height);
      path.lineTo(0, size.height - (lengthPerSide - size.width * 2 - size.height));
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
