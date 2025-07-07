document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const htmlCode = document.getElementById('htmlCode');
    const cssCode = document.getElementById('cssCode');
    const jsCode = document.getElementById('jsCode');
    const previewFrame = document.getElementById('previewFrame');
    const runButton = document.getElementById('runButton');
    const resetButton = document.getElementById('resetButton');
    const refreshButton = document.getElementById('refreshButton');
    const downloadButton = document.getElementById('downloadButton');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Default code for reset function
    const defaultHTML = htmlCode.value;
    const defaultCSS = cssCode.value;
    const defaultJS = jsCode.value;
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all panels
            const panels = document.querySelectorAll('.code-section');
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Show selected panel
            const panelId = this.getAttribute('data-tab');
            document.getElementById(panelId).classList.add('active');
        });
    });
    
    // Function to update preview
    function updatePreview() {
        // Get the iframe document
        const previewDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
        
        // Clear the document
        previewDocument.open();
        
        // Construct the HTML content with inline CSS and JS
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssCode.value}</style>
            </head>
            <body>
                ${getBodyContent(htmlCode.value)}
                <script>${jsCode.value}</script>
            </body>
            </html>
        `;
        
        // Write to the iframe document
        previewDocument.write(content);
        previewDocument.close();
        
        // Add animation to show update
        previewFrame.style.opacity = '0.5';
        setTimeout(() => {
            previewFrame.style.opacity = '1';
        }, 100);
    }
    
    // Function to extract body content from full HTML
    function getBodyContent(html) {
        // If the HTML doesn't contain a body tag, return it as-is
        if (!html.includes('<body')) {
            return html;
        }
        
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Try to find the body content
        const bodyContent = tempDiv.querySelector('body');
        
        // Return the body content or the original HTML if body not found
        return bodyContent ? bodyContent.innerHTML : html;
    }
    
    // Function to reset code to defaults
    function resetCode() {
        htmlCode.value = defaultHTML;
        cssCode.value = defaultCSS;
        jsCode.value = defaultJS;
        updatePreview();
        
        // Add animation to show reset
        [htmlCode, cssCode, jsCode].forEach(editor => {
            editor.classList.add('reset-flash');
            setTimeout(() => {
                editor.classList.remove('reset-flash');
            }, 300);
        });
    }
    
    // Function to download code as ZIP
    function downloadAsZip() {
        try {
            // Create a new JSZip instance
            const zip = new JSZip();
            
            // Add files to the zip
            zip.file("index.html", htmlCode.value);
            zip.file("style.css", cssCode.value);
            zip.file("script.js", jsCode.value);
            
            // Generate the zip file
            zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    // Use FileSaver.js to save the file
                    saveAs(content, "mini-code-playground.zip");
                    
                    // Show success animation
                    downloadButton.classList.add('success');
                    setTimeout(() => {
                        downloadButton.classList.remove('success');
                    }, 1500);
                })
                .catch(error => {
                    console.error("Error creating ZIP:", error);
                    alert("Failed to create ZIP file. Please try again.");
                });
        } catch (error) {
            console.error("Error in download process:", error);
            alert("An error occurred during the download process.");
        }
    }

    // Event listeners
    runButton.addEventListener('click', updatePreview);
    resetButton.addEventListener('click', resetCode);
    refreshButton.addEventListener('click', updatePreview);
    downloadButton.addEventListener('click', downloadAsZip);
    
    // Auto-resize textareas
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    [htmlCode, cssCode, jsCode].forEach(textarea => {
        textarea.addEventListener('input', function() {
            adjustTextareaHeight(this);
        });
        
        // Initial height adjustment
        adjustTextareaHeight(textarea);
    });
    
    // Add indentation support (tab key)
    [htmlCode, cssCode, jsCode].forEach(editor => {
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                // Get cursor position
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                // Insert tab at cursor position
                this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
                
                // Move cursor after the inserted tab
                this.selectionStart = this.selectionEnd = start + 2;
            }
        });
    });
    
    // Auto-update preview on typing (with debounce)
    let typingTimer;
    const doneTypingInterval = 1000; // Time in ms
    
    function doneTyping() {
        updatePreview();
    }
    
    [htmlCode, cssCode, jsCode].forEach(editor => {
        editor.addEventListener('keyup', function() {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        });
        
        editor.addEventListener('keydown', function() {
            clearTimeout(typingTimer);
        });
    });
    
    // Monitor for changes in iframe size
    window.addEventListener('resize', function() {
        // Add a small delay to ensure the iframe has resized
        setTimeout(updatePreview, 300);
    });
    
    // Initial preview update
    updatePreview();
    
    // Add syntax highlighting simulation effect
    function simulateSyntaxHighlighting(editor) {
        // This is a simple visual effect to simulate syntax highlighting
        // In a real project, you might use libraries like highlight.js or CodeMirror
        editor.style.caretColor = '#fff';
        
        editor.addEventListener('input', function() {
            // This just adds a subtle flash effect when typing
            editor.style.backgroundColor = '#232323';
            setTimeout(() => {
                editor.style.backgroundColor = '#1e1e1e';
            }, 50);
        });
    }
    
    [htmlCode, cssCode, jsCode].forEach(simulateSyntaxHighlighting);
    
    // Add event listener for browser back button
    window.addEventListener('popstate', function() {
        // If the user navigates back to the editor page, refresh the preview
        updatePreview();
    });
    
    // Alert users before leaving if they have made changes
    let originalCode = htmlCode.value + cssCode.value + jsCode.value;
    
    window.addEventListener('beforeunload', function(e) {
        const currentCode = htmlCode.value + cssCode.value + jsCode.value;
        
        if (currentCode !== originalCode) {
            // Modern browsers don't show custom messages for security reasons
            // but this will still trigger the confirmation dialog
            e.preventDefault();
            e.returnValue = '';
        }
    });
});