// frontend/src/components/EmployeeList.jsx
import React from 'react';
import { Trash2, Edit, Search, User, Mail, Briefcase, Filter, CheckCircle, ChevronLeft, ChevronRight, XCircle, Users } from 'lucide-react'; 

// --- Pagination Sub-Component ---
const Pagination = ({ currentPage, totalPages, setCurrentPage, totalEmployees }) => {
    if (totalPages <= 1) return null;

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-6">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-700">
                 Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span> 
                 <span className="ml-3 hidden sm:inline">({totalEmployees} results)</span>
            </span>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

// --- EmployeeList Component ---
const EmployeeList = ({ 
    employees, 
    isLoading,
    searchTerm, 
    setSearchTerm, 
    filterCriteria, 
    onOpenFilter, 
    onClearFilters, 
    onEdit, 
    onDelete, 
    currentPage, 
    setCurrentPage,
    totalPages,
    totalEmployees
}) => {
    
    const isAdvancedFilterActive = Object.values(filterCriteria).some(val => val.trim() !== '');
    const isFilterActive = isAdvancedFilterActive || searchTerm.trim() !== '';

    // --- Helper: Safely get department name ---
    const getDepartmentName = (employee) => {
        if (!employee || !employee.department) return "N/A";
        if (typeof employee.department === "object" && "name" in employee.department) return employee.department.name || "N/A";
        if (typeof employee.department === "string") return employee.department || "N/A";
        return "N/A";
    };

    // --- Debug log ---
    console.log('Employees with Departments:', employees.map(emp => ({
        name: emp.name,
        department: getDepartmentName(emp)
    })));

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="p-8 text-center text-indigo-600">
                 <svg className="animate-spin h-8 w-8 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg font-medium">Loading employee data...</p>
            </div>
        );
    }

    const isDataEmpty = employees.length === 0 && totalEmployees === 0;

    if (isDataEmpty && !isFilterActive) {
         return (
             <div className="p-10 text-center bg-white rounded-xl shadow-lg border-2 border-dashed border-indigo-200">
                <CheckCircle className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Employees Found</h3>
                <p className="text-gray-500 mt-2">Start by adding a new employee or use the Bulk Import feature.</p>
            </div>
         );
    }
    
    if (totalEmployees === 0 && isFilterActive) {
        return (
            <div className="p-10 text-center bg-white rounded-xl shadow-lg border-2 border-dashed border-red-200">
                <Search className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Results Match Your Filter</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search term or advanced filters.</p>
                <button
                    onClick={onClearFilters}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition-colors"
                    aria-label="Clear all active filters"
                >
                    <XCircle className="w-5 h-5 mr-2" />
                    Clear All Filters
                </button>
            </div>
        );
    }

    // --- Main Content ---
    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Quick search by name, email, position, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-150 shadow-sm"
                        aria-label="Quick search employee directory"
                    />
                </div>
                
                <button
                    onClick={onOpenFilter}
                    className={`flex items-center px-4 py-3 font-semibold rounded-lg shadow-sm transition-colors duration-200 ${
                        isAdvancedFilterActive 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                    aria-label="Open advanced filters"
                >
                    <Filter className="w-5 h-5 mr-2" />
                    Filter
                </button>

                {isFilterActive && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center px-4 py-3 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition-colors shadow-sm"
                        aria-label="Clear all active filters"
                    >
                        <XCircle className="w-5 h-5" />
                        <span className="ml-2 hidden sm:inline">Clear</span>
                    </button>
                )}
            </div>
            
            {/* List/Table View */}
            {totalEmployees > 0 && (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map(employee => (
                                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                            <User className="w-5 h-5 mr-3 text-indigo-400" />
                                            {employee.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                <Users className="w-3 h-3 mr-1" />
                                                {getDepartmentName(employee)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                <Briefcase className="w-3 h-3 mr-1" />
                                                {employee.position || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email || "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="inline-flex space-x-2">
                                                <button onClick={() => onEdit(employee)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => onDelete(employee)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {employees.map(employee => (
                            <div key={employee.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-lg font-bold text-gray-900 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-indigo-500" />
                                        {employee.name}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button onClick={() => onEdit(employee)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDelete(employee)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="flex items-center text-gray-600 font-medium">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            <Users className="w-3 h-3 mr-1" />
                                            {getDepartmentName(employee)}
                                        </span>
                                    </p>
                                    <p className="flex items-center text-gray-600 font-medium">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Briefcase className="w-3 h-3 mr-1" />
                                            {employee.position || "N/A"}
                                        </span>
                                    </p>
                                    <p className="flex items-center text-gray-600 font-medium">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {employee.email || "N/A"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        setCurrentPage={setCurrentPage}
                        totalEmployees={totalEmployees}
                    />
                </>
            )}
        </div>
    );
};

export default EmployeeList;
