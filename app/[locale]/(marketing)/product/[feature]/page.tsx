import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FeaturePage } from '@/components/marketing/FeaturePage';
import { featureBySlug, PRODUCT_FEATURES } from '@/lib/product-features';
import { withSocial } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_FEATURES.map((f) => ({ feature: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ feature: string }> }): Promise<Metadata> {
  const { feature } = await params;
  const f = featureBySlug(feature);
  if (!f) return {};
  return localizeMeta(withSocial({ title: `${f.seoTitle} | Crescelo`, description: f.seoDescription, alternates: { canonical: `/product/${f.slug}` } }, `/product/${f.slug}`));
}

export default async function ProductFeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const { feature } = await params;
  const f = featureBySlug(feature);
  if (!f) notFound();
  return <FeaturePage feature={f} />;
}
