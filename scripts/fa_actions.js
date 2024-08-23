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
    select.innerHTML = AGENTS.map(agent => `<option value="${agent.id}">${agent.name}</option>`).join('');
    popoverContent.appendChild(select);

    // Create the text field
    const textField = document.createElement('input');
    textField.type = 'text';
    textField.placeholder = 'Note';
    textField.className = 'popover-textfield';
    popoverContent.appendChild(textField);

    // Create the button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'popover-button-container';

    // Create the submit button inside the popover
    const submitButton = document.createElement('button');
    submitButton.innerHTML = 'Generate ✦';
    submitButton.className = REWRITE_BUTTON_SELECTOR.replace(".", "");
    buttonContainer.appendChild(submitButton);

    // Create the revert button
    const revertButton = document.createElement('button');
    revertButton.innerHTML = `
    <svg viewBox="0 0 20 20" class="Icon_Icon__uZZKy" style="width: 20px; height: 20px;"><path d="M7.47 3.72a.75.75 0 0 1 1.06 1.06l-1.72 1.72h3.94a5 5 0 0 1 0 10h-1.5a.75.75 0 0 1 0-1.5h1.5a3.5 3.5 0 1 0 0-7h-3.94l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3Z"></path></svg>
    `;
    revertButton.style.display = 'none'; // Initially hidden
    revertButton.className = 'popover-revert-button';
    buttonContainer.appendChild(revertButton);

    // Button container
    popoverContent.appendChild(buttonContainer);

    // SUBMIT ACTION!!!
    submitButton.addEventListener('click', async () => {
        const generateButton = document.querySelector(REWRITE_BUTTON_SELECTOR);

        generateButton.classList.add('loading');
        generateButton.innerHTML = '<div class="spinner"></div>'; 
    
        await handClickToRewrite(originalText, select.value, textField.value, inputSelector, activeElement)

        if (!isGoogleDocs()) {
            generateButton.classList.remove('loading');

            submitButton.classList.remove(REWRITE_BUTTON_SELECTOR);
            submitButton.classList.add('popover-resubmit-button');
            submitButton.innerHTML = 'Again ✦';
    
            // Show the revert button after the first click
            revertButton.style.display = 'flex'; // Change display property;
        }
        // If GGDocs, close popover
        else {
            document.body.removeChild(popover);
            document.removeEventListener('click', handleClickOutside);
        }
    });

    // Revert button action
    revertButton.addEventListener('click', () => {
        // Remove popup
        document.body.removeChild(popover);
        document.removeEventListener('click', handleClickOutside);

        handleClickRevert(activeElement);
    });

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
        topPosition = window.scrollY + buttonRect.top - popover.offsetHeight - 150; // Adjusted to 170px above the button
    }

    const leftPosition = window.scrollX + buttonRect.left - (buttonRect.right - buttonRect.left) / 2;
    
    Object.assign(popover.style, {
        top: `${topPosition}px`,
        left: `${leftPosition}px`
    });
    
    document.body.appendChild(popover);
    

    // Add an event listener to close the popover when clicking outside of it
    function handleClickOutside(event) {
        if (!popover.contains(event.target) && event.target !== button) {
            document.body.removeChild(popover);
            document.removeEventListener('click', handleClickOutside);

            // Clear cache
            removeLastText();
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

    // Clear cache
    removeLastText();

    // Append the button to the document body
    document.body.appendChild(button);
}

function hideButton() {
    const existingButton = document.querySelector(BUTTON_SELECTOR);
    if (existingButton) {
        existingButton.remove();
    }
}
