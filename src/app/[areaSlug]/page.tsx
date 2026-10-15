import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AREAS_LIST, AREAS_BY_SLUG } from "@/lib/areas-data";
import { AreaPageView } from "@/components/storefront/area-page-view";
import { getShopProducts } from "@/lib/get-shop-products";

interface AreaPageProps {
  params: Promise<{ areaSlug: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return AREAS_LIST.map((area) => ({
    areaSlug: area.slug,
  }));
}

export async function generateMetadata({
  params,
}: AreaPageProps): Promise<Metadata> {
  const { areaSlug } = await params;
  const area = AREAS_BY_SLUG[areaSlug];

  if (!area) {
    return {};
  }

  const at = area.name.endsWith("Street") ? "on" : "in";

  return {
    title: `Weed Delivery ${at} ${area.name}, DC | Torch Cannabis Delivery`,
    description: `Free same-day cannabis delivery ${at} ${area.name}, Washington, DC. Flower, pre-rolls, vapes and edibles. Pay cash at the door, 21+ only.`,
    alternates: {
      canonical: `https://torchdc.co/${area.slug}/`,
    },
  };
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { areaSlug } = await params;
  const area = AREAS_BY_SLUG[areaSlug];

  if (!area) {
    notFound();
  }

  const allProducts = await getShopProducts();
  const popularProducts = allProducts.filter((p) => p.isBestSeller || p.isNewArrival);

  return (
    <AreaPageView
      area={area}
      popularProducts={popularProducts.length >= 4 ? popularProducts : allProducts}
    />
  );
}
