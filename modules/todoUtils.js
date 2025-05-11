// modules/todoUtils.js
import { format } from 'date-fns';
// Animate task update
export function animateTaskUpdate(todoElement) {
    // Add the animation class
    todoElement.classList.add('task-updated');

    // Remove the animation class after animation completes to allow reuse
    todoElement.addEventListener('animationend', () => {
        todoElement.classList.remove('task-updated');
    }, { once: true }); // Use once to automatically remove the listener after it fires
}

// Animate task deletion
export function animateTaskDeletion(todoElement, onComplete) {
    // Add the animation class
    todoElement.classList.add('task-deleted');

    // Wait for animation to complete, then execute callback
    todoElement.addEventListener('animationend', () => {
        if (typeof onComplete === 'function') {
            onComplete();
        }
    }, { once: true });
}

// Format date with date-fns
export function formatDate(dateString, formatType = 'short') {
    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date encountered in formatDate:', dateString);
            return 'Invalid Date';
        }

        // Use date-fns for formatting
        if (formatType === 'long') {
            return format(date, 'MMMM d, yyyy'); // e.g., "January 1, 2025"
        } else {
            return format(date, 'MMM d, yyyy'); // e.g., "Jan 1, 2025"
        }
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        // Fallback to native formatting
        const d = new Date(dateString);
        return d.toLocaleDateString() !== 'Invalid Date' ? d.toLocaleDateString() : 'Error Date';
    }
}

// Check if a todo is overdue
export function isOverdue(dateString) {
    try {
        const dueDate = new Date(dateString);
        if (isNaN(dueDate.getTime())) return false; // Not overdue if date is invalid

        const today = new Date();

        // Set times to midnight for accurate day comparison
        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return dueDate < today;
    } catch (error) {
        console.error('Error checking overdue status:', dateString, error);
        return false;
    }
}

// Generate a unique ID (you might not be using this from here if your TodoApp.js handles it)
export function generateId(prefix = 'item') { // Changed prefix to avoid conflict if you use 'todo' elsewhere
    return `<span class="math-inline">\{prefix\}\-</span>{Date.now()}-${Math.floor(Math.random() * 1000)}`;
}