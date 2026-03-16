"use client";

import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const label = value ? format(new Date(`${value}T00:00:00`), "dd MMMM yyyy") : placeholder;

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
      <PopoverContent className="w-[320px] space-y-3">
        <div>
          <p className="text-sm font-medium">Pilih tanggal</p>
          <p className="text-xs text-muted-foreground">
            Tanggal akan dipakai sebagai batas akhir kampanye.
          </p>
        </div>
        <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
        {value ? (
          <Button type="button" variant="ghost" className="w-full" onClick={() => onChange("")}>
            Hapus tanggal
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
