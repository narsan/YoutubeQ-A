var OPENAI_API_KEY = ""
var YOUTUBE_API_KEY = ""

// loading API key from config file
async function loadConfig() {
    await fetch('./config.json')
        .then((response) => response.json())
        .then((json) => { OPENAI_API_KEY = json.OPENAI_API_KEY; YOUTUBE_API_KEY = json.YOUTUBE_API_KEY });
}

async function myReloadMethod() {
    //get video ID
    videoId = await getYouTubeVideoId();
     //set Api Key from conf.json
     await loadConfig();
     //if the transcript is unavalable in local memory get it from transcript api and update the local storage data
     GetTranscript(videoId);
    //if user has chat about this video with bot load it 
    ShowChatHistory();
   
}

// if the page has been reloaded this method should be call
window.onload = function () {
    myReloadMethod();
};



