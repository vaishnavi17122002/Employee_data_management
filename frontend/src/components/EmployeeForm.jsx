// frontend/src/components/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import Joi from 'joi'; // Client-side validation for better UX

// Joi schema for client-side validation, matching the backend schema
const employeeSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Name is required.',
        'string.min': 'Name must be at least 2 characters.',
    }),
    email: Joi.string().trim().email({ tlds: { allow: false } }).max(100).required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Email address is invalid.',
    }),
    position: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Position is required.',
        'string.min': 'Position must be at least 2 characters.',
    }),
    department: Joi.string().trim().min(2).max(100).required().messages({ // NEW FIELD
        'string.empty': 'Department is required.',
        'string.min': 'Department must be at least 2 characters.',
    }),
});

// Tailwind CSS class constants
const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-150 shadow-sm";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
const errorClasses = "mt-2 text-sm text-red-600";
const buttonBaseClasses = "px-6 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-md";

/**
 * Reusable form component for adding and editing employees.
 */
const EmployeeForm = ({ employeeToEdit, onSubmit, onClose }) => {
    const isEditMode = !!employeeToEdit;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        position: '',
        department: '', // NEW FIELD
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Populate form data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: employeeToEdit.name || '',
                email: employeeToEdit.email || '',
                position: employeeToEdit.position || '',
                department: employeeToEdit.department || '', // Set new field
            });
        } else {
            setFormData({ name: '', email: '', position: '', department: '' }); // Reset for add
        }
        setErrors({});
        setApiError('');
    }, [employeeToEdit, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the field being edited
        if (errors[name] || apiError) {
            setErrors(prev => ({ ...prev, [name]: '' }));
            setApiError('');
        }
    };
    
    const validate = () => {
        const { error } = employeeSchema.validate(formData, { abortEarly: false });
        if (!error) {
            setErrors({});
            return true;
        }

        const newErrors = {};
        error.details.forEach(detail => {
            newErrors[detail.context.key] = detail.message.replace(/"(name|email|position|department)"/, '');
        });

        setErrors(newErrors);
        return false;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        
        if (!validate()) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData); 
        } catch (error) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* API Error Message */}
            {apiError && (
                <div className="p-3 text-sm font-medium text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
                    <span className="font-bold">API Error:</span> {apiError}
                </div>
            )}

            {/* Name Field */}
            <div>
                <label htmlFor="name" className={labelClasses}>Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g., Jane Doe"
                    disabled={isLoading}
                />
                {errors.name && <p className={errorClasses}>{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g., jane.doe@company.com"
                    disabled={isLoading}
                />
                {errors.email && <p className={errorClasses}>{errors.email}</p>}
            </div>
            
             {/* Department Field (NEW) */}
            <div>
                <label htmlFor="department" className={labelClasses}>Department</label>
                <input
                    id="department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g., Engineering, Sales"
                    disabled={isLoading}
                />
                {errors.department && <p className={errorClasses}>{errors.department}</p>}
            </div>

            {/* Position Field */}
            <div>
                <label htmlFor="position" className={labelClasses}>Position</label>
                <input
                    id="position"
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g., Senior Developer"
                    disabled={isLoading}
                />
                {errors.position && <p className={errorClasses}>{errors.position}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row-reverse gap-3 pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    className={`${buttonBaseClasses} bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        isEditMode ? 'Save Changes' : 'Add Employee'
                    )}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className={`${buttonBaseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md`}
                    disabled={isLoading}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;
