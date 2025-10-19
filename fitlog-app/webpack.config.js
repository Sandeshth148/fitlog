const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'fitlog',
  
  remotes: {
    // Streaks MFE will be added here later
    // Example: "streaks": "http://localhost:4201/remoteEntry.js",
  },

  shared: shareAll({ 
    singleton: true, 
    strictVersion: true, 
    requiredVersion: 'auto' 
  }),
});
