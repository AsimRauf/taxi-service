"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateSelectorProps {
  label: string
  onChange: (date: Date | null) => void
  value: Date | null
  placeholder?: string
}

export const DateSelector = ({ label, onChange, value, placeholder = "Select date and time" }: DateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [time, setTime] = useState("12:00")

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
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
              `${format(value, "PPP")}, ${time}`
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex items-start" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(date) => {
              if (date) {
                const [hours, minutes] = time.split(":")
                date.setHours(parseInt(hours), parseInt(minutes))
                onChange(date)
              }
            }}
            initialFocus
          />
          <div className="w-[120px] my-4 mr-2">
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-1">
                {Array.from({ length: 96 }).map((_, i) => {
                  const hour = Math.floor(i / 4).toString().padStart(2, "0")
                  const minute = ((i % 4) * 15).toString().padStart(2, "0")
                  const timeValue = `${hour}:${minute}`
                  return (
                    <Button
                      key={i}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => {
                        setTime(timeValue)
                        if (value) {
                          const newDate = new Date(value)
                          newDate.setHours(parseInt(hour), parseInt(minute))
                          onChange(newDate)
                        }
                        setIsOpen(false)
                      }}
                    >
                      {timeValue}
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
