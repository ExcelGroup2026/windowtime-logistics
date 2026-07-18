// ============================================
// IndexedDB to localStorage Bridge
// ============================================

console.log('🌉 IndexedDB Bridge: Initializing...');

// Override indexedDB.open to use localStorage instead
const origOpen = indexedDB.open;

indexedDB.open = function(dbName, version) {
  console.log('📂 Redirecting IndexedDB.open to localStorage:', dbName);

  // Create a fake request object that simulates IDBOpenRequest
  const fakeRequest = {
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: createFakeDatabase(dbName),
    readyState: 'done',

    addEventListener: function(event, handler) {
      if (event === 'success') this.onsuccess = handler;
      if (event === 'error') this.onerror = handler;
      if (event === 'upgradeneeded') this.onupgradeneeded = handler;
    },

    removeEventListener: function() {},
  };

  // Trigger success callback asynchronously
  setTimeout(() => {
    if (fakeRequest.onsuccess) {
      fakeRequest.onsuccess({ target: fakeRequest });
    }
  }, 0);

  return fakeRequest;
};

function createFakeDatabase(dbName) {
  return {
    name: dbName,
    version: 1,
    objectStoreNames: [],

    transaction: function(storeNames, mode) {
      console.log('🔄 IDBDatabase.transaction:', storeNames, mode);
      return createFakeTransaction(dbName, storeNames, mode);
    },

    close: function() {
      console.log('❌ IDBDatabase.close (ignored for localStorage)');
    },
  };
}

function createFakeTransaction(dbName, storeNames, mode) {
  const stores = {};

  // Create object stores
  if (typeof storeNames === 'string') {
    storeNames = [storeNames];
  }

  storeNames.forEach(storeName => {
    stores[storeName] = createFakeObjectStore(dbName, storeName, mode);
  });

  return {
    objectStore: function(name) {
      return stores[name];
    },

    oncomplete: null,
    onerror: null,

    addEventListener: function(event, handler) {
      if (event === 'complete') this.oncomplete = handler;
      if (event === 'error') this.onerror = handler;
    },

    removeEventListener: function() {},
  };
}

function createFakeObjectStore(dbName, storeName, mode) {
  const storageKey = `idb_${dbName}_${storeName}`;

  return {
    name: storeName,
    keyPath: null,
    autoIncrement: false,

    put: function(value, key) {
      console.log('📝 IDBObjectStore.put (→ localStorage):', storeName, value);

      // Serialize and save to localStorage
      const recordKey = key ? `${storageKey}_${key}` : `${storageKey}_${JSON.stringify(value)}`;
      localStorage.setItem(recordKey, JSON.stringify(value));

      // Also save under store name for quick access
      const allRecords = JSON.parse(localStorage.getItem(storageKey) || '[]');
      allRecords.push({ key, value });
      localStorage.setItem(storageKey, JSON.stringify(allRecords));

      return createFakeRequest(true);
    },

    add: function(value, key) {
      console.log('➕ IDBObjectStore.add (→ localStorage):', storeName, value);
      return this.put(value, key);
    },

    get: function(key) {
      console.log('📖 IDBObjectStore.get (← localStorage):', storeName, key);
      const recordKey = `${storageKey}_${key}`;
      const data = localStorage.getItem(recordKey);
      return createFakeRequest(true, data ? JSON.parse(data) : undefined);
    },

    getAll: function() {
      console.log('📚 IDBObjectStore.getAll (← localStorage):', storeName);
      const allRecords = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return createFakeRequest(true, allRecords.map(r => r.value));
    },

    delete: function(key) {
      console.log('🗑️ IDBObjectStore.delete (→ localStorage):', storeName, key);
      const recordKey = `${storageKey}_${key}`;
      localStorage.removeItem(recordKey);
      return createFakeRequest(true);
    },

    clear: function() {
      console.log('🧹 IDBObjectStore.clear (→ localStorage):', storeName);
      localStorage.removeItem(storageKey);
      return createFakeRequest(true);
    },

    deleteIndex: function() { return this; },
    createIndex: function() { return this; },
    index: function() { return this; },
  };
}

function createFakeRequest(success, result) {
  return {
    onsuccess: null,
    onerror: null,
    result,
    readyState: 'done',
    error: success ? null : new Error('IndexedDB operation failed'),

    addEventListener: function(event, handler) {
      if (event === 'success') this.onsuccess = handler;
      if (event === 'error') this.onerror = handler;
    },

    removeEventListener: function() {},
  };
}

console.log('✅ IndexedDB Bridge loaded - all IndexedDB calls → localStorage');
