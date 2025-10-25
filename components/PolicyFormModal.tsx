
import React, { useState, useEffect } from 'react';
import { InsurancePolicy, PolicyType, PremiumFrequency, PolicyStatus } from '../types';

interface PolicyFormModalProps {
    policy: InsurancePolicy | null;
    onClose: () => void;
    onSave: (policy: Omit<InsurancePolicy, 'id'> & { id?: string }) => void;
}

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
    });

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
            });
        }
    }, [policy]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const policyData = {
            ...formData,
            premium: parseFloat(formData.premium) || 0,
        };
        onSave({ ...policyData, id: policy?.id });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">{policy ? 'Edit Policy' : 'Add New Policy'}</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Form fields */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Provider</label>
                                <input type="text" name="provider" value={formData.provider} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Policy Number</label>
                                <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    {Object.values(PolicyType).map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Premium ($)</label>
                                <input type="number" name="premium" value={formData.premium} onChange={handleChange} required min="0" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Frequency</label>
                                <select name="premiumFrequency" value={formData.premiumFrequency} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    {Object.values(PremiumFrequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    {Object.values(PolicyStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white text-slate-700 font-semibold px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow">Save Policy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PolicyFormModal;
