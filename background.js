// Background service worker for price tracking
// Import storage utilities (injected at runtime)
importScripts('storage.js');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Wishlist Price Tracker installed');
});

// Listen for price selection from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'priceSelected') {
    // Store the selected price info temporarily
    chrome.storage.local.set({ 
      lastSelectedPrice: {
        price: request.price,
        selector: request.selector,
        text: request.text
      }
    });
    sendResponse({ success: true });
  }
});

// Refresh prices for all wishlist items
async function refreshAllPrices() {
  const items = await WishlistStorage.getAllItems();
  const results = [];
  
  for (const item of items) {
    try {
      const price = await fetchPriceForItem(item);
      if (price && price !== item.price) {
        await WishlistStorage.updateItem(item.id, { price });
        results.push({
          id: item.id,
          oldPrice: item.price,
          newPrice: price,
          changed: true
        });
      } else if (price) {
        await WishlistStorage.updateItem(item.id, { price });
        results.push({
          id: item.id,
          price,
          changed: false
        });
      }
    } catch (error) {
      console.error(`Error refreshing price for ${item.url}:`, error);
      results.push({
        id: item.id,
        error: error.message
      });
    }
  }
  
  return results;
}

// Fetch price for a specific item
async function fetchPriceForItem(item) {
  return new Promise((resolve, reject) => {
    // Open the page in a background tab to fetch the price
    chrome.tabs.create({ url: item.url, active: false }, (tab) => {
      // Wait for page to load
      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          
          // Inject price scraper and extract price
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['priceScraper.js']
          }).then(() => {
            return chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (selector) => {
                if (selector) {
                  const result = PriceScraper.getPriceBySelector(selector);
                  return result ? result.price : null;
                } else {
                  const result = PriceScraper.findPriceAuto();
                  return result ? result.price : null;
                }
              },
              args: [item.priceSelector]
            });
          }).then((results) => {
            const price = results[0]?.result || null;
            // Close the tab
            chrome.tabs.remove(tab.id);
            resolve(price);
          }).catch((error) => {
            chrome.tabs.remove(tab.id);
            reject(error);
          });
        }
      };
      
      chrome.tabs.onUpdated.addListener(listener);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.tabs.remove(tab.id);
        reject(new Error('Timeout fetching price'));
      }, 10000);
    });
  });
}

// Refresh prices when extension is opened
chrome.runtime.onStartup.addListener(() => {
  refreshAllPrices();
});

// Listen for refresh request from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refreshPrices') {
    refreshAllPrices().then(results => {
      sendResponse({ success: true, results });
    });
    return true; // Keep channel open for async response
  }
});

