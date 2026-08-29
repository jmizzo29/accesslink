import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Users } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { SiteFooter } from '../components/SiteFooter';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '../lib/constants';

const WHY_ITEMS = [
  {
    icon: MapPin,
    title: 'Verified before you book',
    body: 'Ramp widths, elevators, roll-in showers, and parking — confirmed by travelers who have been there.',
  },
  {
    icon: Users,
    title: 'Community-driven',
    body: 'Anyone can contribute a hotel, Airbnb stay, or wheelchair van. Others search the shared catalog.',
  },
  {
    icon: Shield,
    title: 'Built for dignity',
    body: 'Clear information, respectful design, and honest empty states. Travel planning without the anxiety.',
  },
] as const;

function FeedbackSection() {
  const subject = encodeURIComponent('Access4All feedback');
  const body = encodeURIComponent(
    `Page: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nYour message:\n`,
  );

  return (
    <section id="feedback" className="border-t border-[var(--sand)] pt-16" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading" className="font-display text-[28px] font-semibold tracking-tight sm:text-[32px]">
        Send feedback
      </h2>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[var(--muted)]">
        Help us improve Access4All. Your mail app opens with a pre-filled message — you choose Send.
      </p>
      <a
        href={`mailto:hello@access4all.app?subject=${subject}&body=${body}`}
        className="mt-8 inline-flex min-h-[48px] items-center text-[17px] font-medium text-[var(--teal)] underline decoration-[var(--teal)]/30 underline-offset-4 hover:decoration-[var(--teal)]"
      >
        Email your feedback
      </a>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--cream)] text-[var(--ink)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <section className="hero-dunes relative min-h-[min(92vh,880px)] w-full overflow-hidden" aria-labelledby="hero-heading">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-black/20"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path fill="currentColor" d="M0 96l80-10c80-11 240-32 400-21s320 53 480 58 320-21 400-32l80-10v69H0z" />
        </svg>
        <AppNav variant="hero" />

        <div className="relative z-10 mx-auto flex min-h-[min(92vh,880px)] w-full max-w-[1200px] flex-col justify-center px-4 pb-20 pt-24 sm:px-8">
          <div className="max-w-xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Verified accessible places, by the community
            </p>
            <h1
              id="hero-heading"
              className="font-display mt-4 max-w-[14ch] text-[clamp(2.75rem,9vw,4.75rem)] font-semibold leading-[1.02] tracking-tight text-white"
            >
              {PRODUCT_NAME}
            </h1>
            <p className="mt-5 max-w-md text-[clamp(1.2rem,2.8vw,1.55rem)] font-semibold leading-snug text-white">
              {PRODUCT_TAGLINE}
            </p>
            <p className="mt-4 max-w-md text-[17px] font-medium leading-relaxed text-white/90 sm:text-[18px]">
              Filter hotels, stays, airports, and wheelchair vans by real features — then rank by
              plain-English needs and anchor a verification on Monad.
            </p>

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/contribute"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-9 text-[17px] font-semibold text-[var(--teal)] shadow-lg hover:scale-[1.02] sm:w-auto"
              >
                Contribute a place
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/search"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white bg-transparent px-8 text-[16px] font-semibold text-white hover:bg-white/12 sm:w-auto"
              >
                Search the catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="w-full bg-[var(--cream)]">
        <section
          id="how-it-works"
          className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-8 sm:py-24"
          aria-labelledby="why-heading"
        >
          <h2 id="why-heading" className="font-display text-[32px] font-semibold tracking-tight sm:text-[40px]">
            Why Access4All?
          </h2>
          <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-[var(--muted)] sm:text-[19px]">
            Travel should work for everyone. Verified data, community wisdom, and thoughtful design —
            so you focus on the adventure, not the obstacles.
          </p>

          <ul className="mt-12 grid list-none gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6">
            {WHY_ITEMS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-[var(--sand)] bg-[var(--paper)] p-6 shadow-sm sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--teal-soft)]">
                  <Icon className="h-5 w-5 text-[var(--teal)]" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-[20px] font-semibold tracking-tight sm:text-[21px]">{title}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-[var(--muted)] sm:text-[17px]">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full border-t border-[var(--sand)] bg-[var(--paper)]" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:px-8 sm:py-24">
            <h2 id="cta-heading" className="font-display text-[32px] font-semibold tracking-tight sm:text-[40px]">
              Ready for the 90-second path?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[18px] leading-relaxed text-[var(--muted)] sm:text-[19px]">
              Run the judge demo, or print the one-page brief for the table.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/demo"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--teal)] px-8 text-[17px] font-semibold text-white hover:bg-[var(--teal-deep)]"
              >
                Start judge demo
              </Link>
              <Link
                to="/judge"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--sand)] bg-[var(--paper)] px-8 text-[17px] font-semibold hover:border-[var(--muted)]"
              >
                Print judge brief
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-8 sm:pb-24">
          <FeedbackSection />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
