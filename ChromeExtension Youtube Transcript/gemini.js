class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
        this.currentTranscript = null;
        this.chatHistory = [];
    }

    setTranscript(transcript) {
        this.currentTranscript = transcript;
        this.chatHistory = [];
        
        // Add initial system context
        this.chatHistory.push({
            role: 'system',
            content: `You are an AI assistant analyzing a YouTube video transcript. Here is the transcript:

${transcript}

You will help answer questions about this video content. Keep your responses concise and relevant to the video content.`
        });
    }

    async generateResponse(transcript, userMessage = 'Please analyze this transcript and provide insights.') {
        try {
            const model = 'models/gemini-2.0-flash';
            const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
            
            const prompt = `Here is a transcript from a YouTube video:
            
            ${transcript}
            
            User's Question: ${userMessage}
            
            Please provide a detailed answer to the user's question based on the transcript content.`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error generating Gemini response:', error);
            throw error;
        }
    }

    async chat(userMessage) {
        if (!this.currentTranscript) {
            throw new Error('No transcript loaded. Please fetch a transcript first.');
        }

        try {
            const model = 'models/gemini-pro';
            const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

            // Add user message to history
            this.chatHistory.push({
                role: 'user',
                content: userMessage
            });

            // Prepare the conversation history for the API
            const messages = this.chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: userMessage }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            // Add AI response to history
            this.chatHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            return aiResponse;
        } catch (error) {
            console.error('Error in chat:', error);
            throw error;
        }
    }
}
