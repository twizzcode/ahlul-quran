"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type {
  FundingItem,
  MasjidProfileData,
  RoadmapItem,
  TimelineItem,
  VisionItem,
} from "@/lib/masjid-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DashboardMasjidProfileFormProps = {
  initialData: MasjidProfileData;
};

type NoticeState = {
  type: "success" | "error";
  text: string;
} | null;

const textareaClassName =
  "flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function DashboardMasjidProfileForm({
  initialData,
}: DashboardMasjidProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  function updateField<K extends keyof MasjidProfileData>(
    key: K,
    value: MasjidProfileData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateVisionItem(
    index: number,
    key: keyof VisionItem,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      visionItems: current.visionItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateTimelineItem(
    index: number,
    key: keyof TimelineItem,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      timelineItems: current.timelineItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateFundingItem(
    index: number,
    key: keyof FundingItem,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      fundingItems: current.fundingItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateRoadmapItem(
    index: number,
    key: keyof RoadmapItem,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      roadmapItems: current.roadmapItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateCommitteeItem(
    index: number,
    key: "section" | "leads",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      committeeItems: current.committeeItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateCommitteeBullet(
    itemIndex: number,
    bulletIndex: number,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      committeeItems: current.committeeItems.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              bullets: item.bullets.map((bullet, currentBulletIndex) =>
                currentBulletIndex === bulletIndex ? value : bullet
              ),
            }
          : item
      ),
    }));
  }

  function addCommitteeBullet(itemIndex: number) {
    setForm((current) => ({
      ...current,
      committeeItems: current.committeeItems.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? { ...item, bullets: [...item.bullets, ""] }
          : item
      ),
    }));
  }

  function removeCommitteeBullet(itemIndex: number, bulletIndex: number) {
    setForm((current) => ({
      ...current,
      committeeItems: current.committeeItems.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              bullets: item.bullets.filter(
                (_bullet, currentBulletIndex) => currentBulletIndex !== bulletIndex
              ),
            }
          : item
      ),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/masjid-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menyimpan profil masjid.");
      }

      setForm(result.data as MasjidProfileData);
      setNotice({
        type: "success",
        text: "Profil masjid berhasil diperbarui.",
      });
      toast.success("Profil masjid berhasil diperbarui.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan profil masjid.";
      setNotice({ type: "error", text: message });
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil Masjid</h1>
          <p className="text-sm text-muted-foreground">
            Kelola identitas publik, konten proposal, dan struktur halaman profil.
          </p>
        </div>
        <Button type="submit" disabled={isSaving} className="gap-2 self-start">
          <Save className="h-4 w-4" />
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {notice ? (
        <div
          className={
            notice.type === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {notice.text}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Identitas Dasar</CardTitle>
          <CardDescription>
            Informasi inti brand yang dipakai pada navbar, footer, dan halaman profil.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Masjid">
            <Input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Masjid Ahlul Qur'an"
            />
          </Field>
          <Field label="Nama Yayasan">
            <Input
              value={form.foundationName}
              onChange={(event) =>
                updateField("foundationName", event.target.value)
              }
              placeholder="Yayasan Ahlul Qur'an Cinta Indonesia"
            />
          </Field>
          <Field label="Nama Gerakan">
            <Input
              value={form.movementName}
              onChange={(event) => updateField("movementName", event.target.value)}
              placeholder="Gerakan Semilyar Tangan"
            />
          </Field>
          <Field label="Website">
            <Input
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://..."
            />
          </Field>
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
          <Field label="Deskripsi Singkat" className="md:col-span-2">
            <textarea
              className={textareaClassName}
              rows={4}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Deskripsi singkat lembaga"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontak dan Kanal Publik</CardTitle>
          <CardDescription>
            Dipakai untuk footer, informasi publik, dan kebutuhan donasi.
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
          <Field label="Latitude">
            <Input
              type="number"
              step="any"
              value={form.latitude ?? ""}
              onChange={(event) =>
                updateField(
                  "latitude",
                  event.target.value === "" ? null : Number(event.target.value)
                )
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
                updateField(
                  "longitude",
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
              placeholder="106.8"
            />
          </Field>
          <Field label="Instagram">
            <Input
              value={form.instagram}
              onChange={(event) => updateField("instagram", event.target.value)}
              placeholder="@instagram"
            />
          </Field>
          <Field label="Facebook">
            <Input
              value={form.facebook}
              onChange={(event) => updateField("facebook", event.target.value)}
              placeholder="Facebook"
            />
          </Field>
          <Field label="YouTube">
            <Input
              value={form.youtube}
              onChange={(event) => updateField("youtube", event.target.value)}
              placeholder="YouTube"
            />
          </Field>
          <Field label="TikTok">
            <Input
              value={form.tiktok}
              onChange={(event) => updateField("tiktok", event.target.value)}
              placeholder="TikTok"
            />
          </Field>
          <Field label="Nama Bank">
            <Input
              value={form.bankName}
              onChange={(event) => updateField("bankName", event.target.value)}
              placeholder="Nama bank"
            />
          </Field>
          <Field label="Nomor Rekening">
            <Input
              value={form.bankAccount}
              onChange={(event) => updateField("bankAccount", event.target.value)}
              placeholder="Nomor rekening"
            />
          </Field>
          <Field label="Atas Nama">
            <Input
              value={form.bankHolder}
              onChange={(event) => updateField("bankHolder", event.target.value)}
              placeholder="Pemilik rekening"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konten Hero dan Narasi Utama</CardTitle>
          <CardDescription>
            Blok ini menjadi ringkasan awal proposal yang tampil di halaman publik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Judul Hero">
            <Input
              value={form.heroTitle}
              onChange={(event) => updateField("heroTitle", event.target.value)}
              placeholder="Judul utama profil"
            />
          </Field>
          <Field label="Subjudul Hero">
            <textarea
              className={textareaClassName}
              rows={4}
              value={form.heroSubtitle}
              onChange={(event) => updateField("heroSubtitle", event.target.value)}
              placeholder="Ringkasan gerakan dan arah pembangunan"
            />
          </Field>
          <Field label="Latar Belakang">
            <textarea
              className={textareaClassName}
              rows={5}
              value={form.backgroundText}
              onChange={(event) => updateField("backgroundText", event.target.value)}
              placeholder="Latar belakang pendirian"
            />
          </Field>
          <Field label="Pernyataan Visi">
            <textarea
              className={textareaClassName}
              rows={4}
              value={form.visionStatement}
              onChange={(event) => updateField("visionStatement", event.target.value)}
              placeholder="Visi utama"
            />
          </Field>
        </CardContent>
      </Card>

      <ListSection
        title="Pilar Utama"
        description="Empat pilar utama seperti Pusat Ibadah, Markas Dakwah, Ruang Tumbuh, dan Inklusif."
        onAdd={() =>
          updateField("visionItems", [
            ...form.visionItems,
            { title: "", description: "" },
          ])
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {form.visionItems.map((item, index) => (
            <Card key={`vision-${index}`} className="gap-4">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle>Pilar {index + 1}</CardTitle>
                  <CardDescription>Konten kartu pilar utama.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    updateField(
                      "visionItems",
                      form.visionItems.filter((_item, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Field label="Judul">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateVisionItem(index, "title", event.target.value)
                    }
                  />
                </Field>
                <Field label="Deskripsi">
                  <textarea
                    className={textareaClassName}
                    rows={4}
                    value={item.description}
                    onChange={(event) =>
                      updateVisionItem(index, "description", event.target.value)
                    }
                  />
                </Field>
              </CardContent>
            </Card>
          ))}
        </div>
      </ListSection>

      <ListSection
        title="Tahapan Pendirian"
        description="Daftar tahapan proses pembangunan yang tampil sebagai timeline publik."
        onAdd={() =>
          updateField("timelineItems", [
            ...form.timelineItems,
            { period: "", title: "", description: "" },
          ])
        }
      >
        <div className="grid gap-4">
          {form.timelineItems.map((item, index) => (
            <Card key={`timeline-${index}`} className="gap-4">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle>Tahapan {index + 1}</CardTitle>
                  <CardDescription>Periode, judul, dan keterangan.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    updateField(
                      "timelineItems",
                      form.timelineItems.filter((_item, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Field label="Periode">
                  <Input
                    value={item.period}
                    onChange={(event) =>
                      updateTimelineItem(index, "period", event.target.value)
                    }
                  />
                </Field>
                <Field label="Judul" className="md:col-span-2">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateTimelineItem(index, "title", event.target.value)
                    }
                  />
                </Field>
                <Field label="Deskripsi" className="md:col-span-3">
                  <textarea
                    className={textareaClassName}
                    rows={4}
                    value={item.description}
                    onChange={(event) =>
                      updateTimelineItem(index, "description", event.target.value)
                    }
                  />
                </Field>
              </CardContent>
            </Card>
          ))}
        </div>
      </ListSection>

      <ListSection
        title="Struktur dan Tupoksi Panitia"
        description="Section ini dipakai untuk menampilkan susunan tim dan tanggung jawabnya."
        onAdd={() =>
          updateField("committeeItems", [
            ...form.committeeItems,
            { section: "", leads: "", bullets: [""] },
          ])
        }
      >
        <div className="grid gap-4">
          {form.committeeItems.map((item, index) => (
            <Card key={`committee-${index}`} className="gap-4">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle>Tim {index + 1}</CardTitle>
                  <CardDescription>Nama seksi, penanggung jawab, dan tupoksi.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    updateField(
                      "committeeItems",
                      form.committeeItems.filter(
                        (_item, itemIndex) => itemIndex !== index
                      )
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nama Seksi">
                    <Input
                      value={item.section}
                      onChange={(event) =>
                        updateCommitteeItem(index, "section", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Lead / Personalia">
                    <Input
                      value={item.leads}
                      onChange={(event) =>
                        updateCommitteeItem(index, "leads", event.target.value)
                      }
                    />
                  </Field>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Butir Tugas</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => addCommitteeBullet(index)}
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Butir
                    </Button>
                  </div>

                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={`committee-${index}-bullet-${bulletIndex}`} className="flex gap-2">
                      <textarea
                        className={`${textareaClassName} min-h-20`}
                        rows={3}
                        value={bullet}
                        onChange={(event) =>
                          updateCommitteeBullet(index, bulletIndex, event.target.value)
                        }
                        placeholder={`Tugas ${bulletIndex + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0"
                        onClick={() => removeCommitteeBullet(index, bulletIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ListSection>

      <ListSection
        title="Sumber Dana dan Penggalangan"
        description="Item sumber dana yang akan ditampilkan sebagai kartu atau highlight publik."
        onAdd={() =>
          updateField("fundingItems", [
            ...form.fundingItems,
            { title: "", description: "" },
          ])
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {form.fundingItems.map((item, index) => (
            <Card key={`funding-${index}`} className="gap-4">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle>Sumber {index + 1}</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    updateField(
                      "fundingItems",
                      form.fundingItems.filter((_item, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Field label="Judul">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateFundingItem(index, "title", event.target.value)
                    }
                  />
                </Field>
                <Field label="Deskripsi">
                  <textarea
                    className={textareaClassName}
                    rows={4}
                    value={item.description}
                    onChange={(event) =>
                      updateFundingItem(index, "description", event.target.value)
                    }
                  />
                </Field>
              </CardContent>
            </Card>
          ))}
        </div>
      </ListSection>

      <ListSection
        title="Roadmap Implementasi"
        description="Tahapan tahunan pembangunan dan pematangan operasional markas dakwah."
        onAdd={() =>
          updateField("roadmapItems", [
            ...form.roadmapItems,
            { phase: "", title: "", description: "" },
          ])
        }
      >
        <div className="grid gap-4">
          {form.roadmapItems.map((item, index) => (
            <Card key={`roadmap-${index}`} className="gap-4">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle>Roadmap {index + 1}</CardTitle>
                  <CardDescription>Label fase, judul, dan fokus implementasi.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    updateField(
                      "roadmapItems",
                      form.roadmapItems.filter((_item, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Field label="Fase">
                  <Input
                    value={item.phase}
                    onChange={(event) =>
                      updateRoadmapItem(index, "phase", event.target.value)
                    }
                  />
                </Field>
                <Field label="Judul" className="md:col-span-2">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateRoadmapItem(index, "title", event.target.value)
                    }
                  />
                </Field>
                <Field label="Deskripsi" className="md:col-span-3">
                  <textarea
                    className={textareaClassName}
                    rows={4}
                    value={item.description}
                    onChange={(event) =>
                      updateRoadmapItem(index, "description", event.target.value)
                    }
                  />
                </Field>
              </CardContent>
            </Card>
          ))}
        </div>
      </ListSection>
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

function ListSection({
  title,
  description,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
