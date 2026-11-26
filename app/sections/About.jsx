import Image from "next/image";
import { profile } from "../content/site";
import Sunflower from "../components/Sunflower";
import { AboutGlobe, CopyEmail, PauseOffscreen } from "../components/AboutIslands";

const CARD = "relative overflow-hidden rounded-[30px] border border-[#d4d7cf] bg-[#f6f7f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_28px_rgba(121,126,112,0.12)]";

const TECH_ROWS = [
  ["HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind CSS", "Node.js", "Express", "MongoDB", "GitHub", "Docker"],
  ["TypeScript", "Vue.js", "Angular", "Firebase", "GraphQL", "Redux", "SASS", "Webpack", "Babel", "Git", "PostgreSQL"],
  ["Python", "Django", "Flask", "MySQL", "Redis", "Kubernetes", "Jenkins", "AWS", "Azure", "GCP"],
];

function Marquee({ items, reverse = false, className = "" }) {
  // Content is duplicated for a seamless loop; the copy is hidden from AT.
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        <span className="flex">
          {items.map((t, i) => (
            <span key={i} className="mx-3 whitespace-nowrap sm:mx-4">
              {t}
            </span>
          ))}
        </span>
        <span className="flex" aria-hidden="true">
          {items.map((t, i) => (
            <span key={i} className="mx-3 whitespace-nowrap sm:mx-4">
              {t}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" data-anchor aria-labelledby="about-title" className="bg-[#FEFFFC] px-5 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 id="about-title" data-anchor-heading className="mb-10 text-4xl font-semibold tracking-tight text-slate-900 sm:mb-14 md:text-6xl">
          About me
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Profile */}
          <article className={CARD}>
            <Image src="/newimages/vedant-profile.jpg" alt={`Portrait of ${profile.name}`} width={1080} height={720} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="h-[260px] w-full object-cover" />
            <div className="p-6">
              <h3 className="text-3xl font-bold text-[#2c2f2a]">Hi, I&apos;m {profile.name}</h3>
              <p className="mt-4 leading-relaxed text-[#4f544d]">{profile.aboutSummary}</p>
            </div>
            <PauseOffscreen className="pb-6 text-3xl text-[#8d9189]">
              <div aria-hidden="true">
                <Marquee items={Array(4).fill(profile.name)} />
              </div>
            </PauseOffscreen>
          </article>

          {/* Tech stack */}
          <article className={CARD}>
            <Image src="/newimages/cherry.png" alt="" width={1024} height={1024} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="h-[260px] w-full object-cover opacity-90" />
            <div className="p-6">
              <h3 className="text-2xl text-[#2c2f2a]">Tech stack</h3>
              <p className="mt-3 leading-relaxed text-[#4f544d]">
                I specialize in a variety of languages, frameworks, and tools, including HTML, CSS, JavaScript, React, Redux, Vue, Next.js, Node.js, Express, MongoDB, MySQL, GraphQL, Apollo Client, and Tailwind CSS, enabling me to build robust and scalable applications.
              </p>
            </div>
          </article>

          {/* Location / globe */}
          <article className={`${CARD} xl:row-span-2`}>
            <AboutGlobe />
            <div className="p-6">
              <h3 className="text-[1.35rem] leading-snug text-[#2c2f2a]">I&apos;m very flexible with time zone communications &amp; locations</h3>
              <p className="mt-3 text-[#4f544d]">I&apos;m based in {profile.location} and open to remote work worldwide.</p>
              <a href="#contact" className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#1C1C21] px-4 text-white hover:bg-black">
                <span className="relative flex h-3 w-3" aria-hidden="true">
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                Contact me
              </a>
              <div className="mt-8 flex justify-center">
                <Sunflower className="h-auto w-[160px] sm:w-[220px] lg:w-[260px]" />
              </div>
            </div>
          </article>

          {/* Passion */}
          <article className={`${CARD} md:col-span-2`}>
            <Image src="/newimages/coast.png" alt="" width={1024} height={412} sizes="(max-width: 768px) 100vw, 66vw" className="h-auto w-full object-cover opacity-90" />
            <div className="p-6">
              <h3 className="text-2xl text-[#2c2f2a]">My passion for coding</h3>
              <p className="mt-3 leading-relaxed text-[#4f544d]">
                I love solving problems and building things through code. Programming isn&apos;t just my profession—it&apos;s my passion. I enjoy exploring new technologies, and enhancing my skills.
              </p>
              <PauseOffscreen className="mx-auto mt-6 flex flex-col gap-5 rounded-2xl border border-[#d4d7cf] bg-[#eef1e6] py-6 text-sm text-[#4f564c] sm:w-4/5 sm:text-base">
                <h4 className="sr-only">Technologies I have worked with</h4>
                {TECH_ROWS.map((row, i) => (
                  <Marquee key={i} items={row} reverse={i % 2 === 1} />
                ))}
              </PauseOffscreen>
            </div>
          </article>

          {/* Contact card */}
          <article className={CARD}>
            <Image src="/newimages/rooftop.png" alt="" width={1024} height={1024} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="h-[240px] w-full object-cover object-center opacity-90" />
            <div className="p-6">
              <h3 className="mb-4 text-center font-semibold text-[#2c2f2a]">Contact me</h3>
              <CopyEmail email={profile.email} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
