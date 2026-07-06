import { initIcons, getIcon } from './icons.js';
import { parseMarkdown } from './markdown.js';
import { Typewriter } from './typewriter.js';

// Elements
const newChatBtn = document.getElementById('newChatBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const messagesInner = document.getElementById('messagesInner');
const landingState = document.getElementById('landingState');
const chatSearch = document.getElementById('chatSearch');
const chatHistory = document.getElementById('chatHistory');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const settingsBackdrop = document.getElementById('settingsBackdrop');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const sidebar = document.querySelector('.sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const currentChatLabel = document.querySelector('.current-chat-label');
const thinkingIndicator = document.getElementById('thinkingIndicator');
const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
const attachBtn = document.getElementById('attachBtn');
const attachedFiles = document.getElementById('attachedFiles');

// Settings Elements
const themeSelect = document.getElementById('themeSelect');
const fontSizeSelect = document.getElementById('fontSizeSelect');
const typewriterSpeed = document.getElementById('typewriterSpeed');
const animationsToggle = document.getElementById('animationsToggle');
const systemPromptEditor = document.getElementById('systemPromptEditor');
const clearChatsBtn = document.getElementById('clearChatsBtn');

// Modals & Menus
const shortcutsBtn = document.getElementById('shortcutsBtn');
const shortcutsModal = document.getElementById('shortcutsModal');
const exportConversationBtn = document.getElementById('exportConversationBtn');
const shareConversationBtn = document.getElementById('shareConversationBtn');
const exportModal = document.getElementById('exportModal');
const chatContextMenu = document.getElementById('chatContextMenu');
const dropOverlay = document.getElementById('dropOverlay');
const toastContainer = document.getElementById('toastContainer');

// Modals close buttons
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.add('hidden');
    });
});

// State
let sessions = JSON.parse(localStorage.getItem('quantis_sessions')) || [];
let activeSessionId = null;
let currentTypewriter = null;
let contextMenuTargetId = null;

// Settings State
let settings = JSON.parse(localStorage.getItem('quantis_settings')) || {
    theme: 'system',
    fontSize: '14px',
    speed: 'normal',
    animations: true,
    systemPrompt: ''
};

// Initialize
function init() {
    initIcons();
    applySettings();
    renderHistory();
    
    if (sessions.length > 0) {
        // Option to load last session, but for ChatGPT clone, usually starts a new one
        startNewChat();
    } else {
        startNewChat();
    }
}

// =======================
// SETTINGS & THEME
// =======================
function applySettings() {
    // Theme
    if (settings.theme === 'dark') {
        document.documentElement.dataset.theme = 'dark';
    } else if (settings.theme === 'light') {
        document.documentElement.dataset.theme = 'light';
    } else {
        // System
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        document.documentElement.dataset.theme = prefersLight ? 'light' : 'dark';
    }
    
    themeSelect.value = settings.theme;
    
    // Font size
    document.body.style.fontSize = settings.fontSize;
    fontSizeSelect.value = settings.fontSize;
    
    // Speed
    typewriterSpeed.value = settings.speed;
    
    // Animations
    animationsToggle.checked = settings.animations;
    if (!settings.animations) {
        document.body.classList.add('reduce-motion');
    } else {
        document.body.classList.remove('reduce-motion');
    }
    
    // System Prompt
    systemPromptEditor.value = settings.systemPrompt || '';
}

function saveSettings() {
    settings = {
        theme: themeSelect.value,
        fontSize: fontSizeSelect.value,
        speed: typewriterSpeed.value,
        animations: animationsToggle.checked,
        systemPrompt: systemPromptEditor.value
    };
    localStorage.setItem('quantis_settings', JSON.stringify(settings));
    applySettings();
}

themeSelect.addEventListener('change', saveSettings);
fontSizeSelect.addEventListener('change', saveSettings);
typewriterSpeed.addEventListener('change', saveSettings);
animationsToggle.addEventListener('change', saveSettings);
systemPromptEditor.addEventListener('input', saveSettings);

themeToggleBtn.addEventListener('click', () => {
    settings.theme = settings.theme === 'light' ? 'dark' : 'light';
    saveSettings();
    initIcons(); // Re-init icons to pick up new colors
});

settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));
settingsBackdrop.addEventListener('click', () => settingsPanel.classList.add('hidden'));

// =======================
// SIDEBAR & LAYOUT
// =======================
sidebarCollapseBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    initIcons();
});

mobileMenuBtn.addEventListener('click', () => {
    document.body.classList.add('sidebar-mobile-open');
    sidebarBackdrop.classList.remove('hidden');
});

sidebarBackdrop.addEventListener('click', () => {
    document.body.classList.remove('sidebar-mobile-open');
    sidebarBackdrop.classList.add('hidden');
});

shortcutsBtn.addEventListener('click', () => shortcutsModal.classList.remove('hidden'));
exportConversationBtn.addEventListener('click', () => exportModal.classList.remove('hidden'));
shareConversationBtn.addEventListener('click', () => showToast('Link copied to clipboard!'));

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        chatSearch.focus();
    }
    // Ctrl/Cmd + / to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        messageInput.focus();
    }
    // Ctrl/Cmd + Shift + C for new chat
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        startNewChat();
    }
});

// =======================
// CHAT LOGIC
// =======================
function startNewChat() {
    activeSessionId = null;
    messagesInner.innerHTML = '';
    landingState.classList.remove('hidden');
    messagesContainer.classList.add('hidden');
    currentChatLabel.textContent = 'New conversation';
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    messageInput.value = '';
    adjustTextareaHeight();
    messageInput.focus();
    exportConversationBtn.classList.add('hidden');
    shareConversationBtn.classList.add('hidden');
}

newChatBtn.addEventListener('click', startNewChat);

function saveSession(title, messages) {
    if (!activeSessionId) {
        activeSessionId = Date.now().toString();
        sessions.unshift({ id: activeSessionId, title: title, messages: messages, date: new Date().toISOString() });
    } else {
        const session = sessions.find(s => s.id === activeSessionId);
        if (session) {
            session.messages = messages;
            if (session.messages.length === 2 && session.title === 'New Chat') {
                session.title = session.messages[0].content.substring(0, 30) + '...';
            }
        }
    }
    localStorage.setItem('quantis_sessions', JSON.stringify(sessions));
    renderHistory();
}

function loadSession(id) {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    
    activeSessionId = id;
    landingState.classList.add('hidden');
    messagesContainer.classList.remove('hidden');
    messagesInner.innerHTML = '';
    currentChatLabel.textContent = session.title;
    
    exportConversationBtn.classList.remove('hidden');
    shareConversationBtn.classList.remove('hidden');
    
    session.messages.forEach((msg, index) => {
        appendMessageElement(msg.role, msg.content, false, index);
    });
    
    scrollToBottom();
    
    document.querySelectorAll('.history-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });
    
    if (window.innerWidth <= 768) {
        document.body.classList.remove('sidebar-mobile-open');
        sidebarBackdrop.classList.add('hidden');
    }
}

// =======================
// MESSAGE RENDERING
// =======================
function getSpeedMs() {
    switch(settings.speed) {
        case 'fast': return 5;
        case 'slow': return 30;
        default: return 15;
    }
}

function appendMessageElement(role, content, animate = false, index = 0) {
    const row = document.createElement('div');
    row.className = \`message-row \${role} \${animate ? 'message-enter' : ''}\`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = role === 'user';
    const avatarContent = isUser ? 'U' : getIcon('logo');
    const name = isUser ? 'You' : 'Quantis';
    
    const parsedContent = isUser ? parseMarkdown(content) : ''; // We'll typewrite bot content if animating

    row.innerHTML = \`
        <div class="message-inner">
            <div class="message-meta">
                <div class="message-avatar">\${avatarContent}</div>
                <div class="message-sender">\${name}</div>
                <div class="message-timestamp">\${time}</div>
            </div>
            <div class="message-body">
                \${isUser || !animate ? parseMarkdown(content) : ''}
            </div>
            <div class="message-actions">
                <button class="message-action-btn" aria-label="Copy" title="Copy">
                    \${getIcon('copy')}
                </button>
                \${!isUser ? \`
                    <button class="message-action-btn" aria-label="Good response" title="Good response">
                        \${getIcon('check')}
                    </button>
                \` : \`
                    <button class="message-action-btn" aria-label="Edit" title="Edit">
                        \${getIcon('pencil')}
                    </button>
                \`}
            </div>
        </div>
    \`;
    
    messagesInner.appendChild(row);
    initIcons(); // initialize newly added icons
    
    // Copy action
    const copyBtn = row.querySelector('.message-action-btn[aria-label="Copy"]');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(content);
            copyBtn.innerHTML = getIcon('check');
            initIcons();
            setTimeout(() => {
                copyBtn.innerHTML = getIcon('copy');
                initIcons();
            }, 2000);
            showToast('Copied to clipboard');
        });
    }

    if (!isUser && animate) {
        const bodyEl = row.querySelector('.message-body');
        const htmlContent = parseMarkdown(content);
        
        if (currentTypewriter) currentTypewriter.stop();
        
        currentTypewriter = new Typewriter(bodyEl, content, {
            speed: getSpeedMs(),
            onUpdate: scrollToBottom,
            onComplete: () => {
                currentTypewriter = null;
                initIcons();
            }
        });
        currentTypewriter.typeHTML(htmlContent);
    }
}

async function handleSend() {
    const text = messageInput.value.trim();
    if (!text) return;

    if (landingState) {
        landingState.classList.add('hidden');
        messagesContainer.classList.remove('hidden');
    }
    
    exportConversationBtn.classList.remove('hidden');
    shareConversationBtn.classList.remove('hidden');

    messageInput.value = '';
    adjustTextareaHeight();
    
    // Render User Message
    appendMessageElement('user', text, true);
    scrollToBottom();
    
    // Get current session messages or init
    let currentSession = sessions.find(s => s.id === activeSessionId);
    let msgs = currentSession ? currentSession.messages : [];
    msgs.push({ role: 'user', content: text });
    saveSession(activeSessionId ? currentSession.title : 'New Chat', msgs);

    // Show Thinking
    thinkingIndicator.classList.remove('hidden');
    scrollToBottom();

    // STOP HERE FOR USER BACKEND HOOK
    // Simulate backend delay and generic response
    setTimeout(() => {
        thinkingIndicator.classList.add('hidden');
        
        const aiResponse = "This is a placeholder response.\\n\\n### Integrate your AI here\\nYou can connect your own AI backend in `app.js` inside the `handleSend()` function. \\n\\n\`\`\`javascript\\n// Example API call\\nconst response = await fetch('/api/chat', {\\n  method: 'POST',\\n  body: JSON.stringify({ messages })\\n});\\n\`\`\`\\n\\nQuantis is ready for production!";
        
        appendMessageElement('assistant', aiResponse, true);
        
        msgs.push({ role: 'assistant', content: aiResponse });
        saveSession(activeSessionId ? currentSession.title : 'New Chat', msgs);
        
    }, 1500);
}

sendBtn.addEventListener('click', handleSend);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

function adjustTextareaHeight() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    sendBtn.disabled = messageInput.value.trim().length === 0;
}
messageInput.addEventListener('input', adjustTextareaHeight);
adjustTextareaHeight();

// Starter Prompts
document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        messageInput.value = chip.dataset.prompt;
        adjustTextareaHeight();
        handleSend();
    });
});

// =======================
// SCROLLING
// =======================
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

messagesContainer.addEventListener('scroll', () => {
    const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
    if (!isAtBottom && messagesInner.children.length > 0) {
        scrollToBottomBtn.classList.add('visible');
    } else {
        scrollToBottomBtn.classList.remove('visible');
    }
});

scrollToBottomBtn.addEventListener('click', scrollToBottom);

// =======================
// HISTORY & SIDEBAR
// =======================
function renderHistory() {
    chatHistory.innerHTML = '';
    
    // Group by Today, Previous 7 Days, Older
    // Simplified rendering for brevity
    
    const now = new Date();
    
    if (sessions.length === 0) {
        chatHistory.innerHTML = '<div class="history-label" style="text-transform:none; font-weight:normal; opacity:0.5;">No history yet</div>';
        return;
    }
    
    sessions.forEach(session => {
        const btn = document.createElement('button');
        btn.className = \`history-item \${session.id === activeSessionId ? 'active' : ''}\`;
        btn.dataset.id = session.id;
        
        btn.innerHTML = \`
            \${getIcon('message')}
            <span class="item-title">\${session.title}</span>
            <div class="history-item-actions">
                <span class="history-action-btn menu-trigger">\${getIcon('menu')}</span>
            </div>
        \`;
        
        btn.addEventListener('click', (e) => {
            if (e.target.closest('.history-action-btn')) {
                showContextMenu(e, session.id);
            } else {
                loadSession(session.id);
            }
        });
        
        chatHistory.appendChild(btn);
    });
    
    initIcons();
}

chatSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.history-item').forEach(el => {
        const title = el.querySelector('.item-title').textContent.toLowerCase();
        el.style.display = title.includes(q) ? 'flex' : 'none';
    });
});

clearChatsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
        sessions = [];
        localStorage.removeItem('quantis_sessions');
        startNewChat();
        renderHistory();
        settingsPanel.classList.add('hidden');
    }
});

// =======================
// CONTEXT MENU
// =======================
function showContextMenu(e, id) {
    e.stopPropagation();
    contextMenuTargetId = id;
    
    chatContextMenu.classList.remove('hidden');
    
    // Position
    const rect = e.target.closest('.history-action-btn').getBoundingClientRect();
    chatContextMenu.style.top = \`\${rect.bottom + 4}px\`;
    chatContextMenu.style.left = \`\${rect.left}px\`;
}

document.addEventListener('click', (e) => {
    if (!chatContextMenu.contains(e.target)) {
        chatContextMenu.classList.add('hidden');
    }
});

chatContextMenu.addEventListener('click', (e) => {
    const btn = e.target.closest('.context-menu-item');
    if (!btn || !contextMenuTargetId) return;
    
    const action = btn.dataset.action;
    
    if (action === 'delete') {
        sessions = sessions.filter(s => s.id !== contextMenuTargetId);
        localStorage.setItem('quantis_sessions', JSON.stringify(sessions));
        if (activeSessionId === contextMenuTargetId) {
            startNewChat();
        }
        renderHistory();
    } else if (action === 'rename') {
        const session = sessions.find(s => s.id === contextMenuTargetId);
        const newTitle = prompt('Enter new title:', session.title);
        if (newTitle) {
            session.title = newTitle;
            localStorage.setItem('quantis_sessions', JSON.stringify(sessions));
            if (activeSessionId === contextMenuTargetId) currentChatLabel.textContent = newTitle;
            renderHistory();
        }
    } else {
        showToast(\`\${action} action not implemented in template\`);
    }
    
    chatContextMenu.classList.add('hidden');
});

// =======================
// FILE UPLOAD (Mock)
// =======================
attachBtn.addEventListener('click', () => {
    // Create an invisible file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(f => {
            attachedFiles.classList.remove('hidden');
            const chip = document.createElement('div');
            chip.className = 'attached-file-chip';
            chip.innerHTML = \`
                \${getIcon('paperclip')} \${f.name}
                <button class="remove-file">\${getIcon('close')}</button>
            \`;
            chip.querySelector('.remove-file').onclick = () => chip.remove();
            attachedFiles.appendChild(chip);
            initIcons();
        });
    };
    input.click();
});

// Drag and drop
window.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropOverlay.classList.remove('hidden');
});

dropOverlay.addEventListener('dragleave', () => {
    dropOverlay.classList.add('hidden');
});

dropOverlay.addEventListener('drop', (e) => {
    e.preventDefault();
    dropOverlay.classList.add('hidden');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        attachedFiles.classList.remove('hidden');
        files.forEach(f => {
            const chip = document.createElement('div');
            chip.className = 'attached-file-chip';
            chip.innerHTML = \`
                \${getIcon('paperclip')} \${f.name}
                <button class="remove-file">\${getIcon('close')}</button>
            \`;
            chip.querySelector('.remove-file').onclick = () => {
                chip.remove();
                if (attachedFiles.children.length === 0) attachedFiles.classList.add('hidden');
            };
            attachedFiles.appendChild(chip);
            initIcons();
        });
    }
});

// =======================
// UTILS
// =======================
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Init app
init();
