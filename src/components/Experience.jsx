import SectionHeading from "./SectionHeading";

export default function Experience() {
  const entries = [
    {
      date:
        "AUG 2026 — PRESENT",

      type:
        "WORK EXPERIENCE",

      title:
        "MERN Stack Developer Intern",

      place:
        "Techno Derivation Pvt Ltd · Jaipur · On-site",

      detail:
        "Building responsive React interfaces, integrating REST APIs, and working with Node.js, Express.js, MongoDB and Mongoose on practical development tasks.",
    },

    {
      date:
        "2022 — 2026",

      type:
        "HIGHER EDUCATION",

      title:
        "B.Tech — Computer Science & Engineering",

      place:
        "Shree Balaji College of Engineering & Technology, Jaipur, Rajasthan",

      detail:
        "Rajasthan Technical University (RTU), Kota.",
    },

    {
      date:
        "2022",

      type:
        "SENIOR SECONDARY",

      title:
        "Class 12th — RBSE",

      place:
        "Shree Shyam Public Senior Secondary School, Bhankhar, Viratnagar, Paota, Jaipur",

      detail:
        "Senior secondary education · 65.40%.",
    },
  ];

  return (
    <section
      className="section experience"
      id="experience"
    >
      <div className="wrap">
        <SectionHeading
          number="04"
          label="MY JOURNEY"
          before="Experience &"
          highlight="education."
        />

        <div className="timeline">
          {entries.map(
            (entry) => (
              <div
                className="timeline-item reveal"
                key={entry.title}
              >
                <div className="timeline-date">
                  {entry.date}
                </div>

                <div
                  className="timeline-dot"
                  aria-hidden="true"
                />

                <div className="timeline-content glass">
                  <span className="timeline-type">
                    {entry.type}
                  </span>

                  <h3>
                    {entry.title}
                  </h3>

                  <p className="timeline-place">
                    {entry.place}
                  </p>

                  <p>
                    {entry.detail}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
