var OPENAI_API_KEY = ""
var YOUTUBE_API_KEY = ""

// loading API key from config file
async function loadConfig() {
    await fetch('./config.json')
        .then((response) => response.json())
        .then((json) => { OPENAI_API_KEY = json.OPENAI_API_KEY; YOUTUBE_API_KEY = json.YOUTUBE_API_KEY });
}

async function myReloadMethod() {
    // get video ID
    videoId = await getYouTubeVideoId();
     // set Api Key from conf.json
     await loadConfig();
     // If transcript is unavailable locally, fetch it from API and update local storage.
     GetTranscript(videoId);
    // Load user’s previous chat if applicable
    ShowChatHistory();
   
}

// Handling page reload
window.onload = function () {
    myReloadMethod();
};



