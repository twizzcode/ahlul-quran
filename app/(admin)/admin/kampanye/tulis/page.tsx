import { asc, isNull } from "drizzle-orm";
import { DashboardCampaignCreateForm } from "@/components/dashboard/donations/dashboard-campaign-create-form";
import { db } from "@/src";
import { gallery } from "@/src/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardKampanyeTulisPage() {
  const galleries = await db.query.gallery.findMany({
    where: isNull(gallery.donationCampaignId),
    with: { images: true },
    orderBy: [asc(gallery.createdAt)],
  });

  return (
    <DashboardCampaignCreateForm
      variant="page"
      galleryOptions={galleries.map((item) => ({
        id: item.id,
        title: item.title,
        createdAt: item.createdAt.toISOString(),
        imageCount: item.images.length,
        coverImage: item.images.sort((a, b) => a.order - b.order)[0]?.url ?? null,
      }))}
    />
  );
}
