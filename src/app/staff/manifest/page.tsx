import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';

export default function ManifestPage() {
  return (
    <Page>
      <PageNav
        items={[{ label: 'Staf', href: '/staff' }, { label: 'Pemesanan' }]}
      />
      <PageHeader title="Pemesanan" />
      <PageSection></PageSection>
    </Page>
  );
}
