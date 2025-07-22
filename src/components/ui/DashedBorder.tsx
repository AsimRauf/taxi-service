import React from 'react';

interface DashedBorderProps {
    children: React.ReactNode;
    className?: string;
}

export const DashedBorder: React.FC<DashedBorderProps> = ({ children, className }) => {
    return (
        <div className={`relative bg-gradient-to-br from-primary/20 to-secondary/20 shadow-lg backdrop-blur-md ${className}`}>
            <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
                <defs>
                    <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00A3EE" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0077BE" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="8"
                    ry="8"
                    fill="none"
                    stroke="url(#border-gradient)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                />
            </svg>
            {children}
        </div>
    );
};