export function createEntityId() {
  return crypto.randomUUID()
}

export function createTimestamp() {
  return new Date().toISOString()
}
