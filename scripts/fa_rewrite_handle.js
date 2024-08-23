let lastOriginalText;
let lastSuggestedText;
let lastInputSelector;

/*
    Set last
*/
function setLastText(originalText, suggestedText, inputSelector) {
    lastOriginalText = originalText;
    lastSuggestedText = suggestedText;
    lastInputSelector = inputSelector;
}

function removeLastText() {
    setLastText(null, null, null);
}

/*
    Action rewrite
*/
async function handClickToRewrite(originalText, selectedOption, enteredText, inputSelector, activeElement) {
    let prompt = lastOriginalText;
    if (!prompt) {
        prompt = originalText;
    }

    const suggestion = await aiRewrite(prompt, enteredText, selectedOption);

    if (suggestion) {
        // Check if GG Docs
        if (isGoogleDocs()) {
            pasteContent(suggestion, activeElement);

            // Set last
            setLastText(prompt, suggestion, inputSelector);
        }
        // If inputs
        else {
            let toBeReplaced;
            const toReplace = suggestion;
            // First time
            if (!lastSuggestedText) {
                toBeReplaced = originalText;
            }
            // Generate again
            else {
                toBeReplaced = lastSuggestedText;
            }
            const inputElement = document.querySelector(inputSelector);

            if (!inputElement) {
                console.error('Element not found');
                return;
            }
        
            if (inputElement.tagName === 'TEXTAREA') {
                // For <textarea>
                const currentValue = inputElement.value;
                const newValue = currentValue.replace(toBeReplaced, toReplace);
                inputElement.value = newValue;
        
                // Set the cursor position or selection range
                const start = newValue.indexOf(suggestion);
                if (start !== -1) {
                    const end = start + suggestion.length;
                    inputElement.setSelectionRange(start, end);
                }
        
                inputElement.focus();
                const event = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(event);

                // Set last
                setLastText(prompt, suggestion, inputSelector);

            } else if (inputElement.isContentEditable) {
                // For contenteditable element
                const currentHTML = inputElement.innerHTML;
                const newHTML = currentHTML.replace(toBeReplaced, toReplace);
                inputElement.innerHTML = newHTML;
        
                // Set the cursor position or select the replaced text
                const range = document.createRange();
                const selection = window.getSelection();
        
                // Find the start position of the suggestion
                const start = newHTML.indexOf(suggestion);
                if (start !== -1) {
                    const textNode = Array.from(inputElement.childNodes).find(node =>
                        node.nodeType === Node.TEXT_NODE && node.textContent.includes(suggestion)
                    );
        
                    if (textNode) {
                        range.setStart(textNode, start);
                        range.setEnd(textNode, start + suggestion.length);
        
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
        
                inputElement.focus();
                const event = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(event);

                // Set last
                setLastText(prompt, suggestion, inputSelector);
            } else {
                console.error('Unsupported element type');
            }
            
        }
    }
}

/*
    Action revert
*/
async function handleClickRevert(activeElement) {
    // If GG Docs, force Ctrl Z
    if (isGoogleDocs()) {
        triggerUndo(activeElement);
        return;
    }
    
    // Else replace text
    const inputSelector = lastInputSelector;
    if (!inputSelector) {
        console.log('No input selector to revert');
        return;
    }
    const inputElement = document.querySelector(inputSelector);

    if (!inputElement) {
        console.error('Element not found');
        return;
    }

    if (inputElement.tagName === 'TEXTAREA') {
        // For <textarea>
        const currentValue = inputElement.value;

        const newValue = currentValue.replace(lastSuggestedText, lastOriginalText);
        inputElement.value = newValue;

        // Set the cursor position or selection range
        const start = newValue.indexOf(lastOriginalText);
        if (start !== -1) {
            const end = start + lastOriginalText.length;
            inputElement.setSelectionRange(start, end);
        }

        inputElement.focus();
        const event = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(event);

    } else if (inputElement.isContentEditable) {
        // For contenteditable element
        const currentHTML = inputElement.innerHTML;
        const newHTML = currentHTML.replace(lastSuggestedText, lastOriginalText);
        inputElement.innerHTML = newHTML;

        // Set the cursor position or select the replaced text
        const range = document.createRange();
        const selection = window.getSelection();

        // Find the start position of the suggestion
        const start = newHTML.indexOf(lastOriginalText);
        if (start !== -1) {
            const textNode = Array.from(inputElement.childNodes).find(node =>
                node.nodeType === Node.TEXT_NODE && node.textContent.includes(lastOriginalText)
            );

            if (textNode) {
                range.setStart(textNode, start);
                range.setEnd(textNode, start + lastOriginalText.length);

                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        inputElement.focus();
        const event = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(event);
    } else {
        console.error('Unsupported element type to revert');
    }
}
