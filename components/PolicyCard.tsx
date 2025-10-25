
import React from 'react';
import { InsurancePolicy, PolicyType } from '../types';
import { AutoIcon } from './icons/AutoIcon';
import { HealthIcon } from './icons/HealthIcon';
import { HomeIcon } from './icons/HomeIcon';
import { LifeIcon } from './icons/LifeIcon';
import { PetIcon } from './icons/PetIcon';
import { OtherIcon } from './icons/OtherIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface PolicyCardProps {
    policy: InsurancePolicy;
    onEdit: (policy: InsurancePolicy) => void;
    onDelete: (id: string) => void;
}

const PolicyIcon: React.FC<{ type: PolicyType; className?: string }> = ({ type, className = "h-8 w-8" }) => {
    switch (type) {
        case PolicyType.Auto:
            return <AutoIcon className={className} />;
        case PolicyType.Health:
            return <HealthIcon className={className} />;
        case PolicyType.Home:
            return <HomeIcon className={className} />;
        case PolicyType.Life:
            return <LifeIcon className={className} />;
        case PolicyType.Pet:
            return <PetIcon className={className} />;
        default:
            return <OtherIcon className={className} />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Expired': return 'bg-yellow-100 text-yellow-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onEdit, onDelete }) => {
    const formattedPremium = `$${policy.premium.toLocaleString('en-US')}`;
    const formattedFrequency = policy.premiumFrequency.replace('-', ' ');

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <PolicyIcon type={policy.type} className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{policy.provider}</h3>
                            <p className="text-sm text-slate-500">{policy.type} Insurance</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                        {policy.status}
                    </span>
                </div>
                
                <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Policy #</span>
                        <span className="font-medium text-slate-700">{policy.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Premium</span>
                        <span className="font-medium text-slate-700">{formattedPremium} / {formattedFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Effective</span>
                        <span className="font-medium text-slate-700">{policy.startDate} - {policy.endDate}</span>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-slate-100 bg-slate-50 p-3 flex justify-end space-x-2 rounded-b-lg">
                <button 
                    onClick={() => onEdit(policy)} 
                    className="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
                    aria-label="Edit Policy"
                >
                    <EditIcon className="h-5 w-5" />
                </button>
                <button 
                    onClick={() => onDelete(policy.id)} 
                    className="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-full transition-colors"
                    aria-label="Delete Policy"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default PolicyCard;
