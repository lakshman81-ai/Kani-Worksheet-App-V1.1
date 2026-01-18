
import React from 'react';

const MagicWandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.68,8.23l-2.51-2.51a1,1,0,0,0-1.42,0L7.64,16.83,4.17,13.36a1,1,0,0,0-1.42,0L.24,15.87a1,1,0,0,0,0,1.42l2.51,2.51a1,1,0,0,0,1.42,0L15.28,8.69l3.47,3.47a1,1,0,0,0,1.42,0l2.51-2.51A1,1,0,0,0,22.68,8.23Z" />
        <path d="M21.5,2.5a1.87,1.87,0,0,0-2.64,0l-1,1,4,4,1-1A1.87,1.87,0,0,0,21.5,2.5Z" />
        <path d="M4.5,19.5a1.87,1.87,0,0,0,2.64,0l1-1-4-4-1,1A1.87,1.87,0,0,0,4.5,19.5Z" />
        <path d="M4.21,6.57l-1.06-.36a1,1,0,0,0-1.22.61L.22,11.2a1,1,0,0,0,.61,1.22l1.06.36a1,1,0,0,0,1.22-.61l1.71-4.38A1,1,0,0,0,4.21,6.57Z" />
        <path d="M19.79,17.43l1.06.36a1,1,0,0,0,1.22-.61l1.71-4.38a1,1,0,0,0-.61-1.22l-1.06-.36a1,1,0,0,0-1.22.61L19.18,16.2A1,1,0,0,0,19.79,17.43Z" />
    </svg>
);

const Spinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin">
                <MagicWandIcon />
            </div>
            <p className="text-xl font-medium text-purple-600">Brewing a magical story...</p>
        </div>
    );
};

export default Spinner;
