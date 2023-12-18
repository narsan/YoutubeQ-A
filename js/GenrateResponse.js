const generateAnswer = async (chatElement) => {
    //get video ID
    videoId = await getYouTubeVideoId();

    //get transcript
    transcript = await GetTranscript(videoId);

    // call openAi api to get Answer of users question 
    CallOpenAI(transcript, chatElement)

}

async function CallOpenAI(transcript, chatElement) {
    console.log(userMessage)
    console.log(transcript)

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
            storedQuestionList.push(userMessage)
            localStorage.setItem('ChatQestion', JSON.stringify(storedQuestionList));
            storedList.push(data.choices[0].message.content.trim())
            localStorage.setItem('ChatAnswer', JSON.stringify(storedList));
        } catch (ex) {
            console.log(ex)
        }
    }).catch((ex) => {
        console.log(ex)
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}