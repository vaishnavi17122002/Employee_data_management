// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import FilterModal from './components/FilterModal'; // ✅ make sure file is inside /components
import BulkImportModal from './components/BulkImportModal';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createEmployeeWithPhoto,
  updateEmployeeWithPhoto,
} from './api/api';

// Generic Modal wrapper
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full bg-white transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Modals & forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  // UPDATED FILTER CRITERIA
  const [filterCriteria, setFilterCriteria] = useState({
    name: '',       // NEW FIELD
    email: '',      // NEW FIELD
    department: '',
    position: '',
    minId: '',      // Retained but expected to be empty string from FilterModal
    maxId: '',      // Retained but expected to be empty string from FilterModal
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 9;

  // Safe filtering
  const filteredEmployees = employees.filter((employee) => {
    // 1. Prepare common employee fields
    const name = (employee?.name || '').toLowerCase();
    const email = (employee?.email || '').toLowerCase();
    const employeePosition = (employee?.position || '').toLowerCase();
    const employeeDepartment = (employee?.department || '').toLowerCase();
    const id = employee?.id || 0;

    // 2. Global Search Term Filter (Trimming)
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      name.includes(term) ||
      email.includes(term) ||
      employeePosition.includes(term) ||
      employeeDepartment.includes(term);

    // 3. Name Filter (From FilterModal)
    const nameCriteria = (filterCriteria.name || '').toLowerCase().trim();
    const matchesName =
      !nameCriteria ||
      name.includes(nameCriteria);
    
    // 4. Email Filter (From FilterModal)
    const emailCriteria = (filterCriteria.email || '').toLowerCase().trim();
    const matchesEmail =
      !emailCriteria ||
      email.includes(emailCriteria);
      
    // 5. Department Filter (From FilterModal)
    const deptCriteria = (filterCriteria.department || '').toLowerCase().trim();
    const matchesDepartment =
      !deptCriteria ||
      employeeDepartment.includes(deptCriteria);

    // 6. Position Filter (From FilterModal)
    const posCriteria = (filterCriteria.position || '').toLowerCase().trim();
    const matchesPosition =
      !posCriteria ||
      employeePosition.includes(posCriteria);

    // 7. Min/Max ID Filter (Robust Parsing)
    // This logic ensures that even if minId/maxId are present in state (as '' now), they don't block
    const minIdString = (filterCriteria.minId || '').trim();
    const maxIdString = (filterCriteria.maxId || '').trim();

    // Parse to number. Will be NaN if input is empty ('') or non-numeric.
    const minId = minIdString === '' ? NaN : parseInt(minIdString, 10);
    const maxId = maxIdString === '' ? NaN : parseInt(maxIdString, 10);
    
    // Check if the parsed number is valid (not NaN)
    const isMinIdValid = !isNaN(minId);
    const isMaxIdValid = !isNaN(maxId);

    // If the filter is valid, apply the range check. Otherwise, it passes.
    const matchesMinId = !isMinIdValid || id >= minId;
    const matchesMaxId = !isMaxIdValid || id <= maxId;

    return (
      matchesSearch &&
      matchesName &&       // NEW FILTER
      matchesEmail &&      // NEW FILTER
      matchesDepartment &&
      matchesPosition &&
      matchesMinId &&
      matchesMaxId
    );
  });

  const totalEmployees = filteredEmployees.length;
  const totalPages = Math.ceil(totalEmployees / employeesPerPage);

  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * employeesPerPage,
    currentPage * employeesPerPage
  );

  // Modal controls
  const openForm = (employee = null) => {
    setEmployeeToEdit(employee);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setEmployeeToEdit(null);
  };
  const openConfirmDelete = (employee) => {
    setEmployeeToDelete(employee);
    setIsConfirmDeleteOpen(true);
  };
  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
    setEmployeeToDelete(null);
  };
  const closeBulkImport = () => {
    setIsBulkImportOpen(false);
  };

  // Fetch data
  const fetchAllEmployees = useCallback(async () => {
    setIsLoading(true);
    setGlobalError('');
    try {
      // NOTE: This call fetches ALL employees. Filtering is client-side in filteredEmployees.
      const data = await fetchEmployees(); 
      setEmployees(data);
    } catch (error) {
      setGlobalError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Only runs on mount

  useEffect(() => {
    fetchAllEmployees();
  }, [fetchAllEmployees]);

  // CRUD handlers
  const handleFormSubmit = async (employeeData, photoFile) => {
    setGlobalError('');
    try {
      let resultEmployee;
      if (photoFile) {
        const fn = employeeToEdit
          ? updateEmployeeWithPhoto
          : createEmployeeWithPhoto;
        resultEmployee = employeeToEdit
          ? await fn(employeeToEdit.id, employeeData, photoFile)
          : await fn(employeeData, photoFile);
      } else if (employeeToEdit) {
        resultEmployee = await updateEmployee(employeeToEdit.id, employeeData);
      } else {
        resultEmployee = await createEmployee(employeeData);
      }

      if (employeeToEdit) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === resultEmployee.id ? resultEmployee : emp
          )
        );
      } else {
        setEmployees((prev) => [resultEmployee, ...prev]);
      }

      closeForm();
    } catch (error) {
      setGlobalError(`Error saving employee: ${error.message}`); // ✅ better error handling
    }
  };

  const handleConfirmedDelete = async () => {
    if (!employeeToDelete) return;
    setGlobalError('');
    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployees((prev) =>
        prev.filter((emp) => emp.id !== employeeToDelete.id)
      );
      closeConfirmDelete();
    } catch (error) {
      setGlobalError(`Error deleting employee: ${error.message}`);
    }
  };

  // UPDATED FILTER CLEAR HANDLER
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCriteria({
      name: '',       // NEW FIELD CLEARED
      email: '',      // NEW FIELD CLEARED
      department: '',
      position: '',
      minId: '',
      maxId: '',
    });
    setCurrentPage(1); // ✅ reset pagination
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
         <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Employee Data Management
        </h1>
        <p className="text-gray-600 mt-2">
            Manage your employees efficiently.
        </p>
        </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Import
            </button>
            <button
              onClick={() => openForm()}
              className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {globalError && (
          <div
            className="p-4 mb-4 text-sm font-medium text-red-800 rounded-lg bg-red-50 border border-red-200"
            role="alert"
          >
            {globalError}
          </div>
        )}

        <EmployeeList
          employees={currentEmployees}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCriteria={filterCriteria}
          onOpenFilter={() => setIsFilterOpen(true)}
          onClearFilters={handleClearFilters}
          onEdit={openForm}
          onDelete={openConfirmDelete}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalEmployees={totalEmployees}
        />
      </main>

      {/* Form modal */}
      <Modal isOpen={isFormOpen} onClose={closeForm}>
        <div className="p-8 bg-white rounded-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {employeeToEdit ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <EmployeeForm
            employeeToEdit={employeeToEdit}
            onSubmit={handleFormSubmit}
            onClose={closeForm}
          />
        </div>
      </Modal>

      {/* Filter modal */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterModal
          initialCriteria={filterCriteria}
          onApply={(newCriteria) => {
            setFilterCriteria(newCriteria);
            setCurrentPage(1); // ✅ reset pagination when applying filters
            setIsFilterOpen(false);
          }}
          onClose={() => setIsFilterOpen(false)}
        />
      </Modal>

      {/* Bulk import modal */}
      <Modal isOpen={isBulkImportOpen} onClose={closeBulkImport}>
        <BulkImportModal onClose={closeBulkImport} onSuccess={fetchAllEmployees} />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={isConfirmDeleteOpen} onClose={closeConfirmDelete}>
        {employeeToDelete && (
          <div className="p-8 bg-white rounded-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete employee{' '}
              <span className="font-semibold text-red-600">
                "{employeeToDelete.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDelete}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;