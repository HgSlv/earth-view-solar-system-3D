const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");
const internalIp = require("internal-ip");
const portFinderSync = require("portfinder-sync");

const boldBlue = (text) => `\u001b[1m\u001b[34m${text}\u001b[39m\u001b[22m`;

module.exports = merge(commonConfiguration, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    host: "0.0.0.0",
    port: portFinderSync.getPort(8080),
    contentBase: "./dist",
    watchContentBase: true,
    open: true,
    https: false,
    useLocalIp: true,
    disableHostCheck: true,
    overlay: true,
    noInfo: true,
    after: function (app, server) {
      const port = server.options.port;
      const protocol = server.options.https ? "https" : "http";
      const localIp = internalIp.v4.sync();
      const networkUrl = `${protocol}://${localIp}:${port}`;
      const localUrl = `${protocol}://localhost:${port}`;

      console.log(
        `Project running at:\n  - ${boldBlue(networkUrl)}\n  - ${boldBlue(localUrl)}`,
      );
    },
  },
});
