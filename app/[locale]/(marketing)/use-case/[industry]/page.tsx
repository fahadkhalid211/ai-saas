import { localizeMetaEnglishOnly } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IndustryPage } from '@/components/marketing/IndustryPage';
import { INDUSTRIES, industryBySlug } from '@/lib/industries';
import { withSocial } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await params;
  const i = industryBySlug(industry);
  if (!i) return {};
  const path = `/use-case/${i.slug}`;
  return localizeMetaEnglishOnly(withSocial({ title: `${i.seoTitle} | Crescelo`, description: i.seoDescription, alternates: { canonical: path } }, path), { path });
}

export default async function IndustryRoute({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params;
  const i = industryBySlug(industry);
  if (!i) notFound();
  return <IndustryPage industry={i} />;
}
