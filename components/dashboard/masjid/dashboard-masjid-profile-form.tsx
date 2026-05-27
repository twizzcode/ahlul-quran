"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { R2ImageUploadField } from "@/components/shared/r2-image-upload-field";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  CommitteeItem,
  DonationBankAccount,
  MasjidProfileData,
  TimelineItem,
} from "@/lib/masjid/masjid-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UPLOAD_FOLDERS } from "@/lib/storage/upload-folders";

type DashboardMasjidProfileFormProps = {
  initialData: MasjidProfileData;
  section?:
    | "general"
    | "timeline"
    | "committee"
    | "social"
    | "bank";
};

const textareaClassName =
  "flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type IndexedCommitteeItem = {
  item: CommitteeItem;
  index: number;
};

function isCommitteeAdvisory(section: string) {
  return /penasehat|pembina/i.test(section);
}

function isCommitteeLeader(section: string) {
  return /ketua|pic utama/i.test(section) && !/wakil/i.test(section);
}

function isCommitteeViceLeader(section: string) {
  return /wakil ketua/i.test(section);
}

function isCommitteeSecretary(section: string) {
  return /sekretaris/i.test(section);
}

function isCommitteeTreasurer(section: string) {
  return /bendahara/i.test(section);
}

function createCommitteeItem(section: string): CommitteeItem {
  return {
    section,
    leads: "",
    imageUrl: "",
    bullets: [],
  };
}

function normalizeCommitteeItemsForEditor(items: CommitteeItem[]) {
  return items.flatMap((item) => {
    if (!isCommitteeAdvisory(item.section)) {
      return [item];
    }

    const advisoryNames = item.leads
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .filter((name) => !/^kasepuhan$/i.test(name));

    if (advisoryNames.length <= 1) {
      return [item];
    }

    return advisoryNames.map((name, index) => ({
      ...item,
      section: `Penasehat ${index + 1}`,
      leads: name,
      imageUrl: "",
    }));
  });
}

export function DashboardMasjidProfileForm({
  initialData,
  section = "general",
}: DashboardMasjidProfileFormProps) {
  const router = useRouter();
  const initialFormState = {
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
    qrisEnabled: initialData.qrisEnabled,
    qrisImageUrl: initialData.qrisImageUrl,
    donationBankAccounts: initialData.donationBankAccounts,
    bankName: initialData.bankName,
    bankAccount: initialData.bankAccount,
    bankHolder: initialData.bankHolder,
    backgroundText: initialData.backgroundText,
    visionStatement: initialData.visionStatement,
    visionItems: initialData.visionItems,
    timelineItems: initialData.timelineItems,
    committeeItems: normalizeCommitteeItemsForEditor(initialData.committeeItems),
    fundingItems: initialData.fundingItems,
    roadmapItems: initialData.roadmapItems,
  };
  const [form, setForm] = useState(initialFormState);
  const [savedSnapshot, setSavedSnapshot] = useState(
    JSON.stringify(initialFormState),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const savedFormState = JSON.parse(savedSnapshot) as typeof initialFormState;
  const isDirty = JSON.stringify(form) !== savedSnapshot;
  const isSocialDirty =
    JSON.stringify({
      facebook: form.facebook,
      instagram: form.instagram,
      youtube: form.youtube,
      tiktok: form.tiktok,
    }) !==
    JSON.stringify({
      facebook: savedFormState.facebook,
      instagram: savedFormState.instagram,
      youtube: savedFormState.youtube,
      tiktok: savedFormState.tiktok,
    });
  const committeeEntries: IndexedCommitteeItem[] = form.committeeItems.map((item, index) => ({
    item,
    index,
  }));
  const advisoryEntries = committeeEntries.filter(({ item }) => isCommitteeAdvisory(item.section));
  const leaderEntries = committeeEntries.filter(
    ({ item }) => isCommitteeLeader(item.section) || isCommitteeViceLeader(item.section),
  );
  const adminEntries = committeeEntries.filter(
    ({ item }) => isCommitteeSecretary(item.section) || isCommitteeTreasurer(item.section),
  );
  const sectionEntries = committeeEntries.filter(
    ({ item }) =>
      !isCommitteeAdvisory(item.section) &&
      !isCommitteeLeader(item.section) &&
      !isCommitteeViceLeader(item.section) &&
      !isCommitteeSecretary(item.section) &&
      !isCommitteeTreasurer(item.section),
  );

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTimelineItem(index: number, key: keyof TimelineItem, value: string) {
    updateField(
      "timelineItems",
      form.timelineItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function updateCommitteeItem(
    index: number,
    key: "section" | "leads" | "imageUrl",
    value: string,
  ) {
    updateField(
      "committeeItems",
      form.committeeItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function removeCommitteeItem(index: number) {
    updateField(
      "committeeItems",
      form.committeeItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function addCommitteeItem(section: string) {
    updateField("committeeItems", [...form.committeeItems, createCommitteeItem(section)]);
  }

  function updateDonationBankAccount(
    index: number,
    key: keyof DonationBankAccount,
    value: DonationBankAccount[keyof DonationBankAccount],
  ) {
    updateField(
      "donationBankAccounts",
      form.donationBankAccounts.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function isDonationBankAccountReady(item: DonationBankAccount) {
    return Boolean(
      item.bankName.trim() && item.bankAccount.trim() && item.bankHolder.trim(),
    );
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

      setSavedSnapshot(JSON.stringify(form));
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

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {section === "general" ? (
        <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
          <CardTitle>Kontak dan Lokasi</CardTitle>
          <CardDescription>
            Dipakai untuk contact us, footer, halaman profile, dan kebutuhan informasi publik.
          </CardDescription>
          </div>
          <SectionSaveButton isSaving={isSaving} isDirty={isSocialDirty} />
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

        </>
      ) : null}

      {section === "timeline" ? (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
          <CardTitle>Tahapan Pendirian</CardTitle>
          <CardDescription>
            Kelola tiap tahapan dalam grid card agar lebih mudah discan saat mengisi.
          </CardDescription>
          </div>
          <SectionSaveButton isSaving={isSaving} isDirty={isDirty} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {form.timelineItems.map((item, index) => (
            <DynamicItemCard
              key={`timeline-${index}`}
              title={`Tahapan ${index + 1}`}
              className="rounded-2xl border-emerald-100 bg-white shadow-sm"
              onRemove={() =>
                updateField(
                  "timelineItems",
                  form.timelineItems.filter((_, itemIndex) => itemIndex !== index)
                )
              }
            >
              <div className="grid gap-4">
                <Field label="Periode">
                  <Input
                    value={item.period}
                    onChange={(event) => updateTimelineItem(index, "period", event.target.value)}
                    placeholder="Agustus 2025"
                  />
                </Field>
                <Field label="Judul">
                  <Input
                    value={item.title}
                    onChange={(event) => updateTimelineItem(index, "title", event.target.value)}
                    placeholder="Pembentukan Panitia"
                  />
                </Field>
                <Field label="Deskripsi">
                  <textarea
                    className={textareaClassName}
                    rows={4}
                    value={item.description}
                    onChange={(event) =>
                      updateTimelineItem(index, "description", event.target.value)
                    }
                    placeholder="Jelaskan ringkas tahap ini."
                  />
                </Field>
              </div>
            </DynamicItemCard>
          ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() =>
              updateField("timelineItems", [
                ...form.timelineItems,
                { period: "", title: "", description: "" },
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Tambah Tahapan
          </Button>
        </CardContent>
      </Card>
      ) : null}

      {section === "committee" ? (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
          <CardTitle>Struktur</CardTitle>
          <CardDescription>
            Susun level struktur seperti tampilan frontend dan upload foto untuk tiap orang bila perlu.
          </CardDescription>
          </div>
          <SectionSaveButton isSaving={isSaving} isDirty={isDirty} />
        </CardHeader>
        <CardContent className="space-y-6">
          <CommitteeLevelSection
            title="Level 1 · Penasehat"
            description="Baris paling atas pada struktur frontend."
            items={advisoryEntries}
            addLabel="Tambah Penasehat"
            onAdd={() => addCommitteeItem(`Penasehat ${advisoryEntries.length + 1}`)}
          >
            {(entry) => (
              <CommitteeMemberFields
                item={entry.item}
                index={entry.index}
                onChange={updateCommitteeItem}
                onRemove={removeCommitteeItem}
                setErrorMessage={setErrorMessage}
              />
            )}
          </CommitteeLevelSection>

          <CommitteeLevelSection
            title="Level 2 · Ketua dan Wakil"
            description="Level utama setelah penasehat."
            items={leaderEntries}
            addLabel="Tambah Ketua / Wakil"
            onAdd={() =>
              addCommitteeItem(
                leaderEntries.some(({ item }) => isCommitteeLeader(item.section))
                  ? "Wakil Ketua"
                  : "Ketua / PIC Utama",
              )
            }
          >
            {(entry) => (
              <CommitteeMemberFields
                item={entry.item}
                index={entry.index}
                onChange={updateCommitteeItem}
                onRemove={removeCommitteeItem}
                setErrorMessage={setErrorMessage}
              />
            )}
          </CommitteeLevelSection>

          <CommitteeLevelSection
            title="Level 3 · Sekretaris dan Bendahara"
            description="Level administrasi yang tampil di bawah ketua dan wakil."
            items={adminEntries}
            addLabel="Tambah Sekretaris / Bendahara"
            onAdd={() =>
              addCommitteeItem(
                adminEntries.some(({ item }) => isCommitteeSecretary(item.section))
                  ? "Bendahara"
                  : "Sekretaris",
              )
            }
          >
            {(entry) => (
              <CommitteeMemberFields
                item={entry.item}
                index={entry.index}
                onChange={updateCommitteeItem}
                onRemove={removeCommitteeItem}
                setErrorMessage={setErrorMessage}
              />
            )}
          </CommitteeLevelSection>

          <CommitteeLevelSection
            title="Level 4 · Seksi"
            description="Bagian paling bawah untuk seksi-seksi pendukung."
            items={sectionEntries}
            addLabel="Tambah Seksi"
            onAdd={() => addCommitteeItem("Seksi Baru")}
          >
            {(entry) => (
              <CommitteeMemberFields
                item={entry.item}
                index={entry.index}
                onChange={updateCommitteeItem}
                onRemove={removeCommitteeItem}
                setErrorMessage={setErrorMessage}
              />
            )}
          </CommitteeLevelSection>
        </CardContent>
      </Card>
      ) : null}

      {section === "social" ? (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
          <CardTitle>Sosial Media</CardTitle>
          <CardDescription>
            Link ini dipakai di footer dan titik kontak publik lainnya.
          </CardDescription>
          </div>
          <SectionSaveButton isSaving={isSaving} isDirty={isDirty} />
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
      ) : null}

      {section === "bank" ? (
      <Card>
          <CardHeader className="flex flex-col gap-4 space-y-0 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <CardTitle>Metode Donasi</CardTitle>
              <CardDescription>
                QRIS di kiri, rekening bank di kanan. Masing-masing bisa diaktifkan atau dinonaktifkan.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-lg px-4"
                onClick={() =>
                  updateField("donationBankAccounts", [
                    ...form.donationBankAccounts,
                    {
                      bankName: "",
                      bankAccount: "",
                      bankHolder: "",
                      logoUrl: "",
                      isActive: true,
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                Tambah Bank
              </Button>
              <SectionSaveButton isSaving={isSaving} isDirty={isDirty} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-2xl border border-border/80 bg-muted/15 p-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">QRIS</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload QRIS dan atur apakah metode ini aktif ditampilkan.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-3">
                  <Checkbox
                    checked={form.qrisEnabled}
                    onCheckedChange={(checked) =>
                      updateField("qrisEnabled", checked === true)
                    }
                    id="qris-enabled"
                  />
                  <label htmlFor="qris-enabled" className="text-sm font-medium">
                    Aktifkan QRIS
                  </label>
                </div>

                <R2ImageUploadField
                  value={form.qrisImageUrl}
                  folder={UPLOAD_FOLDERS.profileDonationQris}
                  onChange={(value) => updateField("qrisImageUrl", value)}
                  description="Upload gambar QRIS."
                  naturalPreview
                  previewFrameClassName="min-h-[320px]"
                  emptyStateClassName="min-h-[260px]"
                  onError={(message) => {
                    setErrorMessage(message);
                    toast.error(message);
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">Rekening Bank</h3>
                  <p className="text-sm text-muted-foreground">
                    Tambahkan rekening bank beserta logo dan status aktifnya.
                  </p>
                </div>

                <div
                  className={`grid gap-4 ${
                    form.donationBankAccounts.length > 1 ? "2xl:grid-cols-2" : "grid-cols-1"
                  }`}
                >
              {form.donationBankAccounts.map((item, index) => (
                (() => {
                  const isBankReady = isDonationBankAccountReady(item);

                  return (
                <DynamicItemCard
                  key={`donation-bank-${index}`}
                  title={`Bank ${index + 1}`}
                  onRemove={() =>
                    updateField(
                      "donationBankAccounts",
                      form.donationBankAccounts.length > 1
                        ? form.donationBankAccounts.filter(
                            (_, itemIndex) => itemIndex !== index,
                          )
                        : [
                            {
                              bankName: "",
                              bankAccount: "",
                              bankHolder: "",
                              logoUrl: "",
                              isActive: true,
                            },
                          ],
                    )
                  }
                >
                  <div className="grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)]">
                    <R2ImageUploadField
                      value={item.logoUrl}
                      folder={UPLOAD_FOLDERS.profileDonationBanks}
                      onChange={(value) =>
                        updateDonationBankAccount(index, "logoUrl", value)
                      }
                      label="Logo Bank"
                      description="Upload logo atau visual bank."
                      className="max-w-[180px]"
                      previewFrameClassName="aspect-square"
                      previewImageClassName="object-contain p-3"
                      emptyStateClassName="aspect-square min-h-[180px] px-4"
                      onError={(message) => {
                        setErrorMessage(message);
                        toast.error(message);
                      }}
                    />

                    <div className="grid gap-4">
                      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-3">
                        <Checkbox
                          checked={isBankReady && item.isActive}
                          disabled={!isBankReady}
                          onCheckedChange={(checked) =>
                            updateDonationBankAccount(
                              index,
                              "isActive",
                              checked === true,
                            )
                          }
                          id={`bank-active-${index}`}
                        />
                        <label
                          htmlFor={`bank-active-${index}`}
                          className={`text-sm font-medium ${!isBankReady ? "text-muted-foreground" : ""}`}
                        >
                          Aktifkan rekening ini
                        </label>
                      </div>
                      {!isBankReady ? (
                        <p className="text-xs text-muted-foreground">
                          Isi nama bank, nomor rekening, dan atas nama dulu untuk mengaktifkan rekening.
                        </p>
                      ) : null}

                      <Field label="Nama Bank">
                        <Input
                          value={item.bankName}
                          onChange={(event) =>
                            updateDonationBankAccount(
                              index,
                              "bankName",
                              event.target.value,
                            )
                          }
                          placeholder="Bank Syariah Indonesia"
                        />
                      </Field>
                      <Field label="Nomor Rekening">
                        <Input
                          value={item.bankAccount}
                          onChange={(event) =>
                            updateDonationBankAccount(
                              index,
                              "bankAccount",
                              event.target.value,
                            )
                          }
                          placeholder="7123456789"
                        />
                      </Field>
                      <Field label="Atas Nama">
                        <Input
                          value={item.bankHolder}
                          onChange={(event) =>
                            updateDonationBankAccount(
                              index,
                              "bankHolder",
                              event.target.value,
                            )
                          }
                          placeholder="Yayasan Ahlul Qur'an"
                        />
                      </Field>
                    </div>
                  </div>
                </DynamicItemCard>
                  );
                })()
              ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </form>
  );
}

function CommitteeLevelSection({
  title,
  description,
  items,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  items: IndexedCommitteeItem[];
  addLabel: string;
  onAdd: () => void;
  children: (entry: IndexedCommitteeItem) => ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {items.map((entry) => (
          <div key={`${entry.item.section}-${entry.index}`}>
            {children(entry)}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" className="gap-2" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </section>
  );
}

function CommitteeMemberFields({
  item,
  index,
  onChange,
  onRemove,
  setErrorMessage,
}: {
  item: CommitteeItem;
  index: number;
  onChange: (index: number, key: "section" | "leads" | "imageUrl", value: string) => void;
  onRemove: (index: number) => void;
  setErrorMessage: (message: string) => void;
}) {
  return (
    <DynamicItemCard
      title={item.section.trim() || `Struktur ${index + 1}`}
      onRemove={() => onRemove(index)}
    >
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        <R2ImageUploadField
          value={item.imageUrl}
          folder={UPLOAD_FOLDERS.profileCommittee}
          onChange={(value) => onChange(index, "imageUrl", value)}
          label="Foto"
          description="Opsional. Foto ini akan dipakai di struktur frontend."
          className="max-w-[220px]"
          previewFrameClassName="aspect-square"
          emptyStateClassName="aspect-square min-h-[220px] px-4"
          onError={(message) => {
            setErrorMessage(message);
            toast.error(message);
          }}
        />

        <div className="grid gap-4">
          <Field label="Jabatan">
            <Input
              value={item.section}
              onChange={(event) => onChange(index, "section", event.target.value)}
              placeholder="Penasehat 1"
            />
          </Field>
          <Field label="Nama">
            <Input
              value={item.leads}
              onChange={(event) => onChange(index, "leads", event.target.value)}
              placeholder="Nama yang tampil di struktur"
            />
          </Field>
        </div>
      </div>
    </DynamicItemCard>
  );
}

function DynamicItemCard({
  title,
  children,
  onRemove,
}: {
  title: string;
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function SectionSaveButton({
  isSaving,
  isDirty,
}: {
  isSaving: boolean;
  isDirty: boolean;
}) {
  return (
    <Button
      type="submit"
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
