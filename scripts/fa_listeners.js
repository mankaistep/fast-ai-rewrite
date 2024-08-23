/*
    Handle events
*/
function handleSelectionComplete() {
    if (isPopoverLive()) {
        return;
    }
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
    if (isPopoverLive()) {
        return;
    }
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
