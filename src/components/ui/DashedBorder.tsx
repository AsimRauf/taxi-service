import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';

interface DashedBorderProps {
    children: React.ReactNode;
    className?: string;
}

export const DashedBorder: React.FC<DashedBorderProps> = ({ children, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [gatePosition, setGatePosition] = useState<{
        bottomGate: { x: number; y: number } | null;
    }>({
        bottomGate: null
    });
    
    const [gateState, setGateState] = useState<{
        bottomGateOpen: boolean;
    }>({
        bottomGateOpen: false
    });

    useLayoutEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let mutationObserver: MutationObserver | null = null;
        let animationFrameId: number | null = null;

        const updateGatePosition = () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!containerRef.current) return;

                const containerRect = containerRef.current.getBoundingClientRect();
                const { width, height } = containerRect;
                const calculateButton = document.getElementById('calculate-button');

                if (width > 0 && height > 0 && calculateButton) {
                    const buttonRect = calculateButton.getBoundingClientRect();
                    
                    const buttonX = buttonRect.left - containerRect.left;
                    const buttonW = buttonRect.width;

                    // Calculate the center X position of the calculate button
                    const buttonCenterX = buttonX + buttonW / 2;

                    // Set gate position aligned with button center - ONLY bottom gate
                    setGatePosition({
                        bottomGate: { x: buttonCenterX, y: height }
                    });
                } else {
                    setGatePosition({
                        bottomGate: null
                    });
                }
            });
        };

        const container = containerRef.current;
        if (!container) return;

        resizeObserver = new ResizeObserver(updateGatePosition);
        resizeObserver.observe(container);

        mutationObserver = new MutationObserver(() => {
            if (document.getElementById('calculate-button')) {
                updateGatePosition();
            }
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Initial check
        updateGatePosition();

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            if (mutationObserver) mutationObserver.disconnect();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    useEffect(() => {
        const handleBottomGate = (event: CustomEvent) => {
            console.log('DashedBorder received bottom gate event:', event.detail.opening);
            setGateState(prev => ({
                ...prev,
                bottomGateOpen: event.detail.opening
            }));
        };

        window.addEventListener('carReachingBottomGate', handleBottomGate as EventListener);

        return () => {
            window.removeEventListener('carReachingBottomGate', handleBottomGate as EventListener);
        };
    }, []);

    const renderBorderWithGates = () => {
        if (!containerRef.current) return null;

        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 100;
        const height = rect.height || 100;
        const rx = 8;
        const ry = 8;
        const gateWidth = 50; // Gap between vertical lines
        const gateDepth = 20; // How far the vertical lines extend inward

        const { bottomGate } = gatePosition;
        const { bottomGateOpen } = gateState;

        // Create path segments for the border with bottom gate only
        const createBorderPath = () => {
            let pathSegments = [];

            // Top border - always full (no gate)
            pathSegments.push(`M ${rx} 1 L ${width - rx} 1`);

            // Right border - always full
            pathSegments.push(`M ${width - 1} ${rx} L ${width - 1} ${height - rx}`);

            // Bottom border - with gate when open
            if (bottomGate && bottomGateOpen) {
                const gateLeft = bottomGate.x - gateWidth / 2;
                const gateRight = bottomGate.x + gateWidth / 2;
                
                // Left part of bottom border
                if (gateLeft > rx) {
                    pathSegments.push(`M ${rx} ${height - 1} L ${gateLeft} ${height - 1}`);
                }
                
                // Right part of bottom border
                if (gateRight < width - rx) {
                    pathSegments.push(`M ${gateRight} ${height - 1} L ${width - rx} ${height - 1}`);
                }
                
                // Bottom gate vertical lines (perpendicular to border)
                pathSegments.push(`M ${gateLeft} ${height - 1} L ${gateLeft} ${height - gateDepth - 1}`);
                pathSegments.push(`M ${gateRight} ${height - 1} L ${gateRight} ${height - gateDepth - 1}`);
            } else {
                // Full bottom border when gate is closed
                pathSegments.push(`M ${rx} ${height - 1} L ${width - rx} ${height - 1}`);
            }

            // Left border - always full
            pathSegments.push(`M 1 ${rx} L 1 ${height - rx}`);

            // Corner arcs - always present
            pathSegments.push(`M ${rx} 1 A ${rx} ${ry} 0 0 0 1 ${rx}`);
            pathSegments.push(`M ${width - 1} ${rx} A ${rx} ${ry} 0 0 0 ${width - rx} 1`);
            pathSegments.push(`M ${width - rx} ${height - 1} A ${rx} ${ry} 0 0 0 ${width - 1} ${height - rx}`);
            pathSegments.push(`M 1 ${height - rx} A ${rx} ${ry} 0 0 0 ${rx} ${height - 1}`);

            return pathSegments.join(' ');
        };

        return (
            <path
                d={createBorderPath()}
                fill="none"
                stroke="url(#border-gradient)"
                strokeWidth="2"
                strokeDasharray="8 4"
            />
        );
    };

    return (
        <div ref={containerRef} className={`relative bg-gradient-to-br from-primary/20 to-secondary/20 shadow-lg backdrop-blur-md ${className}`}>
            <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
                <defs>
                    <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00A3EE" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0077BE" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                {renderBorderWithGates()}
            </svg>
            {children}
        </div>
    );
};