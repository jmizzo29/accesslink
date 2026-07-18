/**
 * Cost Tracking Configuration for AccessLink
 * 
 * Enables automatic LLM cost tracking for this application.
 */

export const costTrackingConfig = {
  // Enable cost tracking by default
  enabled: process.env.FORGEOS_COST_TRACKING_ENABLED !== 'false',

  // Storage path for logs
  storagePath: process.env.FORGEOS_COST_TRACKING_PATH || './logs/llm-costs',

  // Auto-persist interval (milliseconds)
  autoPersistIntervalMs:
    parseInt(process.env.FORGEOS_COST_TRACKING_AUTO_PERSIST_MS || '60000', 10),

  // Enable Slack notifications
  slackNotifications: process.env.SLACK_WEBHOOK_URL !== undefined,

  // Enable email notifications
  emailNotifications: process.env.FORGEOS_EMAIL_FROM !== undefined,

  // Production only
  productionOnly: process.env.FORGEOS_COST_TRACKING_PRODUCTION_ONLY === 'true',
};

export default costTrackingConfig;
