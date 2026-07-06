import { setIcon, Icons } from "./icons.js";

const sendButton = document.getElementById("send");
const newChatButton = document.getElementById("newChatBtn");
const settingsButton = document.getElementById("settingsBtn");
const chatHistoryEl = document.getElementById("chatHistory");
const messagesEl = document.getElementById("messages");
const promptInput = document.getElementById("prompt");
const heroSection = document.getElementById("hero");
const settingsPanel = document.getElementById("settingsPanel");
const settingsBackdrop = document.getElementById("settingsBackdrop");
const closeSettingsButton = document.getElementById("closeSettings");
const themeButton = document.getElementById("themeBtn");
const themeToggle = document.getElementById("themeToggle");
const clearChatsButton = document.getElementById("clearChatsBtn");
const starterButtons = document.querySelectorAll(".starter-prompts button");
const modeButtons = document.querySelectorAll(".mode-btn");

setIcon(sendButton, "send");
setIcon(document.querySelector("#newChatBtn .icon-holder"), "plus");
setIcon(document.querySelector("#settingsBtn .icon-holder"), "settings");
setIcon(document.querySelector("#themeBtn .icon-holder"), "moon");
setIcon(document.querySelector("#closeSettings .icon-holder"), "chevron-down");

const sessions = [
    {
        id: "welcome",
        title: "Getting started",
        messages: [
            {
                role: "bot",
                text: "Hi there! I am Quantis, your AI assistant. Try the prompt buttons or type a question to begin."
            }
        ]
    }
];

let activeSessionId = "welcome";
let currentMode = "balanced";

function findSession(id) {
    return sessions.find((session) => session.id === id);
}

function renderChatHistory() {
    chatHistoryEl.innerHTML = "";
    sessions.forEach((session) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `chat-card ${session.id === activeSessionId ? "active" : ""}`;
        card.innerHTML = `
            <span class="icon-holder"></span>
            <span class="chat-card-title">${session.title}</span>
        `;
        card.addEventListener("click", () => selectSession(session.id));
        chatHistoryEl.appendChild(card);
        setIcon(card.querySelector(".icon-holder"), session.id === "welcome" ? "bot" : "sparkles");
    });
}

function renderMessages() {
    const session = findSession(activeSessionId);
    messagesEl.innerHTML = "";

    if (!session || session.messages.length === 0) {
        messagesEl.classList.add("hidden");
        heroSection.classList.remove("hidden");
        return;
    }

    heroSection.classList.add("hidden");
    messagesEl.classList.remove("hidden");

    session.messages.forEach((message) => {
        const row = document.createElement("article");
        row.className = `message-row ${message.role}`;

        const meta = document.createElement("div");
        meta.className = "message-meta";
        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        const avatarIcon = document.createElement("span");
        avatarIcon.className = "icon-holder";
        avatar.appendChild(avatarIcon);
        setIcon(avatarIcon, message.role === "user" ? "user" : "bot");

        const label = document.createElement("span");
        label.textContent = message.role === "user" ? "You" : "Quantis";
        meta.appendChild(avatar);
        meta.appendChild(label);
        row.appendChild(meta);

        const body = document.createElement("div");
        body.className = "message-body";
        body.textContent = message.text;
        row.appendChild(body);

        messagesEl.appendChild(row);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function selectSession(sessionId) {
    activeSessionId = sessionId;
    renderChatHistory();
    renderMessages();
}

function createNewSession() {
    const title = "New conversation";
    const id = `chat-${Date.now()}`;
    const session = { id, title, messages: [] };
    sessions.unshift(session);
    activeSessionId = id;
    renderChatHistory();
    renderMessages();
    promptInput.focus();
}

function sendMessage(prompt) {
    if (!prompt.trim()) return;
    const session = findSession(activeSessionId);
    if (!session) return;

    session.messages.push({ role: "user", text: prompt });
    renderMessages();
    promptInput.value = "";
    promptInput.focus();

    const reply = {
        role: "bot",
        text: "Analyzing your request..."
    };
    session.messages.push(reply);
    renderMessages();

    window.setTimeout(() => {
        const updated = session.messages[session.messages.length - 1];
        updated.text = generateResponse(prompt);
        renderMessages();
    }, 900);
}

function generateResponse(prompt) {
    if (currentMode === "creative") {
        return `Creative mode reply: ${prompt} — here is a fresh idea tailored for you.`;
    }
    if (currentMode === "focused") {
        return `Focused mode response: ${prompt} — precise and practical guidance for your request.`;
    }
    return `Balanced mode response: ${prompt} — concise support with a thoughtful tone.`;
}

function openSettings() {
    settingsPanel.classList.remove("hidden");
    settingsPanel.classList.add("visible");
}

function closeSettings() {
    settingsPanel.classList.add("hidden");
    settingsPanel.classList.remove("visible");
}

function applyTheme(isDark) {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeToggle.checked = isDark;
    setIcon(document.querySelector("#themeBtn .icon-holder"), isDark ? "moon" : "sun");
}

function clearChats() {
    sessions.splice(1);
    activeSessionId = sessions[0].id;
    sessions[0].messages = [
        {
            role: "bot",
            text: "Your workspace is cleared. Start a fresh conversation anytime."
        }
    ];
    renderChatHistory();
    renderMessages();
}

newChatButton.addEventListener("click", () => {
    createNewSession();
});

sendButton.addEventListener("click", () => {
    sendMessage(promptInput.value);
});

promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage(promptInput.value);
    }
});

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
settingsBackdrop.addEventListener("click", closeSettings);

themeButton.addEventListener("click", () => {
    applyTheme(!themeToggle.checked);
});

themeToggle.addEventListener("input", () => {
    applyTheme(themeToggle.checked);
});

clearChatsButton.addEventListener("click", clearChats);

starterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        promptInput.value = button.dataset.prompt;
        promptInput.focus();
    });
});

modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        modeButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        currentMode = button.dataset.mode;
    });
});

window.addEventListener("DOMContentLoaded", () => {
    renderChatHistory();
    renderMessages();
    applyTheme(true);
});

console.log("Quantis Started 🚀");
