function createWebStore(getStorage) {
  return {
    get(key) {
      try {
        const raw = getStorage().getItem(key);
        return raw === null ? undefined : JSON.parse(raw);
      } catch {
        return undefined;
      }
    },
    set(key, value) {
      if (value === undefined) return this.remove(key);

      const serialized = JSON.stringify(value);

      try {
        getStorage().setItem(key, serialized);
      } catch(error) {
        if (error?.name === 'QuotaExceededError') throw error;
        if (error?.name !== 'SecurityError') throw error;
      }
    },
    remove(key) {
      try {
        getStorage().removeItem(key);
      } catch { /* storage unavailable */ }
    },
    each(callback) {
      const keys = [];

      try {
        const storage = getStorage();
        for (let i = 0; i < storage.length; i++) {
          keys.push(storage.key(i));
        }
      } catch { /* storage unavailable */ }

      keys.forEach(key => callback(this.get(key), key));
    },
  };
}

export default createWebStore;
