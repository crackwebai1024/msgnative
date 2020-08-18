using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Import.Service.RNImportService
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNImportServiceModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNImportServiceModule"/>.
        /// </summary>
        internal RNImportServiceModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNImportService";
            }
        }
    }
}
