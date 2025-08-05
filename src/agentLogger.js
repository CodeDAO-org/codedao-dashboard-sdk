import Ajv from 'ajv';
import { schema } from './schema.js';

/**
 * AgentLogger - Core logging functionality for AI agent activities
 */
export class AgentLogger {
  static STORAGE_KEY = 'codedao_ai_activities';
  static MAX_ACTIVITIES = 1000; // Prevent localStorage overflow
  
  static ajv = new Ajv();
  static validate = AgentLogger.ajv.compile(schema);

  /**
   * Log an AI agent activity
   * @param {string} agent - Agent name (e.g., 'Claude', 'ChatGPT')
   * @param {string} action - Description of the action taken
   * @param {string} type - Type of action (commit, analysis, detection, etc.)
   * @param {string} status - Status (success, processing, error, info)
   * @param {Object} metadata - Additional metadata (optional)
   */
  static log(agent, action, type = 'info', status = 'success', metadata = {}) {
    const activity = {
      id: Date.now() + Math.random(), // Ensure uniqueness
      timestamp: new Date().toISOString(),
      agent,
      action,
      type,
      status,
      metadata
    };

    // Validate against schema
    if (!this.validate(activity)) {
      console.warn('CodeDAO SDK: Invalid activity format:', this.validate.errors);
      return false;
    }

    try {
      const activities = this.getActivities();
      activities.unshift(activity); // Add to beginning
      
      // Keep only recent activities to prevent storage overflow
      if (activities.length > this.MAX_ACTIVITIES) {
        activities.splice(this.MAX_ACTIVITIES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('codedao:activity', { 
        detail: activity 
      }));

      return true;
    } catch (error) {
      console.error('CodeDAO SDK: Failed to log activity:', error);
      return false;
    }
  }

  /**
   * Get all logged activities
   * @param {number} limit - Maximum number of activities to return
   * @returns {Array} Array of activity objects
   */
  static getActivities(limit = null) {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const activities = stored ? JSON.parse(stored) : [];
      
      return limit ? activities.slice(0, limit) : activities;
    } catch (error) {
      console.error('CodeDAO SDK: Failed to retrieve activities:', error);
      return [];
    }
  }

  /**
   * Get activities filtered by agent
   * @param {string} agent - Agent name to filter by
   * @param {number} limit - Maximum number of activities to return
   * @returns {Array} Filtered array of activity objects
   */
  static getActivitiesByAgent(agent, limit = null) {
    const activities = this.getActivities().filter(a => a.agent === agent);
    return limit ? activities.slice(0, limit) : activities;
  }

  /**
   * Get activities filtered by type
   * @param {string} type - Activity type to filter by
   * @param {number} limit - Maximum number of activities to return
   * @returns {Array} Filtered array of activity objects
   */
  static getActivitiesByType(type, limit = null) {
    const activities = this.getActivities().filter(a => a.type === type);
    return limit ? activities.slice(0, limit) : activities;
  }

  /**
   * Get activity statistics
   * @returns {Object} Statistics object with counts by agent, type, and status
   */
  static getStatistics() {
    const activities = this.getActivities();
    
    const stats = {
      total: activities.length,
      byAgent: {},
      byType: {},
      byStatus: {},
      recentActivity: activities.slice(0, 10)
    };

    activities.forEach(activity => {
      // Count by agent
      stats.byAgent[activity.agent] = (stats.byAgent[activity.agent] || 0) + 1;
      
      // Count by type
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[activity.status] = (stats.byStatus[activity.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear all logged activities
   */
  static clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('codedao:cleared'));
      return true;
    } catch (error) {
      console.error('CodeDAO SDK: Failed to clear activities:', error);
      return false;
    }
  }

  /**
   * Export activities as JSON
   * @returns {string} JSON string of all activities
   */
  static exportActivities() {
    return JSON.stringify(this.getActivities(), null, 2);
  }

  /**
   * Import activities from JSON
   * @param {string} jsonData - JSON string of activities
   * @returns {boolean} Success status
   */
  static importActivities(jsonData) {
    try {
      const activities = JSON.parse(jsonData);
      
      // Validate each activity
      const validActivities = activities.filter(activity => this.validate(activity));
      
      if (validActivities.length !== activities.length) {
        console.warn(`CodeDAO SDK: ${activities.length - validActivities.length} invalid activities skipped`);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validActivities));
      window.dispatchEvent(new CustomEvent('codedao:imported'));
      
      return true;
    } catch (error) {
      console.error('CodeDAO SDK: Failed to import activities:', error);
      return false;
    }
  }
}
