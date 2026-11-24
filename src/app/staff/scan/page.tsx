import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';

export default function ScanPage() {
  return (
    <Page>
      <PageNav
        items={[{ label: 'Staf', href: '/staff' }, { label: 'scan QR' }]}
      />
      <PageHeader title="Scan QR" />
      <PageSection></PageSection>
    </Page>
  );
}
