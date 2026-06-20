let sequence = 0n;
let lastTimestamp = -1n;
const workerId = BigInt(process.env.WORKER_ID || 1);
const datacenterId = BigInt(process.env.DATACENTER_ID || 1);

if (workerId < 0n || workerId > 31n) {
  throw new Error("workerId must be between 0 and 31");
}
if (datacenterId < 0n || datacenterId > 31n) {
  throw new Error("datacenterId must be between 0 and 31");
}
const twepoch = 1767225600000n; // 2026-01-01 00:00:00 UTC

function nextId() {
  let timestamp = BigInt(Date.now());
  if (timestamp < lastTimestamp) {
    throw new Error("Clock moved backwards. Refusing to generate id");
  }
  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & 4095n;
    if (sequence === 0n) {
      while (timestamp <= lastTimestamp) {
        timestamp = BigInt(Date.now());
      }
    }
  } else {
    sequence = 0n;
  }
  lastTimestamp = timestamp;
  return ((timestamp - twepoch) << 22n) |
         (datacenterId << 17n) |
         (workerId << 12n) |
         sequence;
}

module.exports = { nextId };
