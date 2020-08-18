using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Com.Reactlibrary.RNBackgroundToForegroundService
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNBackgroundToForegroundServiceModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNBackgroundToForegroundServiceModule"/>.
        /// </summary>
        internal RNBackgroundToForegroundServiceModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNBackgroundToForegroundService";
            }
        }
    }
}
