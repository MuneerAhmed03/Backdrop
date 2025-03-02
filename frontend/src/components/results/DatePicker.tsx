import React from 'react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1995 + 1 }, (_, i) => 1995 + i);

export default function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState<number>(new Date().getFullYear());
  const [isOpen, setIsOpen] = React.useState(false);
  const [calendarKey, setCalendarKey] = React.useState(0);

  // Function to handle month change
  const handleMonthChange = (value: string) => {
    setCurrentMonth(months.indexOf(value));
    setCalendarKey(prev => prev + 1); // Force calendar re-render
  };

  // Function to handle year change
  const handleYearChange = (value: string) => {
    setCurrentYear(parseInt(value));
    setCalendarKey(prev => prev + 1); // Force calendar re-render
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={4}>
          <div className="px-4 pt-4 flex gap-2">
            <Select onValueChange={handleMonthChange} defaultValue={months[currentMonth]}>
              <SelectTrigger className="flex-1 min-w-[140px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleYearChange} defaultValue={currentYear.toString()}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            key={calendarKey}
            initialFocus
            mode="range"
            defaultMonth={new Date(currentYear, currentMonth)}
            selected={dateRange}
            onSelect={(range: DateRange | undefined) => {
              if (range) {
                onDateRangeChange(range);
                if (range.from && range.to) {
                  setIsOpen(false);
                }
              }
            }}
            numberOfMonths={1}
            className="rounded-md"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
