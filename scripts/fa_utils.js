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
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    // Check for id
    if (element.id) {
        // Escape special characters in the ID
        return `#${CSS.escape(element.id)}`;
    }

    // Function to create attribute selector
    const attrSelector = (attr) => `[${attr.name}="${attr.value.replace(/"/g, '\\"')}"]`;

    // Check for unique attribute
    for (let attr of element.attributes) {
        if (attr.name !== 'class') {
            const selector = element.tagName.toLowerCase() + attrSelector(attr);
            if (document.querySelectorAll(selector).length === 1) {
                return selector;
            }
        }
    }

    // Generate a path
    let path = [];
    let currentElement = element;
    while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
        let selector = currentElement.tagName.toLowerCase();

        // Add classes (limit to 2)
        if (currentElement.className) {
            const classes = currentElement.className.trim().split(/\s+/).slice(0, 2);
            if (classes.length > 0) {
                selector += '.' + classes.join('.');
            }
        }

        // Add attribute selectors (limit to 2, exclude class)
        let attrSelectors = Array.from(currentElement.attributes)
            .filter(attr => attr.name !== 'class')
            .map(attrSelector)
            .slice(0, 2);
        selector += attrSelectors.join('');

        // Add nth-child only if necessary
        let parent = currentElement.parentNode;
        if (parent) {
            let siblings = Array.from(parent.children);
            let similars = siblings.filter(sibling => 
                sibling.tagName === currentElement.tagName && 
                sibling.className === currentElement.className
            );
            if (similars.length > 1) {
                let index = siblings.indexOf(currentElement) + 1;
                selector += `:nth-child(${index})`;
            }
        }

        path.unshift(selector);
        currentElement = parent;

        // Check if the current path is unique
        if (document.querySelectorAll(path.join(' > ')).length === 1) {
            break;
        }

        // Limit path length to prevent overly long selectors
        if (path.length >= 4) break;
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
    if (selection.rangeCount > 0) {
        // Get the range (collapsed or not)
        const range = selection.getRangeAt(0);
        let rect;

        if (selection.isCollapsed) {
            // Create a temporary range with a small expansion to get bounding rect
            const tempRange = document.createRange();
            tempRange.setStart(range.startContainer, range.startOffset);

            if (range.startOffset < range.startContainer.textContent.length) {
                tempRange.setEnd(range.startContainer, range.startOffset + 1);
            } else {
                tempRange.setEnd(range.startContainer, range.startOffset);
            }

            rect = tempRange.getClientRects()[0];
        } else {
            // For non-collapsed selection, use the first bounding rect directly
            rect = range.getClientRects()[0];
        }

        if (rect) {
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
}

function dispatchChangeEvent(element) {
    const event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(event);
}

function isPopoverLive() {
    const popover = document.querySelector('.popover');
    if (popover) {
        return true;
    } else return false;
}

function makePopoverDraggable(popover) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    popover.addEventListener('mousedown', function(event) {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        initialX = popover.offsetLeft;
        initialY = popover.offsetTop;
        popover.style.userSelect = 'none'; // Prevent text selection while dragging
    });

    document.addEventListener('mousemove', function(event) {
        if (isDragging) {
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            popover.style.left = `${initialX + dx}px`;
            popover.style.top = `${initialY + dy}px`;
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        popover.style.userSelect = ''; // Re-enable text selection after dragging
    });
}

function isFirstRewrite() {
    return lastSuggestedText == null;
}