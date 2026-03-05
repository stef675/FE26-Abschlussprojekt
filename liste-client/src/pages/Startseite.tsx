import { useNavigate } from "react-router-dom";

export default function Startseite() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>liste.live</h1>
      <p>Erstelle ganz einfach Mitbringlisten für deine Partys!</p>
      
      {/* Button zum Navigieren */}
      <button 
        onClick={() => navigate("/neue-liste")}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Neue Liste erstellen
      </button>
    </div>
  );
}