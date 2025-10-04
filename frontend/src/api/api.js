// frontend/src/api/api.js

// FIX: Hardcoding to 3001 to match server.js default PORT, and including /api
const API_BASE_URL = 'http://localhost:3001/api';
const EMPLOYEES_URL = `${API_BASE_URL}/employees`;
const EMPLOYEES_WITH_PHOTO_URL = `${API_BASE_URL}/employees/with-photo`;
const BULK_IMPORT_URL = `${API_BASE_URL}/employees/bulk-import`;

/**
 * Custom fetch wrapper to handle standard JSON requests (GET, PUT, DELETE without photo).
 * @param {string} url - The target URL.
 * @param {Object} options - Fetch options (method, headers, body).
 * @returns {Promise<Object|void>} - Parsed JSON data or nothing for 204.
 */
const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                // Only send 'Content-Type: application/json' for standard JSON payloads
                'Content-Type': options.method !== 'GET' ? 'application/json' : undefined,
                ...options.headers,
            },
            ...options,
        });

        if (response.status === 204) {
            return; // No content for successful deletion
        }

        const data = await response.json();

        if (!response.ok) {
            // Throw the error message from the server
            throw new Error(data.error || 'A server error occurred.');
        }

        return data; // Return the parsed JSON data

    } catch (error) {
        console.error('API Error:', error.message);
        if (error.message.includes('Failed to fetch')) {
             throw new Error('Network error: Could not connect to the API server. Is the backend running on port 3001?');
        }
        // Re-throw the error for the component to handle
        throw error;
    }
};

// --- CRUD Operations (Standard JSON) ---

/**
 * Fetch employees with optional filters.
 * @param {Object} filters - { department, position, minId, maxId }
 */
export const fetchEmployees = (filters = {}) => {
    const queryParams = new URLSearchParams();

    if (filters.department) queryParams.append('department', filters.department);
    if (filters.position) queryParams.append('position', filters.position);
    if (filters.minId) queryParams.append('minId', filters.minId);
    if (filters.maxId) queryParams.append('maxId', filters.maxId);

    const url = queryParams.toString()
        ? `${EMPLOYEES_URL}?${queryParams.toString()}`
        : EMPLOYEES_URL;

    return apiCall(url);
};

export const createEmployee = (employeeData) => apiCall(EMPLOYEES_URL, {
    method: 'POST',
    body: JSON.stringify(employeeData),
});

export const updateEmployee = (id, employeeData) => apiCall(`${EMPLOYEES_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
});

export const deleteEmployee = (id) => apiCall(`${EMPLOYEES_URL}/${id}`, {
    method: 'DELETE',
});

// --- Photo-Enabled CRUD Operations (NEW: Uses FormData) ---

/**
 * Submits employee data with a photo file.
 * @param {Object} employeeData - Employee details (name, email, position, department, photoUrl).
 * @param {File|null} photoFile - The uploaded file object.
 * @param {string} method - 'POST' for create, 'PUT' for update.
 * @param {string|number|null} id - Employee ID for update, null for create.
 */
const photoApiCall = async (employeeData, photoFile, method, id = null) => {
    const formData = new FormData();
    
    // Append the file if present
    if (photoFile) {
        // 'photo' must match the key the backend (multer) expects
        formData.append('photo', photoFile, photoFile.name); 
    }
    
    // Append all other fields (required for Joi validation on the server)
    // NOTE: The server expects these fields to be strings when using multipart/form-data
    Object.keys(employeeData).forEach(key => {
        // Convert null/undefined to empty string for FormData consistency
        formData.append(key, employeeData[key] || ''); 
    });

    let url = EMPLOYEES_WITH_PHOTO_URL;
    if (id) {
        url = `${EMPLOYEES_URL}/${id}/with-photo`; // Dedicated update endpoint
    }
    
    try {
        const response = await fetch(url, {
            method: method,
            body: formData, 
            // NOTE: Do not set Content-Type header here! 
            // The browser sets it automatically as 'multipart/form-data' with the boundary.
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Server error during photo upload/update.');
        }

        return data;

    } catch (error) {
        console.error('Photo API Error:', error.message);
        throw error;
    }
}

// Public functions for photo operations
export const createEmployeeWithPhoto = (employeeData, photoFile) => 
    photoApiCall(employeeData, photoFile, 'POST');

export const updateEmployeeWithPhoto = (id, employeeData, photoFile) => 
    photoApiCall(employeeData, photoFile, 'PUT', id);


// --- Bulk Import Operation (Uses FormData) ---
export const bulkCreateEmployees = async (file) => {
    // This function does not use apiCall because it needs to send a file using FormData
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the key the backend expects

    try {
        const response = await fetch(BULK_IMPORT_URL, {
            method: 'POST',
            body: formData, 
        });

        const data = await response.json();

        if (!response.ok) {
            // Throw API error messages for display in the UI
            throw new Error(data.error || 'Bulk import failed due to a server error.');
        }

        // Return the structured result from the server
        return data; 

    } catch (error) {
        console.error('Bulk Import API Error:', error.message);
        if (error.message.includes('Failed to fetch')) {
             throw new Error('Network error: Could not connect to the API server. Is the backend running on port 3001?');
        }
        throw error; 
    }
};
