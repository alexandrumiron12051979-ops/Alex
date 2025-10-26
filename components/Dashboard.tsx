
import React, { useState, useMemo } from 'react';
import { InsurancePolicy } from '../types';
import { analyzeCoverage } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

interface DashboardProps {
    policies: InsurancePolicy[];
}

const SummaryCard: React.FC<{ title: string; value: string; subtext?: string }> = ({ title, value, subtext }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ policies }) => {
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const stats = useMemo(() => {
        const totalPolicies = policies.length;
        const annualPremium = policies.reduce((acc, policy) => {
            switch (policy.premiumFrequency) {
                case 'Monthly':
                    return acc + policy.premium * 12;
                case 'Quarterly':
                    return acc + policy.premium * 4;
                case 'Semi-Annually':
                    return acc + policy.premium * 2;
                case 'Annually':
                    return acc + policy.premium;
                default:
                    return acc;
            }
        }, 0);

        const upcomingRenewals = policies.filter(p => {
            const endDate = new Date(p.endDate);
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            return p.status === 'Active' && endDate > today && endDate <= thirtyDaysFromNow;
        }).length;

        return { totalPolicies, annualPremium, upcomingRenewals };
    }, [policies]);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const result = await analyzeCoverage(policies);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Total Policies" value={stats.totalPolicies.toString()} />
                <SummaryCard title="Total Annual Premium" value={`$${stats.annualPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <SummaryCard title="Upcoming Renewals" value={stats.upcomingRenewals.toString()} subtext="In next 30 days" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">AI Coverage Analysis</h2>
                        <p className="text-gray-500 mt-1">Get personalized insights and suggestions on your insurance portfolio.</p>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="mt-4 md:mt-0 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        <span>{isLoading ? 'Analyzing...' : 'Analyze My Coverage'}</span>
                    </button>
                </div>

                {isLoading && (
                    <div className="mt-6 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2">Our AI is reviewing your policies. This may take a moment...</p>
                    </div>
                )}
                {error && <div className="mt-6 text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}
                {analysis && (
                     <div 
                        className="mt-6 prose prose-gray max-w-none prose-headings:font-semibold prose-a:text-indigo-600"
                        dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                )}
            </div>
        </section>
    );
};

export default Dashboard;