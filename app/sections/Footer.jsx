import { profile } from "../content/site";
import FooterArt from "../components/FooterArt";

// Built at deploy time; avoids a hard-coded year without hydration risk.
const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden text-white">
      <FooterArt />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-end gap-6 px-6 pb-10 pt-40 md:flex-row md:items-end md:justify-between md:px-12">
        <div>
          <p className="text-2xl font-semibold">{profile.name}</p>
          <p className="text-white/80">
            {profile.role} · {profile.location}
          </p>
        </div>
        <nav aria-label="Elsewhere">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-white/90">
            <li>
              <a className="underline-offset-4 hover:underline" href={`mailto:${profile.email}`}>
                Email
              </a>
            </li>
            <li>
              <a className="underline-offset-4 hover:underline" href={profile.github} target="_blank" rel="noopener noreferrer">
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="underline-offset-4 hover:underline" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
        <p className="text-sm text-white/70">
          © {YEAR} {profile.name}
        </p>
      </div>
    </footer>
  );
}
