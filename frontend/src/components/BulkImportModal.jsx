import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
// FIX: Correctly import the bulkCreateEmployees function from the API file
import { bulkCreateEmployees } from '../api/api'; 

/**
 * Modal for bulk importing employee data via CSV file.
 * The App.jsx now passes onSuccess={refreshEmployees} to this component.
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to close the modal.
 * @param {Function} props.onSuccess - Function to call when employees are successfully imported (e.g., refresh list).
 */
const BulkImportModal = ({ onClose, onSuccess }) => {
   
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [uploadResult, setUploadResult] = useState(null);
    const [progress, setProgress] = useState(0); 

    const handleFileChange = useCallback((e) => {
        setApiError('');
        setUploadResult(null);
        setProgress(0);
        const selectedFile = e.target.files ? e.target.files[0] : null;

        if (selectedFile) {
            // Basic check for file type
            if (selectedFile.type && selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setApiError('Only CSV files are supported for bulk import.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    }, []);

    const handleUpload = async () => {
        if (!file) {
            setApiError('Please select a file to upload.');
            return;
        }

        setIsLoading(true);
        setApiError('');
        setUploadResult(null);
        setProgress(0);

        try {
            // Simulate upload progress
            const interval = setInterval(() => {
                setProgress(prev => (prev < 90 ? prev + 10 : 90));
            }, 100);

            // Use the imported bulkCreateEmployees function
            const result = await bulkCreateEmployees(file); 
            
            clearInterval(interval);
            setProgress(100); // Set to 100% on success

            setUploadResult(result);
            
            // Call the success callback provided by App.jsx to refresh the employee list
            if (result.importedCount > 0 && onSuccess) {
                // Delay refresh slightly so the user sees the progress bar complete
                setTimeout(onSuccess, 500); 
            }

        } catch (error) {
            setApiError(error.message || 'An unexpected error occurred during import.');
            setProgress(0); // Reset progress on failure
        } finally {
            setIsLoading(false);
        }
    };

    const fileInputClasses = useMemo(() => {
        const base = "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 p-6";
        if (isLoading) return `${base} border-indigo-400 bg-indigo-50 text-indigo-700`;
        if (file) return `${base} border-green-400 bg-green-50 text-green-700 hover:bg-green-100`;
        if (apiError) return `${base} border-red-400 bg-red-50 text-red-700 hover:bg-red-100`;
        return `${base} border-gray-300 bg-gray-50 text-gray-500 hover:border-indigo-400 hover:bg-indigo-50`;
    }, [file, isLoading, apiError]);

    const buttonBaseClasses = "px-6 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-md";

    return (
        <div className="p-8">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Upload className="w-6 h-6 mr-3 text-indigo-600" />
                    Bulk Employee Import (.csv)
                </h3>
            </div>

         

            <div className="my-4 text-center">
                <p className="text-gray-600 mb-2">First, download the template to ensure your data is formatted correctly:</p>
                
                {/* This is the key line for the download functionality */}
                <a 
                    href="/employee_template.csv" 
                    download 
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition"
                >
                    Download Bulk Template
                </a>
            </div>

            {/* File Dropzone/Input Area */}
            <div className="relative mb-6">
                <label htmlFor="file-upload" className={fileInputClasses}>
                    {file ? (
                        <div className="flex flex-col items-center">
                            <FileText className="w-12 h-12 mb-3" />
                            <span className="text-lg font-medium truncate w-48 text-center">{file.name}</span>
                            <span className="text-sm mt-1 text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            
                            {isLoading && (
                                <p className="text-sm mt-3 text-indigo-600 font-semibold">
                                    Uploading and Processing...
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 mb-3" />
                            <span className="text-lg font-medium">Click to select file</span>
                            <span className="text-sm mt-1 text-gray-500">or drag and drop here</span>
                        </div>
                    )}
                    <input 
                        id="file-upload"
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                    />
                </label>
            </div>

            {/* Status/Error/Progress */}
            {isLoading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}
            
            {apiError && (
                <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg mb-4 flex items-start">
                    <AlertTriangle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">{apiError}</span>
                </div>
            )}

            {/* Upload Result Summary */}
            {uploadResult && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                    <p className={`text-lg font-bold flex items-center ${uploadResult.failedCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Import Complete!
                    </p>
                    <ul className="text-sm space-y-1 text-gray-700">
                        <li><span className="font-semibold">Total Records Read:</span> {uploadResult.totalRecords}</li>
                        <li><span className="font-semibold text-green-700">Successfully Imported:</span> {uploadResult.importedCount}</li>
                        {uploadResult.failedCount > 0 && (
                            <li className="text-red-600"><span className="font-semibold">Failed Records:</span> {uploadResult.failedCount}</li>
                        )}
                    </ul>
                    
                    {uploadResult.failedCount > 0 && (
                        <div className="mt-3 p-3 bg-red-50 border-t border-red-200 rounded-lg max-h-40 overflow-y-auto">
                            <p className="text-xs font-semibold text-red-800 mb-2">Details for Failed Rows:</p>
                            {uploadResult.failedRows.map((fail, index) => (
                                <p key={index} className="text-xs text-red-700">
                                    Row {fail.row}: {fail.error}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                    onClick={onClose}
                    className={`${buttonBaseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`}
                    disabled={isLoading}
                >
                    {uploadResult ? 'Done' : 'Cancel'}
                </button>
                <button
                    onClick={handleUpload}
                    className={`${buttonBaseClasses} bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center`}
                    disabled={isLoading || !file || apiError || uploadResult}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            <Upload className="w-5 h-5 mr-2" />
                            Start Import
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default BulkImportModal;
