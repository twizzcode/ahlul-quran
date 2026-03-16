"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { MasjidProfileData } from "@/lib/masjid-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DashboardMasjidProfileFormProps = {
  initialData: MasjidProfileData;
};

const textareaClassName =
  "flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function DashboardMasjidProfileForm({
  initialData,
}: DashboardMasjidProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    address: initialData.address,
    city: initialData.city,
    province: initialData.province,
    postalCode: initialData.postalCode,
    phone: initialData.phone,
    email: initialData.email,
    website: initialData.website,
    latitude: initialData.latitude,
    longitude: initialData.longitude,
    logoUrl: initialData.logoUrl,
    bannerUrl: initialData.bannerUrl,
    facebook: initialData.facebook,
    instagram: initialData.instagram,
    youtube: initialData.youtube,
    tiktok: initialData.tiktok,
    bankName: initialData.bankName,
    bankAccount: initialData.bankAccount,
    bankHolder: initialData.bankHolder,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/masjid-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menyimpan pengaturan profile.");
      }

      toast.success("Pengaturan profile berhasil diperbarui.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan pengaturan profile.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Halaman profile publik sekarang statis. Di sini hanya field operasional yang tetap bisa diedit.
          </p>
        </div>
        <Button type="submit" disabled={isSaving} className="gap-2 self-start">
          <Save className="h-4 w-4" />
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Aset Visual</CardTitle>
          <CardDescription>
            Dipakai untuk tampilan navbar, footer, dan hero halaman publik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Logo URL">
            <Input
              value={form.logoUrl}
              onChange={(event) => updateField("logoUrl", event.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Banner URL">
            <Input
              value={form.bannerUrl}
              onChange={(event) => updateField("bannerUrl", event.target.value)}
              placeholder="https://..."
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontak dan Lokasi</CardTitle>
          <CardDescription>
            Dipakai untuk contact us, footer, halaman profile, dan kebutuhan informasi publik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Alamat" className="md:col-span-2">
            <textarea
              className={textareaClassName}
              rows={3}
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Alamat lengkap"
            />
          </Field>
          <Field label="Kota">
            <Input
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="Kota"
            />
          </Field>
          <Field label="Provinsi">
            <Input
              value={form.province}
              onChange={(event) => updateField("province", event.target.value)}
              placeholder="Provinsi"
            />
          </Field>
          <Field label="Kode Pos">
            <Input
              value={form.postalCode}
              onChange={(event) => updateField("postalCode", event.target.value)}
              placeholder="Kode pos"
            />
          </Field>
          <Field label="Telepon">
            <Input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+62..."
            />
          </Field>
          <Field label="Email">
            <Input
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="email@contoh.com"
            />
          </Field>
          <Field label="Website">
            <Input
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Latitude">
            <Input
              type="number"
              step="any"
              value={form.latitude ?? ""}
              onChange={(event) =>
                updateField("latitude", event.target.value === "" ? null : Number(event.target.value))
              }
              placeholder="-6.2"
            />
          </Field>
          <Field label="Longitude">
            <Input
              type="number"
              step="any"
              value={form.longitude ?? ""}
              onChange={(event) =>
                updateField("longitude", event.target.value === "" ? null : Number(event.target.value))
              }
              placeholder="106.8"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sosial Media</CardTitle>
          <CardDescription>
            Link ini dipakai di footer dan titik kontak publik lainnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Instagram">
            <Input
              value={form.instagram}
              onChange={(event) => updateField("instagram", event.target.value)}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Facebook">
            <Input
              value={form.facebook}
              onChange={(event) => updateField("facebook", event.target.value)}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="YouTube">
            <Input
              value={form.youtube}
              onChange={(event) => updateField("youtube", event.target.value)}
              placeholder="https://youtube.com/..."
            />
          </Field>
          <Field label="TikTok">
            <Input
              value={form.tiktok}
              onChange={(event) => updateField("tiktok", event.target.value)}
              placeholder="https://tiktok.com/@..."
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekening Donasi</CardTitle>
          <CardDescription>
            Dipakai untuk transfer manual dan informasi rekening di halaman publik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="Nama Bank">
            <Input
              value={form.bankName}
              onChange={(event) => updateField("bankName", event.target.value)}
              placeholder="Bank Syariah Indonesia"
            />
          </Field>
          <Field label="Nomor Rekening">
            <Input
              value={form.bankAccount}
              onChange={(event) => updateField("bankAccount", event.target.value)}
              placeholder="7123456789"
            />
          </Field>
          <Field label="Atas Nama">
            <Input
              value={form.bankHolder}
              onChange={(event) => updateField("bankHolder", event.target.value)}
              placeholder="Yayasan Ahlul Qur'an"
            />
          </Field>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
