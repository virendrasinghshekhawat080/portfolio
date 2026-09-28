import { techTicker } from "../data/portfolio";

export default function Ticker() {
  return (
    <div
      className="ticker"
      aria-label="Technology stack"
    >
      <div
        className="ticker-track"
        aria-hidden="true"
      >
        {[
          ...techTicker,
          ...techTicker,
        ].map((skill, index) => (
          <span
            key={`${skill}-${index}`}
          >
            {skill}

            <b>✳</b>
          </span>
        ))}
      </div>
    </div>
  );
}
