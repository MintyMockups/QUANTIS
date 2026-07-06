/**
 * Basic Markdown to HTML parser
 */

export function parseMarkdown(text) {
    if (!text) return '';

    // Handle code blocks first to protect contents
    let parsedText = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        // Extract language if present
        const lines = code.split('\n');
        let lang = '';
        if (lines[0] && !lines[0].includes(' ') && lines.length > 1) {
            lang = lines[0].trim();
            lines.shift();
        }
        
        const cleanCode = lines.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
        
        return `
            <pre>
                <div class="code-header">
                    <span class="code-lang">${lang || 'code'}</span>
                    <button class="copy-code-btn" aria-label="Copy code">
                        <span class="icon-holder" data-icon="copy"></span> Copy
                    </button>
                </div>
                <code>${cleanCode}</code>
            </pre>
        `;
    });

    // Inline code
    parsedText = parsedText.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    parsedText = parsedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    parsedText = parsedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Headers
    parsedText = parsedText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    parsedText = parsedText.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    parsedText = parsedText.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquotes
    parsedText = parsedText.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Unordered Lists
    parsedText = parsedText.replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>');
    parsedText = parsedText.replace(/<\/ul>\n<ul>/g, '\n'); // Merge adjacent lists

    // Ordered Lists
    parsedText = parsedText.replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>');
    parsedText = parsedText.replace(/<\/ol>\n<ol>/g, '\n'); // Merge adjacent lists

    // Links
    parsedText = parsedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Horizontal Rule
    parsedText = parsedText.replace(/^---$/gim, '<hr>');

    // Paragraphs (wrap lines that aren't already HTML blocks)
    const blocks = ['<pre>', '<h', '<ul>', '<ol>', '<blockquote>', '<hr>', '<li>'];
    const lines = parsedText.split('\n');
    let inList = false;
    
    parsedText = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed === '') return '';
        if (blocks.some(b => trimmed.startsWith(b))) return line;
        return `<p>${line}</p>`;
    }).join('\n');

    return parsedText;
}
