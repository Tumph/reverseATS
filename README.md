# WaterlooWorks TR Counter

A Chrome extension that counts and displays the number of table rows (`<tr>` elements) on the WaterlooWorks job page.

## Features

- Displays a counter in the top-right corner of the page showing the number of table rows
- Updates automatically when the page content changes
- Works on all WaterlooWorks pages

## Development

This extension is built with TypeScript and bundled with webpack.

### Prerequisites

- Node.js and npm

### Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

### Build

To build the extension:

```
npm run build
```

This will:
1. Run the webpack configuration to compile and bundle TypeScript
2. Copy the manifest.json and icon files to the dist directory

For more granular control, you can use:
- `npm run config` - Run webpack to compile TypeScript
- `npm run copy-assets` - Copy static assets to the dist directory
- `npm run tsc` - Run TypeScript compiler directly

### Development Mode

To watch for changes and rebuild automatically:

```
npm run watch
```

## Installation

1. Build the extension using the instructions above
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `dist` directory from this project
5. The extension should now be installed and active

## How It Works

The extension counts all `<tr>` elements on the page and displays the count in a fixed position in the top-right corner. It uses a MutationObserver to detect changes to the DOM and update the count accordingly.

## License

ISC 