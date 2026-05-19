// iOS-style swipe gesture for mobile action bar

let touchStartY = 0;
let touchStartTime = 0;
let actionBarElement = null;

// Panel swipe state
let panelSwipeStartX = 0;
let panelSwipeStartTime = 0;
let panelWrapper = null;
let panelSwitchFn = null;

export function initSwipeGesture() {
    actionBarElement = document.getElementById('selection-action-bar');

    if (!actionBarElement) return;

    actionBarElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    actionBarElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    actionBarElement.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
}

function handleTouchMove(e) {
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;

    // Provide visual feedback during swipe
    if (deltaY > 0 && deltaY < 100) {
        actionBarElement.style.transform = `translateY(${Math.min(deltaY, 100)}px)`;
    }
}

function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartY;
    const deltaTime = Date.now() - touchStartTime;

    // Swipe down gesture: moved more than 50px in less than 300ms
    if (deltaY > 50 && deltaTime < 300) {
        const { clearSelection } = import('./selection.js');
        clearSelection();
    }

    // Reset transform
    actionBarElement.style.transform = '';
}

export function destroySwipeGesture() {
    if (actionBarElement) {
        actionBarElement.removeEventListener('touchstart', handleTouchStart);
        actionBarElement.removeEventListener('touchmove', handleTouchMove);
        actionBarElement.removeEventListener('touchend', handleTouchEnd);
    }
}

// Horizontal swipe for panel switching
export function initPanelSwipe(switchTabFn) {
    panelWrapper = document.getElementById('editor-preview-wrapper');
    if (!panelWrapper) return;

    panelSwitchFn = switchTabFn;

    panelWrapper.addEventListener('touchstart', (e) => {
        panelSwipeStartX = e.touches[0].clientX;
        panelSwipeStartTime = Date.now();
    }, { passive: true });

    panelWrapper.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - panelSwipeStartX;
        const deltaTime = Date.now() - panelSwipeStartTime;

        // Swipe left/right: moved more than 80px in less than 400ms
        if (Math.abs(deltaX) > 80 && deltaTime < 400) {
            if (deltaX < 0) {
                panelSwitchFn('preview');
            } else {
                panelSwitchFn('editor');
            }
        }
    }, { passive: true });
}
