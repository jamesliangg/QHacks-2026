# Installation Guide

## Quick Start

1. **Generate Icons** (if not already present):
   - Open `create-icons.html` in your browser
   - Right-click each canvas and save as:
     - `icons/icon16.png`
     - `icons/icon48.png`
     - `icons/icon128.png`
   - Alternatively, create your own icons using any image editor

2. **Load the Extension**:
   - Open Chrome/Edge and go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `qhacks2026` directory

3. **Start Using**:
   - Navigate to any product page
   - Click the extension icon
   - Click "Add Current Page" to add to wishlist

## Troubleshooting

### Icons Missing Error
If you see an error about missing icons:
- Make sure the `icons/` directory contains `icon16.png`, `icon48.png`, and `icon128.png`
- Use the `create-icons.html` file to generate them, or create simple placeholder images

### Price Not Detected
- The extension tries common selectors first
- If auto-detection fails, click "Select Price Element" and manually select the price
- The selector will be saved for future price checks

### Extension Not Working
- Make sure all files are in the correct directory
- Check the browser console for errors (right-click extension icon → Inspect popup)
- Verify the manifest.json is valid JSON

## File Structure

```
qhacks2026/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup logic
├── content.js            # Content script for price detection
├── background.js         # Background service worker
├── priceScraper.js       # Price scraping utilities
├── storage.js            # Wishlist storage management
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── create-icons.html     # Icon generator tool
├── README.md             # Main documentation
└── INSTALLATION.md       # This file
```

