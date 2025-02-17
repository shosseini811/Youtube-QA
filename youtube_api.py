from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

class YouTubeTranscriptFetcher:
    def __init__(self, api_key):
        self.youtube = build('youtube', 'v3', developerKey=api_key)

    def get_video_id(self, url):
        """Extract video ID from YouTube URL"""
        parsed_url = urlparse(url)
        if parsed_url.hostname == 'youtu.be':
            return parsed_url.path[1:]
        if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
            if parsed_url.path == '/watch':
                return parse_qs(parsed_url.query)['v'][0]
        return None

    def get_video_info(self, video_id):
        """Get video title and channel name"""
        try:
            response = self.youtube.videos().list(
                part='snippet',
                id=video_id
            ).execute()

            if response['items']:
                snippet = response['items'][0]['snippet']
                return {
                    'title': snippet['title'],
                    'channel': snippet['channelTitle']
                }
            return None
        except Exception as e:
            print(f"Error fetching video info: {str(e)}")
            return None

    def get_transcript(self, url):
        """Get transcript for a YouTube video"""
        try:
            video_id = self.get_video_id(url)
            if not video_id:
                return "Invalid YouTube URL"

            # Get video information
            video_info = self.get_video_info(video_id)
            if not video_info:
                return "Could not fetch video information"

            # Get transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            
            # Format output
            output = f"Title: {video_info['title']}\n"
            output += f"Channel: {video_info['channel']}\n\n"
            output += "Transcript:\n"
            
            for entry in transcript_list:
                time = int(entry['start'])
                minutes = time // 60
                seconds = time % 60
                text = entry['text']
                output += f"[{minutes:02d}:{seconds:02d}] {text}\n"
                
            return output
            
        except Exception as e:
            return f"Error: {str(e)}"

def main():
    # Replace with your actual API key
    API_KEY = 'AIzaSyCmM5OzvheY_bxANbIWQHxVtZxZq2muD9s'
    
    fetcher = YouTubeTranscriptFetcher(API_KEY)
    
    url = input("Enter YouTube URL: ")
    transcript = fetcher.get_transcript(url)
    print("\n" + transcript)

if __name__ == "__main__":
    main()