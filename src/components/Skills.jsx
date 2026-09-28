import { skills } from "../data/portfolio";
import SectionHeading from "./SectionHeading";

export default function Skills() {
  return (
    <section
      className="section skills"
      id="skills"
    >
      <div className="wrap">
        <SectionHeading
          number="02"
          label="MY TOOLKIT"
          before="Technologies I"
          highlight="work with."
          description="Tools and technologies I use to build interactive web experiences."
        />

        <div className="skill-layout">
          {skills.map(
            (group, index) => (
              <div
                key={group.title}
                className="skill-group glass reveal"
              >
                <div className="skill-head">
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <h3>
                    {group.title}
                  </h3>
                </div>

                <div className="skill-list">
                  {group.items.map(
                    (skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
