# YouTube Transcript Fetcher Chrome Extension

A powerful Chrome extension that allows users to fetch and display transcripts from YouTube videos directly in their browser.

## Demo

Watch the extension in action:

![Demo Video](https://github.com/user-attachments/assets/a4ea561b-babc-4e6f-a35c-623ec7262e4f)

## Features

- 🎯 Instantly fetch transcripts from any YouTube video
- 🌐 Support for auto-generated captions
- 🔍 Works with the current active YouTube tab
- 📝 Clean and user-friendly interface
- 🌍 Support for multiple languages (through YouTube's caption system)

## Installation

1. Clone this repository or download the source code
2. Create a `config.json` file in the extension directory (copy from `config.sample.json`)
3. Add your YouTube Data API key to `config.json`:
   ```json
   {
       "apiKey": "YOUR_YOUTUBE_API_KEY_HERE"
   }
   ```
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right corner
6. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in your Chrome toolbar
3. Click the "Fetch Transcript" button
4. The transcript will appear in the popup window

## Technical Details

### Architecture

The extension is built using vanilla JavaScript and follows Chrome Extension Manifest V3 guidelines. It consists of:

- `manifest.json`: Extension configuration and permissions
- `popup.html`: The UI for the extension popup
- `popup.js`: Core functionality including:
  - YouTube API integration
  - Transcript fetching logic
  - UI handling

### Key Components

#### Configuration Management

The extension uses a secure configuration system to handle sensitive data:

1. Configuration Files:
   - `config.json`: Main configuration file that stores your YouTube Data API key
     ```json
     {
         "apiKey": "YOUR_YOUTUBE_API_KEY_HERE"
     }
     ```
   - `config.sample.json`: Template file showing the required configuration structure
     ```json
     {
         "apiKey": "YOUR_YOUTUBE_API_KEY_HERE"
     }
     ```

2. Runtime Security:
   - Chrome's Storage API is used to securely store the API key at runtime
   - API keys are loaded asynchronously when the extension starts
   - Keys are never exposed in the browser's developer tools

#### YouTubeTranscriptFetcher Class

The main class that handles:
- Video ID extraction from URLs
- Fetching video information via YouTube Data API
- Retrieving captions and transcripts
- Error handling and user feedback

### Security Considerations

1. API Key Protection:
   - API keys are stored in a separate `config.json` file
   - `config.json` is listed in `.gitignore` to prevent accidental commits
   - Keys are loaded securely at runtime using Chrome's Storage API

2. Safe Configuration:
   - Use `config.sample.json` as a template
   - Never commit actual API keys to version control
   - Each developer maintains their own local `config.json`

### Permissions

The extension requires the following permissions:
- `activeTab`: To access the current YouTube tab
- `scripting`: To inject scripts for fetching video data
- `tabs`: To interact with browser tabs

### Host Permissions

- `https://www.youtube.com/*`: To access YouTube video pages
- `https://youtube.googleapis.com/*`: To interact with YouTube API

## Development

### Prerequisites

- Chrome browser
- Basic knowledge of JavaScript and Chrome Extension development

### Local Development

1. Make changes to the source code
2. Reload the extension in `chrome://extensions/`
3. Test the changes on a YouTube video

### Error Handling

The extension includes robust error handling for common scenarios:
- Video not found
- No captions available
- Network errors
- API failures

## Security

- Uses Content Security Policy (CSP) to prevent XSS attacks
- Implements safe data parsing and sanitization
- Follows Chrome Extension security best practices

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- YouTube Data API
- Chrome Extensions API
- The open-source community

---

Built with ❤️ for YouTube content consumers