import { setIcon } from "./icons.js";

const appRoot = document.querySelector(".app");
const sendButton = document.getElementById("sendBtn");
const newChatButton = document.getElementById("newChatBtn");
const settingsButton = document.getElementById("settingsBtn");
const sidebarCollapseBtn = document.getElementById("sidebarCollapseBtn");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const chatHistoryEl = document.getElementById("chatHistory");
const messagesEl = document.getElementById("messagesContainer");
const promptInput = document.getElementById("messageInput");
const landingState = document.getElementById("landingState");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const settingsPanel = document.getElementById("settingsPanel");
const settingsBackdrop = document.getElementById("settingsBackdrop");
const closeSettingsButton = document.getElementById("closeSettings");
const clearChatsButton = document.getElementById("clearChatsBtn");
const themeButtons = document.querySelectorAll("[data-theme]");
const modeButtons = document.querySelectorAll(".mode-btn");
const starterButtons = document.querySelectorAll(".starter-prompts button");
const topbarTitle = document.querySelector(".current-chat-label");
const topbarSubtitle = document.querySelector(".current-chat-subtitle");
const topbarSearchBtn = document.getElementById("topbarSearchBtn");
const signupBtn = document.getElementById("signupBtn");
const profileBtn = document.getElementById("profileBtn");
const attachBtn = document.getElementById("attachBtn");
const imageBtn = document.getElementById("imageBtn");
const voiceBtn = document.getElementById("voiceBtn");
const sidebarBrand = document.getElementById("sidebarBrand");
const topbarBrand = document.getElementById("topbarBrand");
const loginBtn = document.getElementById("loginBtn");
const shareConversationBtn = document.getElementById("shareConversationBtn");
const exportConversationBtn = document.getElementById("exportConversationBtn");
const settingsSignInBtn = document.getElementById("settingsSignInBtn");
const settingsSignUpBtn = document.getElementById("settingsSignUpBtn");
const authStatusEl = document.getElementById("authStatus");
const sidebarAuthHint = document.getElementById("sidebarAuthHint");
const topbarSyncNote = document.getElementById("topbarSyncNote");
const profileNameEl = document.getElementById("profileName");
const profileEmailEl = document.getElementById("profileEmail");
const profileAvatarEl = document.getElementById("profileAvatar");
const chatSearchInput = document.getElementById("chatSearch");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const toastContainer = document.getElementById("toastContainer");
const logoIcons = document.querySelectorAll(".logo-icon, .logo-icon-large");

const sessions = [];
let activeSessionId = null;
let currentMode = "balanced";

function getInitialTheme() {
    const storedTheme = localStorage.getItem("quantisTheme");
    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("quantisTheme", theme);
    const isDark = theme === "dark";
    setIcon(themeToggleBtn.querySelector(".icon-holder"), isDark ? "moon" : "sun");
    themeToggleBtn.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
}

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderMarkdown(text) {
    return escapeHtml(text)
        .replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code)}</code></pre>`)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
}

function updateTopbar(session) {
    if (!session) {
        topbarTitle.textContent = "New conversation";
        topbarSubtitle.textContent = "Start with a prompt or choose a suggestion.";
        return;
    }

    topbarTitle.textContent = session.title;
    topbarSubtitle.textContent = session.messages.length
        ? "Continue your conversation with Quantis."
        : "Start with a prompt or choose a suggestion.";
}

function getSessionCategory(session) {
    if (session.pinned) return "Pinned Chats";

    const now = new Date();
    const created = new Date(session.createdAt);
    const midnightNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const midnightCreated = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDifference = Math.floor((midnightNow - midnightCreated) / msPerDay);

    if (dayDifference === 0) return "Today";
    if (dayDifference === 1) return "Yesterday";
    if (dayDifference < 7) return "Previous 7 Days";
    if (dayDifference < 30) return "Previous 30 Days";
    return "Older";
}

function renderChatHistory() {
    chatHistoryEl.innerHTML = "";

    if (sessions.length === 0) {
        chatHistoryEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-title">No chats yet</div>
                <div class="empty-state-text">Create a new conversation to keep your chat history here.</div>
            </div>
        `;
        return;
    }

    const sections = {
        "Pinned Chats": [],
        Today: [],
        Yesterday: [],
        "Previous 7 Days": [],
        "Previous 30 Days": [],
        Older: []
    };

    sessions
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((session) => {
            const category = getSessionCategory(session);
            sections[category].push(session);
        });

    Object.keys(sections).forEach((sectionTitle) => {
        const sectionItems = sections[sectionTitle];
        if (!sectionItems.length) return;

        const section = document.createElement("div");
        section.className = "sidebar-group";

        const heading = document.createElement("div");
        heading.className = "sidebar-group-title";
        heading.textContent = sectionTitle;
        section.appendChild(heading);

        sectionItems.forEach((session) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = `chat-card ${session.id === activeSessionId ? "active" : ""} ${session.pinned ? "pinned" : ""}`;
            card.dataset.title = session.title.toLowerCase();
            card.innerHTML = `
                <span class="icon-holder"></span>
                <span class="chat-card-title">${escapeHtml(session.title)}</span>
            `;
            card.addEventListener("click", () => selectSession(session.id));
            section.appendChild(card);
            setIcon(card.querySelector(".icon-holder"), session.messages.length ? "bot" : "sparkles");
        });

        chatHistoryEl.appendChild(section);
    });
}

function renderMessages() {
    const session = sessions.find((item) => item.id === activeSessionId);
    messagesEl.innerHTML = "";

    if (!session || session.messages.length === 0) {
        messagesEl.classList.add("hidden");
        landingState.classList.remove("hidden");
        updateTopbar(session);
        return;
    }

    landingState.classList.add("hidden");
    messagesEl.classList.remove("hidden");
    updateTopbar(session);

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
        body.innerHTML = renderMarkdown(message.text);
        row.appendChild(body);

        const actions = document.createElement("div");
        actions.className = "message-actions";

        const actionButtons = [
            { icon: "copy", label: "Copy message", onClick: () => {
                navigator.clipboard.writeText(message.text).catch(() => {});
                actions.classList.add("action-sent");
                window.setTimeout(() => actions.classList.remove("action-sent"), 1200);
            } },
            { icon: "thumbsUp", label: "Like message", onClick: () => {
                actions.classList.toggle("liked");
            } },
            { icon: "thumbsDown", label: "Dislike message", onClick: () => {
                actions.classList.toggle("disliked");
            } },
            { icon: "trash", label: "Delete message", onClick: () => {
                const session = sessions.find((item) => item.id === activeSessionId);
                if (!session) return;
                session.messages = session.messages.filter((m) => m !== message);
                renderMessages();
            } }
        ];

        actionButtons.forEach((buttonData) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "message-action-btn";
            button.setAttribute("aria-label", buttonData.label);
            const iconEl = document.createElement("span");
            iconEl.className = "icon-holder";
            setIcon(iconEl, buttonData.icon);
            button.appendChild(iconEl);
            button.addEventListener("click", buttonData.onClick);
            actions.appendChild(button);
        });

        row.appendChild(actions);

        messagesEl.appendChild(row);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function selectSession(sessionId) {
    activeSessionId = sessionId;
    renderChatHistory();
    renderMessages();
    if (window.innerWidth <= 1040) {
        closeMobileSidebar();
    }
}

function createNewSession() {
    const title = `New chat ${sessions.length + 1}`;
    const id = `chat-${Date.now()}`;
    const now = new Date().toISOString();
    const session = {
        id,
        title,
        messages: [],
        createdAt: now,
        updatedAt: now,
        pinned: false
    };
    sessions.unshift(session);
    activeSessionId = id;
    renderChatHistory();
    renderMessages();
    promptInput.value = "";
    promptInput.focus();
}

function sendMessage(prompt) {
    if (!prompt.trim()) return;

    if (!activeSessionId) {
        createNewSession();
    }

    const session = sessions.find((item) => item.id === activeSessionId);
    if (!session) return;

    session.messages.push({ role: "user", text: prompt.trim() });
    renderMessages();
    promptInput.value = "";
    promptInput.focus();
}

function openSettings() {
    settingsPanel.classList.remove("hidden");
    settingsPanel.classList.add("visible");
    settingsPanel.setAttribute("aria-hidden", "false");
}

function closeSettings() {
    settingsPanel.classList.add("hidden");
    settingsPanel.classList.remove("visible");
    settingsPanel.setAttribute("aria-hidden", "true");
}

function toggleSidebar() {
    const collapsed = appRoot.classList.toggle("sidebar-collapsed");
    setIcon(sidebarCollapseBtn.querySelector(".icon-holder"), collapsed ? "sidebarOpen" : "sidebarClose");

    if (window.innerWidth <= 1040) {
        if (collapsed) {
            sidebarBackdrop?.classList.add("hidden");
            sidebarBackdrop?.setAttribute("aria-hidden", "true");
        } else {
            sidebarBackdrop?.classList.remove("hidden");
            sidebarBackdrop?.setAttribute("aria-hidden", "false");
        }
    }
}

function openMobileSidebar() {
    appRoot.classList.remove("sidebar-collapsed");
    setIcon(sidebarCollapseBtn.querySelector(".icon-holder"), "sidebarClose");
    sidebarBackdrop?.classList.remove("hidden");
    sidebarBackdrop?.setAttribute("aria-hidden", "false");
}

function closeMobileSidebar() {
    appRoot.classList.add("sidebar-collapsed");
    setIcon(sidebarCollapseBtn.querySelector(".icon-holder"), "sidebarOpen");
    sidebarBackdrop?.classList.add("hidden");
    sidebarBackdrop?.setAttribute("aria-hidden", "true");
}

function ensureMobileSidebarState() {
    const collapsed = window.innerWidth <= 1040;
    appRoot.classList.toggle("sidebar-collapsed", collapsed);
    setIcon(sidebarCollapseBtn.querySelector(".icon-holder"), collapsed ? "sidebarOpen" : "sidebarClose");

    sidebarBackdrop?.classList.add("hidden");
    sidebarBackdrop?.setAttribute("aria-hidden", "true");
}

function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
}

function clearChats() {
    sessions.length = 0;
    createNewSession();
    closeSettings();
}

function debounce(fn, delay = 180) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(...args), delay);
    };
}

const authState = {
    loggedIn: false,
    name: "Guest",
    email: "Continue as a guest to keep exploring.",
    avatar: "Q"
};

function updateAuthUi() {
    authStatusEl.textContent = authState.loggedIn ? "Signed in" : "Signed out";
    profileNameEl.textContent = authState.name;
    profileEmailEl.textContent = authState.email;
    profileAvatarEl.textContent = authState.avatar;

    const profileText = profileBtn.querySelector("span:last-child");
    if (profileText) {
        profileText.textContent = authState.loggedIn ? "Profile" : "Sign In";
    }

    if (loginBtn) {
        loginBtn.textContent = authState.loggedIn ? "Sign Out" : "Sign In";
    }

    if (sidebarAuthHint) {
        sidebarAuthHint.textContent = authState.loggedIn ? "Synced to your account" : "Guest mode";
    }

    if (topbarSyncNote) {
        topbarSyncNote.textContent = authState.loggedIn
            ? "Sessions are synced to your Quantis account."
            : "Sign in to sync history and sessions across devices.";
    }

    if (settingsSignInBtn) {
        settingsSignInBtn.textContent = authState.loggedIn ? "Sign Out" : "Sign In";
    }
}

function handleSignInToggle() {
    if (authState.loggedIn) {
        authState.loggedIn = false;
        authState.name = "Guest";
        authState.email = "Continue as a guest to keep exploring.";
        authState.avatar = "Q";
    } else {
        authState.loggedIn = true;
        authState.name = "Quantis User";
        authState.email = "hello@quantis.ai";
        authState.avatar = "Q";
    }
    updateAuthUi();
}

function showToast(message) {
    if (!toastContainer) {
        window.alert(message);
        return;
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);

    window.setTimeout(() => toast.classList.add("visible"), 10);
    window.setTimeout(() => {
        toast.classList.remove("visible");
        window.setTimeout(() => toast.remove(), 300);
    }, 2600);
}

function getActiveSession() {
    return sessions.find((item) => item.id === activeSessionId);
}

function exportConversation() {
    const session = getActiveSession();
    if (!session) {
        showToast("Select a conversation before exporting.");
        return;
    }

    const exportData = {
        title: session.title,
        createdAt: session.createdAt,
        messages: session.messages
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const fileName = `${session.title.replace(/[^a-z0-9_-]/gi, "_").toLowerCase() || "quantis-chat"}.json`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Conversation exported to JSON.");
}

function shareConversation() {
    const session = getActiveSession();
    if (!session) {
        showToast("Select a conversation before sharing.");
        return;
    }

    const sharePayload = `Quantis Chat: ${session.title}\n\n${session.messages.map((message) => `${message.role === "user" ? "You" : "Quantis"}: ${message.text}`).join("\n")}`;
    navigator.clipboard.writeText(sharePayload).then(() => {
        showToast("Conversation copied to clipboard for sharing.");
    }).catch(() => {
        showToast("Could not copy conversation. Try again.");
    });
}

function filterChats(query) {
    const normalized = query.trim().toLowerCase();
    const cards = chatHistoryEl.querySelectorAll(".chat-card");
    cards.forEach((card) => {
        const title = card.dataset.title || card.textContent.toLowerCase();
        card.style.display = normalized && !title.includes(normalized) ? "none" : "flex";
    });

    const groups = chatHistoryEl.querySelectorAll(".sidebar-group");
    groups.forEach((group) => {
        const visibleCard = group.querySelector(".chat-card:not([style*='display: none'])");
        group.style.display = visibleCard ? "block" : "none";
    });
}

function resizeTextarea() {
    promptInput.style.height = "auto";
    promptInput.style.height = `${promptInput.scrollHeight}px`;
}

function initializeIcons() {
    logoIcons.forEach((element) => setIcon(element, "quantis"));
    setIcon(document.querySelector("#newChatBtn .icon-holder"), "plus");
    setIcon(document.querySelector("#settingsBtn .icon-holder"), "settings");
    setIcon(document.querySelector("#themeToggleBtn .icon-holder"), "moon");
    setIcon(document.querySelector("#sendBtn .icon-holder"), "send");
    setIcon(document.querySelector("#sidebarCollapseBtn .icon-holder"), "sidebarClose");
    setIcon(document.querySelector("#mobileMenuBtn .icon-holder"), "menu");
    setIcon(document.querySelector("#closeSettings .icon-holder"), "chevron-down");
    setIcon(document.querySelector("#topbarSearchBtn .icon-holder"), "search");
    setIcon(document.querySelector("#shareConversationBtn .icon-holder"), "monitor");
    setIcon(document.querySelector("#exportConversationBtn .icon-holder"), "download");
    setIcon(document.querySelector("#profileBtn .icon-holder"), "user");
    setIcon(document.querySelector("#attachBtn .icon-holder"), "paperclip");
    setIcon(document.querySelector("#imageBtn .icon-holder"), "image");
    setIcon(document.querySelector("#voiceBtn .icon-holder"), "mic");
}

newChatButton.addEventListener("click", createNewSession);
sendButton.addEventListener("click", () => sendMessage(promptInput.value));

starterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        promptInput.value = button.dataset.prompt;
        promptInput.focus();
    });
});

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
settingsBackdrop.addEventListener("click", closeSettings);

themeToggleBtn.addEventListener("click", toggleTheme);

themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

clearChatsButton.addEventListener("click", clearChats);
sidebarCollapseBtn.addEventListener("click", toggleSidebar);

topbarSearchBtn.addEventListener("click", () => chatSearchInput?.focus());
if (shareConversationBtn) shareConversationBtn.addEventListener("click", shareConversation);
if (exportConversationBtn) exportConversationBtn.addEventListener("click", exportConversation);
if (signupBtn) signupBtn.addEventListener("click", openSettings);
profileBtn.addEventListener("click", openSettings);
if (loginBtn) loginBtn.addEventListener("click", () => {
    if (authState.loggedIn) {
        handleSignInToggle();
    } else {
        openSettings();
    }
});
if (settingsSignInBtn) settingsSignInBtn.addEventListener("click", handleSignInToggle);
if (settingsSignUpBtn) settingsSignUpBtn.addEventListener("click", () => {
    authState.loggedIn = true;
    authState.name = "Quantis User";
    authState.email = "welcome@quantis.ai";
    authState.avatar = "Q";
    updateAuthUi();
});
sidebarBrand.addEventListener("click", createNewSession);
topbarBrand.addEventListener("click", createNewSession);
if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobileSidebar);

promptInput.addEventListener("input", resizeTextarea);

chatSearchInput?.addEventListener("input", debounce((event) => {
    filterChats(event.target.value);
}));

window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        promptInput.focus();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        chatSearchInput?.focus();
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        createNewSession();
    }

    if (event.key === "Escape") {
        closeSettings();
        if (window.innerWidth <= 1040 && !appRoot.classList.contains("sidebar-collapsed")) {
            closeMobileSidebar();
        }
    }
});

window.addEventListener("DOMContentLoaded", () => {
    initializeIcons();
    ensureMobileSidebarState();
    applyTheme(getInitialTheme());
    createNewSession();
    resizeTextarea();
});

modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        modeButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        currentMode = button.dataset.mode;
    });
});

window.addEventListener("resize", debounce(() => {
    ensureMobileSidebarState();
}));

console.log("Quantis Started 🚀");
