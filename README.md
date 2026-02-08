# Wishlist Price Tracker Browser Extension

A Chrome/Edge browser extension that allows you to add products from any website to a wishlist and track their prices over time. The extension automatically detects prices when possible, or allows you to manually select the price element if auto-detection fails.

## Features

- ✅ Add products from any website to your wishlist
- ✅ Automatic price detection using common e-commerce selectors
- ✅ Manual price element selection if auto-detection fails
- ✅ Price tracking with history
- ✅ Price change notifications (increase/decrease indicators)
- ✅ Refresh prices on demand or automatically when extension opens
- ✅ **Integration with changedetection.io** for automated price monitoring
- ✅ Clean, modern UI

## Installation

### Extension Setup

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension directory

### changedetection.io Setup (Optional but Recommended)

For automated price monitoring, set up a local instance of changedetection.io:

1. **Run changedetection.io using Docker:**
   ```bash
   docker run -d \
     --name changedetection \
     -p 8888:5000 \
     -v datastore-volume:/datastore \
     ghcr.io/dgtlmoon/changedetection.io:latest
   ```
   
   **Note:** Port 8888 is used to avoid conflicts with macOS Control Center on port 5000. You can use any available port (5050, 8080, etc.) if 8888 is already in use.

2. **Or use Docker Compose:**
   ```yaml
   version: '3'
   services:
     changedetection:
       image: ghcr.io/dgtlmoon/changedetection.io:latest
       ports:
         - "5000:5000"
       volumes:
         - datastore-volume:/datastore
   ```

3. **Access changedetection.io:**
   - Open `http://localhost:8888` in your browser
   - Go to **SETTINGS** → **API** tab
   - Copy your API key

4. **Configure the extension:**
   - Click the settings icon (⚙️) in the extension popup
   - Enter your changedetection.io URL (default: `http://localhost:8888`)
   - Enter your API key
   - Click "Test Connection" to verify
   - Click "Save Settings"

## Usage

### Adding a Product

1. Navigate to a product page on any website
2. Click the extension icon in your browser toolbar
3. Click "Add Current Page" - the extension will try to automatically detect the price
4. If price detection fails, click "Select Price Element" and click on the element containing the price
5. The product will be added to your wishlist

### Managing Your Wishlist

- **View all items**: Open the extension popup to see all items in your wishlist
- **Refresh prices**: Click the "Refresh" button to check all prices
- **Refresh individual item**: Click the refresh icon (🔄) next to any item
- **Remove items**: Click the delete icon (🗑️) next to any item

### Price Tracking

- Prices are automatically checked when you open the extension
- Price changes are highlighted with color-coded indicators:
  - 🟢 Green: Price decreased (good news!)
  - 🔴 Red: Price increased
  - ⚪ Gray: No change
- Price history is stored for each item

### changedetection.io Integration

When you add a product to your wishlist:
- A watch is automatically created in changedetection.io
- The watch monitors the product page for changes
- If you selected a price element, it uses CSS filtering to focus on price changes
- You'll receive notifications through changedetection.io when prices change
- Watches are automatically deleted when you remove items from your wishlist

## How It Works

### Automatic Price Detection

The extension uses a list of common CSS selectors used by popular e-commerce sites to automatically find prices. It tries selectors in order until it finds a valid price.

### Manual Price Selection

If automatic detection fails, you can:
1. Click "Select Price Element"
2. Hover over elements on the page to see them highlighted
3. Click on the element containing the price
4. The extension will generate a CSS selector for that element and use it for future price checks

### Data Storage

- **Wishlist data**: Stored locally in your browser using Chrome's storage API. Your data never leaves your device.
- **API credentials**: Stored securely in Chrome's storage (not cookies, as extensions use storage API for better security)
- **changedetection.io watches**: Created and managed via API. Watch UUIDs are stored with each wishlist item for synchronization.

## Technical Details

### Files Structure

- `manifest.json` - Extension configuration
- `popup.html/css/js` - Extension popup UI
- `content.js` - Content script for price detection and element selection
- `background.js` - Background service worker for price tracking
- `priceScraper.js` - Price scraping utilities
- `storage.js` - Wishlist storage management
- `changedetectionApi.js` - changedetection.io API integration

### Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Price Tracking Implementation

The extension implements price tracking through:

1. **Local Price Detection**: 
   - Opens product pages in background tabs
   - Extracts prices using stored selectors
   - Compares with previous prices
   - Stores price history locally

2. **changedetection.io Integration** (when configured):
   - Automatically creates watches for each product
   - Uses CSS selectors to focus on price elements
   - Monitors pages continuously in the background
   - Sends notifications when prices change
   - Syncs watch deletion with wishlist removal

The changedetection.io integration provides:
- Continuous monitoring without keeping browser tabs open
- Configurable check intervals
- Multiple notification channels (email, Discord, Slack, webhooks, etc.)
- Historical snapshots and diffs

## Future Enhancements

Potential improvements:
- Integration with changedetection.io API for automated monitoring
- Price drop browser notifications
- Export wishlist data (JSON/CSV)
- Price alerts (notify when price drops below threshold)
- Support for multiple currencies
- Price history charts/visualization
- Batch price checking with progress indicator
- Support for logged-in pages (cookies/session)

## Development

To modify the extension:

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT License - feel free to use and modify as needed.

