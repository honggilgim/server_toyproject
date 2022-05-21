import 'package:flutter/material.dart';
import 'dart:async';

import 'package:flutter/services.dart';
import 'package:bootpay_api/bootpay_api.dart';
import 'package:bootpay_api/model/payload.dart';
import 'package:bootpay_api/model/extra.dart';
import 'package:bootpay_api/model/user.dart';
import 'package:bootpay_api/model/item.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Test",
      home: TestPage(),
    );
  }
}

class TestPage extends StatefulWidget {
  @override
  TestPageState createState() => TestPageState();
}

class TestPageState extends State<TestPage> {
//  String _platformVersion = 'Unknown';

  @override
  void initState() {
    super.initState();
//    initPlatformState();
  }
 

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Plugin example app'),
        ),
        body: Container(
          child:  RaisedButton(
            onPressed: () {
              goBootpayRequest(context);
            },
            child: Text("부트페이 결제요청"),
          ),
        )
    );
  }

  static Future<void> request(BuildContext context, Payload payload,
      {User user,
      List<Item> items,
      Extra extra,
      StringCallback onDone,
      StringCallback onReady,
      StringCallback onCancel,
      StringCallback onError}) async {

    payload.applicationId = Platform.isIOS
        ? payload.iosApplicationId
        : payload.androidApplicationId;

    if (user == null) user = User();
    if (items == null) items = [];
    if (extra == null) extra = Extra();

    Map<String, dynamic> params = {
      "payload": payload.toJson(),
      "user": user.toJson(),
      "items": items.map((v) => v.toJson()).toList(),
      "extra": extra.toJson()
    };


    Map<dynamic, dynamic> result = await _channel.invokeMethod(
      "bootpayRequest",
      params,
    );


    String method = result["method"];
    if (method == null) method = result["action"];

    String message = result["message"];
    if (message == null) message = result["msg"];



    //confirm 생략
    if (method == 'onDone' || method == 'BootpayDone') {
      if (onDone != null) onDone(message);
    } else if (method == 'onReady' || method == 'BootpayReady') {
      if (onReady != null) onReady(message);
    } else if (method == 'onCancel' || method == 'BootpayCancel') {
      if (onCancel != null) onCancel(message);
    } else if (method == 'onError' || method == 'BootpayError') {
      if (onError != null) onError(message);
    } else if (result['receipt_id'] != null && result['receipt_id'].isNotEmpty) {
      if (onDone != null) onDone(jsonEncode(result));
    }
  }
}