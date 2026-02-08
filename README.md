# Wishlist Price Tracker Browser Extension

A Chrome/Edge browser extension that allows you to add products from any website to a wishlist and track their prices over time. The extension automatically detects prices when possible, or allows you to manually select the price element if auto-detection fails.

## Features

- ✅ Add products from any website to your wishlist
- ✅ Automatic price detection using common e-commerce selectors
- ✅ Manual price element selection if auto-detection fails
- ✅ Price tracking with history
- ✅ Price change notifications (increase/decrease indicators)
- ✅ Refresh prices on demand or automatically when extension opens
- ✅ Clean, modern UI

## Installation

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension directory

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

## How It Works

### Automatic Price Detection

The extension uses a list of common CSS selectors used by popular e-commerce sites to automatically find prices. It tries selectors in order until it finds a valid price.

### Manual Price Selection

If automatic detection fails, you can:
1. Click "Select Price Element"
2. Hover over elements on the page to see them highlighted
3. Click on the element containing the price
4. The extension will generate a CSS selector for that element and use it for future price checks

### Price Storage

All wishlist data is stored locally in your browser using Chrome's storage API. Your data never leaves your device.

## Technical Details

### Files Structure

- `manifest.json` - Extension configuration
- `popup.html/css/js` - Extension popup UI
- `content.js` - Content script for price detection and element selection
- `background.js` - Background service worker for price tracking
- `priceScraper.js` - Price scraping utilities
- `storage.js` - Wishlist storage management

### Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Price Tracking Implementation

The extension currently implements basic price tracking by:
- Opening product pages in background tabs
- Extracting prices using stored selectors
- Comparing with previous prices
- Storing price history

For more advanced monitoring, you could integrate with:
- **changedetection.io**: Set up monitoring URLs that check prices periodically
- **Custom API**: Create a backend service that periodically checks prices
- **Browser notifications**: Alert users when prices drop

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

