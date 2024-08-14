const BUTTON_SELECTOR = '.selection-button';

const OPENAI_API_KEY = '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';
const OPENAI_ORGANIZATION_ID = 'org-G3tztz3w8bknXwb2FeSN8sa1';
const OPENAI_PROJECT_ID = 'proj_I7L3HWWUVlrcgV6R0IUevhlI';

/*
    Utils function
*/
function isCursorInTypableField() {
    const activeElement = document.activeElement;

    // Check if the active element is an input, textarea, or contenteditable
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return true;
    }

    if (activeElement.hasAttribute('contenteditable')) {
        return true;
    }

    return false;
}

function getUniqueSelector(element) {
    if (element.id) {
        return `#${element.id}`;
    }

    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        
        // Add classes if they exist
        if (element.className) {
            selector += '.' + element.className.trim().replace(/\s+/g, '.');
        }

        // Add nth-child if necessary to distinguish similar siblings
        if (element.parentElement) {
            const siblings = Array.from(element.parentElement.children);
            const sameTagSiblings = siblings.filter(sibling => sibling.nodeName === element.nodeName);
            if (sameTagSiblings.length > 1) {
                const index = siblings.indexOf(element) + 1;
                selector += `:nth-child(${index})`;
            }
        }

        path.unshift(selector);
        element = element.parentElement;
    }

    return path.join(' > ');
}

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
    Create HTML elements
*/
function showPopover(originalText, inputSelector) {
    // Find the button element using BUTTON_SELECTOR
    const button = document.querySelector(BUTTON_SELECTOR);
    if (!button) {
        console.error('Button with the specified selector not found.');
        return;
    }

    // Create the popover container
    const popover = document.createElement('div');
    popover.className = 'popover';
    Object.assign(popover.style, {
        position: 'absolute',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: '1000'
    });

    // Create the content for the popover
    const popoverContent = document.createElement('div');
    Object.assign(popoverContent.style, {
        display: 'flex',
        flexDirection: 'column'
    });

    // Create the select field
    const select = document.createElement('select');
    select.innerHTML = `
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
    `;
    Object.assign(select.style, {
        display: 'block',
        margin: '10px 0',
        width: '100%'
    });
    popoverContent.appendChild(select);

    // Create the text field
    const textField = document.createElement('input');
    textField.type = 'text';
    textField.placeholder = 'Enter text here';
    Object.assign(textField.style, {
        display: 'block',
        margin: '10px 0',
        width: '100%'
    });
    popoverContent.appendChild(textField);

    // Create the submit button inside the popover
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    Object.assign(submitButton.style, {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    });

    // SUBMIT ACTION!!!
    //
    //
    //
    // IMPORTANT
    submitButton.addEventListener('click', async () => {
        // Handle the submit button click here
        const selectedOption = select.value;
        const enteredText = textField.value;

        console.log('Selected option:', selectedOption);
        console.log('Entered text:', enteredText);

        const suggestion = await aiRewrite(originalText, enteredText);
        console.log('suggestion:', suggestion);
        console.log('input selector:', inputSelector);
        if (suggestion) {
            document.querySelector(inputSelector).innerText = suggestion;
            document.querySelector(inputSelector).value = suggestion;
        }

        // Close the popover
        // document.body.removeChild(popover);
    });
    popoverContent.appendChild(submitButton);

    // Append the content to the popover container
    popover.appendChild(popoverContent);

    // Calculate position and append the popover to the body
    const buttonRect = button.getBoundingClientRect();
    Object.assign(popover.style, {
        // Fixed 170px
        top: `${window.scrollY + buttonRect.top - popover.offsetHeight - 170}px`,
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

function createButton(selection, inputSelector) {
    // Create a button element
    const button = document.createElement('button');
    button.textContent = 'Rewrite with AI';
    button.className = BUTTON_SELECTOR.replace(".", "");

    // Style the button
    button.style.position = 'absolute';
    button.style.zIndex = '1000';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '8px 16px';
    button.style.cursor = 'pointer';

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

    if (textArea) {
        // Get the bounding rectangle of the <textarea>
        const textAreaRect = textArea.getBoundingClientRect();
        top = window.scrollY + textAreaRect.top - 50; // Position below the textarea
        left = window.scrollX + textAreaRect.left;
    } else {
        // Fallback to the range if <textarea> is not found
        const normalRect = range.getBoundingClientRect();
        top = window.scrollY + normalRect.top - 50;
        left = window.scrollX + normalRect.left;
    }

    // Position the button
    button.style.top = `${top}px`;
    button.style.left = `${left}px`;

    // Event
    button.addEventListener('click', () => {
        showPopover(selection.toString(), inputSelector);
        hideButton();
    });

    return button;
}

function showButton(selection, inputSelector) {
    // Remove any existing button
    hideButton();

    // Create button
    const button = createButton(selection, inputSelector);

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
    // Only show button if it's editable field
    if (!isCursorInTypableField()) {
        return;
    }
    
    // Show button
    const activeElement = document.activeElement;
    const selection = window.getSelection();
    if (selection.toString()) {
        showButton(selection, getUniqueSelector(activeElement));
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
    setTimeout(handleSelectionComplete, 1);
});
document.addEventListener('mousedown', handleDeselect);

// Select by keyboard
document.addEventListener('keyup', (event) => {
    handleDeselect();
});
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'a') {
        setTimeout(handleSelectionComplete, 1); 
    }
});

// Deselect
document.addEventListener('input', handleDeselect);

// If you're working with specific input elements (e.g., textarea or input fields),
// add the event listener to those elements instead of the document.
setTimeout(() => {
    const inputElements = document.querySelectorAll('textarea, input[type="text"]');
    inputElements.forEach(element => {
        element.addEventListener('input', handleDeselect);
    });
}, 2500);