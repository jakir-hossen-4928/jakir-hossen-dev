import React from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConfirmToastProps {
    message: React.ReactNode;
    onConfirm: () => void;
    closeToast?: () => void;
}

const ConfirmToastComponent: React.FC<ConfirmToastProps> = ({ message, onConfirm, closeToast }) => {
    return (
        <div className="flex flex-col gap-6 p-2 md:p-4">
            <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 shrink-0" />
                <div className="text-lg md:text-xl font-bold text-foreground leading-snug">{message}</div>
            </div>
            <div className="flex justify-center gap-4 mt-2 w-full">
                <Button variant="outline" size="lg" onClick={closeToast} className="flex-1 font-bold uppercase tracking-wider">
                    Cancel
                </Button>
                <Button variant="destructive" size="lg" onClick={() => {
                    onConfirm();
                    if (closeToast) closeToast();
                }} className="flex-1 font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white">
                    Confirm
                </Button>
            </div>
        </div>
    );
};

export const confirmToast = (message: React.ReactNode, onConfirm: () => void) => {
    toast(
        ({ closeToast }) => (
            <ConfirmToastComponent message={message} onConfirm={onConfirm} closeToast={closeToast} />
        ),
        {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
            theme: "dark",
            className: "border border-red-500/30 bg-card rounded-2xl shadow-[0_0_100px_rgba(239,68,68,0.15)] !mb-0 mt-[20vh] !w-[90vw] sm:!w-[500px] !max-w-[500px] -ml-[calc(45vw-160px)] sm:-ml-[90px]",
        }
    );
};
