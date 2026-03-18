import React from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'primary',
                                                  size = 'md',
                                                  className = '',
                                                  children,
                                                  ...props
                                              }) => {
    const base =
        'inline-flex items-center justify-center gap-1.5 font-sans font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-40 disabled:cursor-not-allowed select-none';

    const variants = {
        primary:
            'bg-stone-900 text-white hover:bg-stone-700 active:scale-95 rounded-lg',
        ghost:
            'text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:scale-95 rounded-lg',
        outline:
            'border border-stone-300 text-stone-700 hover:bg-stone-50 active:scale-95 rounded-lg',
        danger:
            'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-95 rounded-lg',
    };

    const sizes = {
        sm: 'text-xs px-2.5 py-1.5',
        md: 'text-sm px-4 py-2',
        icon: 'w-8 h-8 text-sm',
    };

    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'green' | 'amber' | 'blue' | 'red';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
                                                children,
                                                variant = 'default',
                                                className = '',
                                            }) => {
    const variants = {
        default: 'bg-stone-100 text-stone-600',
        green: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        blue: 'bg-blue-50 text-blue-700',
        red: 'bg-red-50 text-red-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium font-mono ${variants[variant]} ${className}`}
        >
      {children}
    </span>
    );
};

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className = '' }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`text-sm font-sans bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer transition-colors hover:border-stone-300 ${className}`}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

// ─── Divider ─────────────────────────────────────────────────────────────────

export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`w-px h-5 bg-stone-200 ${className}`} />
);

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatProps {
    label: string;
    value: string | number;
    mono?: boolean;
}

export const Stat: React.FC<StatProps> = ({ label, value, mono }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">{label}</span>
        <span className={`text-sm font-semibold text-stone-800 ${mono ? 'font-mono' : 'font-sans'}`}>
      {value}
    </span>
    </div>
);