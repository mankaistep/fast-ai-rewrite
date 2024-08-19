/*
    AI function
*/
async function aiRewrite(original, prompt) {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Organization': `${OPENAI_ORGANIZATION_ID}`,
            'OpenAI-Project': `${OPENAI_PROJECT_ID}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system", 
                    content: `
                        You are a support agent for an Shopify App platform.
                        You are about to rewrite the chat I provide based on the content I give you
                        Your job is to assist customers with any issues they encounter while using the platform, ensuring that responses are clear, empathetic, and solution-oriented
                        Always maintain a friendly and professional tone, and provide concise and actionable guidance, sometime funny
                        Don't make the message feel like bot, make it human
                        The prompt will include message to rewrite and the note when rewrite
                        If the note is empty, please ignore
                        Provide rewritten text only, don't include anything else
                    ` 
                },
                {
                    role: "user",
                    content: `
                        message to rewrite: ${original}.
                        note when rewrite: ${prompt}
                    `
                }
            ],
            temperature: 0.3
        })
    }

    // Send
    // Send the request and return the suggestion
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', request);
        const data = await response.json();

        const suggestion = data.choices[0].message.content;
        
        return suggestion;
    } catch (error) {
        return null;
    }
}

/*
    Action rewrite
*/
async function handClickToRewrite(originalText, selectedOption, enteredText, inputSelector, activeElement) {
    const suggestion = await aiRewrite(originalText, enteredText);

    if (suggestion) {
        // Check if GG Docs
        if (isGoogleDocs()) {
            pasteContent(suggestion, activeElement);
        }
        // If inputs
        else {
            const inputElement = document.querySelector(inputSelector);

            if (inputElement) {
                // Get the current HTML of the contenteditable element
                const currentHTML = inputElement.innerHTML;
            
                // Replace the originalText with the suggestion
                const newHTML = currentHTML.replace(originalText, suggestion);
            
                // Set the new HTML to the contenteditable element
                inputElement.innerHTML = newHTML;
            
                // Set the cursor position or select the replaced text
                const range = document.createRange();
                const selection = window.getSelection();
            
                // Find the start position of the suggestion
                const start = newHTML.indexOf(suggestion);
                if (start !== -1) {
                    // Set the range to select the suggestion
                    range.setStart(inputElement.firstChild, start);
                    range.setEnd(inputElement.firstChild, start + suggestion.length);
            
                    // Clear any existing selection and add the new range
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            
                // Focus back on the contenteditable element
                inputElement.focus();
            
                // Dispatch a change event if needed
                const event = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(event);
            }
        }
    }
}

/*
    Create HTML elements
*/
function showPopover(originalText, inputSelector, activeElement) {
    // Find the button element using BUTTON_SELECTOR
    const button = document.querySelector(BUTTON_SELECTOR);
    if (!button) {
        console.error('Button with the specified selector not found.');
        return;
    }

    // Create the popover container
    const popover = document.createElement('div');
    popover.className = 'popover';

    // Create the content for the popover
    const popoverContent = document.createElement('div');
    popoverContent.className = 'popover-content';

    // Create the select field
    const select = document.createElement('select');
    select.className = 'popover-select';
    select.innerHTML = `
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
    `;
    popoverContent.appendChild(select);

    // Create the text field
    const textField = document.createElement('input');
    textField.type = 'text';
    textField.placeholder = 'Enter text here';
    textField.className = 'popover-textfield';
    popoverContent.appendChild(textField);

    // Create the submit button inside the popover
    const submitButton = document.createElement('button');
    submitButton.innerHTML = 'Generate ✦';
    submitButton.className = REWRITE_BUTTON_SELECTOR.replace(".", "");

    // SUBMIT ACTION!!!
    submitButton.addEventListener('click', async () => {
        const generateButton = document.querySelector(REWRITE_BUTTON_SELECTOR);

        generateButton.classList.add('loading');
        generateButton.innerHTML = 'AI processing <div class="spinner"></div>'; 
    
        await handClickToRewrite(originalText, select.value, textField.value, inputSelector, activeElement)

        generateButton.classList.remove('loading');
        submitButton.innerHTML = 'Generate ✦';
    });
    popoverContent.appendChild(submitButton);

    // Append the content to the popover container
    popover.appendChild(popoverContent);

    // Calculate position and append the popover to the body
    const buttonRect = button.getBoundingClientRect();
    const middleOfScreen = window.innerHeight / 2;
    
    // Check if the button is above or below the middle of the screen
    let topPosition;
    if (buttonRect.top < middleOfScreen) {
        // If above the middle of the screen, position the popover below the button
        topPosition = window.scrollY + buttonRect.top; // 10px below the button
    } else {
        // If below the middle of the screen, position the popover above the button
        topPosition = window.scrollY + buttonRect.top - popover.offsetHeight - 170; // Adjusted to 170px above the button
    }
    
    Object.assign(popover.style, {
        top: `${topPosition}px`,
        left: `${window.scrollX + buttonRect.left}px`
    });
    
    document.body.appendChild(popover);
    

    // Add an event listener to close the popover when clicking outside of it
    function handleClickOutside(event) {
        if (!popover.contains(event.target) && event.target !== button) {
            document.body.removeChild(popover);
            document.removeEventListener('click', handleClickOutside);
        }
    }
    document.addEventListener('click', handleClickOutside);
}

function getSelectionRectRelativeToBody(selection) {
    if (selection.rangeCount === 0) return null; // No selection
    
    let range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();
    
    // Initialize offset
    let offsetTop = 0;
    let offsetLeft = 0;
    
    // Traverse up the DOM to accumulate offsets if inside iframes
    let currentFrame = window.frameElement;
    while (currentFrame) {
        const frameRect = currentFrame.getBoundingClientRect();
        
        // Add iframe's position to offsets
        offsetTop += frameRect.top;
        offsetLeft += frameRect.left;
        
        // Move up to the parent frame
        currentFrame = currentFrame.ownerDocument.defaultView.frameElement;
    }
    
    // Calculate final position relative to the <body> of the main document
    return {
        top: rect.top + offsetTop,
        left: rect.left + offsetLeft,
        bottom: rect.bottom + offsetTop,
        right: rect.right + offsetLeft,
        width: rect.width,
        height: rect.height
    };
}


function createButton(selection, inputSelector, frameElement) {
    // Create a button element
    const button = document.createElement('button');
    button.textContent = 'Rewrite ✦';
    button.className = `${BUTTON_SELECTOR.replace(".", "")} rewrite-button`;

    // Check if the selection is within a textarea
    const range = selection.getRangeAt(0);
    
    const selectedNode = range.startContainer;
    const parentElement = selectedNode.nodeType === 3 ? selectedNode.parentElement : selectedNode;

    let top, left;

    // Find the <textarea> element
    let textArea = null;
    if (parentElement.tagName === 'TEXTAREA') {
        textArea = parentElement;
    } else {
        // If not directly a <textarea>, find it within the parent element
        textArea = parentElement.querySelector('textarea');
    }

    const middleOfScreen = (window.innerHeight / 2);

    // gg docs
    if (isGoogleDocs()) {
        // Get scroll
        const editorElement = document.querySelector('.kix-appview-editor');
        const ggDocScroll = editorElement.scrollTop;

        // If Window
        if (window.getComputedStyle(frameElement).getPropertyValue('transform') != 'none') {
            let normalRect = range.getBoundingClientRect();

            // If iframe
            const iframe = frameElement;
            const iframeRect = getSelectionPositionInIframe(iframe, selection);
            if (iframeRect) {
                normalRect = convertIframePositionToMainWindow(iframe, iframeRect);
            }
            
            if (normalRect.top < middleOfScreen) {
                // If above the middle of the screen, display below
                top = window.scrollY + normalRect.bottom + 10; // 10px below the range
            } else {
                // If below the middle of the screen, display above
                top = window.scrollY + normalRect.top - 30; // 30px above the range
            }
            left = window.scrollX + normalRect.left;
        }
        // If Mac
        else {
            const offset = getSelectionOffsetInGoogleDocs(selection);

            let normalRect = range.getBoundingClientRect();

            if (normalRect.bottom - ggDocScroll < middleOfScreen) {
                // If above the middle of the screen, display below
                top = window.scrollY + offset.bottom + 7; 
            } else {
                // If below the middle of the screen, display above
                top = window.scrollY + offset.top - 55;
            }
            left = window.scrollX + offset.left;
        }

        // Position the button
        button.style.top = `${top}px`;
        button.style.left = `${left}px`;
    }
    // Not gg docs
    else {
        // Text area
        if (textArea) {
            // Get the bounding rectangle of the <textarea>
            const textAreaRect = textArea.getBoundingClientRect();
            const middleOfScreen = window.innerHeight / 2;
            
            if (textAreaRect.top < middleOfScreen) {
                // If above the middle of the screen, display below
                top = window.scrollY + textAreaRect.bottom + 10; // 10px below the textarea
            } else {
                // If below the middle of the screen, display above
                top = window.scrollY + textAreaRect.top - 30; // 30px above the textarea
            }
            left = window.scrollX + textAreaRect.left;
        }
        // Not text area (maybe input?)
        else {
            // Fallback to the range if <textarea> is not found
            let normalRect = getSelectionTopLeft(selection);
            
            if (normalRect.bottom < middleOfScreen) {
                // If above the middle of the screen, display below
                top = window.scrollY + normalRect.bottom + 7; 
            } else {
                // If below the middle of the screen, display above
                top = window.scrollY + normalRect.top - 55;
            }
            left = window.scrollX + normalRect.left;
        }

        // Position the button
        button.style.top = `${top}px`;
        button.style.left = `${left}px`;
    }

    // Event
    button.addEventListener('click', () => {
    
        // Perform your action (e.g., show popover, etc.)
        showPopover(selection.toString(), inputSelector, parentElement);
    
        // Optionally, you can hide the button after the action is complete
        hideButton();
    });

    return button;
}

function showButton(selection, inputSelector, frameElement) {
    // Remove any existing button
    hideButton();

    // Create button
    const button = createButton(selection, inputSelector, frameElement);

    // Append the button to the document body
    document.body.appendChild(button);
}

function hideButton() {
    const existingButton = document.querySelector(BUTTON_SELECTOR);
    if (existingButton) {
        existingButton.remove();
    }
}

/*
    Handle events
*/
function handleSelectionComplete() {
    // Only show button if it's editable field or it's Google Docs
    if (!isEditingGoogleDocs()) {
        if (!isCursorInTypableField()) {
            return;
        }
    }
    
    // Show button
    const activeElement = document.activeElement;

    const parentWindow = getContentWindowForActiveElement();
    const selection = parentWindow.document.getSelection();
    
    if (selection.toString()) {
        showButton(selection, getUniqueSelector(activeElement), parentWindow.frameElement);
    }
}

function handleDeselect(event) {
    try {
        if (event.target.matches(BUTTON_SELECTOR)) {
            return;
        }
        hideButton();
    }
    catch (error) {
        return;
    }
}

/*
    Listen to events
*/
// Add event listeners for mouse
document.addEventListener('mouseup', (event) => {
    setTimeout(handleSelectionComplete, 50);
});
document.addEventListener('mousedown', handleDeselect);

// Deselect
document.addEventListener('input', handleDeselect);

// Deselect with text area
setTimeout(() => {
    const inputElements = document.querySelectorAll('textarea, input[type="text"]');
    inputElements.forEach(element => {
        element.addEventListener('input', handleDeselect);
    });
}, 2500);


// Key event
let documentToAddListner = document;
if (isGoogleDocs()) {
    documentToAddListner = document.querySelector('.docs-texteventtarget-iframe').contentWindow.document;
}
// Select by keyboard
documentToAddListner.addEventListener('keyup', (event) => {
    handleDeselect();
});
documentToAddListner.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        setTimeout(handleSelectionComplete, 50);
    }
});