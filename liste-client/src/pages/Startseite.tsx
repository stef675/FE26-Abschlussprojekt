import { Link } from "react-router-dom";

export default function Startseite() {
  return (
    <div className="page">
      <div className="container hero">
        <h1 className="logo-title">
          liste<span className="logo-blue">.live</span>
        </h1>

        <p className="subtitle">
          Erstelle eine Mitbringliste und teile sie mit deinen Gästen.
        </p>

        <Link to="/neue-liste">
          <button className="button-primary" style={{ maxWidth: 260 }}>
            Neue Liste erstellen →
          </button>
        </Link>
      </div>
    </div>
  );
}