"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRoleUpdateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  currentRole: string;
  userId: string;
  roleOptions: readonly string[];
  roleLabels: Record<string, string>;
};

export function UserRoleUpdateForm({
  action,
  currentRole,
  userId,
  roleOptions,
  roleLabels,
}: UserRoleUpdateFormProps) {
  const [role, setRole] = useState(currentRole);
  const isDirty = role !== currentRole;

  return (
    <form action={action} className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="h-9 min-w-40 rounded-md px-3 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((roleOption) => (
            <SelectItem key={roleOption} value={roleOption}>
              {roleLabels[roleOption] || roleOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={!isDirty}>
        Simpan
      </Button>
    </form>
  );
}
