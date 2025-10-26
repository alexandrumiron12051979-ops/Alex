
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
import { CalendarIcon } from './icons/CalendarIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { LicensePlateIcon } from './icons/LicensePlateIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';


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
        default: return 'bg-gray-100 text-gray-800';
    }
};

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onEdit, onDelete }) => {
    const formattedPremium = `$${policy.premium.toLocaleString('en-US')}`;
    const formattedFrequency = policy.premiumFrequency.replace('-', ' ');

    const handleCreateReminder = (policy: InsurancePolicy) => {
        if (!policy.endDate) return;
    
        // Parse date string as UTC to avoid timezone issues
        const parts = policy.endDate.split('-').map(p => parseInt(p, 10));
        const endDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
    
        const reminderDate = new Date(endDate);
        reminderDate.setUTCMonth(reminderDate.getUTCMonth() - 1);
    
        const formatDateForICS = (date: Date) => {
            const year = date.getUTCFullYear();
            const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
            const day = date.getUTCDate().toString().padStart(2, '0');
            return `${year}${month}${day}`;
        };
    
        const formatDateTimeForICS = (date: Date) => {
            // YYYYMMDDTHHMMSSZ
            return formatDateForICS(date) + 'T' + 
                   date.getUTCHours().toString().padStart(2, '0') +
                   date.getUTCMinutes().toString().padStart(2, '0') +
                   date.getUTCSeconds().toString().padStart(2, '0') + 'Z';
        }
    
        const reminderDateStr = formatDateForICS(reminderDate);
        
        // An all-day event ends on the next day
        const nextDay = new Date(reminderDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const reminderEndDateStr = formatDateForICS(nextDay);
    
        const title = `Insurance Renewal: ${policy.provider} - ${policy.type}`;
        const description = `Your ${policy.provider} ${policy.type} insurance (Policy #${policy.policyNumber}) is set to expire on ${policy.endDate}. Time to review your coverage and compare prices!`;
        const uid = `${policy.id}@insurtrack.ai`;
        const dtstamp = formatDateTimeForICS(new Date());
    
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//InsurTrackAI//EN',
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${dtstamp}`,
            `DTSTART;VALUE=DATE:${reminderDateStr}`,
            `DTEND;VALUE=DATE:${reminderEndDateStr}`,
            `SUMMARY:${title}`,
            `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
    
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'insurance_reminder.ics');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleViewContract = (base64Data: string, fileName: string, mimeType: string) => {
        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const fileUrl = URL.createObjectURL(blob);
            
            window.open(fileUrl, '_blank');
            
            // Clean up the object URL after a short delay
            setTimeout(() => URL.revokeObjectURL(fileUrl), 100);

        } catch (e) {
            console.error("Failed to decode or open contract file", e);
            alert("Could not open the contract file. It might be corrupted.");
        }
    };

    const renderPolicySpecificInfo = () => {
        switch (policy.type) {
            case PolicyType.Auto:
                return policy.licensePlate ? (
                    <div className="flex justify-between items-center text-gray-600">
                        <span className="flex items-center"><LicensePlateIcon className="h-4 w-4 mr-2" /> License Plate</span>
                        <span className="font-medium text-gray-700">{policy.licensePlate}</span>
                    </div>
                ) : null;
            case PolicyType.Home:
                return policy.address ? (
                    <div className="flex justify-between items-center text-gray-600">
                        <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2" /> Address</span>
                        <span className="font-medium text-gray-700 truncate" title={policy.address}>{policy.address}</span>
                    </div>
                ) : null;
            case PolicyType.Health:
            case PolicyType.Life:
                return policy.insuredPersonName ? (
                    <div className="flex justify-between items-center text-gray-600">
                        <span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2" /> Insured Name</span>
                        <span className="font-medium text-gray-700">{policy.insuredPersonName}</span>
                    </div>
                ) : null;
            default:
                return null;
        }
    };


    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <PolicyIcon type={policy.type} className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{policy.provider}</h3>
                            <p className="text-sm text-gray-500">{policy.type} Insurance</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                        {policy.status}
                    </span>
                </div>
                
                <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Policy #</span>
                         <span className="font-medium text-gray-700 flex items-center gap-1.5">
                            {policy.contractFileName && <PaperclipIcon className="h-4 w-4 text-gray-400" title="Contract attached" />}
                            {policy.policyNumber}
                        </span>
                    </div>
                    {renderPolicySpecificInfo()}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Premium</span>
                        <span className="font-medium text-gray-700">{formattedPremium} / {formattedFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Effective</span>
                        <span className="font-medium text-gray-700">{policy.startDate} - {policy.endDate}</span>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-100 bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-lg">
                <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                    <button 
                        onClick={() => handleCreateReminder(policy)}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                        aria-label="Add renewal reminder to calendar"
                    >
                        <CalendarIcon className="h-5 w-5 mr-1.5" />
                        <span>Add Reminder</span>
                    </button>
                    <a 
                        href="https://www.rastreator.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                        aria-label="Compare insurance prices"
                    >
                        <SearchIcon className="h-5 w-5 mr-1.5" />
                        <span>Compare Prices</span>
                    </a>
                    {policy.contractData && policy.contractFileName && policy.contractMimeType && (
                        <button
                            onClick={() => handleViewContract(policy.contractData!, policy.contractFileName!, policy.contractMimeType!)}
                            className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                            aria-label="View attached contract"
                        >
                            <DocumentIcon className="h-5 w-5 mr-1.5" />
                            <span>View Contract</span>
                        </button>
                    )}
                </div>
                
                <div className="flex justify-end space-x-2">
                    <button 
                        onClick={() => onEdit(policy)} 
                        className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
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
        </div>
    );
};

export default PolicyCard;