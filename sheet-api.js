// ============================================
// WindowTime - Google Sheets API Integration
// ============================================

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbypyZ5ut_d5tCSHTBOcl6Zr73xJBI_hNQ1s5bvOPpCP5kRuZesFx8grQY0P4-V5Wf2Y/exec";

// Sheet names
const SHEETS = {
  QUEUES: "Queues",
  TIMESTAMPS: "TimeStamps",
  DRIVERS: "Master_Drivers",
  TRUCKS: "Master_Trucks",
  SUPPLIERS: "Master_Suppliers",
  DOCKS: "Master_Docks"
};

// ============================================
// SheetAPI Class - Main interface
// ============================================

class SheetAPI {
  constructor() {
    this.isOnline = true;
    this.cacheKey = "windowtime_cache";
    this.lastSync = localStorage.getItem("windowtime_sync") || null;
  }

  // ==================== GET ====================
  async getSheet(sheetName) {
    try {
      const response = await fetch(`${SHEET_API_URL}?sheet=${sheetName}`);
      const result = await response.json();

      if (result.success) {
        this.isOnline = true;
        // Cache data
        this.cacheData(sheetName, result.data);
        this.updateSyncTime();
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch ${sheetName}:`, error.message);
      this.isOnline = false;

      // Fallback to localStorage
      const cached = this.getCachedData(sheetName);
      if (cached) {
        console.log(`📦 Using cached data for ${sheetName}`);
        this.showNotification(`⚠️ Offline mode: Using cached data for ${sheetName}`, "warning");
        return cached;
      }

      throw error;
    }
  }

  // ==================== POST ====================
  async saveSheet(sheetName, rows) {
    const payload = {
      sheet: sheetName,
      rows: rows
    };

    const self = this;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", SHEET_API_URL, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onload = () => {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.success) {
            self.isOnline = true;
            self.updateSyncTime();
            console.log(`✅ Saved ${result.data.count} rows to ${sheetName}`);
            self.showNotification(`✅ Synced ${result.data.count} rows to ${sheetName}`, "success");
            resolve(result.data);
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.warn(`❌ Failed to parse response:`, error.message);
          self.isOnline = false;
          self.saveToLocalStorage(sheetName, rows);
          self.showNotification(`⚠️ Offline: Data saved locally. Will sync when online.`, "warning");
          resolve({ message: "Saved locally (offline mode)", count: rows.length });
        }
      };

      xhr.onerror = () => {
        console.warn(`❌ Failed to save ${sheetName}: Network error`);
        self.isOnline = false;
        self.saveToLocalStorage(sheetName, rows);
        self.showNotification(`⚠️ Offline: Data saved locally. Will sync when online.`, "warning");
        resolve({ message: "Saved locally (offline mode)", count: rows.length });
      };

      xhr.send(JSON.stringify(payload));
    });
  }

  // ==================== Helper: Cache ====================
  cacheData(sheetName, data) {
    const cache = JSON.parse(localStorage.getItem(this.cacheKey) || "{}");
    cache[sheetName] = data;
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }

  getCachedData(sheetName) {
    const cache = JSON.parse(localStorage.getItem(this.cacheKey) || "{}");
    return cache[sheetName] || null;
  }

  updateSyncTime() {
    localStorage.setItem("windowtime_sync", new Date().toISOString());
  }

  // ==================== Helper: LocalStorage Fallback ====================
  saveToLocalStorage(sheetName, rows) {
    const pendingKey = "windowtime_pending";
    const pending = JSON.parse(localStorage.getItem(pendingKey) || "{}");

    if (!pending[sheetName]) {
      pending[sheetName] = [];
    }

    pending[sheetName].push(...rows);
    localStorage.setItem(pendingKey, JSON.stringify(pending));
  }

  async syncPending() {
    const pendingKey = "windowtime_pending";
    const pending = JSON.parse(localStorage.getItem(pendingKey) || "{}");

    for (const [sheetName, rows] of Object.entries(pending)) {
      if (rows.length > 0) {
        try {
          await this.saveSheet(sheetName, rows);
          delete pending[sheetName];
          localStorage.setItem(pendingKey, JSON.stringify(pending));
          console.log(`✅ Synced pending data from ${sheetName}`);
        } catch (error) {
          console.warn(`Failed to sync ${sheetName}:`, error.message);
        }
      }
    }
  }

  // ==================== Helper: Notifications ====================
  showNotification(message, type = "info") {
    // Try to show toast notification if available
    if (window.showNotification && typeof window.showNotification === "function") {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // ==================== Helper: Status ====================
  getStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      hasPendingData: Object.keys(JSON.parse(localStorage.getItem("windowtime_pending") || "{}")).length > 0
    };
  }
}

// ============================================
// Global instance
// ============================================
const sheetAPI = new SheetAPI();

// ============================================
// Auto-sync pending data when online
// ============================================
window.addEventListener("online", () => {
  console.log("🔄 Going online - syncing pending data...");
  sheetAPI.syncPending();
});

window.addEventListener("offline", () => {
  console.log("⚠️ Going offline - will use local cache");
});
