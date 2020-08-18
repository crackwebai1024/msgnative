//
//  netPerfWrapper.swift
//  MsgSafe
//
//  Created by colin on 15/11/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import Netperf

@objc
class netPerfWrapper: NSObject {
  @objc func startNetPerf() {
    print("USE LIB")
    let mySurvey = NetworkSurvey()
    mySurvey.runLibrary()
  }
}
