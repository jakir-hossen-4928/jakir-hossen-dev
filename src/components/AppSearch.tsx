import React from 'react';
import { Input } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface AppSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const AppSearch: React.FC<AppSearchProps> = ({ value, onChange, placeholder = 'Search apps...' }) => {
    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-background border-2 border-border focus:ring-2 focus:ring-primary focus:border-primary font-medium text-sm transition-all text-foreground placeholder:text-muted-foreground"
            />
        </div>
    );
};

export default AppSearch;
