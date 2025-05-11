// Factory function for Todo items
export const TodoFactory = (id, title, description, dueDate, priority, notes = '', completed = false) => {
    return {
        id,
        title,
        description,
        dueDate,
        priority,
        notes,
        completed
    };
};

// Factory function for Project items
export const ProjectFactory = (id, name, todos = []) => {
    return {
        id,
        name,
        todos
    };
};

// Main Todo App logic
export default class TodoApp {
    constructor(storedData = null) {
        if (storedData) {
            this.projects = storedData.projects;
            this.currentProjectId = storedData.currentProjectId;
        } else {
            // Initialize with a default project
            const defaultProject = ProjectFactory('default', 'Default Project');
            this.projects = [defaultProject];
            this.currentProjectId = 'default';
        }
    }

    // Project methods
    createProject(name) {
        const id = 'project-' + Date.now();
        const newProject = ProjectFactory(id, name);
        this.projects.push(newProject);
        return newProject;
    }

    getProject(projectId) {
        return this.projects.find(project => project.id === projectId);
    }

    getAllProjects() {
        return this.projects;
    }

    deleteProject(projectId) {
        // Don't delete the default project
        if (projectId === 'default') {
            return false;
        }
        
        const index = this.projects.findIndex(project => project.id === projectId);
        if (index !== -1) {
            this.projects.splice(index, 1);
            
            // If the current project is being deleted, switch to default
            if (this.currentProjectId === projectId) {
                this.currentProjectId = 'default';
            }
            return true;
        }
        return false;
    }

    setCurrentProject(projectId) {
        this.currentProjectId = projectId;
    }

    getCurrentProject() {
        return this.getProject(this.currentProjectId);
    }

    // Todo methods
    createTodo(title, description, dueDate, priority, notes) {
        const id = 'todo-' + Date.now();
        const newTodo = TodoFactory(id, title, description, dueDate, priority, notes);
        
        const currentProject = this.getCurrentProject();
        currentProject.todos.push(newTodo);
        
        return newTodo;
    }

    getTodo(todoId) {
        const currentProject = this.getCurrentProject();
        return currentProject.todos.find(todo => todo.id === todoId);
    }

    getAllTodos() {
        const currentProject = this.getCurrentProject();
        return currentProject.todos;
    }

    updateTodo(todoId, updates) {
        const todo = this.getTodo(todoId);
        if (todo) {
            Object.assign(todo, updates);
            return todo;
        }
        return null;
    }

    deleteTodo(todoId) {
        const currentProject = this.getCurrentProject();
        const index = currentProject.todos.findIndex(todo => todo.id === todoId);
        
        if (index !== -1) {
            currentProject.todos.splice(index, 1);
            return true;
        }
        return false;
    }

    toggleTodoCompletion(todoId) {
        const todo = this.getTodo(todoId);
        if (todo) {
            todo.completed = !todo.completed;
            return todo;
        }
        return null;
    }

    // Get app data for storage
    getAppData() {
        return {
            projects: this.projects,
            currentProjectId: this.currentProjectId
        };
    }
}