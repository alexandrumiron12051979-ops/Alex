
export enum PolicyType {
    Auto = 'Auto',
    Health = 'Health',
    Home = 'Home',
    Life = 'Life',
    Pet = 'Pet',
    Other = 'Other'
}

export enum PremiumFrequency {
    Monthly = 'Monthly',
    Annually = 'Annually',
    SemiAnnually = 'Semi-Annually',
    Quarterly = 'Quarterly'
}

export enum PolicyStatus {
    Active = 'Active',
    Expired = 'Expired',
    Cancelled = 'Cancelled'
}

export interface InsurancePolicy {
    id: string;
    provider: string;
    policyNumber: string;
    type: PolicyType;
    premium: number;
    premiumFrequency: PremiumFrequency;
    startDate: string;
    endDate: string;
    coverageDetails?: string;
    status: PolicyStatus;
}
