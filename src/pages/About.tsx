import { useScrollAnimation } from '../hooks/useScrollAnimation';

export const About = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({});
  const contentRef = useScrollAnimation<HTMLDivElement>({ delay: 200 });

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground">About</h1>
      </div>

      <div ref={contentRef} className="max-w-2xl space-y-6">
        <p className="text-lg leading-relaxed text-foreground/70">
          I'm a developer who enjoys building thoughtful, well-crafted tools and interfaces.
          This site is a reflection of that — a place where I can share projects, document
          what I learn, and keep track of the component ecosystem I work with.
        </p>

        <p className="text-lg leading-relaxed text-foreground/70">
          I believe in simplicity without sacrifice. Good design doesn't need to shout,
          and good code doesn't need to be clever. It just needs to work, be maintainable,
          and leave room for the next thing you'll want to build.
        </p>

        <h2 className="pt-6 text-xl font-medium text-foreground">What I Work With</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { label: 'TypeScript', desc: 'The foundation' },
            { label: 'React', desc: 'UI components' },
            { label: 'Rsbuild', desc: 'Build tooling' },
            { label: 'Tailwind CSS', desc: 'Utility styling' },
            { label: 'Three.js', desc: '3D visuals' },
            { label: 'Cloudflare', desc: 'Deployment' },
          ].map((skill) => (
            <div
              key={skill.label}
              className="rounded-xl border border-border bg-white/40 p-4 backdrop-blur-sm"
              data-animate
              style={{ opacity: 0 }}
            >
              <div className="text-sm font-medium text-foreground">{skill.label}</div>
              <div className="mt-0.5 text-xs text-foreground/50">{skill.desc}</div>
            </div>
          ))}
        </div>

        <div className="pt-6">
          <h2 className="mb-4 text-xl font-medium text-foreground">Get In Touch</h2>
          <p className="leading-relaxed text-foreground/70">
            Feel free to reach out if you want to collaborate, have questions, or just want to say hello.
          </p>
        </div>
      </div>
    </>
  );
};
