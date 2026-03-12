"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DelayedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit'> {
    value: string | number;
    onSubmit: (value: string) => void;
    className?: string;
}

export function DelayedInput({ value, onSubmit, className, ...props }: DelayedInputProps) {
    const [localValue, setLocalValue] = useState(value.toString());

    // Sync with external value changes
    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value.toString()) {
            onSubmit(localValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur(); // Trigger handleBlur
        }
        if (e.key === 'Escape') {
            setLocalValue(value.toString()); // Revert
            e.currentTarget.blur();
        }
    };

    return (
        <Input
            {...props}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(className)}
        />
    );
}
