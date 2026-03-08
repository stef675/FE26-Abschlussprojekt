import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listeClient } from "../listeClient";

type CreateListResponse = {
  id: number;
  key: string;
  title: string;
  description: string;
  eventDate: string | null;
  attendees: number | null;
  createdAt: number;
};

export default function NeueListe() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [attendees, setAttendees] = useState("");

  const createListMutation = useMutation({
    mutationFn: () =>
      listeClient<CreateListResponse>("/public/api/lists", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          eventDate: eventDate || undefined,
          attendees: attendees ? Number(attendees) : undefined,
        }),
      }),
    onSuccess: (data) => {
      navigate(`/liste/${data.key}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createListMutation.mutate();
  };

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="section-title">Neue Liste erstellen</h1>
          <p className="section-subtitle">
            Gib deiner Mitbringliste einen Namen und teile sie mit deinen Gästen.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Name der Liste</label>
              <input
                className="input"
                placeholder="z. B. Grillparty bei Julia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Beschreibung</label>
              <textarea
                className="textarea"
                placeholder="Was sollen Gäste mitbringen? Gibt es besondere Hinweise?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Datum der Veranstaltung</label>
                <input
                  className="input"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Erwartete Gäste</label>
                <input
                  className="input"
                  type="number"
                  placeholder="z. B. 12"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="button-primary"
              disabled={createListMutation.isPending || !title.trim() || !description.trim()}
            >
              {createListMutation.isPending ? "Erstellt..." : "Liste erstellen →"}
            </button>

            {createListMutation.isError && (
              <div className="error-box">
                Fehler: {(createListMutation.error as Error).message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}