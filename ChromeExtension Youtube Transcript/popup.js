// Load API key from config file
let transcriptFetcher = null;

// Function to initialize the YouTubeTranscriptFetcher
async function initializeTranscriptFetcher() {
    try {
        const response = await fetch(chrome.runtime.getURL('config.json'));
        const config = await response.json();
        const apiKey = config.apiKey;
        
        // Store API key securely in chrome.storage.local
        await chrome.storage.local.set({ apiKey });
        console.log('API key loaded and stored securely');
        
        // Initialize the transcript fetcher with the API key
        transcriptFetcher = new YouTubeTranscriptFetcher(apiKey);
        return true;
    } catch (error) {
        console.error('Error initializing:', error);
        return false;
    }
}

class YouTubeTranscriptFetcher {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    getVideoId(url) {
        console.log('Attempting to extract video ID from URL:', url);
        // debugger; // Pause here to inspect url
        try {
            const urlObj = new URL(url);
            console.log('Parsed URL object:', {
                hostname: urlObj.hostname,
                pathname: urlObj.pathname,
                searchParams: Object.fromEntries(urlObj.searchParams)
            });
            
            if (urlObj.hostname === 'youtu.be') {
                const videoId = urlObj.pathname.slice(1);
                console.log('Extracted video ID from youtu.be URL:', videoId);
                return videoId;
            }
            if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
                if (urlObj.pathname === '/watch') {
                    const videoId = urlObj.searchParams.get('v');
                    console.log('Extracted video ID from youtube.com URL:', videoId);
                    return videoId;
                }
            }
            console.log('No video ID found in URL');
            return null;
        } catch (error) {
            console.error('Error parsing URL:', error);
            return null;
        }
    }

    async getVideoInfo(videoId) {
        // 🔵 Breakpoint 1: Check videoId
        console.log('Fetching video info for video ID:', videoId);
        try {
            // debugger; // Pause here to inspect videoId
            // 🔵 Breakpoint 2: Check URL construction
            const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${this.apiKey}`;
            console.log('Making API request to:', url.replace(this.apiKey, '[REDACTED]'));
            
            const response = await fetch(url);
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            // 🔵 Breakpoint 3: Check API response
            let data;
            try {
                data = await response.json();
            } catch (error) {
                console.error('Failed to parse JSON from response:', error);
                const textBody = await response.text();
                console.log('Response text:', textBody);
                data = null; // or handle error gracefully
            }
            // debugger; // Pause here to inspect response data
            console.log('API response data:', data);

            if (data && data.items && data.items.length > 0) {
                const snippet = data.items[0].snippet;
                // 🔵 Breakpoint 4: Check extracted data
                const videoInfo = {
                    title: snippet.title,
                    channel: snippet.channelTitle
                };
                console.log('Successfully extracted video info:', videoInfo);
                return videoInfo;
            }
            console.log('No video information found in API response');
            return null;
        } catch (error) {
            console.error('Error fetching video info:', error);
            return null;
        }
    }

    async getTranscript(videoId) {
        try {
            console.log('Fetching transcript for video:', videoId);
            
            console.log('Starting transcript fetch...');
            
            // Get the active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('Found tabs:', tabs);
            
            if (!tabs || tabs.length === 0) {
                throw new Error('No active tab found');
            }
            
            const tab = tabs[0];
            console.log('Active tab:', { 
                id: tab.id, 
                url: tab.url,
                status: tab.status
            });
            
            if (!tab.url?.includes('youtube.com/watch')) {
                throw new Error('Please navigate to a YouTube video page first');
            }
            
            // Inject and execute script to get caption data
            console.log('Injecting script into tab:', tab.id);
            let pageData;
            try {
                const injectionResults = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        // This function runs in the context of the YouTube page
                        console.log('Script injected, searching for YouTube player data...');
                        
                        // Debug window object keys
                        console.log('Available window properties:', Object.keys(window));
                        
                        // Try different ways to get the player response
                        let ytInitialPlayerResponse = window.ytInitialPlayerResponse;
                        
                        if (!ytInitialPlayerResponse) {
                            // Try to find it in the page source
                            const scripts = document.getElementsByTagName('script');
                            for (const script of scripts) {
                                const text = script.text;
                                if (text && text.includes('ytInitialPlayerResponse')) {
                                    try {
                                        const match = text.match(/ytInitialPlayerResponse\s*=\s*({.*?});/);
                                        if (match && match[1]) {
                                            ytInitialPlayerResponse = JSON.parse(match[1]);
                                            console.log('Found player response in script tag');
                                            break;
                                        }
                                    } catch (e) {
                                        console.log('Error parsing script content:', e);
                                    }
                                }
                            }
                        }
                        
                        console.log('Player response found:', !!ytInitialPlayerResponse);
                        console.log('Player response type:', typeof ytInitialPlayerResponse);
                        
                        if (!ytInitialPlayerResponse) {
                            throw new Error('Could not find YouTube player data - please refresh the page');
                        }
                        
                        // Log the structure of the response
                        console.log('Player response keys:', Object.keys(ytInitialPlayerResponse));
                        
                        const result = {
                            captions: ytInitialPlayerResponse.captions,
                            videoDetails: ytInitialPlayerResponse.videoDetails
                        };
                        
                        console.log('Extracted result:', result);
                        console.log('Data extracted:', {
                            hasCaptions: !!result.captions,
                            hasVideoDetails: !!result.videoDetails
                        });
                        return JSON.stringify(result);
                    }
                });
                
                console.log('Script injection results:', JSON.stringify(injectionResults, null, 2));
                console.log('Injection results type:', typeof injectionResults);
                console.log('Is array?', Array.isArray(injectionResults));
                
                if (!injectionResults || injectionResults.length === 0) {
                    throw new Error('Script injection failed - no results returned');
                }
                
                console.log('First injection result:', injectionResults[0]);
                const {result} = injectionResults[0];
                if (!result) {
                    throw new Error('Script executed but returned no data');
                }
                pageData = result;
                
                console.log('Successfully retrieved YouTube page data');
                console.log('Page data:', pageData);
                // debugger; // Pause here to inspect pageData
            } catch (error) {
                console.error('Error during script injection:', error);
                throw error;
            }
            
            // Parse the YouTube data
            let parsedData;
            try {
                parsedData = JSON.parse(pageData);
            } catch (error) {
                console.error('Failed to parse pageData:', error);
                throw new Error('Failed to parse YouTube data');
            }
            
            const { captions, videoDetails } = parsedData;
            
            if (!captions) {
                const videoTitle = videoDetails?.title || 'this video';
                throw new Error(`No captions are available for "${videoTitle}". The video creator may need to add them.`);
            }
            
            // Check if captions are actually available
            const captionTracks = captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (!captionTracks || captionTracks.length === 0) {
                const videoTitle = videoDetails?.title || 'this video';
                throw new Error(`No caption tracks found for "${videoTitle}". The video might not have any captions or subtitles.`);
            }
            
            const transcriptUrl = captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0]?.baseUrl;
            
            if (!transcriptUrl) {
                throw new Error('No transcript URL found');
            }
            
            // Inject and execute script to fetch transcript
            const [{result: transcriptData}] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: async (url) => {
                    const response = await fetch(url);
                    const text = await response.text();
                    return text;
                },
                args: [transcriptUrl]
            });
            
            // Parse XML to get transcript
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(transcriptData, "text/xml");
            const textElements = xmlDoc.getElementsByTagName('text');
            
            const transcript = [];
            for (let i = 0; i < textElements.length; i++) {
                const element = textElements[i];
                transcript.push({
                    text: element.textContent,
                    start: parseFloat(element.getAttribute('start')),
                    duration: parseFloat(element.getAttribute('dur'))
                });
            }

            return transcript;
        } catch (error) {
            throw new Error(`Failed to fetch transcript: ${error.message}`);
        }
    }
}

// Function to reload the current tab and wait for it to complete
async function reloadTabAndWait() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.reload(tab.id);
    // Wait for the page to reload
    return new Promise((resolve) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                // Give a little extra time for YouTube to initialize
                setTimeout(resolve, 1000);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Extension popup loaded');
    const fetchButton = document.getElementById('fetchTranscript');
    const transcriptDiv = document.getElementById('transcript');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');

    // Initialize the transcript fetcher
    const initialized = await initializeTranscriptFetcher();
    if (!initialized) {
        transcriptDiv.innerHTML = 'Error: Could not initialize the transcript fetcher. Please check your API key.';
        return;
    }
    console.log('Created YouTubeTranscriptFetcher instance');
    
    // Initialize Gemini API
    const config = await fetch(chrome.runtime.getURL('config.json')).then(r => r.json());
    const geminiApi = new GeminiAPI(config.geminiApiKey);

    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        if (!isUser) {
            const converter = new showdown.Converter();
            messageDiv.innerHTML = converter.makeHtml(content);
        } else {
            messageDiv.textContent = content;
        }
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle chat input
    async function handleChat() {
        const message = chatInput.value.trim();
        if (!message) return;

        try {
            // Disable input while processing
            chatInput.disabled = true;
            sendButton.disabled = true;

            // Add user message to chat
            addMessage(message, true);
            chatInput.value = '';

            // Get AI response
            let response;
            if (geminiApi.chatHistory.length <= 1) { // Only system message present
                response = await geminiApi.generateResponse(geminiApi.currentTranscript, message);
            } else {
                response = await geminiApi.chat(message);
            }
            addMessage(response, false);
        } catch (error) {
            console.error('Chat error:', error);
            addMessage(`Error: ${error.message}`, false);
        } finally {
            // Re-enable input
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatInput.focus();
        }
    }

    // Set up chat input handlers
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });

    sendButton.addEventListener('click', handleChat);

    fetchButton.addEventListener('click', async () => {
        console.log('Fetch button clicked');
        const loadingDiv = document.querySelector('.loading');
        transcriptDiv.textContent = ''; // Clear previous content
        chatMessages.innerHTML = ''; // Clear previous chat messages
        
        try {
            loadingDiv.classList.add('active'); // Show loading indicator
            fetchButton.disabled = true; // Disable button while fetching
            
            // Reload the page to ensure fresh data
            await reloadTabAndWait();
            console.log('Page reloaded, proceeding with transcript fetch');
            
            console.log('Getting current tab URL...');
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.url) {
                throw new Error('Could not get current tab URL');
            }
            console.log('Current tab URL:', tab.url);
            
            const videoId = transcriptFetcher.getVideoId(tab.url);
            console.log('Video ID:', videoId);

            if (!videoId) {
                throw new Error('Not a valid YouTube video page');
            }

            // Get video info
            const videoInfo = await transcriptFetcher.getVideoInfo(videoId);
            if (!videoInfo) {
                throw new Error('Could not fetch video information');
            }
            console.log('Video info:', videoInfo);

            // Get transcript
            const transcript = await transcriptFetcher.getTranscript(videoId);
            if (!transcript || transcript.length === 0) {
                throw new Error('No transcript available for this video');
            }
            console.log('Fetched transcript length:', transcript.length);
            
            // Format output
            let output = `Title: ${videoInfo.title}\n`;
            output += `Channel: ${videoInfo.channel}\n\n`;
            output += "Transcript:\n";
            
            transcript.forEach(entry => {
                const minutes = Math.floor(entry.start / 60);
                const seconds = Math.floor(entry.start % 60);
                const timeStamp = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}]`;
                output += `${timeStamp} ${entry.text}\n`;
            });

            transcriptDiv.textContent = output;
            
            // Initialize chat with transcript
            geminiApi.setTranscript(output);
            
            // Enable chat input
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatMessages.innerHTML = '';
            addMessage('I have analyzed the transcript. Feel free to ask me any questions about the video!', false);
        } catch (error) {
            console.error('Error fetching transcript:', error);
            transcriptDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        } finally {
            loadingDiv.classList.remove('active'); // Hide loading indicator
            fetchButton.disabled = false; // Re-enable button
        }
    });
});