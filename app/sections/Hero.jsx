import { profile, projects } from "../content/site";
import HeroClock from "../components/HeroClock";
import ChatBox from "../components/Chatbox";

const featured = projects.find((p) => p.slug === "medwe") ?? projects[0];

export default function Hero() {
  return (
    <section id="hero" data-anchor className="relative isolate overflow-hidden text-white">
      <span id="home" aria-hidden="true" className="absolute top-0" />
      {/* Day-phase plate (CSS chooses it from html[data-phase]); decorative. */}
      <div aria-hidden="true" className="hero-art absolute inset-0 -z-20" />
      <div aria-hidden="true" className="hero-art-prev absolute inset-0 -z-20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(6,10,20,0.88)_0%,rgba(6,10,20,0.68)_42%,rgba(6,10,20,0.25)_75%,rgba(6,10,20,0.15)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[rgba(6,10,20,0.75)] to-transparent" />

      <div className="mx-auto grid min-h-[100svh] w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-28 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14 lg:pt-32">
        <div className="max-w-[44rem]">
          <p className="font-hero-script text-3xl text-amber-200 sm:text-4xl" aria-hidden="true">
            Hello,
          </p>
          <h1 data-anchor-heading className="mt-2 text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-white">
            I&apos;m {profile.name}.
          </h1>
          <p className="mt-5 text-lg text-amber-50/95 sm:text-xl">
            {profile.role} · {profile.education}
          </p>
          <p className="mt-2 font-hero-serif text-base italic text-amber-100/80">
            Articulate, poised, principled, vision-driven.
          </p>
          <p className="mt-6 max-w-[38rem] text-[1.02rem] leading-relaxed text-slate-100/90">{profile.heroSummary}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="inline-flex min-h-12 items-center rounded-full bg-amber-300 px-6 text-base font-semibold text-slate-950 transition-colors hover:bg-amber-200">
              View selected work
            </a>
            <a href="#contact" className="inline-flex min-h-12 items-center rounded-full border border-white/40 bg-white/10 px-6 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20">
              Contact
            </a>
            <a href={`mailto:${profile.email}`} className="inline-flex min-h-12 items-center px-2 text-base text-white/90 underline decoration-white/40 underline-offset-4 hover:decoration-white">
              {profile.email}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-white/15 bg-slate-950/45 px-5 py-4 text-sm backdrop-blur-sm sm:w-fit">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">Featured</span>
            <a href="#projects" className="font-medium text-white underline-offset-4 hover:underline">
              {featured.title} — {featured.subtitle}
            </a>
            <a href={featured.source} target="_blank" rel="noopener noreferrer" className="text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white">
              Source on GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <HeroClock />
          </div>
        </div>

        <div className="h-[30rem] w-full sm:h-[34rem]">
          <ChatBox />
        </div>
      </div>
    </section>
  );
}
