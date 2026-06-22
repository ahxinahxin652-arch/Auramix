const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock browser globals
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, value) => { storage[key] = String(value); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; }
};

global.window = {
  location: {
    hash: ''
  }
};

// Simple Vue & Pinia Mock
const mockVue = {
  ref: (val) => {
    return {
      _val: val,
      get value() { return this._val; },
      set value(v) { this._val = v; }
    };
  },
  computed: (fn) => {
    return {
      get value() { return fn(); }
    };
  }
};

const mockPinia = {
  defineStore: (id, storeSetup) => {
    return () => storeSetup();
  }
};

// We will mock fetch
let fetchMock = null;
global.fetch = async (url, options) => {
  if (fetchMock) {
    return fetchMock(url, options);
  }
  throw new Error('No fetch mock configured');
};

// Read files and convert them to run in Node (CommonJS / eval context)
const backendApiContent = fs.readFileSync(
  path.join(__dirname, '../src/utils/backendApi.js'),
  'utf8'
);

const userStoreContent = fs.readFileSync(
  path.join(__dirname, '../src/stores/user.js'),
  'utf8'
);

// Transform files:
// 1. Remove ES imports and exports.
// 2. Supply mocks for vue, pinia, import.meta.env
let transformedApi = backendApiContent
  .replace(/export class ApiError/g, 'class ApiError')
  .replace(/export async function backendFetch/g, 'async function backendFetch')
  .replace(/import\.meta\.env/g, '{}');

let transformedUserStore = userStoreContent
  .replace(/import \{ defineStore \} from 'pinia'/g, 'const { defineStore } = mockPinia;')
  .replace(/import \{ ref, computed \} from 'vue'/g, 'const { ref, computed } = mockVue;')
  .replace(/import \{ backendFetch \} from '\.\.\/utils\/backendApi'/g, '')
  .replace(/export const useUserStore/g, 'const useUserStore');

// Combine them into a single runnable context
const testContextCode = `
${transformedApi}

${transformedUserStore}

// Expose the store to test code
module.exports = {
  ApiError,
  backendFetch,
  useUserStore
};
`;

// Evaluate the code
const m = new module.constructor();
m._compile(testContextCode, __filename);
const { useUserStore } = m.exports;

async function runTests() {
  console.log('Testing User Pinia Store...');
  let exitCode = 0;

  try {
    // Test 1: Initial state
    localStorage.clear();
    let store = useUserStore();
    assert.strictEqual(store.token.value, null);
    assert.strictEqual(store.profile.value, null);
    assert.strictEqual(store.isLoggedIn.value, false);
    console.log('PASS: Initial store state is empty.');

    // Test 2: Initial state with values in localStorage
    localStorage.setItem('auramix_token', 'mock-token-123');
    localStorage.setItem('auramix_profile', JSON.stringify({ name: 'Alice' }));
    store = useUserStore();
    assert.strictEqual(store.token.value, 'mock-token-123');
    assert.deepStrictEqual(store.profile.value, { name: 'Alice' });
    assert.strictEqual(store.isLoggedIn.value, true);
    console.log('PASS: Initial store state loads from localStorage.');

    // Test 3: sendCode
    fetchMock = async (url, options) => {
      assert.strictEqual(url, 'http://localhost:8080/api/user/auth/send-code');
      assert.strictEqual(options.method, 'POST');
      assert.deepStrictEqual(JSON.parse(options.body), { email: 'test@example.com' });
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ code: 200, message: 'success', data: { sent: true } })
      };
    };
    const sendCodeResult = await store.sendCode('test@example.com');
    assert.deepStrictEqual(sendCodeResult, { sent: true });
    console.log('PASS: sendCode sends correct request and returns data.');

    // Test 4: login success
    fetchMock = async (url, options) => {
      assert.strictEqual(url, 'http://localhost:8080/api/user/auth/login');
      assert.strictEqual(options.method, 'POST');
      assert.deepStrictEqual(JSON.parse(options.body), { email: 'test@example.com', password: 'pwd' });
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          code: 200,
          message: 'success',
          data: {
            token: 'new-token-456',
            profile: { name: 'Bob', email: 'test@example.com' }
          }
        })
      };
    };
    
    // Clear first to check changes
    localStorage.clear();
    store = useUserStore();
    const loginResult = await store.login('test@example.com', 'pwd');
    assert.strictEqual(store.token.value, 'new-token-456');
    assert.deepStrictEqual(store.profile.value, { name: 'Bob', email: 'test@example.com' });
    assert.strictEqual(store.isLoggedIn.value, true);
    assert.strictEqual(localStorage.getItem('auramix_token'), 'new-token-456');
    assert.deepStrictEqual(JSON.parse(localStorage.getItem('auramix_profile')), { name: 'Bob', email: 'test@example.com' });
    console.log('PASS: login stores credentials on success.');

    // Test 5: fetchProfile
    fetchMock = async (url, options) => {
      assert.strictEqual(url, 'http://localhost:8080/api/user/auth/me');
      assert.strictEqual(options.headers.get('Authorization'), 'Bearer new-token-456');
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          code: 200,
          message: 'success',
          data: { name: 'Bob Updated', email: 'test@example.com' }
        })
      };
    };
    await store.fetchProfile();
    assert.deepStrictEqual(store.profile.value, { name: 'Bob Updated', email: 'test@example.com' });
    assert.deepStrictEqual(JSON.parse(localStorage.getItem('auramix_profile')), { name: 'Bob Updated', email: 'test@example.com' });
    console.log('PASS: fetchProfile retrieves and updates profile details.');

    // Test 6: logout
    store.logout();
    assert.strictEqual(store.token.value, null);
    assert.strictEqual(store.profile.value, null);
    assert.strictEqual(store.isLoggedIn.value, false);
    assert.strictEqual(localStorage.getItem('auramix_token'), undefined);
    assert.strictEqual(localStorage.getItem('auramix_profile'), undefined);
    assert.strictEqual(window.location.hash, '#/login');
    console.log('PASS: logout clears credentials and redirects.');

  } catch (error) {
    console.error('FAIL:', error.stack || error.message);
    exitCode = 1;
  }

  process.exit(exitCode);
}

runTests();
