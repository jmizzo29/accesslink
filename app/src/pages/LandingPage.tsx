import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Shield, Users } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { SiteFooter } from '../components/SiteFooter';
import { ListingCard } from '../components/search/ListingCard';
import { HERO_PHOTO } from '../lib/listings/photos';
import { getSeedListings, getSeedStats } from '../lib/listings/seed';
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

const FEATURED_IDS = ['prop-001', 'prop-004', 'prop-010'];

export function LandingPage() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const featured = getSeedListings().filter((listing) => FEATURED_IDS.includes(listing.id));
  const stats = getSeedStats();

  function handleHeroSearch(event: FormEvent) {
    event.preventDefault();
    const location = city.trim() || 'New York, NY';
    navigate(`/search?location=${encodeURIComponent(location)}`);
  }

  return (
    <div className="min-h-screen w-full bg-[var(--cream)] text-[var(--ink)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <section className="relative min-h-[min(88vh,860px)] w-full overflow-hidden" aria-labelledby="hero-heading">
        <img
          src={HERO_PHOTO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[55%_40%]"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" aria-hidden />
        <AppNav variant="hero" />

        <div className="relative z-10 mx-auto flex min-h-[min(88vh,860px)] w-full max-w-[1180px] flex-col justify-end px-4 pb-16 pt-28 sm:px-8 sm:pb-24">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/75">
              Verified accessible places, by the community
            </p>
            <h1
              id="hero-heading"
              className="font-display mt-4 text-[clamp(2.8rem,8vw,5.2rem)] font-semibold leading-[0.98] tracking-tight text-white"
            >
              {PRODUCT_NAME}
            </h1>
            <p className="mt-6 max-w-xl text-[clamp(1.25rem,2.6vw,1.7rem)] font-semibold leading-snug text-white">
              {PRODUCT_TAGLINE}
            </p>
            <p className="mt-4 max-w-lg text-[18px] leading-relaxed text-white/90">
              Hotels, stays, airports, and wheelchair vans — filtered by the features that actually
              matter, ranked in plain English.
            </p>
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 rounded-3xl bg-white/95 p-3 shadow-2xl backdrop-blur sm:flex sm:items-center sm:gap-3 sm:p-3"
              aria-label="Search accessible places"
            >
              <label className="sr-only" htmlFor="hero-city">
                City
              </label>
              <div className="relative flex-1">
                <MapPin
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]"
                  aria-hidden
                />
                <input
                  id="hero-city"
                  type="search"
                  autoComplete="address-level2"
                  placeholder="Where are you going? e.g. New York, Miami"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-2xl border-0 bg-transparent py-3.5 pl-11 pr-4 text-[17px] text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/30"
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--teal)] px-7 text-[17px] font-semibold text-white hover:bg-[var(--teal-deep)] sm:mt-0 sm:w-auto"
              >
                <Search className="h-4 w-4" aria-hidden />
                Search
              </button>
            </form>
            <p className="mt-4 text-[14px] text-white/80">
              {stats.total} places · {stats.cities} cities · 8 accessibility filters
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/contribute"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-white px-7 text-[16px] font-semibold text-white hover:bg-white/10"
              >
                Share a place you trust
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="w-full">
        <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-8 sm:py-20" aria-labelledby="featured-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="font-display text-[32px] font-semibold tracking-tight sm:text-[40px]">
                Places travelers actually used
              </h2>
              <p className="mt-3 max-w-xl text-[18px] text-[var(--muted)]">
                Start with Harborview in New York, a Miami resort, or a WAV that shows up when the
                hotel van does not.
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex min-h-[44px] items-center font-semibold text-[var(--teal)] hover:underline"
            >
              Browse the catalog
            </Link>
          </div>
          <ul className="mt-10 grid list-none gap-6 p-0 lg:grid-cols-3">
            {featured.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} variant="cover" />
              </li>
            ))}
          </ul>
        </section>

        <section
          id="how-it-works"
          className="border-t border-[var(--sand)] bg-[var(--paper)]"
          aria-labelledby="why-heading"
        >
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-8 sm:py-24">
            <h2 id="why-heading" className="font-display text-[32px] font-semibold tracking-tight sm:text-[40px]">
              Why Access4All?
            </h2>
            <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-[var(--muted)]">
              Travel should work for everyone. Verified data, community wisdom, and thoughtful design —
              so you focus on the trip, not the guesswork.
            </p>
            <ul className="mt-12 grid list-none gap-5 sm:grid-cols-3">
              {WHY_ITEMS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-3xl border border-[var(--sand)] bg-[var(--cream)] p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--teal-soft)]">
                    <Icon className="h-5 w-5 text-[var(--teal)]" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-[22px] font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-[var(--muted)]">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-8 sm:py-20" aria-labelledby="tour-heading">
          <div className="rounded-[2rem] bg-[var(--teal)] px-8 py-12 text-white sm:px-14 sm:py-16">
            <h2 id="tour-heading" className="font-display text-[32px] font-semibold tracking-tight sm:text-[40px]">
              Ninety seconds to see if a stay will work
            </h2>
            <p className="mt-4 max-w-xl text-[18px] leading-relaxed text-white/85">
              Search New York for a roll-in shower, open Harborview, then match your needs in plain
              English. No account required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/demo"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-8 text-[17px] font-semibold text-[var(--teal)]"
              >
                Take the quick tour
              </Link>
              <Link
                to="/judge"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/40 px-8 text-[17px] font-semibold text-white hover:bg-white/10"
              >
                One-page overview
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
