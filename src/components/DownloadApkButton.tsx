import React from 'react';
import { Download } from 'lucide-react';

interface DownloadApkButtonProps {
    url: string;
    className?: string;
}

const DownloadApkButton: React.FC<DownloadApkButtonProps> = ({ url, className = '' }) => {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center bg-indigo-600 rounded-2xl transition-all duration-300 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl h-14 md:h-16 w-full sm:w-auto px-6 overflow-hidden ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
                    <Download size={22} className="md:w-6 md:h-6" />
                </div>

                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">DIRECT ACCESS</span>
                    <span className="text-lg md:text-xl font-black text-white tracking-tight">Download APK</span>
                </div>
            </div>
        </a>
    );
};

export default DownloadApkButton;
