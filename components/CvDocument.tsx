import { Icon } from "./Icon";
import { linkIcon, projectIcon, skillIcon, skillLogo } from "@/lib/icons";
import type { CvData, Experience, Product, Project } from "@/lib/types";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Initials fallback when an entry has no logo and none could be resolved. */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return <span className="monogram">{initials || "•"}</span>;
}

function ProductShowcase({ products, label }: { products?: Product[]; label?: string }) {
  if (!products?.length) return null;
  return (
    <div className="shipped">
      <div className="shipped-label">{label || "Products I helped ideate & ship"}</div>
      <div className="shipped-grid">
        {products.map((p, i) => {
          const Card = p.url ? "a" : "div";
          return (
            <Card
              key={i}
              className="prod-card"
              {...(p.url ? { href: p.url, target: "_blank", rel: "noopener" } : {})}
            >
              <span
                className={`prod-ic${p.logo ? " has-logo" : ""}`}
                style={p.logoBg ? { background: p.logoBg } : undefined}
              >
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="prod-logo" src={p.logo} alt={`${p.name} logo`} />
                ) : (
                  <Monogram name={p.name} />
                )}
              </span>
              <span className="prod-text">
                <span className="prod-name">{p.name}</span>
                {p.tagline && <span className="prod-tag">{p.tagline}</span>}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceEntry({ e }: { e: Experience }) {
  return (
    <div className="entry">
      <div className="when">{e.period}</div>
      <div className="what">
        <h3>
          {e.role}
          {e.company && <span className="org"> — {e.company}</span>}
        </h3>
        {e.headline && <div className="headline">{e.headline}</div>}
        {e.points?.length > 0 && (
          <ul>
            {e.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}
        {e.achievements?.some((g) => g.points.length > 0) && (
          <div className="achv">
            <div className="achv-label">Achievements</div>
            {e.achievements.map((g, i) =>
              g.points.length ? (
                <div className="achv-group" key={i}>
                  {g.label && <div className="achv-group-label">{g.label}</div>}
                  <ul>
                    {g.points.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        )}
        <ProductShowcase products={e.products} label={e.productsLabel} />
      </div>
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <div className="project">
      <span
        className={`p-icon${p.logo ? " has-logo" : ""}`}
        style={p.logoBg ? { background: p.logoBg } : undefined}
      >
        {p.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="p-logo" src={p.logo} alt={`${p.name} logo`} />
        ) : (
          <Icon name={projectIcon(p)} />
        )}
      </span>
      <div className="p-main">
        <h3>{p.name}</h3>
        {p.description && <div className="desc">{p.description}</div>}
        {p.url && (
          <a href={p.url} target="_blank" rel="noopener">
            {p.url.replace(/^https?:\/\//, "")}
          </a>
        )}
        {p.extraLinks?.map((x, i) => (
          <a className="p-sub" key={i} href={x.url} target="_blank" rel="noopener">
            <Icon name={linkIcon(x.url)} /> {x.label || x.url}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Groups projects by their optional `group` heading, preserving order. */
function groupProjects(projects: Project[]) {
  const groups: { label: string; items: Project[] }[] = [];
  for (const p of projects) {
    const label = p.group || "";
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(p);
    else groups.push({ label, items: [p] });
  }
  return groups;
}

const LEVEL_SCORE: Record<string, number> = {
  native: 5,
  "highly proficient": 4,
  fluent: 4,
  proficient: 4,
  advanced: 4,
  intermediate: 3,
  conversational: 3,
  basic: 2,
  beginner: 1,
};

/**
 * The CV sheet itself. Pure presentation — same markup and class names as the
 * original static index.html, so styles.css carried over unchanged.
 */
export default function CvDocument({ data }: { data: CvData }) {
  const d = data;
  const c = d.contact || {};
  let n = 0;
  const num = () => pad2(++n);

  const contactItems: React.ReactNode[] = [];
  if (c.location)
    contactItems.push(
      <span className="item" key="loc">
        <Icon name="pin" />
        {c.location}
      </span>,
    );
  if (c.phone)
    contactItems.push(
      <span className="item" key="tel">
        <Icon name="phone" />
        <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>
      </span>,
    );
  if (c.email)
    contactItems.push(
      <span className="item" key="mail">
        <Icon name="mail" />
        <a href={`mailto:${c.email}`}>{c.email}</a>
      </span>,
    );
  if (c.dob)
    contactItems.push(
      <span className="item" key="dob">
        <Icon name="calendar" />
        {c.dob}
      </span>,
    );
  if (c.website)
    contactItems.push(
      <span className="item" key="web">
        <Icon name="globe" />
        <a href={c.website} target="_blank" rel="noopener">
          {c.website.replace(/^https?:\/\//, "")}
        </a>
      </span>,
    );
  if (c.linkedin)
    contactItems.push(
      <span className="item" key="li">
        <Icon name="linkedin" />
        <a href={c.linkedin} target="_blank" rel="noopener">
          LinkedIn
        </a>
      </span>,
    );

  const realLinks = (d.links || []).filter((l) => l.url);

  return (
    <div
      className="sheet-inner"
      style={d.accent ? ({ "--accent": d.accent } as React.CSSProperties) : undefined}
    >
      {/* ---------- Masthead ---------- */}
      <div className="masthead">
        {d.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="photo" src={d.photo} alt="" />
        ) : null}
        <div className="head-main">
          {d.title && <div className="kicker">{d.title}</div>}
          <h1>{d.name}</h1>
          <div className="contact">{contactItems}</div>
        </div>
      </div>
      <div className="rule-top" />

      {/* ---------- Profile ---------- */}
      {d.summary?.length > 0 && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Profile
          </div>
          <div className="body">
            <div className="summary">
              {d.summary.map((p, i) => {
                if (i === 0) return <p className="lead" key={i}>{p}</p>;
                if (i === d.summary.length - 1 && d.summary.length > 2)
                  return <p className="pull" key={i}>{p}</p>;
                return <p key={i}>{p}</p>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Experience ---------- */}
      {d.experience?.length > 0 && (
        <div className="xp">
          <div className="xp-head">
            <span className="num">{num()}</span>Experience
          </div>
          <div className="xp-list">
            {d.experience.map((e, i) => (
              <ExperienceEntry e={e} key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ---------- Clients ---------- */}
      {d.clients && d.clients.length > 0 && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Clients Highlight
          </div>
          <div className="body">
            <div className="clients-grid">
              {d.clients.map((cl, i) => {
                const Tag = cl.url ? "a" : "span";
                return (
                  <Tag
                    key={i}
                    className={`client${cl.fill ? " fill" : ""}`}
                    {...(cl.url ? { href: cl.url, target: "_blank", rel: "noopener" } : {})}
                  >
                    {cl.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cl.logo} alt={cl.name} title={cl.name} />
                    ) : (
                      <span className="client-name">{cl.name}</span>
                    )}
                  </Tag>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Education ---------- */}
      {d.education && d.education.length > 0 && (
        <div className="xp">
          <div className="xp-head">
            <span className="num">{num()}</span>Education
          </div>
          <div className="xp-list">
            {d.education.map((e, i) => (
              <div className="entry" key={i}>
                <div className="when">{e.period}</div>
                <div className="what">
                  <h3>
                    {e.degree}
                    {e.school && <span className="org"> — {e.school}</span>}
                  </h3>
                  {e.certifications?.length ? (
                    <ul>
                      {e.certifications.map((cert, j) => (
                        <li key={j}>{cert}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Links ---------- */}
      {realLinks.length > 0 && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Links
          </div>
          <div className="body">
            <div>
              {realLinks.map((l, i) => (
                <span key={i}>
                  {i > 0 && <span className="link-sep">/</span>}
                  <a className="inline-link" href={l.url} target="_blank" rel="noopener">
                    <Icon name={linkIcon(l.url)} />
                    {l.label || l.url}
                  </a>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Skills ---------- */}
      {d.skills && d.skills.length > 0 && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Skills &amp; Tools
          </div>
          <div className="body">
            <div className="skills-grid">
              {d.skills.map((s, i) => {
                const logo = skillLogo(s);
                return (
                  <span className="skill" key={i}>
                    <span className={`ic-wrap${logo ? " has-logo" : ""}`}>
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="skill-logo" src={logo} alt="" />
                      ) : (
                        <Icon name={skillIcon(s)} />
                      )}
                    </span>
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Languages ---------- */}
      {d.languages && d.languages.length > 0 && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Languages
          </div>
          <div className="body">
            <div>
              {d.languages.map((l, i) => {
                const score = LEVEL_SCORE[(l.level || "").toLowerCase()] || 4;
                return (
                  <div className="lang-row" key={i}>
                    <span className="lang-name">{l.name}</span>
                    <span className="lang-dots">
                      {Array.from({ length: 5 }, (_, k) => (
                        <span className={`dot${k < score ? "" : " off"}`} key={k} />
                      ))}
                    </span>
                    {l.level && <span className="lang-level">{l.level}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Hobbies ---------- */}
      {d.hobbies && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Hobbies
          </div>
          <div className="body">
            <span className="hobbies-row">
              <Icon name="music" />
              {d.hobbies}
            </span>
          </div>
        </div>
      )}

      {/* ---------- Projects ---------- */}
      {d.projects && d.projects.length > 0 && (
        <div className="fullsec">
          <div className="xp-head">
            <span className="num">{num()}</span>Projects &amp; Works
          </div>
          <div className="fullsec-body">
            {groupProjects(d.projects).map((g, i) => (
              <div className="proj-group" key={i}>
                {g.label && <div className="proj-group-label">{g.label}</div>}
                <div className="projects-grid">
                  {g.items.map((p, j) => (
                    <ProjectCard p={p} key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Colophon ---------- */}
      <div className="colophon">
        <span>{d.name}</span>
        <span>Curriculum Vitae</span>
      </div>
    </div>
  );
}
