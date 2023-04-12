const withTM = require("next-transpile-modules")(["@simplewebauthn/browser"]);

module.exports = withTM({ debug: true });
