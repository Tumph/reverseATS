# WaterlooWorks TR Counter

A Chrome extension that counts and displays the number of table rows (`<tr>` elements) on the WaterlooWorks job page and provides additional functionality for working with job listings.

## Features

- Counts and displays the number of table rows (jobs) on the page
- Extracts and displays job IDs from the table
- Scrapes detailed information about each job
- Allows downloading job details as JSON or CSV
- Includes an "About" button with information about the extension
- Updates automatically when the page content changes
- Works with the latest WaterlooWorks UI

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

### Installation

1. Build the extension using the instructions above
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `dist` directory from this project
5. The extension should now be installed and active

## How It Works

The extension adds a control panel above job listing tables on WaterlooWorks. The panel includes:

1. **TR Count Display**: Shows the number of table rows (jobs) on the page
2. **Scrape Button**: Counts rows and extracts job IDs
3. **Scrape Job Details Button**: Extracts detailed information about each job
4. **About Button**: Shows information about the extension
5. **Job IDs Display**: Shows the extracted job IDs
6. **Job Details Display**: Shows the extracted job details with options to download as JSON or CSV

The extension uses a MutationObserver to detect changes to the DOM and update the controls accordingly.

## Data Extraction

The extension extracts the following information from job listings:

- Job ID
- Job Title
- Organization
- Location/City
- Term
- Openings
- Status
- Level
- Application Deadline

All data is extracted directly from the page without making additional network requests.

## License

ISC 