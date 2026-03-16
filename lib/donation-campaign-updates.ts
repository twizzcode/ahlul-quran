import { getPublicArticleType } from "@/lib/public-articles";

type LinkedArticleLike = {
  slug: string;
  title: string;
  tags: string[];
  category: {
    name: string;
    slug: string;
  } | null;
};

export function isDonationCampaignUpdateSchemaMismatchError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message;

  return (
    message.includes("does not exist in the current database") ||
    message.includes("Unknown field `updates`") ||
    message.includes("Unknown argument `updates`") ||
    message.includes("Unknown field `donationCampaignId`") ||
    message.includes("Unknown argument `donationCampaignId`") ||
    message.includes("Unknown field `donationCampaign`") ||
    message.includes("Unknown argument `donationCampaign`")
  );
}

export function getDonationCampaignUpdateHref(article: LinkedArticleLike) {
  const type = getPublicArticleType(article);
  return `/${type}/${article.slug}`;
}
