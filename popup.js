const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
let userMessage = null; // Variable to store user's message
// Paste your openAI API key here
const OPENAI_API_KEY = "Replace you own API KEY";
//Paste your RapidAI Youtube Captions and Transcripts API here 
const YOUTUBE_API_KEY = "Replace you own API KEY" 
const inputInitHeight = 6;
let video_id = ''


function getYouTubeVideoId() {
    return new Promise((resolve) => {
        chrome.tabs.query({ "active": true, "currentWindow": true }, function (tabs) {
            if (tabs && tabs[0] && tabs[0].url) {
                let video_url = tabs[0].url;
                let video_id = video_url.split('v=')[1];
                resolve(video_id);
            } else {
                resolve(null); // Handle the case when tabs or the URL is not available
            }
        });
    });
}


async function GetTranscript(videoId) {
    const url = `https://youtube-captions-and-transcripts.p.rapidapi.com/getCaptions?videoId=${videoId}&lang=en&format=json`;
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


const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("div");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">face_4</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

async function checkVideoStatus(videoid) {
    try {
        var storedVideoId = localStorage.getItem('videoId');
        if (videoid === storedVideoId) {
            return true;
        }
        localStorage.clear();
        localStorage.setItem('videoId', videoId);
        return false;
    } catch {
        localStorage.clear();
        localStorage.setItem('videoId', videoId);
        return false;
    }
}

const generateResponse = async (chatElement) => {
    //get video ID
    videoId = await getYouTubeVideoId();

    //checkVideo
    videoStatus = await checkVideoStatus(videoId);
    //get transcript
    if (!videoStatus || localStorage.getItem('transcript') === null ) {
        transcript = await GetTranscript(videoId);
        // console.log("Transcript:", transcript);
    } else {
        //fetch transcript from local storage
        transcript = localStorage.getItem('transcript')
        // console.log("Transcript from local storage:", transcript);
    }

    //getting chat list from local storage
    var storedList = localStorage.getItem('ChatAnswer');
    storedList = storedList ? JSON.parse(storedList) : [];

    var storedQuestionList = localStorage.getItem('ChatQestion');
    storedQuestionList = storedQuestionList ? JSON.parse(storedQuestionList) : [];


    //calling openAI api
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `provide short answer based on Transcript${transcript}. . Question:${userMessage}` }],
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        messageElement.textContent = data.choices[0].message.content.trim();
        try {
            storedList.push(data.choices[0].message.content.trim())
            localStorage.setItem('ChatAnswer', JSON.stringify(storedList));
        } catch (ex) {
            console.log(ex)
            console.log("salam")
        }
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace

    var storedQuestionList = localStorage.getItem('ChatQestion');
    storedQuestionList = storedQuestionList ? JSON.parse(storedQuestionList) : [];
    storedQuestionList.push(chatInput.value.trim())
    localStorage.setItem('ChatQestion', JSON.stringify(storedQuestionList));

    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}vh`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}vh`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (event) => {
    // If Enter key is pressed without Shift key and the window 
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleChat();
    }
});




async function myReloadMethod() {
    //get video ID
    videoId = await getYouTubeVideoId();

    //checkVideo
    videoStatus = await checkVideoStatus(videoId);
    console.log("video status : " + videoStatus)

    var storedQuestionList = localStorage.getItem('ChatQestion');
    if (storedQuestionList !== null)
        storedQuestionList = JSON.parse(storedQuestionList);

    var storedAnswerList = localStorage.getItem('ChatAnswer');
    if (storedAnswerList !== null)
        storedAnswerList = JSON.parse(storedAnswerList);


    if (storedQuestionList !== null && storedAnswerList !== null) {
        for (let i = 0; i < storedQuestionList.length; i++) {
            const outGoingChatLi = createChatLi(storedQuestionList[i], "outgoing")
            chatbox.appendChild(outGoingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            const incomingChatLi = createChatLi(storedAnswerList[i], "incoming")
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    }



    //get transcript
    if (!videoStatus) {
        transcript = await GetTranscript(videoId);
        console.log("Transcript:", transcript);
    } else {
        //fetch transcript from local storage
        transcript = localStorage.getItem('transcript')
        console.log("Transcript from local storage:", transcript);
    }


}

// Use window.onload event
window.onload = function () {
    myReloadMethod();
};




sendChatBtn.addEventListener("click", handleChat);
