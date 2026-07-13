import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { SearchSection } from '@/components/SearchSection';
import { ReportSection } from '@/components/ReportSection';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AccessLink - Accessible Travel Made Easy',
  description: 'Find truly accessible travel options for wheelchair users. Search accessible Airbnbs, hotels, and airports with verified accessibility data.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <SearchSection />
      <ReportSection />
      <Footer />
    </main>
  );
}
