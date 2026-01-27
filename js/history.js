// History Manager for Undo/Redo functionality

let history = {
    past: [],
    present: null,
    future: []
};

let maxHistory = Infinity; // Unlimited during session

export function executeCommand(command) {
    // Add current state to past if it exists
    if (history.present) {
        history.past.push(history.present);
    }

    // Limit history size
    if (history.past.length > maxHistory) {
        history.past.shift();
    }

    // Execute the command
    command.execute();

    // Set as present and clear future
    history.present = command;
    history.future = [];

    // Return the command for reference
    return command;
}

export function undo() {
    if (history.present) {
        // Move present to future
        history.future.push(history.present);

        // Undo the command
        try {
            history.present.undo();
        } catch (error) {
            console.error('Undo failed:', error);
            history.future.pop(); // Remove from future if undo failed
            return false;
        }

        // Get previous state from past
        history.present = history.past.pop() || null;

        return true;
    }
    return false;
}

export function redo() {
    if (history.future.length > 0) {
        // Move present to past
        if (history.present) {
            history.past.push(history.present);
        }

        // Get command from future
        const command = history.future.pop();

        // Execute the command
        command.execute();

        // Set as present
        history.present = command;

        return true;
    }
    return false;
}

export function canUndo() {
    return history.present !== null;
}

export function canRedo() {
    return history.future.length > 0;
}

export function getHistory() {
    return { ...history };
}

export function clearHistory() {
    history = {
        past: [],
        present: null,
        future: []
    };
}

export function getCurrentCommand() {
    return history.present;
}
