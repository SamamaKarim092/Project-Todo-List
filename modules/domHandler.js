// modules/domHandler.js
import { animateTaskUpdate, animateTaskDeletion, formatDate, isOverdue } from './todoUtils.js';

export default class DOMHandler {
    constructor(todoApp, storageHandler) {
        this.todoApp = todoApp;
        this.storageHandler = storageHandler;
        
        // DOM elements
        this.projectList = document.getElementById('project-list');
        this.currentProjectName = document.getElementById('current-project-name');
        this.todosContainer = document.getElementById('todos-container');
        
        // Modals
        this.projectModal = document.getElementById('project-modal');
        this.todoModal = document.getElementById('todo-modal');
        this.todoDetailsModal = document.getElementById('todo-details-modal');
        
        // Forms
        this.newProjectForm = document.getElementById('new-project-form');
        this.todoForm = document.getElementById('todo-form');
        
        // Buttons
        this.newProjectBtn = document.getElementById('new-project-btn');
        this.newTodoBtn = document.getElementById('new-todo-btn');
        this.editTodoBtn = document.getElementById('edit-todo-btn');
        this.deleteTodoBtn = document.getElementById('delete-todo-btn');
        
        // Todo form inputs
        this.todoIdInput = document.getElementById('todo-id');
        this.todoTitleInput = document.getElementById('todo-title');
        this.todoDescriptionInput = document.getElementById('todo-description');
        this.todoDateInput = document.getElementById('todo-date');
        this.todoPriorityInput = document.getElementById('todo-priority');
        this.todoNotesInput = document.getElementById('todo-notes');
        
        // Current todo being edited or viewed
        this.currentTodoId = null;

        // App state
        this.updateInProgress = false; // To prevent rapid/duplicate submissions
    }
    
    // Set up all event listeners
    setupEventListeners() {
        // Project-related events
        if (this.newProjectBtn) {
            this.newProjectBtn.addEventListener('click', () => this.openProjectModal());
        }
        
        if (this.newProjectForm) {
            this.newProjectForm.addEventListener('submit', (e) => this.handleNewProject(e));
        }
        
        // Todo-related events
        if (this.newTodoBtn) {
            this.newTodoBtn.addEventListener('click', () => this.openNewTodoModal());
        }
        
        if (this.todoForm) {
            // Handles form submission via enter key or button click if button type is "submit"
            this.todoForm.addEventListener('submit', (e) => {
                console.log('Form submit event triggered');
                e.preventDefault(); // Prevent default form submission
                this.handleTodoFormSubmit(e);
            });
            
            // Optional: If you want specific logic for the save button click itself
            // const saveBtn = document.getElementById('save-todo-btn');
            // if (saveBtn) {
            //     saveBtn.addEventListener('click', (e) => {
            //         console.log('Save button explicitly clicked');
            //         // If the button is type="submit", the form's submit event will also fire.
            //         // If it's type="button", you'd call handleTodoFormSubmit here.
            //     });
            // }
        }
        
        if (this.editTodoBtn) {
            this.editTodoBtn.addEventListener('click', () => this.openEditTodoModal());
        }
        
        if (this.deleteTodoBtn) {
            this.deleteTodoBtn.addEventListener('click', () => this.deleteTodo());
        }
        
        // Close modals when clicking the X button
        document.querySelectorAll('.close-btn').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }
    
    // Project methods
    renderProjects() {
        const projects = this.todoApp.getAllProjects();
        if (!this.projectList) return;
        
        this.projectList.innerHTML = '';
        
        if (projects.length === 0) {
            this.projectList.innerHTML = '<div class="no-projects">No projects available</div>';
            return;
        }
        
        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'project-item';
            li.dataset.projectId = project.id;
            
            if (project.id === this.todoApp.currentProjectId) {
                li.classList.add('active');
            }
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = project.name;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon project-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            
            if (project.id === 'default') {
                deleteBtn.style.display = 'none';
            }
            
            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.project-delete')) {
                    this.selectProject(project.id);
                }
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteProject(project.id);
            });
            
            this.projectList.appendChild(li);
        });
    }
    
    selectProject(projectId) {
        this.todoApp.setCurrentProject(projectId);
        this.updateCurrentProjectName();
        this.renderProjects(); // Re-render projects to update active state
        this.renderTodos();
        this.saveData();
    }
    
    updateCurrentProjectName() {
        if (!this.currentProjectName) return;
        const currentProject = this.todoApp.getCurrentProject();
        if (currentProject) {
            this.currentProjectName.textContent = currentProject.name;
        } else {
            this.currentProjectName.textContent = "Project not found"; // Fallback
        }
    }
    
    openProjectModal() {
        if (!this.projectModal) return;
        this.projectModal.style.display = 'block';
        const projectNameInput = document.getElementById('project-name');
        if (projectNameInput) {
            projectNameInput.focus();
        }
    }
    
    handleNewProject(e) {
        e.preventDefault();
        const projectNameInput = document.getElementById('project-name');
        if (!projectNameInput) return;
        
        const projectName = projectNameInput.value.trim();
        
        if (projectName) {
            this.todoApp.createProject(projectName);
            this.renderProjects();
            this.saveData();
            this.closeAllModals();
            projectNameInput.value = '';
        }
    }
    
    deleteProject(projectId) {
        if (projectId === 'default') {
            alert("The default project cannot be deleted.");
            return;
        }
        if (confirm('Are you sure you want to delete this project? All todos in this project will be lost.')) {
            this.todoApp.deleteProject(projectId);
            this.renderProjects();
            this.updateCurrentProjectName(); // Ensure current project name is updated if it was the one deleted
            this.renderTodos(); // Render todos of the new current project
            this.saveData();
        }
    }
    
    // Todo methods
    renderTodos() {
        if (!this.todosContainer) return;
        const todos = this.todoApp.getAllTodos();
        this.todosContainer.innerHTML = '';
        
        if (!todos || todos.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todosContainer.appendChild(todoElement);
        });
    }
    
    renderEmptyState() {
        if (!this.todosContainer) return;
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-tasks"></i>
            <h3>No tasks yet</h3>
            <p>Click "Add Task" to create a new task</p>
        `;
        this.todosContainer.appendChild(emptyState);
    }
    
    createTodoElement(todo) {
        const todoEl = document.createElement('div');
        todoEl.className = 'todo-item';
        todoEl.classList.add(`priority-${todo.priority}`);
        todoEl.dataset.todoId = todo.id;
        
        if (todo.completed) {
            todoEl.classList.add('todo-completed');
        }
        
        const formattedDate = formatDate(todo.dueDate, 'short'); // Using utility
        const todoOverdue = isOverdue(todo.dueDate) && !todo.completed; // Using utility
        
        todoEl.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-info">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-date ${todoOverdue ? 'overdue' : ''}">${formattedDate}</div>
                </div>
            </div>
            <div class="todo-right">
                <span class="todo-priority priority-${todo.priority}">${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>
            </div>
        `;
        
        todoEl.querySelector('.todo-checkbox').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTodoCompletion(todo.id);
        });
        
        todoEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('todo-checkbox')) {
                this.openTodoDetails(todo.id);
            }
        });
        
        return todoEl;
    }
    
    openNewTodoModal() {
        if (!this.todoModal) return;
        
        const modalTitle = document.getElementById('todo-modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Create New Task';
        }
        
        if (this.todoForm) this.todoForm.reset();
        if (this.todoIdInput) this.todoIdInput.value = '';
        
        if (this.todoDateInput) {
            const today = new Date();
            const formattedToday = today.toISOString().split('T')[0];
            this.todoDateInput.value = formattedToday;
        }
        
        this.todoModal.style.display = 'block';
        if (this.todoTitleInput) this.todoTitleInput.focus();
    }
    
    openEditTodoModal() {
        if (!this.todoDetailsModal || !this.todoModal) return;
        this.todoDetailsModal.style.display = 'none';
        
        const todo = this.todoApp.getTodo(this.currentTodoId);
        if (todo) {
            const modalTitle = document.getElementById('todo-modal-title');
            if (modalTitle) modalTitle.textContent = 'Edit Task';
            
            if (this.todoIdInput) this.todoIdInput.value = todo.id;
            if (this.todoTitleInput) this.todoTitleInput.value = todo.title;
            if (this.todoDescriptionInput) this.todoDescriptionInput.value = todo.description || '';
            if (this.todoDateInput) this.todoDateInput.value = todo.dueDate;
            if (this.todoPriorityInput) this.todoPriorityInput.value = todo.priority;
            if (this.todoNotesInput) this.todoNotesInput.value = todo.notes || '';
            
            this.todoModal.style.display = 'block';
            if (this.todoTitleInput) this.todoTitleInput.focus();
        }
    }
    
    handleTodoFormSubmit(e) {
        // e.preventDefault() is called by the event listener in setupEventListeners
        
        if (this.updateInProgress) {
            console.log('Form submission ignored, update already in progress.');
            return;
        }
        this.updateInProgress = true;
        console.log('Handling todo form submission...');

        try {
            const title = this.todoTitleInput ? this.todoTitleInput.value.trim() : '';
            const description = this.todoDescriptionInput ? this.todoDescriptionInput.value.trim() : '';
            const dueDate = this.todoDateInput ? this.todoDateInput.value : '';
            const priority = this.todoPriorityInput ? this.todoPriorityInput.value : 'medium';
            const notes = this.todoNotesInput ? this.todoNotesInput.value.trim() : '';
            const id = this.todoIdInput ? this.todoIdInput.value : '';

            if (!title || !dueDate) {
                alert('Please fill in at least the title and due date.');
                this.updateInProgress = false;
                return;
            }

            let todoElementToAnimate;

            if (id) { // Update existing todo
                const updates = { title, description, dueDate, priority, notes };
                const updatedTodo = this.todoApp.updateTodo(id, updates);
                if (!updatedTodo) throw new Error('Failed to update todo - todo not found');

                const oldTodoElement = this.todosContainer.querySelector(`[data-todo-id="${id}"]`);
                if (oldTodoElement) {
                    const newTodoElement = this.createTodoElement(updatedTodo); // Create new element with updated data
                    oldTodoElement.parentNode.replaceChild(newTodoElement, oldTodoElement);
                    todoElementToAnimate = newTodoElement;
                } else {
                    this.renderTodos(); // Fallback if element not found
                }
            } else { // Create new todo
                const newTodo = this.todoApp.createTodo(title, description, dueDate, priority, notes);
                if (!newTodo) throw new Error('Failed to create new todo');

                if (this.todosContainer.querySelector('.empty-state')) {
                    this.todosContainer.innerHTML = ''; // Clear empty state
                }
                todoElementToAnimate = this.createTodoElement(newTodo);
                this.todosContainer.appendChild(todoElementToAnimate);
            }

            if (todoElementToAnimate) {
                animateTaskUpdate(todoElementToAnimate);
            }
            
            this.saveData();
            this.closeAllModals();
        } catch (error) {
            console.error('Error handling todo form:', error);
            alert('There was an error saving your task. Please try again.');
        } finally {
            this.updateInProgress = false;
        }
    }
    
    openTodoDetails(todoId) {
        if (!this.todoDetailsModal) return;
        const todo = this.todoApp.getTodo(todoId);
        if (todo) {
            this.currentTodoId = todoId;
            const formattedDate = formatDate(todo.dueDate, 'long'); // Using utility
            
            const detailsContent = document.getElementById('todo-details-content');
            if (detailsContent) {
                detailsContent.innerHTML = `
                    <div class="todo-details-header">
                        <h2 class="todo-details-title">${todo.title}</h2>
                        <div class="todo-details-date">Due: ${formattedDate}</div>
                        <div class="todo-priority priority-${todo.priority}">${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</div>
                    </div>
                    ${todo.description ? `<div class="todo-details-section"><h3>Description</h3><p>${todo.description}</p></div>` : ''}
                    ${todo.notes ? `<div class="todo-details-section"><h3>Notes</h3><p>${todo.notes}</p></div>` : ''}
                    <div class="todo-details-section"><h3>Status</h3><p>${todo.completed ? 'Completed' : 'Pending'}</p></div>
                `;
            }
            this.todoDetailsModal.style.display = 'block';
        }
    }
    
    toggleTodoCompletion(todoId) {
        const updatedTodo = this.todoApp.toggleTodoCompletion(todoId);
        
        if (updatedTodo && this.todosContainer) {
            const todoElement = this.todosContainer.querySelector(`[data-todo-id="${todoId}"]`);
            
            if (todoElement) {
                // Create a new element based on the updated todo data
                const newTodoElement = this.createTodoElement(updatedTodo);
                // Replace the old element with the new one
                todoElement.parentNode.replaceChild(newTodoElement, todoElement);
                // Animate the new (updated) element
                animateTaskUpdate(newTodoElement);
            } else {
                // Fallback: if the specific element isn't found, re-render all todos
                this.renderTodos();
            }
            this.saveData();
        }
    }
    
    deleteTodo() {
        if (!this.currentTodoId) return;
        
        if (confirm('Are you sure you want to delete this task?')) {
            const todoElement = this.todosContainer.querySelector(`[data-todo-id="${this.currentTodoId}"]`);
            const todoIdToDelete = this.currentTodoId; // Store because currentTodoId will be reset
            
            if (todoElement) {
                animateTaskDeletion(todoElement, () => {
                    this.todoApp.deleteTodo(todoIdToDelete);
                    todoElement.remove(); // Remove from DOM after animation
                    this.saveData();
                    this.closeAllModals(); // Close details modal if open
                    // If the list becomes empty, render the empty state
                    if (this.todoApp.getAllTodos().length === 0 && this.todosContainer) {
                        this.renderEmptyState();
                    }
                    this.currentTodoId = null; 
                });
            } else {
                // Fallback if element somehow not found in DOM (e.g., out of sync)
                this.todoApp.deleteTodo(todoIdToDelete);
                this.renderTodos(); // Re-render to ensure consistency
                this.saveData();
                this.closeAllModals();
                this.currentTodoId = null;
            }
        }
    }
    
    closeAllModals() {
        if (this.projectModal) this.projectModal.style.display = 'none';
        if (this.todoModal) this.todoModal.style.display = 'none';
        if (this.todoDetailsModal) this.todoDetailsModal.style.display = 'none';
    }
    
    saveData() {
        try {
            console.log('Saving app data...');
            const appData = this.todoApp.getAppData();
            this.storageHandler.saveData(appData);
        } catch (error) {
            console.error('Error in DOMHandler saveData method:', error);
        }
    }
}