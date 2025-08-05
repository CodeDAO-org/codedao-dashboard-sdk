/**
 * JSON Schema for AI Agent Activity Logging
 * Ensures consistent data structure across all implementations
 */

export const schema = {
  type: "object",
  required: ["id", "timestamp", "agent", "action", "type", "status"],
  properties: {
    id: {
      type: ["number", "string"],
      description: "Unique identifier for the activity"
    },
    timestamp: {
      type: "string",
      format: "date-time",
      description: "ISO 8601 timestamp when the activity occurred"
    },
    agent: {
      type: "string",
      minLength: 1,
      description: "Name of the AI agent (e.g., 'Claude', 'ChatGPT')",
      examples: ["Claude", "ChatGPT", "GPT-4", "Copilot"]
    },
    action: {
      type: "string",
      minLength: 1,
      description: "Human-readable description of what the agent did",
      examples: [
        "Fixed syntax error in package.json",
        "Analyzed code for security vulnerabilities",
        "Generated unit tests for new function",
        "Committed changes to repository"
      ]
    },
    type: {
      type: "string",
      enum: [
        "commit",        // Code commits and changes
        "analysis",      // Code analysis and review
        "detection",     // Issue or bug detection
        "validation",    // Code validation and testing
        "monitoring",    // System monitoring and health checks
        "documentation", // Documentation updates
        "security",      // Security-related actions
        "optimization",  // Performance optimizations
        "refactoring",   // Code refactoring
        "deployment",    // Deployment-related actions
        "collaboration", // Agent-to-agent communication
        "info"          // General informational activities
      ],
      description: "Category of the activity"
    },
    status: {
      type: "string",
      enum: ["success", "processing", "error", "warning", "info"],
      description: "Current status of the activity"
    },
    metadata: {
      type: "object",
      description: "Additional context and details about the activity",
      properties: {
        commitHash: {
          type: "string",
          pattern: "^[a-f0-9]+$",
          description: "Git commit hash if applicable"
        },
        filePath: {
          type: "string",
          description: "File path if the activity relates to a specific file"
        },
        lineNumbers: {
          type: "array",
          items: { type: "integer" },
          description: "Line numbers affected by the activity"
        },
        duration: {
          type: "number",
          minimum: 0,
          description: "Duration of the activity in milliseconds"
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Confidence score for the activity (0-1)"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for categorizing the activity"
        },
        relatedActivities: {
          type: "array",
          items: { type: ["number", "string"] },
          description: "IDs of related activities"
        },
        repository: {
          type: "string",
          description: "Repository name or URL"
        },
        branch: {
          type: "string",
          description: "Git branch name"
        },
        pullRequest: {
          type: "integer",
          description: "Pull request number if applicable"
        },
        issue: {
          type: "integer", 
          description: "Issue number if applicable"
        },
        errorMessage: {
          type: "string",
          description: "Error message if status is 'error'"
        },
        url: {
          type: "string",
          format: "uri",
          description: "Relevant URL (e.g., commit URL, PR URL)"
        }
      },
      additionalProperties: true
    }
  },
  additionalProperties: false
};

/**
 * Agent configuration for consistent styling and behavior
 */
export const agentConfig = {
  'Claude': {
    color: 'purple',
    bgColor: '#8B5CF6',
    lightBg: '#F3E8FF',
    textColor: '#7C3AED',
    icon: 'C',
    name: 'Claude'
  },
  'ChatGPT': {
    color: 'green', 
    bgColor: '#10B981',
    lightBg: '#ECFDF5',
    textColor: '#059669',
    icon: 'G',
    name: 'ChatGPT'
  },
  'GPT-4': {
    color: 'blue',
    bgColor: '#3B82F6',
    lightBg: '#EFF6FF', 
    textColor: '#2563EB',
    icon: '4',
    name: 'GPT-4'
  },
  'Copilot': {
    color: 'gray',
    bgColor: '#6B7280',
    lightBg: '#F9FAFB',
    textColor: '#4B5563',
    icon: 'Co',
    name: 'GitHub Copilot'
  }
};

/**
 * Status configuration for consistent styling
 */
export const statusConfig = {
  'success': { 
    icon: 'fas fa-check-circle', 
    color: '#10B981',
    bg: '#ECFDF5'
  },
  'processing': { 
    icon: 'fas fa-spinner fa-spin', 
    color: '#3B82F6',
    bg: '#EFF6FF'
  },
  'error': { 
    icon: 'fas fa-exclamation-triangle', 
    color: '#EF4444',
    bg: '#FEF2F2'
  },
  'warning': { 
    icon: 'fas fa-exclamation-circle', 
    color: '#F59E0B',
    bg: '#FFFBEB'
  },
  'info': { 
    icon: 'fas fa-info-circle', 
    color: '#6B7280',
    bg: '#F9FAFB'
  }
};

/**
 * Type configuration for consistent styling and icons
 */
export const typeConfig = {
  'commit': { icon: 'fas fa-code-branch', color: '#8B5CF6' },
  'analysis': { icon: 'fas fa-search', color: '#3B82F6' },
  'detection': { icon: 'fas fa-bug', color: '#EF4444' },
  'validation': { icon: 'fas fa-check-double', color: '#10B981' },
  'monitoring': { icon: 'fas fa-eye', color: '#6B7280' },
  'documentation': { icon: 'fas fa-file-alt', color: '#F59E0B' },
  'security': { icon: 'fas fa-shield-alt', color: '#DC2626' },
  'optimization': { icon: 'fas fa-tachometer-alt', color: '#059669' },
  'refactoring': { icon: 'fas fa-code', color: '#7C3AED' },
  'deployment': { icon: 'fas fa-rocket', color: '#DC2626' },
  'collaboration': { icon: 'fas fa-comments', color: '#2563EB' },
  'info': { icon: 'fas fa-info-circle', color: '#6B7280' }
};
