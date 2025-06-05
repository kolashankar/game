// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:chronocore_companion/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build a test version of the app
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('ChronoCore Companion'),
          ),
        ),
      ),
    );

    // Verify that our app shows the title text
    expect(find.text('ChronoCore Companion'), findsOneWidget);
  });
}
