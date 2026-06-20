const assert = require('assert');
const { nextId } = require('../server/dao/snowflake');

function runTest() {
  console.log('Testing Snowflake ID Generator...');
  let exitCode = 0;

  try {
    // 1. Verify nextId is a function and returns a BigInt
    if (typeof nextId !== 'function') {
      throw new Error('nextId is not a function');
    }
    
    const id1 = nextId();
    if (typeof id1 !== 'bigint') {
      throw new Error(`Expected nextId() to return a BigInt, got ${typeof id1}`);
    }
    console.log(`Generated ID 1: ${id1}`);

    // 2. Verify that consecutive generated IDs are increasing
    const id2 = nextId();
    console.log(`Generated ID 2: ${id2}`);
    if (id2 <= id1) {
      throw new Error(`Expected id2 (${id2}) to be greater than id1 (${id1})`);
    }

    // 3. Verify sequence generation within the same millisecond/rapid succession
    const ids = [];
    for (let i = 0; i < 100; i++) {
      ids.push(nextId());
    }
    for (let i = 1; i < ids.length; i++) {
      if (ids[i] <= ids[i - 1]) {
        throw new Error(`IDs are not strictly increasing at index ${i}: ${ids[i]} <= ${ids[i - 1]}`);
      }
    }
    console.log('PASS: All IDs are unique and strictly increasing.');

    // 4. Verify clock moved backwards throwing an error
    const originalDateNow = Date.now;
    try {
      nextId(); // set lastTimestamp
      Date.now = () => 1000; // mock backwards time
      assert.throws(() => nextId(), /Clock moved backwards/);
      console.log('PASS: Clock rollback throws expected error.');
    } finally {
      Date.now = originalDateNow;
    }

  } catch (error) {
    console.error('FAIL:', error.message);
    exitCode = 1;
  }

  process.exit(exitCode);
}

runTest();
