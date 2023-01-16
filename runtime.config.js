const publicRuntimeConfig = {
  // Will be available on both server and client
  mixpanelEnv: process.env.MIXPANEL_ENV,
  mixpanelAPIKey: process.env.MIXPANEL_KEY,
  buildHash: process.env.COMMIT_SHA,
  buildDate: Date.now(),
  sentryRelease: process.env.SENTRY_RELEASE,
  authClientId: process.env.AUTH_CLIENT_ID,
  torusVerifier: process.env.TORUS_VERIFIER,
  authDomain: process.env.AUTH_DOMAIN,
};

module.exports = {
  publicRuntimeConfig: publicRuntimeConfig,
};
