// changedetection.io API integration
class ChangeDetectionAPI {
  constructor() {
    this.baseUrl = null;
    this.apiKey = null;
  }

  async initialize() {
    const config = await chrome.storage.local.get(['changedetectionUrl', 'changedetectionApiKey']);
    this.baseUrl = config.changedetectionUrl || 'http://localhost:8888';
    this.apiKey = config.changedetectionApiKey || null;
    return this.isConfigured();
  }

  isConfigured() {
    return !!(this.baseUrl && this.apiKey);
  }

  async configure(url, apiKey) {
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    await chrome.storage.local.set({
      changedetectionUrl: this.baseUrl,
      changedetectionApiKey: this.apiKey
    });
  }

  async createWatch(url, title, cssSelector = null) {
    if (!this.isConfigured()) {
      throw new Error('changedetection.io not configured. Please set API key and URL.');
    }

    const watchData = {
      url: url,
      title: title,
      paused: false,
      notification_muted: false,
      time_between_check: {
        weeks: 0,
        days: 0,
        hours: 1,
        minutes: 0,
        seconds: 0
      }
    };

    // If we have a CSS selector for the price, use CSS selector filter
    // Note: changedetection.io uses 'css_filter' or 'include_filters' depending on version
    // We'll set it via update after creation if needed, or use the watch settings
    if (cssSelector) {
      // Store selector for later use - changedetection.io may need it in watch settings
      watchData.extra_config = {
        css_selector: cssSelector
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(watchData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create watch: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // If we have a CSS selector, update the watch to use it
      // changedetection.io may require setting this via a separate update call
      if (cssSelector && result && result.uuid) {
        try {
          // Try to set CSS filter - this may vary by changedetection.io version
          await this.updateWatch(result.uuid, {
            include_filters: [cssSelector]
          });
        } catch (updateError) {
          console.warn('Could not set CSS filter, watch created without filter:', updateError);
          // Continue anyway - the watch is still created
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error creating watch:', error);
      throw error;
    }
  }

  async getWatch(uuid) {
    if (!this.isConfigured()) {
      throw new Error('changedetection.io not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/watch/${uuid}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get watch: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting watch:', error);
      throw error;
    }
  }

  async updateWatch(uuid, updates) {
    if (!this.isConfigured()) {
      throw new Error('changedetection.io not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/watch/${uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update watch: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating watch:', error);
      throw error;
    }
  }

  async deleteWatch(uuid) {
    if (!this.isConfigured()) {
      throw new Error('changedetection.io not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/watch/${uuid}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete watch: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting watch:', error);
      throw error;
    }
  }

  async getWatchHistory(uuid) {
    if (!this.isConfigured()) {
      throw new Error('changedetection.io not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/watch/${uuid}/history`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get watch history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting watch history:', error);
      throw error;
    }
  }

  async testConnection() {
    if (!this.isConfigured()) {
      return { success: false, error: 'Not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/systeminfo`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        return { success: false, error: `Connection failed: ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

