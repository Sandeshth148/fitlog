const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'fitlog',
  
  remotes: {
    // Streaks MFE will be added here
    // "streaks": "http://localhost:4201/remoteEntry.js",
  },

  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
  },

  // Expose services for remotes to use
  exposes: {
    './UserService': './src/app/core/services/user.service.ts',
    './StorageService': './src/app/core/services/storage.service.ts',
    './ThemeService': './src/app/core/services/theme.service.ts',
  },
});
