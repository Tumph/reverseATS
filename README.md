# ReverseATS Job Matcher

![ReverseATS Logo](src/image48.png)

## Overview

ReverseATS Job Matcher is a Chrome extension designed for University of Waterloo students that helps you find the most relevant job postings on WaterlooWorks based on your resume. Instead of manually scanning through hundreds of job listings trying to guess which ones match your skills, ReverseATS automatically analyzes job descriptions and ranks them according to how well they match your resume.

## Features

- **Resume Upload and Analysis**: Upload your resume in PDF format and extract/edit the text for keyword optimization
- **Automatic Job Matching**: Automatically analyzes job postings on WaterlooWorks pages  
- **Match Percentage Visualization**: See a clear percentage match score for each job listing
- **NLP-Based Analysis**: Uses natural language processing to identify relevant skills and keywords
- **Works Across Multiple Job Boards**: Compatible with co-op, graduating, direct, and contract job listings

## Installation

1. Download the extension from the Chrome Web Store (coming soon)
2. Click "Add to Chrome" to install
3. Once installed, you'll see the ReverseATS icon in your browser toolbar

## How to Use

1. **Upload Your Resume**:
   - Click on the ReverseATS icon in your browser toolbar
   - Upload your resume (PDF only)
   - Review and optionally edit the extracted text to optimize keyword matching
   - Click "Save Resume"

2. **Browse WaterlooWorks Jobs**:
   - Navigate to any supported WaterlooWorks job listing page:
     - Co-op jobs (direct or all)
     - Graduating jobs
     - Contract jobs
   - The extension will automatically scan job postings and add match percentages

3. **Interpret Results**:
   - Higher percentage = better match with your resume
   - Use the match scores to prioritize which jobs to apply for
   - Review the job descriptions to confirm the match quality

## How It Works

ReverseATS uses advanced natural language processing and cosine similarity algorithms to:

1. Extract important skills and keywords from your resume
2. Scrape job descriptions from WaterlooWorks listings
3. Calculate similarity scores between your resume and each job
4. Display match percentages directly in the job listing table

The extension works completely client-side, ensuring your resume data stays private and secure.

## Supported Pages

- https://waterlooworks.uwaterloo.ca/myAccount/co-op/direct/jobs.htm
- https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm
- https://waterlooworks.uwaterloo.ca/myAccount/graduating/jobs.htm
- https://waterlooworks.uwaterloo.ca/myAccount/contract/jobs.htm

## Privacy

ReverseATS values your privacy:
- Your resume is stored locally in your browser's storage
- No data is sent to external servers
- All processing happens on your device

## Development

ReverseATS is built with TypeScript and uses modern web technologies:

```bash
# Install dependencies
npm install

# Build the extension
npm run build-extension

# Watch for changes during development
npm run watch
```

## Known Limitations

- Only supports PDF resume files
- Works only on WaterlooWorks job listing pages
- Requires a saved resume before job matching will work

## Contributing

Contributions are welcome! If you'd like to contribute, please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request


---

*ReverseATS Job Matcher is not affiliated with the University of Waterloo or WaterlooWorks.*
