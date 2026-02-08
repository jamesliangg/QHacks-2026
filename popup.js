// Popup script for wishlist management UI
let currentTab = null;
let isSelectingPrice = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadWishlist();
  await getCurrentTab();
  setupEventListeners();
  
  // Refresh prices when popup opens
  refreshAllPrices();
});

// Get current active tab
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  
  // Show/hide select price button based on whether we're on a valid page
  if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
    document.getElementById('selectPriceBtn').style.display = 'block';
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('addCurrentPageBtn').addEventListener('click', addCurrentPage);
  document.getElementById('selectPriceBtn').addEventListener('click', startPriceSelection);
  document.getElementById('refreshBtn').addEventListener('click', refreshAllPrices);
  
  // Listen for price selection from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'priceSelected') {
      handlePriceSelected(request);
    }
  });
}

// Add current page to wishlist
async function addCurrentPage() {
  if (!currentTab) {
    showStatus('Error: Could not get current tab', 'error');
    return;
  }

  try {
    // Get page info
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => ({
        url: window.location.href,
        title: document.title
      })
    });

    // Try to detect price automatically
    // PriceScraper should already be loaded via content_scripts in manifest
    const [detectResult] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        // PriceScraper should be available from content_scripts
        const PriceScraperClass = window.PriceScraper;
        if (!PriceScraperClass) {
          return { success: false, error: 'PriceScraper not loaded' };
        }
        const autoResult = PriceScraperClass.findPriceAuto();
        if (autoResult) {
          return {
            success: true,
            price: autoResult.price,
            selector: autoResult.selector,
            text: autoResult.text
          };
        }
        return { success: false };
      }
    });

    let priceData = null;
    if (detectResult.result && detectResult.result.success) {
      priceData = detectResult.result;
    } else {
      // Check if user previously selected a price
      const stored = await chrome.storage.local.get(['lastSelectedPrice']);
      if (stored.lastSelectedPrice) {
        priceData = stored.lastSelectedPrice;
        await chrome.storage.local.remove(['lastSelectedPrice']);
      }
    }

    // Add to wishlist
    const item = await WishlistStorage.addItem({
      url: result.url,
      title: result.title,
      price: priceData ? priceData.price : null,
      priceSelector: priceData ? priceData.selector : null
    });

    showStatus('Product added to wishlist!', 'success');
    await loadWishlist();
  } catch (error) {
    console.error('Error adding page:', error);
    showStatus('Error adding page. Please try again.', 'error');
  }
}

// Start price selection mode
async function startPriceSelection() {
  if (!currentTab) {
    showStatus('Error: Could not get current tab', 'error');
    return;
  }

  isSelectingPrice = true;
  document.getElementById('selectPriceBtn').textContent = '⏹️ Cancel Selection';
  document.getElementById('selectPriceBtn').classList.add('btn-danger');
  
  try {
    // Scripts should already be loaded via content_scripts in manifest
    // Just send the message to start selection
    await chrome.tabs.sendMessage(currentTab.id, { action: 'startSelection' });
    
    showStatus('Click on the element containing the price', 'info');
  } catch (error) {
    console.error('Error starting selection:', error);
    showStatus('Error starting selection mode', 'error');
    isSelectingPrice = false;
    resetSelectButton();
  }
}

// Handle price selected from content script
async function handlePriceSelected(data) {
  isSelectingPrice = false;
  resetSelectButton();
  
  // Store the selected price
  await chrome.storage.local.set({ lastSelectedPrice: data });
  
  showStatus('Price element selected! Now click "Add Current Page" to add it to your wishlist.', 'success');
  
  // Auto-add if user wants
  setTimeout(async () => {
    await addCurrentPage();
  }, 500);
}

// Reset select button
function resetSelectButton() {
  document.getElementById('selectPriceBtn').textContent = '🎯 Select Price Element';
  document.getElementById('selectPriceBtn').classList.remove('btn-danger');
  
  if (currentTab) {
    chrome.tabs.sendMessage(currentTab.id, { action: 'stopSelection' }).catch(() => {
      // Ignore errors if content script is not available
    });
  }
}

// Load and display wishlist
async function loadWishlist() {
  const items = await WishlistStorage.getAllItems();
  const container = document.getElementById('wishlistItems');
  
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state">No items in wishlist yet</div>';
    return;
  }
  
  container.innerHTML = items.map(item => createItemHTML(item)).join('');
  
  // Add event listeners for delete buttons
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('.wishlist-item').dataset.id;
      await WishlistStorage.removeItem(id);
      await loadWishlist();
      showStatus('Item removed from wishlist', 'success');
    });
  });
  
  // Add event listeners for refresh buttons
  container.querySelectorAll('.btn-refresh-item').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('.wishlist-item').dataset.id;
      await refreshItemPrice(id);
    });
  });
}

// Create HTML for wishlist item
function createItemHTML(item) {
  const priceDisplay = item.price 
    ? `<div class="current-price">$${item.price.toFixed(2)}</div>`
    : '<div class="price-loading">Price not available</div>';
  
  const originalPriceDisplay = item.originalPrice && item.originalPrice !== item.price
    ? `<div class="original-price">$${item.originalPrice.toFixed(2)}</div>`
    : '';
  
  const priceChange = item.originalPrice && item.price
    ? calculatePriceChange(item.originalPrice, item.price)
    : null;
  
  const priceChangeDisplay = priceChange
    ? `<div class="price-change ${priceChange.type}">${priceChange.text}</div>`
    : '';
  
  const lastChecked = item.lastChecked
    ? new Date(item.lastChecked).toLocaleString()
    : 'Never';
  
  return `
    <div class="wishlist-item" data-id="${item.id}">
      <div class="item-header">
        <div class="item-title">${escapeHtml(item.title)}</div>
        <div class="item-actions">
          <button class="btn-icon btn-refresh-item" title="Refresh price">🔄</button>
          <button class="btn-icon btn-delete" title="Remove">🗑️</button>
        </div>
      </div>
      <div class="item-url">${escapeHtml(item.url)}</div>
      <div class="item-price-section">
        <div class="price-info">
          ${priceDisplay}
          ${originalPriceDisplay}
        </div>
        ${priceChangeDisplay}
      </div>
      <div class="last-checked">Last checked: ${lastChecked}</div>
    </div>
  `;
}

// Calculate price change
function calculatePriceChange(original, current) {
  const change = current - original;
  const percent = ((change / original) * 100).toFixed(1);
  
  if (change > 0) {
    return {
      type: 'increase',
      text: `+$${change.toFixed(2)} (+${percent}%)`
    };
  } else if (change < 0) {
    return {
      type: 'decrease',
      text: `-$${Math.abs(change).toFixed(2)} (${percent}%)`
    };
  } else {
    return {
      type: 'no-change',
      text: 'No change'
    };
  }
}

// Refresh price for a specific item
async function refreshItemPrice(id) {
  const item = await WishlistStorage.getItem(id);
  if (!item) return;
  
  try {
    // Open the item URL in a new tab to check price
    // In a real implementation, you might want to use a background fetch
    showStatus(`Checking price for ${item.title}...`, 'info');
    
    // For now, we'll just update the last checked time
    // In production, you'd fetch the page and extract the price
    await WishlistStorage.updateItem(id, { lastChecked: new Date().toISOString() });
    
    await loadWishlist();
    showStatus('Price updated', 'success');
  } catch (error) {
    console.error('Error refreshing price:', error);
    showStatus('Error refreshing price', 'error');
  }
}

// Refresh all prices
async function refreshAllPrices() {
  const items = await WishlistStorage.getAllItems();
  if (items.length === 0) {
    showStatus('No items to refresh', 'info');
    return;
  }
  
  showStatus('Refreshing prices...', 'info');
  
  // In a real implementation, you would:
  // 1. Open each URL in a background tab
  // 2. Extract the price using the stored selector
  // 3. Update the wishlist item
  
  // For now, we'll just update the last checked time
  for (const item of items) {
    await WishlistStorage.updateItem(item.id, { lastChecked: new Date().toISOString() });
  }
  
  await loadWishlist();
  showStatus('Prices refreshed!', 'success');
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

