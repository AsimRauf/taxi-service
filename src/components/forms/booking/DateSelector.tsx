"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateSelectorProps {
    label: string
    onChange: (date: Date | null) => void
    value: Date | null
    placeholder?: string
}

export const DateSelector = ({ onChange, value, placeholder = "Select date and time" }: DateSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value || undefined);
    const [time, setTime] = useState<string | undefined>(value ? format(value, "HH:mm") : undefined);

    useEffect(() => {
        if (selectedDate && time) {
            const [hour, minute] = time.split(':');
            const newDate = new Date(selectedDate);
            newDate.setHours(parseInt(hour, 10), parseInt(minute, 10));
            onChange(newDate);
        } else {
            onChange(null);
        }
    }, [selectedDate, time, onChange]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date && !time) {
            setTime("13:00"); // Default time when a date is picked for the first time
        }
    }

    const times = Array.from({ length: 24 * 4 }, (_, i) => {
        const hour = Math.floor(i / 4).toString().padStart(2, "0");
        const minute = ((i % 4) * 15).toString().padStart(2, "0");
        return `${hour}:${minute}`;
    });

    return (
        <div className="w-full">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full h-[60px] font-normal justify-start text-left",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {value ? (
                            format(value, "PPP, HH:mm")
                        ) : (
                            <span>{placeholder}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col sm:flex-row">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="rounded-md border shadow"
                        />
                        <div className="p-3 border-t sm:border-t-0 sm:border-l">
                            <p className="text-sm font-medium text-center mb-2">Select Time</p>
                            <Select value={time} onValueChange={setTime}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Time" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <ScrollArea className="h-[200px]">
                                        {times.map(t => <SelectItem key={t} value={t} className="data-[highlighted]:text-white">{t}</SelectItem>)}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="default"
                                className="w-full mt-3 text-white"
                                onClick={() => setIsOpen(false)}
                                disabled={!selectedDate || time === undefined}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
