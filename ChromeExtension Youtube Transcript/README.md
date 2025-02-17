# YouTube Transcript Fetcher & AI Assistant Chrome Extension

A powerful Chrome extension that not only fetches YouTube video transcripts but also allows you to have intelligent conversations about the video content using Google's Gemini AI. Get instant access to video transcripts and ask questions about any part of the video.

## Demo

Watch the extension in action:

<video src="https://github.com/user-attachments/assets/a4ea561b-babc-4e6f-a35c-623ec7262e4f" controls></video>

## Features

- 🎯 Instantly fetch transcripts from any YouTube video
- 🤖 AI-powered video content analysis using Google's Gemini
- 💬 Interactive chat interface to ask questions about the video
- 🌐 Support for auto-generated captions
- 🔍 Real-time transcript processing
- 📝 Clean and modern user interface
- 🌍 Support for multiple languages (through YouTube's caption system)
- ⚡ Fast and responsive performance
- 🔒 Secure API key management

## Installation

1. Clone this repository or download the source code
2. Create a `config.json` file in the extension directory (copy from `config.sample.json`)
3. Add your API keys to `config.json`:
   ```json
   {
       "apiKey": "YOUR_YOUTUBE_API_KEY_HERE",
       "geminiApiKey": "YOUR_GEMINI_API_KEY_HERE"
   }
   ```

### Getting API Keys

#### YouTube Data API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to Credentials and create an API key
5. Copy the API key to your `config.json`

#### Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click on 'Create API Key'
4. Copy the API key to your `config.json`

⚠️ **Important**: Keep your API keys secure and never commit them to version control.
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right corner
6. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in your Chrome toolbar
3. Click the "Fetch Transcript" button
4. The transcript will appear in the popup window

## Project Structure

```
├── manifest.json           # Chrome extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Main extension logic
├── gemini.js              # Gemini AI integration
├── config.js              # Configuration management
├── config.sample.json     # API key configuration template
├── showdown.min.js        # Markdown rendering library
└── README.md              # Project documentation
```

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

#### 1. User Interface (`popup.html`, `popup.js`)
- Split-screen layout with transcript and chat sections
- Real-time loading indicators
- Markdown rendering for AI responses
- Responsive design for better usability

#### 2. Transcript Processing (`popup.js`)
- YouTube Data API integration
- Automatic caption track detection
- Timestamp-synchronized transcript extraction
- Error handling for various YouTube page states

#### 3. AI Integration (`gemini.js`)
- Google Gemini API integration
- Context-aware conversation handling
- Intelligent response generation
- Chat history management

#### 4. Configuration Management (`config.js`)
- Secure API key storage
- Environment configuration
- Chrome storage integration

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