const BUTTON_SELECTOR = '.selection-button';

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

/*
    Create HTML elements
*/
function showPopover() {
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
    submitButton.addEventListener('click', () => {
        // Handle the submit button click here
        const selectedOption = select.value;
        const enteredText = textField.value;
        console.log('Selected option:', selectedOption);
        console.log('Entered text:', enteredText);

        // Close the popover
        document.body.removeChild(popover);
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

function createButton(selection) {
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
        showPopover();
        hideButton();
    });

    return button;
}

function showButton(selection) {
    // Remove any existing button
    hideButton();

    // Create button
    const button = createButton(selection);

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
    const selection = window.getSelection();
    if (selection.toString()) {
        console.log('Selection complete. Selected text:', selection.toString());
        showButton(selection);
    }
}

function handleDeselect(event) {
    if (event.target.matches(BUTTON_SELECTOR)) {
        return;
    }
    hideButton();
}

/*
    Listen to eventss
*/
document.addEventListener('mouseup', handleSelectionComplete);
document.addEventListener('mousedown', handleDeselect);