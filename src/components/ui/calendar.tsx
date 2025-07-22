"use client"

import * as React from "react"
import { DayPicker, Dropdown as DropDownDayPicker } from "react-day-picker"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { CustomComponents } from "@/types/customComponents";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  components?: CustomComponents;
  captionLabelClassName?: string
  dayClassName?: string
  dayButtonClassName?: string
  dropdownsClassName?: string
  footerClassName?: string
  monthClassName?: string
  monthCaptionClassName?: string
  monthGridClassName?: string
  monthsClassName?: string
  weekClassName?: string
  weekdayClassName?: string
  weekdaysClassName?: string
  rangeEndClassName?: string
  rangeMiddleClassName?: string
  rangeStartClassName?: string
  selectedClassName?: string
  disabledClassName?: string
  hiddenClassName?: string
  outsideClassName?: string
  todayClassName?: string
  selectTriggerClassName?: string
}

function Calendar({
  className,
  classNames,
  hideNavigation,
  showOutsideDays = true,
  components: customComponents,
  ...props
}: CalendarProps) {
  const _monthsClassName = cn(
    "relative flex flex-col gap-4 sm:flex-row",
    props.monthsClassName
  )
  const _monthCaptionClassName = cn(
    "relative flex h-7 items-center justify-between",
    props.monthCaptionClassName
  )
  const _dropdownsClassName = cn(
    "flex items-center justify-center gap-2 w-full",
    hideNavigation ? "w-full" : "",
    props.dropdownsClassName
  )
  const _footerClassName = cn("pt-3 text-sm", props.footerClassName)
  const _weekdaysClassName = cn("flex", props.weekdaysClassName)
  const _weekdayClassName = cn(
    "w-9 text-sm font-normal text-black",
    props.weekdayClassName
  )
  const _captionLabelClassName = cn(
    "truncate text-sm font-medium text-white",
    props.captionLabelClassName
  )
  const _monthGridClassName = cn("mx-auto mt-4", props.monthGridClassName)
  const _weekClassName = cn("mt-2 flex w-max items-start", props.weekClassName)
  const _dayClassName = cn(
    "flex size-9 flex-1 items-center justify-center p-0 text-sm",
    props.dayClassName
  )
  const _dayButtonClassName = cn(
    buttonVariants({ variant: "ghost" }),
    "size-9 rounded-md p-0 font-normal transition-none aria-selected:opacity-100",
    props.dayButtonClassName
  )

  const buttonRangeClassName =
    "bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground"
  const _rangeStartClassName = cn(
    buttonRangeClassName,
    "rounded-s-md",
    props.rangeStartClassName
  )
  const _rangeEndClassName = cn(
    buttonRangeClassName,
    "rounded-e-md",
    props.rangeEndClassName
  )
  const _rangeMiddleClassName = cn(
    "bg-accent !text-foreground [&>button]:bg-transparent [&>button]:!text-foreground [&>button]:hover:bg-transparent [&>button]:hover:!text-foreground",
    props.rangeMiddleClassName
  )
  const _selectedClassName = cn(
    "[&>button]:bg-primary [&>button]:text-black [&>button]:hover:bg-primary [&>button]:hover:text-black",
    props.selectedClassName
  )
  const _todayClassName = cn(
    "[&>button]:bg-white/20 [&>button]:text-white",
    props.todayClassName
  )
  const _outsideClassName = cn(
    "text-black/50 opacity-50",
    props.outsideClassName
  )
  const _disabledClassName = cn(
    "text-black/50 opacity-50",
    props.disabledClassName
  )
  const _hiddenClassName = cn("invisible flex-1", props.hiddenClassName)

  const Dropdown = React.useCallback(
    ({
      value,
      onChange,
      options,
    }: React.ComponentProps<typeof DropDownDayPicker>) => {
      const selected = options?.find((option) => option.value === value)
      const handleChange = (value: string) => {
        const changeEvent = {
          target: { value },
        } as React.ChangeEvent<HTMLSelectElement>
        onChange?.(changeEvent)
      }

      return (
        <Select
          value={value?.toString()}
          onValueChange={(value) => {
            handleChange(value)
          }}
        >
          <SelectTrigger className="outline-none focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20 text-white">
            <SelectValue>{selected?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="center" className="bg-primary/20 backdrop-blur-md border-white/20 text-white">
            <ScrollArea className="h-80">
              {options?.map(({ value, label, disabled }, id) => (
                <SelectItem
                  key={`${value}-${id}`}
                  value={value?.toString()}
                  disabled={disabled}
                >
                  {label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      )
    },
    []
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      modifiers={{today: new Date()}}
      mode="single"
      classNames={{
        caption_label: _captionLabelClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        dropdowns: _dropdownsClassName,
        footer: _footerClassName,
        month: props.monthClassName,
        month_caption: _monthCaptionClassName,
        month_grid: _monthGridClassName,
        months: _monthsClassName,
        week: _weekClassName,
        weekday: _weekdayClassName,
        weekdays: _weekdaysClassName,
        range_end: _rangeEndClassName,
        range_middle: _rangeMiddleClassName,
        range_start: _rangeStartClassName,
        selected: _selectedClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,
        outside: _outsideClassName,
        today: _todayClassName,
        nav: "flex items-center",
        ...classNames,
      }}
      components={{
        Dropdown,
        IconLeft: ({ ...props }) => (
          <button
            {...props}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1 text-sm font-medium ring-offset-background transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        ),
        IconRight: ({ ...props }) => (
          <button
            {...props}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1 text-sm font-medium ring-offset-background transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        ),
        ...customComponents,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
