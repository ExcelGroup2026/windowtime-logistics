// ============================================
// localStorage Proxy - Intercept and sync with Google Sheets
// ============================================

// Wait for sheetAPI to be ready
function waitForSheetAPI() {
  return new Promise((resolve) => {
    if (window.sheetAPI) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (window.sheetAPI) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    }
  });
}

// Initialize proxy after sheetAPI is loaded
waitForSheetAPI().then(() => {
  console.log("✅ Sheet API ready - initializing localStorage proxy");

  // Store original localStorage
  const originalStorage = { ...localStorage };

  // Override localStorage.setItem to sync with Google Sheets
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    // Always save to localStorage first (for offline mode)
    originalSetItem.call(this, key, value);

    // Try to sync with Google Sheets
    syncToSheets(key, value);
  };

  // Override localStorage.getItem to fallback from Google Sheets
  const originalGetItem = Storage.prototype.getItem;
  Storage.prototype.getItem = function(key) {
    // First try localStorage (cached data)
    const cached = originalGetItem.call(this, key);
    if (cached) {
      return cached;
    }

    // If not in cache, try to fetch from Google Sheets (sync mode)
    return syncFromSheets(key);
  };

  // ==================== SYNC TO SHEETS ====================
  async function syncToSheets(key, value) {
    try {
      // Parse key to determine sheet and data
      const data = parseKey(key, value);
      if (!data) return;

      // POST to Google Sheets
      await sheetAPI.saveSheet(data.sheet, data.rows);
      console.log(`✅ Synced to ${data.sheet}:`, data.rows);
    } catch (error) {
      console.warn(`⚠️ Failed to sync to sheets:`, error.message);
      // Fallback is already in localStorage
    }
  }

  // ==================== SYNC FROM SHEETS ====================
  async function syncFromSheets(key) {
    try {
      // Parse key to determine sheet
      const sheet = getSheetFromKey(key);
      if (!sheet) return null;

      // GET from Google Sheets
      const data = await sheetAPI.getSheet(sheet);
      console.log(`📥 Fetched from ${sheet}:`, data);

      // Cache in localStorage
      const cacheKey = sheet + "_cache";
      localStorage.setItem(cacheKey, JSON.stringify(data));

      // Return matching row
      return findMatchingRow(key, data);
    } catch (error) {
      console.warn(`⚠️ Failed to fetch from sheets:`, error.message);
      return null;
    }
  }

  // ==================== HELPER: Parse Key ====================
  function parseKey(key, value) {
    // Example: "driver_stamps_2026-01-15_Q001"
    if (key.startsWith("driver_stamps_")) {
      const [, , date, queueId] = key.split("_");
      try {
        const obj = JSON.parse(value);
        return {
          sheet: "TimeStamps",
          rows: [{
            "Queue No. (Q)": queueId,
            "Actual Arrival Time": obj.arrivalTime || "",
            "Loading/Unloading Start Time": obj.unloadStart || "",
            "Completed Time": obj.completed || "",
            "Departure Time": obj.departure || "",
            "Destination": obj.destination || "",
            "Arrival at Destination Time": obj.arriveDestination || "",
            "Departure from Destination Time": obj.departDestination || "",
            "Helper Name": obj.helperName || ""
          }]
        };
      } catch (e) {
        return null;
      }
    }

    if (key.startsWith("helper_name_")) {
      const [, , date, queueId] = key.split("_");
      return {
        sheet: "TimeStamps",
        rows: [{
          "Queue No. (Q)": queueId,
          "Helper Name": value
        }]
      };
    }

    return null;
  }

  // ==================== HELPER: Get Sheet From Key ====================
  function getSheetFromKey(key) {
    if (key.startsWith("driver_stamps_") || key.startsWith("helper_name_")) {
      return "TimeStamps";
    }
    return null;
  }

  // ==================== HELPER: Find Matching Row ====================
  function findMatchingRow(key, data) {
    const [, , date, queueId] = key.split("_");

    if (key.startsWith("driver_stamps_")) {
      // Find and return driver stamps for this queue
      const row = data.find(r => r["Queue No. (Q)"] === queueId);
      if (row) {
        return JSON.stringify({
          arrivalTime: row["Actual Arrival Time"] || "",
          unloadStart: row["Loading/Unloading Start Time"] || "",
          completed: row["Completed Time"] || "",
          departure: row["Departure Time"] || "",
          destination: row["Destination"] || "",
          arriveDestination: row["Arrival at Destination Time"] || "",
          departDestination: row["Departure from Destination Time"] || "",
          helperName: row["Helper Name"] || ""
        });
      }
    }

    if (key.startsWith("helper_name_")) {
      // Find and return helper name for this queue
      const row = data.find(r => r["Queue No. (Q)"] === queueId);
      if (row) {
        return row["Helper Name"] || "";
      }
    }

    return null;
  }

  console.log("✅ localStorage proxy initialized - syncing with Google Sheets");
});
