"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 min-w-[300px]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center",

        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "",
        weekday: "text-muted-foreground w-9 font-normal text-[0.8rem] text-center",
        week: "",
        day: cn(
          "relative p-0 text-center text-sm align-middle",
          "data-[selected]:bg-accent data-[selected]:text-accent-foreground",
          "data-[today]:bg-accent data-[today]:text-accent-foreground",
          "data-[outside]:text-muted-foreground",
          "data-[disabled]:text-muted-foreground data-[disabled]:opacity-50"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal"
        ),

        chevron: "h-4 w-4",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...props }) => {
          switch (orientation) {
            case "left":
              return (
                <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
              )
            case "right":
              return (
                <ChevronRight className={cn("h-4 w-4", className)} {...props} />
              )
            case "up":
              return (
                <ChevronUp className={cn("h-4 w-4", className)} {...props} />
              )
            case "down":
            default:
              return (
                <ChevronDown className={cn("h-4 w-4", className)} {...props} />
              )
          }
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
