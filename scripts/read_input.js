const BUTTON_SELECTOR = '.selection-button';

/*
    Create HTML elements
*/
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

    // Get the position of the end of the selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position the button after the end of the selection
    button.style.top = `${window.scrollY + rect.bottom + 10}px`;
    button.style.left = `${window.scrollX + rect.left}px`;

    return button;
}

/*
    Handle events
*/
function handleSelectionComplete() {
    const selection = window.getSelection();
    if (selection.toString()) {
        console.log('Selection complete. Selected text:', selection.toString());

        // Remove any existing button
        const existingButton = document.querySelector(BUTTON_SELECTOR);
        if (existingButton) {
            existingButton.remove();
        }

        // Create button
        const button = createButton(selection);

        // Append the button to the document body
        document.body.appendChild(button);
    }
}

function handleDeselect() {
    const existingButton = document.querySelector(BUTTON_SELECTOR);
    if (existingButton) {
        existingButton.remove();
    }
}

/*
    Listen to events
*/
document.addEventListener('mouseup', handleSelectionComplete);
document.addEventListener('mousedown', handleDeselect);
