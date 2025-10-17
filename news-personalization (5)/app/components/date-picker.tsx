"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date: Date
  onDateChange: (date: Date | undefined) => void
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] px-4 font-serif text-xs font-bold uppercase tracking-wide text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#8b6f47] hover:text-[#eddfc5] dark:hover:bg-[#3a2418] dark:hover:text-[#e0d0b0] transition-colors whitespace-nowrap justify-start",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#1a0f08] font-serif text-[#2d1810] dark:text-[#e0d0b0]"
        align="end"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="bg-[#f5f0e8] dark:bg-[#1a0f08] font-serif text-[#2d1810] dark:text-[#e0d0b0]"
        />
      </PopoverContent>
    </Popover>
  )
}
