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

function isGoogleDocs() {
    return window.location.href.startsWith("https://docs.google.com/");
}

function isEditingGoogleDocs() {
    const currentWindow = getContentWindowForActiveElement();
    if (currentWindow) {
        const iframe = currentWindow.frameElement;
        if (iframe && iframe.classList.contains("docs-texteventtarget-iframe")) {
            return true;
        }
    }
    return false;
}

function isElementInIframe(element) {
    return element.ownerDocument !== window.top.document;
}

function getSelectionTopLeft(selection) { 
    if (selection.isCollapsed) {
        if (selection.rangeCount > 0) {
            // Get the collapsed range
            const range = selection.getRangeAt(0);
            
            // Create a temporary range with a small expansion to get bounding rect
            const tempRange = document.createRange();
            tempRange.setStart(range.startContainer, range.startOffset);
            // Expand by 1 character or 1 unit if possible
            if (range.startOffset < range.startContainer.textContent.length) {
                tempRange.setEnd(range.startContainer, range.startOffset + 1);
            } else {
                // If can't expand, expand to the start of the container
                tempRange.setEnd(range.startContainer, range.startOffset);
            }

            const rects = tempRange.getClientRects();
            if (rects.length > 0) {
                // Use the top-left of the first rect
                const rect = rects[0];
                return {
                    top: rect.top,
                    left: rect.left,
                    bottom: rect.bottom,
                    right: rect.right
                };
            } else {
                console.log('No bounding rectangle found.');
                return null;
            }
        } else {
            console.log('No selection range available.');
            return null;
        }
    } else {
        // Handle non-collapsed selection if needed
        console.log('Selection is not collapsed.');
        return null;
    }
}