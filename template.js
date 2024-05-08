//Node.js SDK v3 (client-side)

// Import required modules

var LaunchDarkly = require("launchdarkly-node-client-sdk");
const axios = require("axios");

var context = { kind: "user", key: "sample-feature" };
const flagName = "Site maintenance mode";
const flagKey = "sample-feature";
const sdkKey = "YOUR_SDK_KEY"; // Replace with your LaunchDarkly SDK Key

const PAGERDUTY_KEY = "YOUR_PAGERDUTY_INTEGRATION_KEY"; // Replace with your PagerDuty Integration Key

const client = LaunchDarkly.initialize(sdkKey, context);

client.waitForInitialization().then(() => {
  console.log("SDK successfully initialized!");
  client.on(`change:${flagKey}`, (newValue) => {
    console.log(`Feature flag "${flagName}" updated to "${newValue}"`);
    notifyPagerDuty(flagName, newValue);
  });
}).catch((error) => {
  console.error("SDK failed to initialize:", error);
  process.exit(1);
});

function notifyPagerDuty(flagName, flagValue) {
  const pagerDutyPayload = {
    routing_key: PAGERDUTY_KEY,
    dedup_key: `incident-${flagName}-${flagValue}`,
    event_action: "trigger",
    payload: {
      summary: `Feature flag "${flagName}" updated to "${flagValue}"`,
      source: "LaunchDarkly SDK",
      severity: "critical",
      custom_details: { flagName, flagValue },
    },
  };
  axios.post("https://events.eu.pagerduty.com/v2/enqueue", pagerDutyPayload) //if outside of EU use "https://events.pagerduty.com/v2/enqueue"
    .then(() => console.log("Incident sent to PagerDuty"))
    .catch((error) => console.error("Error sending to PagerDuty:", error));
}

