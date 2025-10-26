
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HeaderProps {
    onAddPolicy: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddPolicy }) => {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-8 w-8 text-indigo-600"/>
                    <h1 className="text-2xl font-bold text-gray-900">InsurTrack AI</h1>
                </div>
                <button
                    onClick={onAddPolicy}
                    className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Policy</span>
                </button>
            </div>
        </header>
    );
};

export default Header;