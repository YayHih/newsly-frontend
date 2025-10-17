"use client"

import { Calendar } from "@/components/ui/calendar"

interface SidebarCalendarProps {
  date: Date
  onDateChange: (date: Date | undefined) => void
}

export function SidebarCalendar({ date, onDateChange }: SidebarCalendarProps) {
  return (
    <div className="p-4">
      <Calendar mode="single" selected={date} onSelect={onDateChange} className="rounded-md border" />

      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium">Saved Dates</h3>
        <div className="space-y-1">
          {[
            { date: "May 10, 2025", label: "Federal Budget Announcement" },
            { date: "May 15, 2025", label: "Quarterly Earnings Reports" },
            { date: "May 22, 2025", label: "Local Election Day" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center justify-between rounded-md p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="font-medium">{item.date}</span>
              <span className="text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium">News Categories</h3>
        <div className="space-y-1">
          {[
            { name: "Financial", active: true },
            { name: "Health", active: true },
            { name: "Local", active: true },
            { name: "Technology", active: true },
            { name: "Politics", active: false },
            { name: "Sports", active: false },
          ].map((category, i) => (
            <div
              key={i}
              className={`flex cursor-pointer items-center justify-between rounded-md p-2 text-xs ${
                category.active
                  ? "bg-slate-100 font-medium dark:bg-slate-800"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <span>{category.name}</span>
              <div
                className={`h-3 w-3 rounded-full ${category.active ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
