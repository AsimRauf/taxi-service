import React from 'react';

interface DashedBorderProps {
    children: React.ReactNode;
    className?: string;
}

export const DashedBorder: React.FC<DashedBorderProps> = ({ children, className }) => {
    return (
        <div className={`relative ${className}`}>
            <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
                <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="8"
                    ry="8"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.2)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                />
            </svg>
            {children}
        </div>
    );
};