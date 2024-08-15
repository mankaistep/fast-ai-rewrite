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

/*
    Iframe position convert
*/

// Function to get the selection position relative to an iframe
function getSelectionPositionInIframe(iframe, selection) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    if (!iframeDoc) {
        console.error('Unable to access iframe document.');
        return null;
    }

    if (!selection || selection.isCollapsed) {
        console.error('No selection or selection is collapsed.');
        return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return rect;
}

// Function to convert iframe-relative position to main window position
function convertIframePositionToMainWindow(iframe, rect) {
    const iframeRect = iframe.getBoundingClientRect();

    console.log('top 1', iframeRect.top);
    console.log('top 2', iframeRect.top + 10000);
    console.log('rect.top', rect.top);

    return {
        top: rect.top + iframeRect.top,
        left: rect.left + iframeRect.left,
        bottom: rect.bottom + iframeRect.top,
        right: rect.right + iframeRect.left
    };
}

/*
    Paste function
*/
function getContentWindowForActiveElement() {
    let activeElement = document.activeElement;
    return getContentWindowForElement(activeElement);
}

function getContentWindowForElement(element) {
    // Traverse up the DOM tree to find the closest iframe
    let currentElement = element;
    
    while (currentElement) {
        if (currentElement.tagName === 'IFRAME') {
            return currentElement.contentWindow;
        }
        currentElement = currentElement.parentElement;
    }
    
    // If no iframe is found, return the window object
    return window;
}

function pasteContent(content, element) {
    // Now you can use this function to get the appropriate contentWindow
    const contentWindow = getContentWindowForActiveElement();

    // Create a ClipboardEvent with paste data
    const pasteData = content;
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', pasteData);

    const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: clipboardData
    });

    // Target the correct element inside the appropriate contentWindow to paste the content
    let targetElement = element;
    if (!targetElement) {
        targetElement = contentWindow.document.activeElement;
    }

    // Dispatch the paste event
    targetElement.dispatchEvent(pasteEvent);
}