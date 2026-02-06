import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SortOption } from '@/utils/sortUtils';
import { ArrowUpDown } from 'lucide-react';

interface AppSortProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const AppSort: React.FC<AppSortProps> = ({ value, onChange }) => {
    return (
        <Select value={value} onValueChange={(val) => onChange(val as SortOption)}>
            <SelectTrigger className="w-[180px] h-12 rounded-xl border-2 font-medium">
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    <SelectValue placeholder="Sort by" />
                </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
                <SelectItem value={SortOption.NEWEST}>Newest First</SelectItem>
                <SelectItem value={SortOption.OLDEST}>Oldest First</SelectItem>
                <SelectItem value={SortOption.NAME_ASC}>Name (A-Z)</SelectItem>
                <SelectItem value={SortOption.NAME_DESC}>Name (Z-A)</SelectItem>
                <SelectItem value={SortOption.STATUS}>Status</SelectItem>
            </SelectContent>
        </Select>
    );
};

export default AppSort;
