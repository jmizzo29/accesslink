import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Shield } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '../lib/constants';

/** Original generated asset — local only; no third-party stock photos.
 *  Must use Vite BASE_URL so portfolio deploys resolve under /portfolio/access4all/app/. */
const HERO_IMAGE = {
  src: `${import.meta.env.BASE_URL}accesslink-hero.webp`,
  alt: 'Step-free hotel entrance with a wide ramp and glass doors in soft morning light',
} as const;

const WHY_ITEMS = [
  {
    icon: MapPin,
    title: 'Verified before you book',
    body: 'Ramp widths, elevators, roll-in showers, and parking — confirmed by travelers who have been there.',
  },
  {
    icon: Users,
    title: 'Community-driven — like GitHub',
    body: 'Anyone can contribute a hotel, Airbnb, or wheelchair van. Others search the shared catalog. Publish via GitHub so the whole community benefits.',
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
    <section id="feedback" className="border-t border-[#d2d2d7] pt-16" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading" className="font-display text-[28px] font-semibold tracking-tight text-[#1d1d1f] sm:text-[32px]">
        Send feedback
      </h2>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#6e6e73]">
        Help us improve Access4All. Your mail app opens with a pre-filled message — you choose Send.
      </p>
      <a
        href={`mailto:hello@restarto.ai?subject=${subject}&body=${body}`}
        className="mt-8 inline-flex min-h-[48px] items-center text-[17px] font-medium text-[#0f4c5c] underline decoration-[#0f4c5c]/30 underline-offset-4 transition-colors hover:decoration-[#0f4c5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f4c5c]"
      >
        Email your feedback
      </a>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="a4a-landing min-h-screen w-full bg-white text-[#1d1d1f] antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[#0f4c5c] focus:outline focus:outline-2 focus:outline-[#0f4c5c]"
      >
        Skip to main content
      </a>

      <section
        className="a4a-hero entry-plate marketing-nav forge-shell-marketing-hero relative min-h-[min(92vh,900px)] w-full overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0" aria-hidden>
          <img
            src={HERO_IMAGE.src}
            alt=""
            className="a4a-hero-img h-full w-full object-cover object-[center_35%]"
            width={1920}
            height={1080}
            loading="eager"
            fetchPriority="high"
          />
          {/* Soft vignette only — no dark “header band” at the top */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#0f4c5c]/40 to-[#061820]/88" />
        </div>

        <div className="relative z-10 flex min-h-[min(92vh,900px)] w-full flex-col">
          <AppNav variant="hero" />

          <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-4 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24">
            <h1
              id="hero-heading"
              className="font-display max-w-[14ch] text-[clamp(2.75rem,9vw,4.75rem)] font-semibold leading-[1.02] tracking-tight text-white"
            >
              Access4All
            </h1>
            <p className="mt-5 max-w-xl text-[clamp(1.15rem,2.8vw,1.5rem)] font-medium leading-snug text-teal-50/95">
              I stopped trusting “accessible” labels. Now I verify the features that matter.
            </p>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/85 sm:text-[18px]">
              {PRODUCT_TAGLINE} — filter by roll-in showers and step-free entry, match your needs in
              plain English, and anchor community verifications on Monad.
            </p>

            <div className="mt-10 flex w-full max-w-lg flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                to="/contribute"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-9 text-[17px] font-semibold text-[#0f4c5c] shadow-lg shadow-slate-900/30 transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              >
                Contribute a place
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/search"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 text-[16px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              >
                Search the catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="w-full bg-[#f5f5f7]">
        <section
          id="how-it-works"
          className="how-it-works mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-8 sm:py-24"
          aria-labelledby="why-heading"
        >
          <h2
            id="why-heading"
            className="font-display text-[32px] font-semibold tracking-tight text-[#1d1d1f] sm:text-[40px]"
          >
            Why Access4All?
          </h2>
          <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-[#6e6e73] sm:text-[19px]">
            Travel should work for everyone. Verified data, community wisdom, and thoughtful design —
            so you focus on the adventure, not the obstacles.
          </p>

          <ul className="mt-12 grid list-none gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6">
            {WHY_ITEMS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-[#d2d2d7] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f4c5c]/10">
                  <Icon className="h-5 w-5 text-[#0f4c5c]" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-[20px] font-semibold tracking-tight text-[#1d1d1f] sm:text-[21px]">
                  {title}
                </h3>
                <p className="mt-3 text-[16px] leading-relaxed text-[#6e6e73] sm:text-[17px]">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full border-t border-[#d2d2d7] bg-white" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:px-8 sm:py-24">
            <h2
              id="cta-heading"
              className="font-display text-[32px] font-semibold tracking-tight text-[#1d1d1f] sm:text-[40px]"
            >
              Ready for the 90-second path?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[18px] leading-relaxed text-[#6e6e73] sm:text-[19px]">
              Run the judge demo, or print the one-page brief for the table.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                to="/demo"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0f4c5c] px-8 text-[17px] font-semibold text-white transition-colors hover:bg-[#0a3540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f4c5c]"
              >
                Start judge demo
              </Link>
              <Link
                to="/judge"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#d2d2d7] bg-white px-8 text-[17px] font-semibold text-[#1d1d1f] transition-colors hover:border-[#86868b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f4c5c]"
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

      <footer className="w-full border-t border-[#d2d2d7] bg-white py-10">
        <p className="text-center text-[13px] text-[#86868b]">
          &copy; {new Date().getFullYear()} {PRODUCT_NAME}. {PRODUCT_TAGLINE}
        </p>
        <p className="mt-2 text-center text-[12px] text-[#86868b]">
          Beta — curated demo stays and live open-map places are labeled in search.
        </p>
      </footer>
    </div>
  );
}
