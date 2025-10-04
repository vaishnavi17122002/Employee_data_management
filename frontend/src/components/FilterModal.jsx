// frontend/src/FilterModal.jsx

import React, { useState, useEffect } from 'react';
import { XCircle, Filter } from 'lucide-react'; 

// Tailwind CSS class constants
const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-150 shadow-sm";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
const buttonBaseClasses = "px-6 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-md";

const FilterModal = ({ initialCriteria, onApply, onClose }) => {
  // Initialize state with the desired fields: name, email, department, position
  const [formData, setFormData] = useState({
    name: initialCriteria.name || '',
    email: initialCriteria.email || '',
    department: initialCriteria.department || '',
    position: initialCriteria.position || '',
  });

  // Check if *any* of the advanced filters are active
  const isActive = Object.values(formData).some(val => (val || '').trim() !== '');

  // Update local state when initial criteria prop changes 
  useEffect(() => {
    setFormData({
        name: initialCriteria.name || '',
        email: initialCriteria.email || '',
        department: initialCriteria.department || '',
        position: initialCriteria.position || '',
    });
  }, [initialCriteria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    // Trim values and apply
    const trimmedData = {
        name: (formData.name || '').trim(),
        email: (formData.email || '').trim(),
        department: (formData.department || '').trim(),
        position: (formData.position || '').trim(),
        // Pass back empty strings for the removed ID fields to ensure App.jsx's state is fully updated/cleared
        minId: '',
        maxId: '',
    };
    onApply(trimmedData);
  };

  const handleClear = () => {
    // Criteria to send to App.jsx to fully clear all filters, including removed minId/maxId
    const clearedCriteria = { name: '', email: '', department: '', position: '', minId: '', maxId: '' };
    // Criteria to update local form state
    setFormData({ name: '', email: '', department: '', position: '' });
    onApply(clearedCriteria);
    onClose();
  };

  return (
    <form onSubmit={handleApply} className="p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
        <Filter className="w-6 h-6 mr-3 text-indigo-500" />
        Advanced Filters
      </h3>
      <p className="text-gray-500 mb-6 text-sm">
        Filter the list by entering criteria below. All fields use 'contains' matching.
      </p>

      <div className="space-y-6">
        
        {/* Name */}
        <div>
          <label htmlFor="filter-name" className={labelClasses}>Name</label>
          <input
            id="filter-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., John Doe (contains)"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="filter-email" className={labelClasses}>Email</label>
          <input
            id="filter-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., john.doe@example.com (contains)"
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="filter-department" className={labelClasses}>Department</label>
          <input
            id="filter-department"
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., Engineering (contains)"
          />
        </div>

        {/* Position */}
        <div>
          <label htmlFor="filter-position" className={labelClasses}>Position</label>
          <input
            id="filter-position"
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., Manager (contains)"
          />
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className={`${buttonBaseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md flex-1`}
          >
            Cancel
          </button>
          {isActive && (
            <button
              type="button"
              onClick={handleClear}
              className={`${buttonBaseClasses} bg-red-100 text-red-600 hover:bg-red-200 flex-1 flex items-center justify-center`}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Clear Filters
            </button>
          )}
          <button
            type="submit"
            className={`${buttonBaseClasses} bg-indigo-600 text-white hover:bg-indigo-700 flex-1`}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </form>
  );
};

export default FilterModal;