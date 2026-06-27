import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useTiltHover } from '../hooks/useTiltHover';

function SkillCard({ label, desc }: { label: string; desc: string }) {
  const { ref, onMouseMove, onMouseLeave } = useTiltHover<HTMLDivElement>({
    maxTilt: 4,
    scale: 1.03,
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="rounded-xl border border-border bg-white/40 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-accent/25 hover:shadow-md"
      style={{
        opacity: 0,
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease, border-color 0.5s ease',
      }}
      data-animate
    >
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="mt-0.5 text-xs text-foreground/50">{desc}</div>
    </div>
  );
}

export const About = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({});
  const contentRef = useScrollAnimation<HTMLDivElement>({ delay: 120, staggerDelay: 80 });

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          About
        </h1>
      </div>

      <div ref={contentRef} className="max-w-2xl space-y-6">
        <p className="text-lg leading-relaxed text-foreground/70" data-animate style={{ opacity: 0 }}>
          I'm a developer who enjoys building thoughtful, well-crafted tools and interfaces.
          This site is a reflection of that — a place where I can share projects, document
          what I learn, and keep track of the component ecosystem I work with.
        </p>

        <p className="text-lg leading-relaxed text-foreground/70" data-animate style={{ opacity: 0 }}>
          I believe in simplicity without sacrifice. Good design doesn't need to shout,
          and good code doesn't need to be clever. It just needs to work, be maintainable,
          and leave room for the next thing you'll want to build.
        </p>

        <h2 className="pt-6 text-xl font-medium text-foreground" data-animate style={{ opacity: 0 }}>
          What I Work With
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { label: 'TypeScript', desc: 'The foundation' },
            { label: 'React', desc: 'UI components' },
            { label: 'Rsbuild', desc: 'Build tooling' },
            { label: 'Tailwind CSS', desc: 'Utility styling' },
            { label: 'Three.js', desc: '3D visuals' },
            { label: 'Cloudflare', desc: 'Deployment' },
          ].map((skill) => (
            <SkillCard key={skill.label} {...skill} />
          ))}
        </div>

        <div className="pt-6" data-animate style={{ opacity: 0 }}>
          <h2 className="mb-4 text-xl font-medium text-foreground">Get In Touch</h2>
          <p className="leading-relaxed text-foreground/70">
            Feel free to reach out if you want to collaborate, have questions, or just want to say hello.
          </p>
        </div>
      </div>
    </>
  );
};
