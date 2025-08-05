/**
 * CodeDAO Dashboard SDK
 * The first SDK for multi-AI collaboration transparency
 */

import { AgentLogger } from './agentLogger.js';
import { Dashboard } from './dashboard.js';
import { schema } from './schema.js';

// Main exports
export { AgentLogger, Dashboard, schema };

// Convenience methods
export const logActivity = AgentLogger.log.bind(AgentLogger);
export const renderDashboard = Dashboard.render.bind(Dashboard);
export const getActivities = AgentLogger.getActivities.bind(AgentLogger);
export const clearActivities = AgentLogger.clear.bind(AgentLogger);

// Version
export const version = '1.0.0';

// Default export for CommonJS compatibility
export default {
  AgentLogger,
  Dashboard,
  schema,
  logActivity,
  renderDashboard,
  getActivities,
  clearActivities,
  version
};
