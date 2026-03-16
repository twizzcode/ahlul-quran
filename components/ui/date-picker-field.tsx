"use client";

import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DatePickerField({
  value,
  onChange,
  placeholder = "Pilih tanggal",
}: DatePickerFieldProps) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
  const label = selectedDate ? format(selectedDate, "dd MMMM yyyy") : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-between rounded-xl px-4 text-sm font-normal"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>{label}</span>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          month={selectedDate}
          captionLayout="dropdown"
          onSelect={(date) => {
            if (!date) {
              onChange("");
              return;
            }

            onChange(format(date, "yyyy-MM-dd"));
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
