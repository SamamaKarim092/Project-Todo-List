import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css'; // Add this line
import TodoApp from './modules/todoApp.js';
import DOMHandler from './modules/domHandler.js';
import StorageHandler from './modules/storageHandler.js';


// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing Todo App');
    
    try {
        // Initialize storage handler
        const storageHandler = new StorageHandler();
        console.log('Storage handler initialized');
        
        // Get stored data or set defaults
        const storedData = storageHandler.loadData();
        console.log('Stored data loaded:', storedData ? 'Found saved data' : 'No saved data found');
        
        // Initialize the todo app with loaded data
        const todoApp = new TodoApp(storedData);
        console.log('Todo App initialized');
        
        // Initialize DOM handler
        const domHandler = new DOMHandler(todoApp, storageHandler);
        console.log('DOM handler initialized');
        
        // Render initial UI
        domHandler.renderProjects();
        domHandler.renderTodos();
        console.log('Initial UI rendered');
        
        // Set up event listeners
        domHandler.setupEventListeners();
        console.log('Event listeners set up');
        
        // Add a debug form submit handler at the global level
        const todoForm = document.getElementById('todo-form');
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                console.log('Global form submit handler triggered');
            });
            
            const saveBtn = document.getElementById('save-todo-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    console.log('Global save button click detected');
                });
            }
        }
        
        console.log('Todo App successfully initialized and ready');
    } catch (error) {
        console.error('Error initializing Todo App:', error);
    }
});