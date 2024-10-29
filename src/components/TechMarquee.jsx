import React from "react";

const TechMarquee = () => {
  return (
    <div className="w-4/5 mx-auto my-8 bg-gray-920 text-gray-300 py-8 rounded-lg overflow-hidden">
      <div className="flex flex-col gap-8">
        {/* Row 1 */}
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            <span className="mx-4 text-lg">HTML</span>
            <span className="mx-4 text-lg">CSS</span>
            <span className="mx-4 text-lg">JavaScript</span>
            <span className="mx-4 text-lg">React</span>
            <span className="mx-4 text-lg">Next.js</span>
            <span className="mx-4 text-lg">Tailwind CSS</span>
            <span className="mx-4 text-lg">Node.js</span>
            <span className="mx-4 text-lg">Express</span>
            <span className="mx-4 text-lg">MongoDB</span>
            <span className="mx-4 text-lg">GitHub</span>
            <span className="mx-4 text-lg">Docker</span>
          </div>
          <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center">
            <span className="mx-4 text-lg">HTML</span>
            <span className="mx-4 text-lg">CSS</span>
            <span className="mx-4 text-lg">JavaScript</span>
            <span className="mx-4 text-lg">React</span>
            <span className="mx-4 text-lg">Next.js</span>
            <span className="mx-4 text-lg">Tailwind CSS</span>
            <span className="mx-4 text-lg">Node.js</span>
            <span className="mx-4 text-lg">Express</span>
            <span className="mx-4 text-lg">MongoDB</span>
            <span className="mx-4 text-lg">GitHub</span>
            <span className="mx-4 text-lg">Docker</span>
          </div>
        </div>

        {/* Row 2 */}
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee-reverse whitespace-nowrap flex items-center">
            <span className="mx-4 text-lg">TypeScript</span>
            <span className="mx-4 text-lg">Vue.js</span>
            <span className="mx-4 text-lg">Angular</span>
            <span className="mx-4 text-lg">Firebase</span>
            <span className="mx-4 text-lg">GraphQL</span>
            <span className="mx-4 text-lg">Redux</span>
            <span className="mx-4 text-lg">SASS</span>
            <span className="mx-4 text-lg">Webpack</span>
            <span className="mx-4 text-lg">Babel</span>
            <span className="mx-4 text-lg">Git</span>
            <span className="mx-4 text-lg">PostgreSQL</span>
          </div>
          <div className="absolute top-0 animate-marquee2-reverse whitespace-nowrap flex items-center">
            <span className="mx-4 text-lg">TypeScript</span>
            <span className="mx-4 text-lg">Vue.js</span>
            <span className="mx-4 text-lg">Angular</span>
            <span className="mx-4 text-lg">Firebase</span>
            <span className="mx-4 text-lg">GraphQL</span>
            <span className="mx-4 text-lg">Redux</span>
            <span className="mx-4 text-lg">SASS</span>
            <span className="mx-4 text-lg">Webpack</span>
            <span className="mx-4 text-lg">Babel</span>
            <span className="mx-4 text-lg">Git</span>
            <span className="mx-4 text-lg">PostgreSQL</span>
          </div>
        </div>

        {/* Row 3 */}
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            <span className="mx-4 text-lg">Python</span>
            <span className="mx-4 text-lg">Django</span>
            <span className="mx-4 text-lg">Flask</span>
            <span className="mx-4 text-lg">MySQL</span>
            <span className="mx-4 text-lg">Redis</span>
            <span className="mx-4 text-lg">Kubernetes</span>
            <span className="mx-4 text-lg">Jenkins</span>
            <span className="mx-4 text-lg">AWS</span>
            <span className="mx-4 text-lg">Azure</span>
            <span className="mx-4 text-lg">GCP</span>
          </div>
          <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center">
            <span className="mx-4 text-lg">Python</span>
            <span className="mx-4 text-lg">Django</span>
            <span className="mx-4 text-lg">Flask</span>
            <span className="mx-4 text-lg">MySQL</span>
            <span className="mx-4 text-lg">Redis</span>
            <span className="mx-4 text-lg">Kubernetes</span>
            <span className="mx-4 text-lg">Jenkins</span>
            <span className="mx-4 text-lg">AWS</span>
            <span className="mx-4 text-lg">Azure</span>
            <span className="mx-4 text-lg">GCP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechMarquee;
