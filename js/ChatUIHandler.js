const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
let userMessage = null; // Variable to store user's message
const inputInitHeight = 6;

const createChatLi = (message, className) => {
    // Create a chat element with passed message and className
    const chatLi = document.createElement("div");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">face_4</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

async function ShowChatHistory(){
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
