// Storage utilities for wishlist management
class WishlistStorage {
  static async getAllItems() {
    const result = await chrome.storage.local.get(['wishlist']);
    return result.wishlist || [];
  }

  static async addItem(item) {
    const items = await this.getAllItems();
    const newItem = {
      id: Date.now().toString(),
      url: item.url,
      title: item.title || 'Untitled Product',
      price: item.price || null,
      originalPrice: item.price || null,
      priceSelector: item.priceSelector || null,
      domain: item.domain || new URL(item.url).hostname,
      addedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      priceHistory: item.price ? [{ price: item.price, date: new Date().toISOString() }] : []
    };
    items.push(newItem);
    await chrome.storage.local.set({ wishlist: items });
    return newItem;
  }

  static async updateItem(id, updates) {
    const items = await this.getAllItems();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    if (updates.price && updates.price !== items[index].price) {
      items[index].priceHistory = items[index].priceHistory || [];
      items[index].priceHistory.push({
        price: updates.price,
        date: new Date().toISOString()
      });
    }
    items[index].lastChecked = new Date().toISOString();
    
    await chrome.storage.local.set({ wishlist: items });
    return items[index];
  }

  static async removeItem(id) {
    const items = await this.getAllItems();
    const filtered = items.filter(item => item.id !== id);
    await chrome.storage.local.set({ wishlist: filtered });
    return filtered;
  }

  static async getItem(id) {
    const items = await this.getAllItems();
    return items.find(item => item.id === id) || null;
  }
}

