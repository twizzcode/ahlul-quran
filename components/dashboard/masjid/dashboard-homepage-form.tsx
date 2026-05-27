"use client";

import type { ReactNode } from "react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import type {
  HomepageCtaCardItem,
  HomepageTestimonialItem,
  HomepageTestimonialPlatform,
  MasjidProfileData,
} from "@/lib/masjid/masjid-profile";
import { R2ImageUploadField } from "@/components/shared/r2-image-upload-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UPLOAD_FOLDERS } from "@/lib/storage/upload-folders";

type DashboardHomepageFormProps = {
  initialData: MasjidProfileData;
  campaigns: Array<{
    id: string;
    title: string;
  }>;
};

const textareaClassName =
  "flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const EMPTY_SELECT_VALUE = "__none__";

function serializeHomepageForm(value: unknown) {
  return JSON.stringify(value);
}

function getHeroSectionSnapshot(form: {
  bannerUrl: string;
  homepageFeatureBadge: string;
  homepageFeatureTitle: string;
  homepageFeatureDescription: string;
  homepageFeatureDonationEnabled: boolean;
  homepageFeatureCampaignId: string;
  homepageFeaturePrimaryButtonText: string;
  homepageFeatureProfileButtonText: string;
}) {
  return serializeHomepageForm({
    bannerUrl: form.bannerUrl,
    homepageFeatureBadge: form.homepageFeatureBadge,
    homepageFeatureTitle: form.homepageFeatureTitle,
    homepageFeatureDescription: form.homepageFeatureDescription,
    homepageFeatureDonationEnabled: form.homepageFeatureDonationEnabled,
    homepageFeatureCampaignId: form.homepageFeatureCampaignId,
    homepageFeaturePrimaryButtonText: form.homepageFeaturePrimaryButtonText,
    homepageFeatureProfileButtonText: form.homepageFeatureProfileButtonText,
  });
}

function getTestimonialsSectionSnapshot(form: {
  homepageTestimonials: HomepageTestimonialItem[];
}) {
  return serializeHomepageForm({
    homepageTestimonials: form.homepageTestimonials,
  });
}

function getCtaSectionSnapshot(form: {
  homepageCtaTitle: string;
  homepageCtaDescription: string;
  homepageCtaButtonText: string;
  homepageCtaCards: HomepageCtaCardItem[];
}) {
  return serializeHomepageForm({
    homepageCtaTitle: form.homepageCtaTitle,
    homepageCtaDescription: form.homepageCtaDescription,
    homepageCtaButtonText: form.homepageCtaButtonText,
    homepageCtaCards: form.homepageCtaCards,
  });
}

export function DashboardHomepageForm({ initialData, campaigns }: DashboardHomepageFormProps) {
  const router = useRouter();
  const ctaCards = Array.from({ length: 6 }, (_, index) => initialData.homepageCtaCards[index] ?? { title: "", imageUrl: "" });
  const initialForm = {
    name: initialData.name,
    description: initialData.description,
    foundationName: initialData.foundationName,
    movementName: initialData.movementName,
    logoUrl: initialData.logoUrl,
    bannerUrl: initialData.bannerUrl,
    heroTitle: initialData.heroTitle,
    heroSubtitle: initialData.heroSubtitle,
    homepageFeatureBadge: initialData.homepageFeatureBadge,
    homepageFeatureTitle: initialData.homepageFeatureTitle,
    homepageFeatureDescription: initialData.homepageFeatureDescription,
    homepageFeatureDonationEnabled: initialData.homepageFeatureDonationEnabled,
    homepageFeatureCampaignId: initialData.homepageFeatureCampaignId,
    homepageFeaturePrimaryButtonText: initialData.homepageFeaturePrimaryButtonText,
    homepageFeatureProfileButtonText: initialData.homepageFeatureProfileButtonText,
    homepageTestimonials: initialData.homepageTestimonials,
    homepageCtaTitle: initialData.homepageCtaTitle,
    homepageCtaDescription: initialData.homepageCtaDescription,
    homepageCtaButtonText: initialData.homepageCtaButtonText,
    homepageCtaCards: ctaCards,
  };
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(null);
  const [savedHeroSnapshot, setSavedHeroSnapshot] = useState(() =>
    getHeroSectionSnapshot(initialForm),
  );
  const [savedTestimonialsSnapshot, setSavedTestimonialsSnapshot] = useState(() =>
    getTestimonialsSectionSnapshot(initialForm),
  );
  const [savedCtaSnapshot, setSavedCtaSnapshot] = useState(() =>
    getCtaSectionSnapshot(initialForm),
  );
  const currentHeroSnapshot = useMemo(() => getHeroSectionSnapshot(form), [form]);
  const currentTestimonialsSnapshot = useMemo(
    () => getTestimonialsSectionSnapshot(form),
    [form],
  );
  const currentCtaSnapshot = useMemo(() => getCtaSectionSnapshot(form), [form]);
  const isHeroDirty = currentHeroSnapshot !== savedHeroSnapshot;
  const isTestimonialsDirty = currentTestimonialsSnapshot !== savedTestimonialsSnapshot;
  const isCtaDirty = currentCtaSnapshot !== savedCtaSnapshot;

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTestimonialItem<K extends keyof HomepageTestimonialItem>(
    index: number,
    key: K,
    value: HomepageTestimonialItem[K],
  ) {
    updateField(
      "homepageTestimonials",
      form.homepageTestimonials.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function updateCtaCardItem<K extends keyof HomepageCtaCardItem>(
    index: number,
    key: K,
    value: HomepageCtaCardItem[K],
  ) {
    updateField(
      "homepageCtaCards",
      form.homepageCtaCards.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const submittedSection = submitter?.dataset.section;

    try {
      const response = await fetch("/api/masjid-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menyimpan pengaturan homepage.");
      }

      toast.success("Homepage berhasil diperbarui.");
      if (submittedSection === "hero") {
        setSavedHeroSnapshot(currentHeroSnapshot);
      } else if (submittedSection === "testimonials") {
        setSavedTestimonialsSnapshot(currentTestimonialsSnapshot);
      } else if (submittedSection === "cta") {
        setSavedCtaSnapshot(currentCtaSnapshot);
      } else {
        setSavedHeroSnapshot(currentHeroSnapshot);
        setSavedTestimonialsSnapshot(currentTestimonialsSnapshot);
        setSavedCtaSnapshot(currentCtaSnapshot);
      }
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan pengaturan homepage.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4 md:pt-6">
      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
          <CardTitle>Hero Campaign Section</CardTitle>
          <CardDescription>
            Atur copy, campaign donasi, dan visual hero dalam satu layout yang menyatu.
          </CardDescription>
          </div>
          <SectionSaveButton isSaving={isSaving} isDirty={isHeroDirty} section="hero" />
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="grid gap-4">
            <Field label="Badge">
              <Input
                value={form.homepageFeatureBadge}
                onChange={(event) => updateField("homepageFeatureBadge", event.target.value)}
                placeholder="Yayasan Ahlul Qur'an Cinta Indonesia"
              />
            </Field>
            <Field label="Judul Utama">
              <Input
                value={form.homepageFeatureTitle}
                onChange={(event) => updateField("homepageFeatureTitle", event.target.value)}
                placeholder="Judul besar pada hero campaign"
              />
            </Field>
            <Field label="Deskripsi">
              <Input
                value={form.homepageFeatureDescription}
                onChange={(event) => updateField("homepageFeatureDescription", event.target.value)}
                placeholder="Deskripsi singkat pada hero campaign"
              />
            </Field>
            <Separator className="bg-border/80" />
            <label className="flex items-center gap-3">
              <Checkbox
                checked={form.homepageFeatureDonationEnabled}
                onCheckedChange={(checked) =>
                  updateField("homepageFeatureDonationEnabled", checked === true)
                }
              />
              <span className="text-sm font-medium">Tampilkan donasi dan progress</span>
            </label>
            {form.homepageFeatureDonationEnabled ? (
              <>
                <Field label="Campaign Donasi">
                  <Select
                    value={form.homepageFeatureCampaignId || EMPTY_SELECT_VALUE}
                    onValueChange={(value) =>
                      updateField(
                        "homepageFeatureCampaignId",
                        value === EMPTY_SELECT_VALUE ? "" : value,
                      )
                    }
                  >
                    <SelectTrigger className="bg-transparent">
                      <SelectValue placeholder="Pilih campaign aktif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>Pilih campaign aktif</SelectItem>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Teks Tombol Utama">
                    <Input
                      value={form.homepageFeaturePrimaryButtonText}
                      onChange={(event) =>
                        updateField("homepageFeaturePrimaryButtonText", event.target.value)
                      }
                      placeholder="Dukung Gerakan Semilyar Tangan"
                    />
                  </Field>
                  <Field label="Teks Tombol Profil">
                    <Input
                      value={form.homepageFeatureProfileButtonText}
                      onChange={(event) =>
                        updateField("homepageFeatureProfileButtonText", event.target.value)
                      }
                      placeholder="Lihat Profil Markas"
                    />
                  </Field>
                </div>
              </>
            ) : null}
          </div>

          <div className="lg:justify-self-end lg:w-full lg:max-w-[380px]">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <Field
                label="Hero Banner"
                className="space-y-2"
              >
                <R2ImageUploadField
                  value={form.bannerUrl}
                  folder={UPLOAD_FOLDERS.homepageMainHeroBanner}
                  onChange={(value) => updateField("bannerUrl", value)}
                  description="Upload background hero homepage."
                  onError={setErrorMessage}
                />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
          <CardTitle>Testimoni Homepage</CardTitle>
          <CardDescription>
            Kelola testimoni yang tampil di homepage. Setiap item bisa punya foto dan tombol link sosial.
          </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 rounded-lg px-4"
              onClick={() => {
                updateField("homepageTestimonials", [
                  ...form.homepageTestimonials,
                  {
                    quote: "",
                    name: "",
                    role: "",
                    imageUrl: "",
                    socialPlatform: "",
                    socialUrl: "",
                  },
                ]);
                setEditingTestimonialIndex(form.homepageTestimonials.length);
              }}
            >
              <Plus className="h-4 w-4" />
              Tambah Testimoni
            </Button>
            <SectionSaveButton
              isSaving={isSaving}
              isDirty={isTestimonialsDirty}
              section="testimonials"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {form.homepageTestimonials.length} testimoni tersimpan
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-background">
            {form.homepageTestimonials.length > 0 ? (
              <div className="divide-y divide-border/70">
                {form.homepageTestimonials.map((item, index) => (
                  <div
                    key={`testimonial-row-${index}`}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {item.name.trim() || `Testimoni ${index + 1}`}
                        </p>
                        {editingTestimonialIndex === index ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                            Sedang diedit
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.role.trim() || "Peran belum diisi"}
                        {item.socialPlatform ? ` • ${item.socialPlatform}` : " • tanpa link"}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                        {item.quote.trim() || "Isi testimoni belum diisi."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setEditingTestimonialIndex(index)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          updateField(
                            "homepageTestimonials",
                            form.homepageTestimonials.filter((_, itemIndex) => itemIndex !== index),
                          );
                          setEditingTestimonialIndex((current) => {
                            if (current === null) return null;
                            if (current === index) return null;
                            if (current > index) return current - 1;
                            return current;
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                Belum ada testimoni. Tambahkan item pertama untuk mulai mengisi.
              </div>
            )}
          </div>

          <Dialog
            open={editingTestimonialIndex !== null}
            onOpenChange={(open) => {
              if (!open) {
                setEditingTestimonialIndex(null);
              }
            }}
          >
            {editingTestimonialIndex !== null &&
            form.homepageTestimonials[editingTestimonialIndex] ? (
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>
                    Edit Testimoni {editingTestimonialIndex + 1}
                  </DialogTitle>
                  <DialogDescription>
                    Perubahan di modal ini akan tersimpan saat kamu klik Simpan Perubahan di halaman homepage.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="space-y-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                    <Field label="Foto" className="space-y-2">
                      <R2ImageUploadField
                        value={form.homepageTestimonials[editingTestimonialIndex].imageUrl}
                        folder={UPLOAD_FOLDERS.homepageTestimonials}
                        onChange={(value) =>
                          updateTestimonialItem(editingTestimonialIndex, "imageUrl", value)
                        }
                        description="Upload foto testimoni ke folder v1/homepage/testimonials."
                        onError={setErrorMessage}
                      />
                    </Field>
                    <div className="grid gap-4">
                      <Field label="Platform Tombol">
                        <Select
                          value={
                            form.homepageTestimonials[editingTestimonialIndex].socialPlatform ||
                            EMPTY_SELECT_VALUE
                          }
                          onValueChange={(value) =>
                            updateTestimonialItem(
                              editingTestimonialIndex,
                              "socialPlatform",
                              value === EMPTY_SELECT_VALUE
                                ? ""
                                : (value as HomepageTestimonialPlatform),
                            )
                          }
                        >
                          <SelectTrigger className="bg-transparent">
                            <SelectValue placeholder="Tanpa link" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={EMPTY_SELECT_VALUE}>Tanpa link</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="URL Link Sosial">
                        <Input
                          value={form.homepageTestimonials[editingTestimonialIndex].socialUrl}
                          onChange={(event) =>
                            updateTestimonialItem(
                              editingTestimonialIndex,
                              "socialUrl",
                              event.target.value,
                            )
                          }
                          placeholder="https://..."
                          disabled={
                            !form.homepageTestimonials[editingTestimonialIndex].socialPlatform
                          }
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Nama">
                        <Input
                          value={form.homepageTestimonials[editingTestimonialIndex].name}
                          onChange={(event) =>
                            updateTestimonialItem(editingTestimonialIndex, "name", event.target.value)
                          }
                          placeholder="Nama pemberi testimoni"
                        />
                      </Field>
                      <Field label="Peran / Keterangan">
                        <Input
                          value={form.homepageTestimonials[editingTestimonialIndex].role}
                          onChange={(event) =>
                            updateTestimonialItem(editingTestimonialIndex, "role", event.target.value)
                          }
                          placeholder="Jamaah Rutin / Donatur / Relawan"
                        />
                      </Field>
                    </div>
                    <Field label="Isi Testimoni">
                      <textarea
                        className={textareaClassName}
                        rows={6}
                        value={form.homepageTestimonials[editingTestimonialIndex].quote}
                        onChange={(event) =>
                          updateTestimonialItem(editingTestimonialIndex, "quote", event.target.value)
                        }
                        placeholder="Tulis isi testimoni"
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setEditingTestimonialIndex(null)}
                  >
                    <X className="h-4 w-4" />
                    Selesai
                  </Button>
                </div>
              </DialogContent>
            ) : null}
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>CTA Homepage</CardTitle>
            <CardDescription>
              Atur section ajakan utama setelah testimoni dengan 6 kartu visual tetap.
            </CardDescription>
          </div>
          <SectionSaveButton isSaving={isSaving} isDirty={isCtaDirty} section="cta" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4">
            <Field label="Judul Section">
              <Input
                value={form.homepageCtaTitle}
                onChange={(event) => updateField("homepageCtaTitle", event.target.value)}
                placeholder="Pembangunan Masjid Ahlul Qur'an"
              />
            </Field>
            <Field label="Deskripsi Section">
              <Input
                value={form.homepageCtaDescription}
                onChange={(event) => updateField("homepageCtaDescription", event.target.value)}
                placeholder="Deskripsi ajakan utama setelah testimoni"
              />
            </Field>
            <Field label="Teks Tombol">
              <Input
                value={form.homepageCtaButtonText}
                onChange={(event) => updateField("homepageCtaButtonText", event.target.value)}
                placeholder="Dukung Pembangunan"
              />
            </Field>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {form.homepageCtaCards.map((item, index) => (
                <div
                  key={`cta-card-${index}`}
                  className="grid gap-4 rounded-2xl border border-border/80 bg-background p-4"
                >
                  <Field label={`Gambar ${index + 1}`} className="space-y-2">
                    <R2ImageUploadField
                      value={item.imageUrl}
                      folder={UPLOAD_FOLDERS.homepageCtaCards}
                      onChange={(value) => updateCtaCardItem(index, "imageUrl", value)}
                      description=""
                      onError={setErrorMessage}
                    />
                  </Field>
                  <Field label="Judul Kartu">
                    <Input
                      value={item.title}
                      onChange={(event) => updateCtaCardItem(index, "title", event.target.value)}
                      placeholder={`Kartu ${index + 1}`}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function SectionSaveButton({
  isSaving,
  isDirty,
  section,
}: {
  isSaving: boolean;
  isDirty: boolean;
  section: "hero" | "testimonials" | "cta";
}) {
  return (
    <Button
      type="submit"
      data-section={section}
      disabled={isSaving || !isDirty}
      className="h-10 shrink-0 gap-2 rounded-lg px-4"
    >
      <Save className="h-4 w-4" />
      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
    </Button>
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
