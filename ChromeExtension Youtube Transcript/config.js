// config.js
const config = {
    apiKey: '' // This will be set from environment variables
};

// Load API key from chrome.storage.local
chrome.storage.local.get(['apiKey'], function(result) {
    if (result.apiKey) {
        config.apiKey = result.apiKey;
    }
});

