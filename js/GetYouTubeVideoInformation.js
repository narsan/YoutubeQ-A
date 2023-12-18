//getting video ID from YouTube URL
async function getYouTubeVideoId() {
    return new Promise((resolve) => {
        chrome.tabs.query({ "active": true, "currentWindow": true }, function (tabs) {
            if (tabs && tabs[0] && tabs[0].url) {
                let video_url = tabs[0].url;
                let video_id = video_url.split('v=')[1];
                resolve(video_id);
            } else {
                resolve(null); 
            }
        });
    });
}


//returning transcript of video
async function GetTranscript(videoId) {
    try {
        var storedVideoId = localStorage.getItem('videoId');
        //if the video isn't change load the transcript from local storage
        if (videoId === storedVideoId) {
            transcript = localStorage.getItem('transcript')
            if (transcript != null)
                return transcript;
        }
        // if the video has been changed clear loacl memory and call transcript API
        localStorage.clear();
        localStorage.setItem('videoId', videoId);
        transcript = await CallTranscriptAPI(videoId);
        return transcript;
    } catch(e) {
        console.log(e)
        return null;
    }
}


//get transcript from Api and set it in local storage 
async function CallTranscriptAPI(videoid) {
    const url = `https://youtube-captions-and-transcripts.p.rapidapi.com/getCaptions?videoId=${videoid}&lang=en&format=json`;
    console.log(url)
    console.log(YOUTUBE_API_KEY)
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': YOUTUBE_API_KEY,
            'X-RapidAPI-Host': 'youtube-captions-and-transcripts.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        trans = JSON.parse(JSON.stringify(result, null, 2))
        console.log("API Response:", trans);
        let video_text = Object.getOwnPropertyNames(trans.data)
        final_text = "";
        video_text.forEach((txt) => { final_text = final_text + " " + trans.data[txt].text })
        localStorage.setItem('transcript', final_text);
        return final_text
    } catch (error) {
        console.error(error);
        return "error"
    }
}