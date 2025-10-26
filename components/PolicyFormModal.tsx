
import React, { useState, useEffect } from 'react';
import { InsurancePolicy, PolicyType, PremiumFrequency, PolicyStatus } from '../types';
import { analyzeContractDocument } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';

interface PolicyFormModalProps {
    policy: InsurancePolicy | null;
    onClose: () => void;
    onSave: (policy: Omit<InsurancePolicy, 'id'> & { id?: string }) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const PolicyFormModal: React.FC<PolicyFormModalProps> = ({ policy, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        provider: '',
        policyNumber: '',
        type: PolicyType.Auto,
        premium: '',
        premiumFrequency: PremiumFrequency.Monthly,
        startDate: '',
        endDate: '',
        status: PolicyStatus.Active,
        contractFileName: '',
        licensePlate: '',
        address: '',
        insuredPersonName: '',
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisMessage, setAnalysisMessage] = useState('');

    useEffect(() => {
        if (policy) {
            setFormData({
                provider: policy.provider,
                policyNumber: policy.policyNumber,
                type: policy.type,
                premium: String(policy.premium),
                premiumFrequency: policy.premiumFrequency,
                startDate: policy.startDate,
                endDate: policy.endDate,
                status: policy.status,
                contractFileName: policy.contractFileName || '',
                licensePlate: policy.licensePlate || '',
                address: policy.address || '',
                insuredPersonName: policy.insuredPersonName || '',
            });
        }
    }, [policy]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, contractFileName: file.name }));
            setAnalysisMessage('');
        }
    };
    
    const handleAnalyzeContract = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setAnalysisMessage('Analyzing document...');
        try {
            const base64Data = await fileToBase64(selectedFile);
            const mimeType = selectedFile.type;
            const extractedData = await analyzeContractDocument(base64Data, mimeType);

            setFormData(prev => ({
                ...prev,
                provider: extractedData.provider || prev.provider,
                policyNumber: extractedData.policyNumber || prev.policyNumber,
                type: extractedData.policyType || prev.type,
                premium: extractedData.premium?.toString() || prev.premium,
                premiumFrequency: extractedData.premiumFrequency || prev.premiumFrequency,
                startDate: extractedData.startDate || prev.startDate,
                endDate: extractedData.endDate || prev.endDate,
                licensePlate: extractedData.licensePlate || prev.licensePlate,
                address: extractedData.address || prev.address,
                insuredPersonName: extractedData.insuredPersonName || prev.insuredPersonName,
            }));
            
            const foundFields = Object.keys(extractedData).filter(key => extractedData[key as keyof typeof extractedData]);
            if (foundFields.length === 0) {
                 setAnalysisMessage('Could not extract details. Please fill the form manually.');
            } else {
                 setAnalysisMessage(`Analysis complete. Please review the auto-filled fields for accuracy.`);
            }

        } catch (error) {
            console.error("Error analyzing contract:", error);
            setAnalysisMessage(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let contractDetails: { contractData?: string; contractFileName?: string; contractMimeType?: string } = {
            contractData: policy?.contractData,
            contractFileName: policy?.contractFileName,
            contractMimeType: policy?.contractMimeType,
        };

        if (selectedFile) {
            contractDetails.contractData = await fileToBase64(selectedFile);
            contractDetails.contractFileName = selectedFile.name;
            contractDetails.contractMimeType = selectedFile.type;
        }

        const policyData = {
            ...formData,
            premium: parseFloat(formData.premium) || 0,
            ...contractDetails,
        };
        onSave({ ...policyData, id: policy?.id });
    };

    const renderPolicySpecificFields = () => {
        switch (formData.type) {
            case PolicyType.Auto:
                return (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">License Plate</label>
                        <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                );
            case PolicyType.Home:
                return (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Property Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                );
            case PolicyType.Health:
            case PolicyType.Life:
                return (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Insured Person's Name</label>
                        <input type="text" name="insuredPersonName" value={formData.insuredPersonName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{policy ? 'Edit Policy' : 'Add New Policy'}</h2>
                        
                        {/* File Upload Section */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Upload Contract (Optional)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
                                </div>
                            </div>
                             {selectedFile && <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name}</p>}
                             {policy && !selectedFile && formData.contractFileName && <p className="text-sm text-gray-500 mt-2">Current file: {formData.contractFileName}</p>}
                        </div>

                        {selectedFile && (
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={handleAnalyzeContract}
                                    disabled={isAnalyzing}
                                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze with AI & Auto-fill'}</span>
                                </button>
                                {analysisMessage && <p className="text-sm text-center mt-2 text-gray-600">{analysisMessage}</p>}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Provider</label>
                                <input type="text" name="provider" value={formData.provider} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Policy Number</label>
                                <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    {Object.values(PolicyType).map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>

                            {renderPolicySpecificFields()}

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Premium ($)</label>
                                <input type="number" name="premium" value={formData.premium} onChange={handleChange} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Frequency</label>
                                <select name="premiumFrequency" value={formData.premiumFrequency} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    {Object.values(PremiumFrequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    {Object.values(PolicyStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow">Save Policy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PolicyFormModal;