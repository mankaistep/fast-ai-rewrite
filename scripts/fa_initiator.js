const BUTTON_SELECTOR = '.selection-button';

const REWRITE_BUTTON_SELECTOR = '.popover-submit-button';

const OPENAI_API_KEY = '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';
const OPENAI_ORGANIZATION_ID = 'org-G3tztz3w8bknXwb2FeSN8sa1';
const OPENAI_PROJECT_ID = 'proj_I7L3HWWUVlrcgV6R0IUevhlI';

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

    return {
        top: rect.top + iframeRect.top,
        left: rect.left + iframeRect.left,
        bottom: rect.bottom + iframeRect.top,
        right: rect.right + iframeRect.left
    };
}

function getIframeContainingElement(element) {
    while (element) {
        if (element.tagName === 'IFRAME') {
            return element;
        }
        element = element.parentElement;
    }
    return null; // Return null if no iframe is found
}

/*
    Google Docs
*/
function getSelectionOffsetInGoogleDocs(selection) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const firstCanvas = document.querySelector('.canvas-first-page');

    const canvasTop = firstCanvas.getBoundingClientRect().top;
    const canvasLeft = firstCanvas.getBoundingClientRect().left;

    const top = rect.top + canvasTop + 97 + window.scrollY;
    const left = rect.left + canvasLeft + 97 + window.scrollX;
    const bottom = rect.bottom + canvasTop + 97 + window.scrollY;
  
    return { top, left, bottom };
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