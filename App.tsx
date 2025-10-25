
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Imported PremiumFrequency and PolicyStatus enums to fix type errors when creating dummy policy data.
import { InsurancePolicy, PolicyType, PremiumFrequency, PolicyStatus } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PolicyList from './components/PolicyList';
import PolicyFormModal from './components/PolicyFormModal';

const App: React.FC = () => {
    const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);

    useEffect(() => {
        try {
            const storedPolicies = localStorage.getItem('insurancePolicies');
            if (storedPolicies) {
                setPolicies(JSON.parse(storedPolicies));
            } else {
                 // Add some dummy data for first-time users
                // FIX: Replaced string literals with enum members for 'premiumFrequency' and 'status' to conform to the InsurancePolicy type.
                const dummyPolicies: InsurancePolicy[] = [
                    { id: '1', provider: 'Geico', policyNumber: 'AUT123456', type: PolicyType.Auto, premium: 120, premiumFrequency: PremiumFrequency.Monthly, startDate: '2023-01-15', endDate: '2024-01-15', status: PolicyStatus.Active },
                    { id: '2', provider: 'Blue Cross', policyNumber: 'HLT987654', type: PolicyType.Health, premium: 450, premiumFrequency: PremiumFrequency.Monthly, startDate: '2023-06-01', endDate: '2024-05-31', status: PolicyStatus.Active },
                    { id: '3', provider: 'Lemonade', policyNumber: 'HOM654321', type: PolicyType.Home, premium: 800, premiumFrequency: PremiumFrequency.Annually, startDate: '2023-08-20', endDate: '2024-08-19', status: PolicyStatus.Active },
                ];
                setPolicies(dummyPolicies);
            }
        } catch (error) {
            console.error("Failed to load policies from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('insurancePolicies', JSON.stringify(policies));
        } catch (error) {
            console.error("Failed to save policies to localStorage", error);
        }
    }, [policies]);

    const handleOpenModal = (policy: InsurancePolicy | null = null) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPolicy(null);
    };

    const handleSavePolicy = (policy: Omit<InsurancePolicy, 'id'> & { id?: string }) => {
        if (policy.id) {
            // Update existing policy
            setPolicies(policies.map(p => p.id === policy.id ? { ...p, ...policy } as InsurancePolicy : p));
        } else {
            // Add new policy
            const newPolicy: InsurancePolicy = { ...policy, id: new Date().toISOString() };
            setPolicies([...policies, newPolicy]);
        }
        handleCloseModal();
    };

    const handleDeletePolicy = (id: string) => {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            setPolicies(policies.filter(p => p.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <Header onAddPolicy={() => handleOpenModal()} />
            <main className="container mx-auto p-4 md:p-8">
                <Dashboard policies={policies} />
                <PolicyList 
                    policies={policies} 
                    onEdit={handleOpenModal}
                    onDelete={handleDeletePolicy}
                />
            </main>
            {isModalOpen && (
                <PolicyFormModal
                    policy={editingPolicy}
                    onClose={handleCloseModal}
                    onSave={handleSavePolicy}
                />
            )}
        </div>
    );
};

export default App;
