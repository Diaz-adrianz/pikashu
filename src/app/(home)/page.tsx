import { Page, PageSection } from '@/components/shared/page';
import { TypingAnimation } from '@/components/ui/typing-animation';

export default function HomePage() {
  return (
    <Page className="bg-background">
      <PageSection id="hero" className="py-24">
        <h1 className="text-center typo-display">
          Pesan armada bersama Pikashu <br /> untuk perjalanan yang{' '}
          <TypingAnimation
            className="leading-tight text-primary"
            words={[
              'Cepat',
              'Hemat',
              'Nyaman',
              'Aman',
              'Tepat Waktu',
              'Bebas Ribet',
            ]}
            loop
          />
        </h1>
      </PageSection>
    </Page>
  );
}
