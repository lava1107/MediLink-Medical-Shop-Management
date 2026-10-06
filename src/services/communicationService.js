import { api } from "./api.js";

export const communicationService = {
  /**
   * Send an Email
   */
  async sendEmail(payload) {
    return await api.post("/communication/email", payload);
  },

  /**
   * Send an SMS
   */
  async sendSMS(payload) {
    return await api.post("/communication/sms", payload);
  },

  /**
   * Send Test Verification Email
   */
  async testEmail(email) {
    return await api.post("/communication/test-email", { email });
  },

  /**
   * Send Test Verification SMS
   */
  async testSMS(phone) {
    return await api.post("/communication/test-sms", { phone });
  },

  /**
   * Retrieve Communications History Logs
   */
  async getLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/communication/logs${query ? `?${query}` : ""}`;
    return await api.get(endpoint);
  },

  /**
   * Get Active Gateway Configuration
   */
  async getConfig() {
    return await api.get("/communication/config");
  },

  /**
   * Update Communication Configuration (SMTP / Twilio)
   */
  async updateConfig(config) {
    return await api.post("/communication/config", config);
  },

  /**
   * Quick trigger for common workflows (invoice, prescription, reservation, restock)
   */
  async quickSend(payload) {
    return await api.post("/communication/quick-send", payload);
  },
};

export default communicationService;
