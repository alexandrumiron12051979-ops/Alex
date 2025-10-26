
import React from 'react';
import { InsurancePolicy } from '../types';
import PolicyCard from './PolicyCard';

interface PolicyListProps {
    policies: InsurancePolicy[];
    onEdit: (policy: InsurancePolicy) => void;
    onDelete: (id: string) => void;
}

const PolicyList: React.FC<PolicyListProps> = ({ policies, onEdit, onDelete }) => {
    return (
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Policies</h2>
            {policies.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">You haven't added any insurance policies yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Click "Add Policy" to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map(policy => (
                        <PolicyCard 
                            key={policy.id} 
                            policy={policy} 
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default PolicyList;