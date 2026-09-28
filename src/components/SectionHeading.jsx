
export default function SectionHeading({
  number,
  label,
  before,
  highlight,
  description,
}) {
  return (
    <div className="section-heading reveal">
      <span className="section-kicker">
        {number} / {label}
      </span>

      <h2>
        {before}{" "}

        <span className="gradient-text">
          {highlight}
        </span>
      </h2>

      {description && (
        <p>{description}</p>
      )}
    </div>
  );
}
