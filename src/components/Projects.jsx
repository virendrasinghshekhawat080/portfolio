import { useState } from "react";
import { GITHUB } from "../config";
import { projects } from "../data/portfolio";
import SectionHeading from "./SectionHeading";

function ProjectArtwork({
  id,
  index,
}) {
  return (
    <div
      className={`project-art art-${id}`}
    >
      <div className="art-top">
        <span>
          {id === "mystore"
            ? "MY STORE"
            : id === "commerce"
            ? "E-COMMERCE"
            : id === "task"
            ? "TASKFLOW"
            : "EXPENSE TRACKER"}
        </span>

        <span>● ● ●</span>
      </div>

      {id === "mystore" && (
        <div className="store-preview">
          <div className="preview-heading">
            Discover more.
            <br />

            <em>
              Shop smarter.
            </em>
          </div>

          <div className="preview-tiles">
            <i>⌚</i>
            <i>🎧</i>
            <i>⌨</i>
          </div>
        </div>
      )}

      {id === "commerce" && (
        <div className="commerce-preview">
          <span className="sale-label">
            NEW COLLECTION / 2026
          </span>

          <strong>
            Find your
            <br />
            next favorite.
          </strong>

          <div className="commerce-bags">
            <i>▣</i>
            <i>▤</i>
            <i>▥</i>
          </div>
        </div>
      )}

      {id === "task" && (
        <div className="task-preview">
          <strong>
            Today's focus{" "}
            <span>✦</span>
          </strong>

          <div>
            <b>✓</b>
            Design project layout
          </div>

          <div>
            <b>✓</b>
            Build components
          </div>

          <div>
            <b>○</b>
            Ship your next idea
          </div>
        </div>
      )}

      {id === "expense" && (
        <div className="expense-preview">
          <small>
            YOUR FINANCIAL OVERVIEW
          </small>

          <strong>
            ₹24,580{" "}
            <em>↗</em>
          </strong>

          <div className="bars">
            {Array.from(
              { length: 9 },
              (_, i) => (
                <i key={i} />
              )
            )}
          </div>
        </div>
      )}

      <span className="art-index">
        {String(
          index + 1
        ).padStart(2, "0")}{" "}
        /{" "}
        {id === "mystore"
          ? "FULL STACK"
          : id === "commerce"
          ? "FRONTEND"
          : id === "task"
          ? "PRODUCTIVITY"
          : "DASHBOARD"}
      </span>
    </div>
  );
}


function ProjectCard({
  project,
  index,
}) {
  return (
    <article className="project-card glass reveal visible">
      <ProjectArtwork
        id={project.id}
        index={index}
      />

      <div className="project-body">
        <div className="project-top">
          <span className="project-category">
            {project.type}
          </span>

          <span className="project-arrow">
            ↗
          </span>
        </div>

        <h3>
          {project.title}
        </h3>

        <p>
          {project.description}
        </p>

        <div className="project-tags">
          {project.tags.map(
            (tag) => (
              <span key={tag}>
                {tag}
              </span>
            )
          )}
        </div>

        <div className="project-links">
          <a
            className="project-live"
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View live demo of ${project.title}`}
          >
            Live Demo ↗
          </a>

          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View source code of ${project.title}`}
          >
            Source Code ↗
          </a>
        </div>
      </div>
    </article>
  );
}


export default function Projects() {
  const [filter, setFilter] =
    useState("All");

  const visibleProjects =
    projects.filter(
      (project) =>
        filter === "All" ||
        project.category === filter
    );

  return (
    <section
      className="section projects"
      id="projects"
    >
      <div className="wrap">
        <SectionHeading
          number="03"
          label="SELECTED WORK"
          before="Projects I've"
          highlight="built."
          description="Explore my work — every project includes a live demo and source code."
        />

        <div
          className="project-filters"
          role="group"
          aria-label="Filter projects"
        >
          {[
            "All",
            "Full Stack",
            "Frontend",
          ].map((option) => (
            <button
              type="button"
              key={option}
              className={`filter-btn ${
                option === filter
                  ? "is-selected"
                  : ""
              }`}
              aria-pressed={
                option === filter
              }
              onClick={() =>
                setFilter(option)
              }
            >
              {option}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {visibleProjects.map(
            (project) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={projects.indexOf(
                  project
                )}
              />
            )
          )}
        </div>

        <div className="more-work reveal">
          <a
            className="btn btn-outline"
            target="_blank"
            rel="noopener noreferrer"
            href={`${GITHUB}?tab=repositories`}
          >
            See more on GitHub{" "}
            <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
