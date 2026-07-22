"use client";

import { Icon } from "./Icon";
import { RowTools, T, useEdit } from "./Editable";
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

const BLANK_PRODUCT: Product = { name: "New product", tagline: "", url: "" };
const BLANK_PROJECT: Project = { name: "New project", description: "", url: "" };

function ProductShowcase({ products, label, base }: { products?: Product[]; label?: string; base: (string | number)[] }) {
  const editing = !!useEdit();
  if (!products?.length) return null;
  return (
    <div className="shipped">
      <T
        path={[...base, "productsLabel"]}
        value={label}
        className="shipped-label"
        as="div"
        placeholder="Showcase heading"
      />
      {!editing && !label && <div className="shipped-label">Products I helped ideate &amp; ship</div>}
      <div className="shipped-grid">
        {products.map((p, i) => {
          const inner = (
            <>
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
                <T path={[...base, "products", i, "name"]} value={p.name} className="prod-name" />
                <T
                  path={[...base, "products", i, "tagline"]}
                  value={p.tagline}
                  className="prod-tag"
                  placeholder="Tagline"
                  hideWhenEmpty
                />
              </span>
              <RowTools listPath={[...base, "products"]} index={i} blank={BLANK_PRODUCT} label="product" />
            </>
          );
          return editing ? (
            <div className="prod-card" key={i}>
              {inner}
            </div>
          ) : (
            <a className="prod-card" key={i} href={p.url} target="_blank" rel="noopener">
              {inner}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceEntry({ e, i }: { e: Experience; i: number }) {
  const editing = !!useEdit();
  const base = ["experience", i];
  return (
    <div className="entry">
      <div className="when">
        <T path={[...base, "period"]} value={e.period} placeholder="Period" as="div" />
        {e.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="co-logo" src={e.logo} alt={`${e.company || e.role} logo`} />
        ) : null}
      </div>
      <div className="what">
        <h3>
          <T path={[...base, "role"]} value={e.role} placeholder="Role" />
          {(e.company || editing) && (
            <span className="org">
              {" — "}
              <T path={[...base, "company"]} value={e.company} placeholder="Company" />
            </span>
          )}
        </h3>
        {(e.headline || editing) && (
          <T
            path={[...base, "headline"]}
            value={e.headline}
            className="headline"
            as="div"
            placeholder="One-line headline (optional)"
          />
        )}
        {(e.points?.length > 0 || editing) && (
          <ul>
            {e.points.map((p, j) => (
              <li key={j}>
                <T
                  path={[...base, "points", j]}
                  value={p}
                  placeholder="Responsibility"
                  listPath={[...base, "points"]}
                  listIndex={j}
                />
                <RowTools listPath={[...base, "points"]} index={j} blank="" label="bullet" />
              </li>
            ))}
          </ul>
        )}
        {e.achievements?.some((g) => g.points.length > 0) && (
          <div className="achv">
            <div className="achv-label">Achievements</div>
            {e.achievements.map((g, gi) =>
              g.points.length ? (
                <div className="achv-group" key={gi}>
                  {(g.label || editing) && (
                    <T
                      path={[...base, "achievements", gi, "label"]}
                      value={g.label}
                      className="achv-group-label"
                      as="div"
                      placeholder="Group label (optional)"
                    />
                  )}
                  <ul>
                    {g.points.map((p, pj) => (
                      <li key={pj}>
                        <T
                          path={[...base, "achievements", gi, "points", pj]}
                          value={p}
                          placeholder="Achievement"
                          listPath={[...base, "achievements", gi, "points"]}
                          listIndex={pj}
                        />
                        <RowTools
                          listPath={[...base, "achievements", gi, "points"]}
                          index={pj}
                          blank=""
                          label="achievement"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        )}
        <ProductShowcase products={e.products} label={e.productsLabel} base={base} />
      </div>
    </div>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const editing = !!useEdit();
  const base = ["projects", i];
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
        <h3>
          <T path={[...base, "name"]} value={p.name} placeholder="Project name" />
          <RowTools listPath={["projects"]} index={i} blank={BLANK_PROJECT} label="project" />
        </h3>
        <T
          path={[...base, "description"]}
          value={p.description}
          className="desc"
          as="div"
          placeholder="Short description"
          hideWhenEmpty
        />
        {editing ? (
          <T path={[...base, "url"]} value={p.url} className="p-sub" as="div" placeholder="URL" />
        ) : (
          p.url && (
            <a href={p.url} target="_blank" rel="noopener">
              {p.url.replace(/^https?:\/\//, "")}
            </a>
          )
        )}
      </div>
    </div>
  );
}

/** Groups projects by their optional `group` heading, preserving order. */
function groupProjects(projects: Project[]) {
  const groups: { label: string; items: { p: Project; i: number }[] }[] = [];
  projects.forEach((p, i) => {
    const label = p.group || "";
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push({ p, i });
    else groups.push({ label, items: [{ p, i }] });
  });
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
 * The CV sheet. Same markup and class names as the original static index.html.
 * Every text node goes through `<T>`, so the identical component renders a
 * read-only CV publicly and an inline-editable one inside the editor.
 */
export default function CvDocument({ data }: { data: CvData }) {
  const d = data;
  const c = d.contact || {};
  const editing = !!useEdit();
  let n = 0;
  const num = () => pad2(++n);

  const show = (v?: string) => Boolean(v) || editing;

  const realLinks = (d.links || []).filter((l) => l.url);

  return (
    <div
      className={`sheet-inner${editing ? " is-editing" : ""}`}
      style={d.accent ? ({ "--accent": d.accent } as React.CSSProperties) : undefined}
    >
      {/* ---------- Masthead ---------- */}
      <div className="masthead">
        {d.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="photo" src={d.photo} alt="" />
        ) : null}
        <div className="head-main">
          {show(d.title) && (
            <T path={["title"]} value={d.title} className="kicker" as="div" placeholder="Job title" />
          )}
          <h1>
            <T path={["name"]} value={d.name} placeholder="Your name" />
          </h1>
          <div className="contact">
            {show(c.location) && (
              <span className="item">
                <Icon name="pin" />
                <T path={["contact", "location"]} value={c.location} placeholder="Location" />
              </span>
            )}
            {show(c.phone) && (
              <span className="item">
                <Icon name="phone" />
                {editing ? (
                  <T path={["contact", "phone"]} value={c.phone} placeholder="Phone" />
                ) : (
                  <a href={`tel:${c.phone?.replace(/\s/g, "")}`}>{c.phone}</a>
                )}
              </span>
            )}
            {show(c.email) && (
              <span className="item">
                <Icon name="mail" />
                {editing ? (
                  <T path={["contact", "email"]} value={c.email} placeholder="Email" />
                ) : (
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                )}
              </span>
            )}
            {show(c.dob) && (
              <span className="item">
                <Icon name="calendar" />
                <T path={["contact", "dob"]} value={c.dob} placeholder="Date of birth" />
              </span>
            )}
            {show(c.website) && (
              <span className="item">
                <Icon name="globe" />
                {editing ? (
                  <T path={["contact", "website"]} value={c.website} placeholder="Website" />
                ) : (
                  <a href={c.website} target="_blank" rel="noopener">
                    {c.website?.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </span>
            )}
            {show(c.linkedin) && (
              <span className="item">
                <Icon name="linkedin" />
                {editing ? (
                  <T path={["contact", "linkedin"]} value={c.linkedin} placeholder="LinkedIn URL" />
                ) : (
                  <a href={c.linkedin} target="_blank" rel="noopener">
                    LinkedIn
                  </a>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="rule-top" />

      {/* ---------- Profile ---------- */}
      {(d.summary?.length > 0 || editing) && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Profile
          </div>
          <div className="body">
            <div className="summary">
              {d.summary.map((p, i) => (
                <p
                  key={i}
                  // While editing, every paragraph looks the same, so pressing
                  // Enter never jumps to a different font or size. The editorial
                  // lead/pull treatment returns in the read-only view and PDF.
                  className={
                    editing
                      ? ""
                      : i === 0
                        ? "lead"
                        : i === d.summary.length - 1 && d.summary.length > 2
                          ? "pull"
                          : ""
                  }
                >
                  <T
                    path={["summary", i]}
                    value={p}
                    placeholder="Paragraph"
                    listPath={["summary"]}
                    listIndex={i}
                  />
                  <RowTools listPath={["summary"]} index={i} blank="" label="paragraph" />
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Experience ---------- */}
      {(d.experience?.length > 0 || editing) && (
        <div className="xp">
          <div className="xp-head">
            <span className="num">{num()}</span>Experience
          </div>
          <div className="xp-list">
            {d.experience.map((e, i) => (
              <ExperienceEntry e={e} i={i} key={i} />
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
                const inner = cl.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cl.logo} alt={cl.name} title={cl.name} />
                ) : (
                  <T path={["clients", i, "name"]} value={cl.name} className="client-name" />
                );
                const cls = `client${cl.fill ? " fill" : ""}`;
                return editing ? (
                  <span className={cls} key={i}>
                    {inner}
                  </span>
                ) : (
                  <a className={cls} key={i} href={cl.url} target="_blank" rel="noopener">
                    {inner}
                  </a>
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
                <div className="when">
                  <T path={["education", i, "period"]} value={e.period} placeholder="Period" as="div" />
                  {e.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="co-logo" src={e.logo} alt={`${e.school || e.degree} logo`} />
                  ) : null}
                </div>
                <div className="what">
                  <h3>
                    <T path={["education", i, "degree"]} value={e.degree} placeholder="Degree" />
                    {(e.school || editing) && (
                      <span className="org">
                        {" — "}
                        <T path={["education", i, "school"]} value={e.school} placeholder="School" />
                      </span>
                    )}
                  </h3>
                  {e.certifications?.length ? (
                    <ul>
                      {e.certifications.map((cert, j) => (
                        <li key={j}>
                          <T
                            path={["education", i, "certifications", j]}
                            value={cert}
                            placeholder="Certification"
                            listPath={["education", i, "certifications"]}
                            listIndex={j}
                          />
                          <RowTools
                            listPath={["education", i, "certifications"]}
                            index={j}
                            blank=""
                            label="certification"
                          />
                        </li>
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
              {(d.links || []).map((l, i) =>
                !l.url && !editing ? null : (
                  <span key={i}>
                    {i > 0 && <span className="link-sep">/</span>}
                    {editing ? (
                      <span className="inline-link">
                        <Icon name={linkIcon(l.url)} />
                        <T path={["links", i, "label"]} value={l.label || l.url} placeholder="Label" />
                      </span>
                    ) : (
                      <a className="inline-link" href={l.url} target="_blank" rel="noopener">
                        <Icon name={linkIcon(l.url)} />
                        {l.label || l.url}
                      </a>
                    )}
                  </span>
                ),
              )}
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
                    <T
                      path={["skills", i]}
                      value={s}
                      placeholder="Skill"
                      listPath={["skills"]}
                      listIndex={i}
                    />
                    <RowTools listPath={["skills"]} index={i} blank="" label="skill" />
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
                    <T path={["languages", i, "name"]} value={l.name} className="lang-name" />
                    <span className="lang-dots">
                      {Array.from({ length: 5 }, (_, k) => (
                        <span className={`dot${k < score ? "" : " off"}`} key={k} />
                      ))}
                    </span>
                    <T
                      path={["languages", i, "level"]}
                      value={l.level}
                      className="lang-level"
                      placeholder="Level"
                    />
                    <RowTools
                      listPath={["languages"]}
                      index={i}
                      blank={{ name: "", level: "Fluent" }}
                      label="language"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Hobbies ---------- */}
      {(d.hobbies || editing) && (
        <div className="section">
          <div className="label">
            <span className="num">{num()}</span>Hobbies
          </div>
          <div className="body">
            <span className="hobbies-row">
              <Icon name="music" />
              <T path={["hobbies"]} value={d.hobbies} placeholder="Hobbies" />
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
            {groupProjects(d.projects).map((g, gi) => (
              <div className="proj-group" key={gi}>
                {(g.label || editing) && (
                  <T
                    path={["projects", g.items[0].i, "group"]}
                    value={g.label}
                    className="proj-group-label"
                    as="div"
                    placeholder="Group heading (optional)"
                  />
                )}
                <div className="projects-grid">
                  {g.items.map(({ p, i }) => (
                    <ProjectCard p={p} i={i} key={i} />
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
