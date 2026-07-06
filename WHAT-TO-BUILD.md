You are a senior frontend engineer and award-winning UI/UX designer.

Build a complete production-ready frontend for an AI platform called "Quantis".

Do NOT create a generic chatbot clone. The UI should feel like ChatGPT, Claude, AI Studio and Cursor combined, while still having its own identity.

The design philosophy is:

• Minimalistic
• Premium
• Extremely polished
• Fast
• Responsive
• Smooth animations
• No glassmorphism
• No unnecessary gradients
• Clean spacing
• Modern typography
• Dark mode first
• Beautiful light mode
• Everything should feel intentional.

====================================================================

TECH STACK

Use only

HTML
CSS
Vanilla JavaScript (ES Modules)

No React.
No Vue.
No Tailwind.
No Bootstrap.
No jQuery.

Organize the project professionally.

css/
js/
assets/
components/

Everything modular.

====================================================================

COLOR SYSTEM

Dark Theme

Background:
#0D0D0D

Panels:
#171717

Hover:
#1F1F1F

Border:
#2A2A2A

Primary text:
#F5F5F5

Secondary text:
#9A9A9A

Accent:
#5B8CFF

Use CSS variables.

====================================================================

LIGHT THEME

Create a complete light theme.

It should not simply invert colors.

It should feel professionally designed.

Theme preference must persist using localStorage.

Detect system preference on first visit.

Animated transition between themes.

====================================================================

LOGO

The logo already exists inside

assets/logos/

Use the logo in:

Sidebar
Landing page
Browser favicon
Loading animation
Header

Animate the logo subtly.

====================================================================

LAYOUT

Desktop:

---------------------------------------------------------

Sidebar

Main Chat

---------------------------------------------------------

Mobile:

Sidebar becomes slide-out drawer.

====================================================================

SIDEBAR

Top

Logo

New Chat button

Search chats

Conversation history

History groups:

Today

Yesterday

Previous 7 Days

Previous 30 Days

Older

Pinned Chats

Collapse sidebar

Bottom

Theme toggle

Settings

Profile

====================================================================

TOP BAR

Left

Logo (when sidebar collapsed)

Center

Current chat title

Right

If NOT logged in

Sign In

Sign Up

If logged in

Avatar

Profile menu

Settings

Logout

====================================================================

LANDING PAGE

When there are zero messages

Center everything vertically.

Large animated logo.

Heading

Quantis

Subtitle

"I can help you write code, solve problems, brainstorm ideas and much more."

Prompt suggestions

Generate code

Explain something

Debug code

Write an article

Plan a project

Create SQL query

Create Python script

Improve writing

Each suggestion fills the textbox.

====================================================================

CHAT

NO chat bubbles.

Messages appear like ChatGPT.

User

Prompt

-----------------------------------

Quantis

Response

Different divider

Next conversation

Conversation divider

Exactly like ChatGPT style.

====================================================================

MESSAGE FEATURES

Each AI message has

Copy

Regenerate

Like

Dislike

Share

Edit

Delete

Timestamp

Hover toolbar

Toolbar hidden until hover.

====================================================================

INPUT

Large rounded textarea.

Auto resize.

Centered on first page.

Animates to bottom after first message.

Placeholder

Ask Quantis...

Buttons

Attach

Image

Voice

Send

Enter = Send

Shift+Enter = New line

Drag and Drop files.

Paste images.

====================================================================

MARKDOWN

Beautiful markdown rendering.

Support

Headings

Tables

Lists

Nested lists

Blockquotes

Inline code

Math

Horizontal rules

Links

Images

Task lists

Footnotes

Mermaid diagrams

KaTeX

Syntax highlighting.

====================================================================

CODE BLOCKS

Beautiful code blocks.

Header contains

Language icon

Language name

Copy

Download

Collapse

Expand

Filename support.

Downloaded filename:

quantis_code.<extension>

Automatically detect extension.

Support over 100 languages.

====================================================================

TYPEWRITER

Frontend only.

Backend returns full response.

Animate one character at a time.

Very fast.

Never lag.

Interruptible.

====================================================================

THINKING

Animated Quantis logo while waiting.

Skeleton loading.

Smooth fade.

====================================================================

CHAT HISTORY

Rename conversations automatically.

Manual rename.

Delete.

Pin.

Archive.

Search.

Share.

Duplicate.

====================================================================

SHARE

Generate shareable conversation page.

Copy link.

Export conversation.

Export as

Markdown

PDF

HTML

TXT

JSON

====================================================================

EXPORT

Export entire chat.

Download conversation.

Import previous conversations.

====================================================================

LOGIN

When not logged in

Show

Sign In

Sign Up

When logged in

Avatar

Dropdown

Profile

Settings

Logout

Authentication UI only.

No backend.

====================================================================

SETTINGS

Theme

Accent color

Font size

Animations

Sidebar position

Code font

Language

Typewriter speed

System prompt editor

Clear history

Export data

Import data

Keyboard shortcuts

Privacy

About

====================================================================

KEYBOARD SHORTCUTS

Ctrl+K

Search

Ctrl+/

Focus input

Ctrl+Shift+C

New Chat

Esc

Close dialogs

Arrow navigation.

====================================================================

RESPONSIVE

Perfect on

Desktop

Laptop

Tablet

Mobile

====================================================================

ANIMATIONS

Use CSS animations.

Smooth.

Subtle.

Premium.

Fade

Slide

Scale

Expand

Collapse

Loading shimmer

Logo animation

Nothing flashy.

====================================================================

ACCESSIBILITY

Keyboard accessible.

ARIA labels.

Visible focus.

Screen reader friendly.

High contrast.

====================================================================

PERFORMANCE

Lazy load.

Debounce search.

Virtualize long chats.

Minimize DOM updates.

Use requestAnimationFrame where appropriate.

====================================================================

FILES

Organize everything professionally.

Separate CSS.

Separate JS.

No inline CSS.

No inline JS.

No duplicated code.

====================================================================

API

Assume backend endpoints:

POST /api/v1/chat/completions

POST /api/v1/chat/completions/stream

GET /api/v1/conversations

POST /api/v1/conversations

PATCH /api/v1/conversations/{id}

DELETE /api/v1/conversations/{id}

====================================================================

FINAL REQUIREMENTS

Produce production-quality code.

Do not use placeholder styling.

Do not simplify the UI.

Every component should be polished.

Maintain consistent spacing, typography, iconography, animations, colors, and responsiveness throughout the project.

The final result should feel like a premium AI product ready for public release, inspired by ChatGPT, Claude, AI Studio, and Cursor, while remaining an original design with its own visual identity.