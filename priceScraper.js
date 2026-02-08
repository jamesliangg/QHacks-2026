// Price scraping utilities
// Prevent redeclaration if script is loaded multiple times
if (typeof window.PriceScraper === 'undefined') {
  window.PriceScraper = class PriceScraper {
  // Common price selectors for popular e-commerce sites
  static COMMON_SELECTORS = [
    '[data-price]',
    '.price',
    '.product-price',
    '.price-current',
    '.current-price',
    '[itemprop="price"]',
    '.a-price .a-offscreen', // Amazon
    '.price-box__price', // Various sites
    '#priceblock_dealprice', // Amazon
    '#priceblock_ourprice', // Amazon
    '#priceblock_saleprice', // Amazon
    '.product-price-value',
    '.price-value',
    '[data-testid="price"]',
    '.pdp-product-price',
    '.product-detail-price',
    '.price-now',
    '.sale-price',
    '.regular-price'
  ];

  // Extract price from text
  static extractPrice(text) {
    if (!text) return null;
    
    // Remove common currency symbols and extract numbers
    const cleaned = text.replace(/[^\d.,]/g, '');
    const match = cleaned.match(/(\d+[.,]?\d*)/);
    if (!match) return null;
    
    // Convert to number (handle both comma and dot as decimal separator)
    const priceStr = match[1].replace(',', '.');
    const price = parseFloat(priceStr);
    
    return isNaN(price) ? null : price;
  }

  // Try to find price using common selectors
  static async findPriceAuto() {
    for (const selector of this.COMMON_SELECTORS) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent || element.innerText || element.getAttribute('content');
          const price = this.extractPrice(text);
          if (price && price > 0) {
            return {
              price,
              selector,
              element: element,
              text: text.trim()
            };
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    return null;
  }

  // Get price using a specific selector
  static getPriceBySelector(selector) {
    try {
      const element = document.querySelector(selector);
      if (!element) return null;
      
      const text = element.textContent || element.innerText || element.getAttribute('content');
      const price = this.extractPrice(text);
      
      return {
        price,
        selector,
        element: element,
        text: text.trim()
      };
    } catch (e) {
      return null;
    }
  }

  // Get price from selected element
  static getPriceFromElement(element) {
    if (!element) return null;
    
    const text = element.textContent || element.innerText || element.getAttribute('content');
    const price = this.extractPrice(text);
    
    // Generate a unique selector for this element
    const selector = this.generateSelector(element);
    
    return {
      price,
      selector,
      element: element,
      text: text.trim()
    };
  }

  // Generate a CSS selector for an element
  static generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).join('.');
      if (classes) {
        const tagName = element.tagName.toLowerCase();
        const selector = `${tagName}.${classes}`;
        // Check if this selector is unique
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }
    
    // Fallback to path-based selector
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      if (current.className) {
        const classes = current.className.split(' ').filter(c => c).slice(0, 2).join('.');
        if (classes) selector += `.${classes}`;
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current);
          selector += `:nth-of-type(${index + 1})`;
        }
      }
      path.unshift(selector);
      current = parent;
    }
    
    return path.join(' > ');
  }
  };
}

