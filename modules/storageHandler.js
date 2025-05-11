// StorageHandler.js - Properly implemented storage functions

export default class StorageHandler {
    constructor(storageKey = 'todoAppData') {
        this.storageKey = storageKey;
    }
    
    saveData(data) {
        try {
            // Make sure data can be properly serialized
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.storageKey, serialized);
            console.log('Data successfully saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    }
    
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) {
                console.log('No saved data found in localStorage');
                return null;
            }
            
            const parsedData = JSON.parse(data);
            console.log('Data successfully loaded from localStorage');
            return parsedData;
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            return null;
        }
    }
    
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Data successfully cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing data from localStorage:', error);
            return false;
        }
    }
}