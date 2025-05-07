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

export const DateSelector = ({ onChange, value, placeholder = "Select date and time" }: DateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [time, setTime] = useState("13:00")  // Changed default from 12:00 to 13:00 (1:00 PM)
  const [period, setPeriod] = useState<"AM" | "PM">("PM")

  // Convert 24-hour format to 12-hour format for display
  const formatTimeDisplay = (time: string, period: "AM" | "PM") => {
    const [hours, minutes] = time.split(":")
    let hour = parseInt(hours)
    
    if (period === "AM") {
      if (hour === 12) hour = 0
    } else {
      if (hour !== 12) hour += 12
    }
    
    // Format for display (12-hour format)
    const displayHour = hour % 12 === 0 ? 12 : hour % 12
    return `${displayHour}:${minutes} ${period}`
  }

  // Convert 12-hour display time to 24-hour time for internal use
  const getTimeIn24HourFormat = (time: string, period: "AM" | "PM") => {
    const [hours, minutes] = time.split(":")
    let hour = parseInt(hours)
    
    if (period === "AM") {
      if (hour === 12) hour = 0
    } else {
      if (hour !== 12) hour += 12
    }
    
    return `${hour.toString().padStart(2, "0")}:${minutes}`
  }

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
              `${format(value, "PPP")}, ${formatTimeDisplay(time, period)}`
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col md:flex-row">
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={(date) => {
                if (date) {
                  // Convert time to 24-hour format for internal use
                  const timeIn24 = getTimeIn24HourFormat(time, period)
                  const [hours, minutes] = timeIn24.split(":")
                  date.setHours(parseInt(hours), parseInt(minutes))
                  onChange(date)
                }
              }}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border shadow"
              classNames={{
                nav: "space-x-1 flex items-center justify-end", // Changed to justify-end
                caption: "text-left pl-2", // Added left alignment for month/year name
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "relative", // Changed from absolute positioning
                nav_button_next: "relative", // Changed from absolute positioning
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_disabled: "!text-red-500 line-through hover:bg-transparent cursor-not-allowed",
                day_range_middle: "rounded-none",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
              }}
            />
            
            <div className="p-3 border-t md:border-t-0 md:border-l">
              {/* AM/PM selector */}
              <div className="flex gap-2 mb-3 justify-center">
                <Button
                  variant={period === "AM" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("AM")}
                  className="w-16"
                >
                  AM
                </Button>
                <Button
                  variant={period === "PM" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("PM")}
                  className="w-16"
                >
                  PM
                </Button>
              </div>
              
              {/* Time selector */}
              <div className="w-[150px]">
                <ScrollArea className="h-[250px] border rounded-md p-1">
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: 48 }).map((_, i) => {
                      // Generate times in 15-minute intervals for 12-hour clock
                      // Start with 1:00 instead of 12:00
                      const hour = (Math.floor(i / 4) % 12) + 1
                      const displayHour = hour === 12 ? 12 : hour
                      const minute = ((i % 4) * 15).toString().padStart(2, "0")
                      const timeValue = `${displayHour}:${minute}`
                      
                      // Store in 24-hour format internally
                      const internalHour = (hour + (period === "PM" && hour !== 12 ? 12 : 0)) % 24
                      const internalTime = `${internalHour.toString().padStart(2, "0")}:${minute}`
                      
                      return (
                        <Button
                          key={i}
                          variant={time === internalTime ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-center font-medium text-sm",
                            time === internalTime && "bg-primary/10"
                          )}
                          onClick={() => {
                            setTime(internalTime)
                            if (value) {
                              const newDate = new Date(value)
                              newDate.setHours(internalHour, parseInt(minute))
                              onChange(newDate)
                            }
                          }}
                        >
                          {timeValue}
                        </Button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
              
              <Button 
                className="w-full mt-3" 
                onClick={() => setIsOpen(false)}
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
