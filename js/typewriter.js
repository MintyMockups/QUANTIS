/**
 * Typewriter effect for AI responses
 */

export class Typewriter {
    constructor(element, text, options = {}) {
        this.element = element;
        this.text = text;
        this.speed = options.speed || 15; // ms per char
        this.onComplete = options.onComplete || (() => {});
        this.onUpdate = options.onUpdate || (() => {});
        this.htmlContent = '';
        this.isStopped = false;
    }

    async typeHTML(htmlString) {
        this.element.innerHTML = '';
        
        // Very basic approach for now: just inject the HTML directly 
        // to avoid complex node-by-node typing for this prototype.
        // In a real production app we'd stream text nodes.
        
        // Simulating the delay for the whole block for effect
        let chunks = htmlString.split(/(<[^>]*>)/g);
        let currentHTML = '';
        
        for (let chunk of chunks) {
            if (this.isStopped) break;
            
            if (chunk.startsWith('<')) {
                currentHTML += chunk;
                this.element.innerHTML = currentHTML;
            } else {
                for (let i = 0; i < chunk.length; i++) {
                    if (this.isStopped) break;
                    currentHTML += chunk[i];
                    this.element.innerHTML = currentHTML;
                    
                    // Call update for scrolling
                    if (i % 5 === 0) this.onUpdate();
                    
                    await new Promise(r => setTimeout(r, this.speed));
                }
            }
        }
        
        if (!this.isStopped) {
            this.onComplete();
        }
    }

    stop() {
        this.isStopped = true;
    }
}
