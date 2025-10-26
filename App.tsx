
import React, { useState, useEffect, useRef } from 'react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const storedPolicies = localStorage.getItem('insurancePolicies');
            if (storedPolicies) {
                setPolicies(JSON.parse(storedPolicies));
            } else {
                 // Add some dummy data for first-time users
                // FIX: Replaced string literals with enum members for 'premiumFrequency' and 'status' to conform to the InsurancePolicy type.
                const dummyPolicies: InsurancePolicy[] = [
                    { id: '1', provider: 'Geico', policyNumber: 'AUT123456', type: PolicyType.Auto, premium: 120, premiumFrequency: PremiumFrequency.Monthly, startDate: '2023-01-15', endDate: '2024-01-15', status: PolicyStatus.Active, licensePlate: 'ABC-1234' },
                    { id: '2', provider: 'Blue Cross', policyNumber: 'HLT987654', type: PolicyType.Health, premium: 450, premiumFrequency: PremiumFrequency.Monthly, startDate: '2023-06-01', endDate: '2024-05-31', status: PolicyStatus.Active, insuredPersonName: 'John Doe' },
                    { id: '3', provider: 'Lemonade', policyNumber: 'HOM654321', type: PolicyType.Home, premium: 800, premiumFrequency: PremiumFrequency.Annually, startDate: '2023-08-20', endDate: '2024-08-19', status: PolicyStatus.Active, address: '123 Main St, Anytown, USA' },
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

    const handleExportPolicies = () => {
        if (policies.length === 0) {
            alert("There are no policies to export.");
            return;
        }
        try {
            const jsonString = JSON.stringify(policies, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.download = `insurtrack_backup_${date}.json`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export policies:", error);
            alert("An error occurred while exporting your policies.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File content is not readable.");
                }
                const importedPolicies = JSON.parse(text);
                
                // Basic validation
                if (!Array.isArray(importedPolicies) || (importedPolicies.length > 0 && !importedPolicies[0].id)) {
                     throw new Error("Invalid file format. Please import a valid backup file.");
                }
                
                if (window.confirm('Are you sure you want to import these policies? This will overwrite your current data.')) {
                    setPolicies(importedPolicies);
                    alert(`${importedPolicies.length} policies imported successfully.`);
                }
            } catch (error) {
                console.error("Failed to import policies:", error);
                alert(`Failed to import policies. ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };


    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
            <Header 
                onAddPolicy={() => handleOpenModal()} 
                onImport={handleImportClick}
                onExport={handleExportPolicies}
            />
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
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
                accept="application/json"
            />
        </div>
    );
};

export default App;
