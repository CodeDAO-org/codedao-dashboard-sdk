import { AgentLogger } from './agentLogger.js';
import { agentConfig, statusConfig, typeConfig } from './schema.js';

/**
 * Dashboard - Renders and manages the AI activity visualization
 */
export class Dashboard {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.querySelector(containerId);
    this.options = {
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
      maxActivities: 50,
      showStats: true,
      showFilters: true,
      theme: 'light',
      ...options
    };
    
    this.refreshTimer = null;
    this.init();
  }

  /**
   * Static method to quickly render a dashboard
   * @param {string} containerId - CSS selector for container element
   * @param {Object} options - Configuration options
   * @returns {Dashboard} Dashboard instance
   */
  static render(containerId, options = {}) {
    return new Dashboard(containerId, options);
  }

  /**
   * Initialize the dashboard
   */
  init() {
    if (!this.container) {
      console.error('CodeDAO SDK: Dashboard container not found:', this.containerId);
      return;
    }

    this.createHTML();
    this.bindEvents();
    this.renderActivities();
    
    if (this.options.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  /**
   * Create the dashboard HTML structure
   */
  createHTML() {
    this.container.innerHTML = `
      <div class="codedao-dashboard" data-theme="${this.options.theme}">
        ${this.options.showStats ? this.createStatsHTML() : ''}
        ${this.options.showFilters ? this.createFiltersHTML() : ''}
        <div class="codedao-activities">
          <div class="codedao-activities-header">
            <h3>Live AI Activity Feed</h3>
            <div class="codedao-status">
              <div class="codedao-indicator"></div>
              <span>Live</span>
            </div>
          </div>
          <div class="codedao-activities-list" id="codedao-activities-list">
            <!-- Activities will be rendered here -->
          </div>
        </div>
      </div>
    `;

    this.injectCSS();
  }

  /**
   * Create statistics section HTML
   */
  createStatsHTML() {
    return `
      <div class="codedao-stats">
        <div class="codedao-stat-item" id="codedao-total-activities">
          <div class="codedao-stat-number">0</div>
          <div class="codedao-stat-label">Total Activities</div>
        </div>
        <div class="codedao-agents-stats" id="codedao-agents-stats">
          <!-- Agent stats will be rendered here -->
        </div>
      </div>
    `;
  }

  /**
   * Create filters section HTML
   */
  createFiltersHTML() {
    return `
      <div class="codedao-filters">
        <select id="codedao-filter-agent">
          <option value="">All Agents</option>
        </select>
        <select id="codedao-filter-type">
          <option value="">All Types</option>
        </select>
        <select id="codedao-filter-status">
          <option value="">All Status</option>
        </select>
        <button id="codedao-clear-filters">Clear Filters</button>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Listen for new activities
    window.addEventListener('codedao:activity', () => {
      this.renderActivities();
    });

    // Listen for cleared activities
    window.addEventListener('codedao:cleared', () => {
      this.renderActivities();
    });

    // Filter event listeners
    if (this.options.showFilters) {
      const filterAgent = document.getElementById('codedao-filter-agent');
      const filterType = document.getElementById('codedao-filter-type');
      const filterStatus = document.getElementById('codedao-filter-status');
      const clearFilters = document.getElementById('codedao-clear-filters');

      if (filterAgent) filterAgent.addEventListener('change', () => this.renderActivities());
      if (filterType) filterType.addEventListener('change', () => this.renderActivities());
      if (filterStatus) filterStatus.addEventListener('change', () => this.renderActivities());
      
      if (clearFilters) {
        clearFilters.addEventListener('click', () => {
          if (filterAgent) filterAgent.value = '';
          if (filterType) filterType.value = '';
          if (filterStatus) filterStatus.value = '';
          this.renderActivities();
        });
      }
    }
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    this.refreshTimer = setInterval(() => {
      this.renderActivities();
    }, this.options.refreshInterval);
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get filtered activities based on current filter settings
   */
  getFilteredActivities() {
    let activities = AgentLogger.getActivities(this.options.maxActivities);

    if (this.options.showFilters) {
      const filterAgent = document.getElementById('codedao-filter-agent');
      const filterType = document.getElementById('codedao-filter-type');
      const filterStatus = document.getElementById('codedao-filter-status');

      if (filterAgent?.value) {
        activities = activities.filter(a => a.agent === filterAgent.value);
      }
      if (filterType?.value) {
        activities = activities.filter(a => a.type === filterType.value);
      }
      if (filterStatus?.value) {
        activities = activities.filter(a => a.status === filterStatus.value);
      }
    }

    return activities;
  }

  /**
   * Render all activities and stats
   */
  renderActivities() {
    const activities = this.getFilteredActivities();
    const stats = AgentLogger.getStatistics();

    this.renderActivityList(activities);
    
    if (this.options.showStats) {
      this.renderStats(stats);
    }
    
    if (this.options.showFilters) {
      this.updateFilters(stats);
    }
  }

  /**
   * Render the activity list
   */
  renderActivityList(activities) {
    const listContainer = document.getElementById('codedao-activities-list');
    if (!listContainer) return;

    if (activities.length === 0) {
      listContainer.innerHTML = `
        <div class="codedao-empty-state">
          <div class="codedao-empty-icon">🤖</div>
          <h4>No AI Activity Yet</h4>
          <p>Waiting for AI agents to start collaborating...</p>
        </div>
      `;
      return;
    }

    const activitiesHTML = activities.map(activity => this.createActivityHTML(activity)).join('');
    listContainer.innerHTML = activitiesHTML;
  }

  /**
   * Create HTML for a single activity
   */
  createActivityHTML(activity) {
    const agent = agentConfig[activity.agent] || agentConfig['Claude'];
    const status = statusConfig[activity.status] || statusConfig['info'];
    const type = typeConfig[activity.type] || typeConfig['info'];
    
    const timeAgo = this.formatTimestamp(new Date(activity.timestamp));
    
    return `
      <div class="codedao-activity-item" style="border-left-color: ${agent.bgColor}">
        <div class="codedao-activity-header">
          <div class="codedao-agent-avatar" style="background-color: ${agent.bgColor}">
            ${agent.icon}
          </div>
          <div class="codedao-activity-meta">
            <span class="codedao-agent-name" style="color: ${agent.textColor}">${activity.agent}</span>
            <div class="codedao-activity-icons">
              <i class="${type.icon}" style="color: ${type.color}"></i>
              <i class="${status.icon}" style="color: ${status.color}"></i>
            </div>
          </div>
          <span class="codedao-timestamp">${timeAgo}</span>
        </div>
        <div class="codedao-activity-content">
          <p class="codedao-activity-action">${activity.action}</p>
          ${this.renderMetadata(activity.metadata)}
        </div>
      </div>
    `;
  }

  /**
   * Render activity metadata
   */
  renderMetadata(metadata = {}) {
    if (!metadata || Object.keys(metadata).length === 0) return '';

    let metadataHTML = '';
    
    if (metadata.commitHash) {
      metadataHTML += `
        <div class="codedao-metadata-item">
          <i class="fas fa-code-branch"></i>
          <span>${metadata.commitHash}</span>
        </div>
      `;
    }
    
    if (metadata.filePath) {
      metadataHTML += `
        <div class="codedao-metadata-item">
          <i class="fas fa-file"></i>
          <span>${metadata.filePath}</span>
        </div>
      `;
    }
    
    if (metadata.duration) {
      metadataHTML += `
        <div class="codedao-metadata-item">
          <i class="fas fa-clock"></i>
          <span>${metadata.duration}ms</span>
        </div>
      `;
    }

    return metadataHTML ? `<div class="codedao-metadata">${metadataHTML}</div>` : '';
  }

  /**
   * Render statistics
   */
  renderStats(stats) {
    const totalElement = document.getElementById('codedao-total-activities');
    if (totalElement) {
      totalElement.querySelector('.codedao-stat-number').textContent = stats.total;
    }

    const agentsStatsElement = document.getElementById('codedao-agents-stats');
    if (agentsStatsElement) {
      const agentsHTML = Object.entries(stats.byAgent).map(([agent, count]) => {
        const agentConf = agentConfig[agent] || agentConfig['Claude'];
        return `
          <div class="codedao-agent-stat">
            <div class="codedao-agent-avatar" style="background-color: ${agentConf.bgColor}">
              ${agentConf.icon}
            </div>
            <div class="codedao-agent-info">
              <span class="codedao-agent-name">${agent}</span>
              <span class="codedao-agent-count">${count}</span>
            </div>
          </div>
        `;
      }).join('');
      
      agentsStatsElement.innerHTML = agentsHTML;
    }
  }

  /**
   * Update filter options
   */
  updateFilters(stats) {
    // Update agent filter
    const filterAgent = document.getElementById('codedao-filter-agent');
    if (filterAgent) {
      const currentValue = filterAgent.value;
      filterAgent.innerHTML = '<option value="">All Agents</option>' +
        Object.keys(stats.byAgent).map(agent => 
          `<option value="${agent}" ${currentValue === agent ? 'selected' : ''}>${agent}</option>`
        ).join('');
    }

    // Update type filter
    const filterType = document.getElementById('codedao-filter-type');
    if (filterType) {
      const currentValue = filterType.value;
      filterType.innerHTML = '<option value="">All Types</option>' +
        Object.keys(stats.byType).map(type => 
          `<option value="${type}" ${currentValue === type ? 'selected' : ''}>${type}</option>`
        ).join('');
    }

    // Update status filter
    const filterStatus = document.getElementById('codedao-filter-status');
    if (filterStatus) {
      const currentValue = filterStatus.value;
      filterStatus.innerHTML = '<option value="">All Status</option>' +
        Object.keys(stats.byStatus).map(status => 
          `<option value="${status}" ${currentValue === status ? 'selected' : ''}>${status}</option>`
        ).join('');
    }
  }

  /**
   * Format timestamp to relative time
   */
  formatTimestamp(timestamp) {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  /**
   * Inject CSS styles for the dashboard
   */
  injectCSS() {
    if (document.getElementById('codedao-dashboard-styles')) return;

    const styles = `
      <style id="codedao-dashboard-styles">
        .codedao-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f9fafb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .codedao-stats {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .codedao-stat-item {
          text-align: center;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 6px;
          min-width: 100px;
        }
        
        .codedao-stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
        }
        
        .codedao-stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .codedao-agents-stats {
          display: flex;
          gap: 1rem;
          flex: 1;
        }
        
        .codedao-agent-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        
        .codedao-filters {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .codedao-filters select,
        .codedao-filters button {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
        }
        
        .codedao-activities {
          background: white;
        }
        
        .codedao-activities-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .codedao-activities-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .codedao-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .codedao-indicator {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .codedao-activities-list {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .codedao-activity-item {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          border-left: 4px solid #e5e7eb;
          transition: background-color 0.2s;
        }
        
        .codedao-activity-item:hover {
          background: #f9fafb;
        }
        
        .codedao-activity-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .codedao-agent-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.875rem;
        }
        
        .codedao-activity-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }
        
        .codedao-agent-name {
          font-weight: 600;
        }
        
        .codedao-activity-icons {
          display: flex;
          gap: 0.25rem;
        }
        
        .codedao-timestamp {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .codedao-activity-action {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-weight: 500;
        }
        
        .codedao-metadata {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .codedao-metadata-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .codedao-empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #6b7280;
        }
        
        .codedao-empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .codedao-empty-state h4 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }
        
        .codedao-empty-state p {
          margin: 0;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Destroy the dashboard and clean up
   */
  destroy() {
    this.stopAutoRefresh();
    
    // Remove event listeners
    window.removeEventListener('codedao:activity', this.renderActivities);
    window.removeEventListener('codedao:cleared', this.renderActivities);
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
