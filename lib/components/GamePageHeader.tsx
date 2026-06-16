'use client';

interface GamePageHeaderProps {
    title: string;
    icon?: string;
    subtitle?: string;
    colorClass?: string;
    className?: string;
}

export function GamePageHeader({
    title,
    icon,
    subtitle,
    colorClass = 'text-cyan-400',
    className = '',
}: GamePageHeaderProps) {
    return (
        <div className={`text-center ${className}`}>
            <h1 className={`text-3xl font-bold ${colorClass} ${subtitle ? 'mb-1' : 'mb-6'} drop-shadow-lg`}>
                {icon ? `${icon} ` : ''}{title}
            </h1>
            {subtitle && (
                <p className={`${colorClass}/60 text-xs mb-4`}>{subtitle}</p>
            )}
        </div>
    );
}
