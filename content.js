// Content script for price detection and element selection
// Prevent redeclaration if script is loaded multiple times
(function() {
  if (window.wishlistTrackerInitialized) {
    return; // Already initialized
  }
  window.wishlistTrackerInitialized = true;
  
  let selectionMode = false;
  let highlightOverlay = null;

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'detectPrice') {
      detectPrice().then(result => sendResponse(result));
      return true; // Keep channel open for async response
    }
    
    if (request.action === 'startSelection') {
      startElementSelection();
      sendResponse({ success: true });
    }
    
    if (request.action === 'stopSelection') {
      stopElementSelection();
      sendResponse({ success: true });
    }
    
    if (request.action === 'getPageInfo') {
      sendResponse({
        url: window.location.href,
        title: document.title
      });
    }
  });

  // Detect price on current page
  async function detectPrice() {
    // Try auto-detection first
    const PriceScraperClass = window.PriceScraper;
    if (!PriceScraperClass) {
      return {
        success: false,
        message: 'PriceScraper not available'
      };
    }
    
    const autoResult = PriceScraperClass.findPriceAuto();
    if (autoResult) {
      return {
        success: true,
        price: autoResult.price,
        selector: autoResult.selector,
        text: autoResult.text,
        method: 'auto'
      };
    }
    
    return {
      success: false,
      message: 'Could not automatically detect price. Please select the price element manually.'
    };
  }

  // Start element selection mode
  function startElementSelection() {
    selectionMode = true;
    document.body.style.cursor = 'crosshair';
    
    // Create overlay for highlighting
    highlightOverlay = document.createElement('div');
    highlightOverlay.style.cssText = `
      position: fixed;
      border: 2px solid #4CAF50;
      background: rgba(76, 175, 80, 0.1);
      pointer-events: none;
      z-index: 999999;
      display: none;
    `;
    document.body.appendChild(highlightOverlay);
    
    // Add event listeners
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    
    // Show instruction banner
    showInstructionBanner();
  }

  // Stop element selection mode
  function stopElementSelection() {
    selectionMode = false;
    document.body.style.cursor = '';
    
    if (highlightOverlay) {
      highlightOverlay.remove();
      highlightOverlay = null;
    }
    
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    
    hideInstructionBanner();
  }

  // Handle mouse over during selection
  function handleMouseOver(e) {
    if (!selectionMode) return;
    
    const element = e.target;
    const rect = element.getBoundingClientRect();
    
    if (highlightOverlay) {
      highlightOverlay.style.display = 'block';
      highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
      highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
      highlightOverlay.style.width = `${rect.width}px`;
      highlightOverlay.style.height = `${rect.height}px`;
    }
  }

  // Handle mouse out during selection
  function handleMouseOut(e) {
    if (!selectionMode) return;
    // Keep overlay visible but don't hide it
  }

  // Handle click during selection
  function handleClick(e) {
    if (!selectionMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target;
    const PriceScraperClass = window.PriceScraper;
    if (!PriceScraperClass) {
      alert('PriceScraper not available');
      stopElementSelection();
      return;
    }
    
    const priceData = PriceScraperClass.getPriceFromElement(element);
    
    if (priceData && priceData.price) {
      chrome.runtime.sendMessage({
        action: 'priceSelected',
        price: priceData.price,
        selector: priceData.selector,
        text: priceData.text
      });
      
      // Highlight the selected element briefly
      const originalOutline = element.style.outline;
      element.style.outline = '3px solid #4CAF50';
      setTimeout(() => {
        element.style.outline = originalOutline;
      }, 2000);
    } else {
      alert('Could not extract a price from the selected element. Please try selecting a different element.');
    }
    
    stopElementSelection();
  }

  // Show instruction banner
  function showInstructionBanner() {
    let banner = document.getElementById('wishlist-tracker-banner');
    if (banner) return;
    
    banner = document.createElement('div');
    banner.id = 'wishlist-tracker-banner';
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #2196F3;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 1000000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 500px;
      text-align: center;
    `;
    banner.textContent = 'Click on the element containing the price';
    document.body.appendChild(banner);
  }

  // Hide instruction banner
  function hideInstructionBanner() {
    const banner = document.getElementById('wishlist-tracker-banner');
    if (banner) {
      banner.remove();
    }
  }

})(); // End of IIFE
