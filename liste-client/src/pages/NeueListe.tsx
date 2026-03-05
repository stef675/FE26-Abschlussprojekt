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

  const createListMutation = useMutation({
    mutationFn: () =>
      listeClient<CreateListResponse>("/public/api/lists", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      }),
    onSuccess: (data) => {
      navigate(`/liste/${data.key}`);
    },
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Neue Liste erstellen</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
        <label>
          Titel der Veranstaltung:
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          Beschreibung:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
            rows={4}
          />
        </label>

        <button
          onClick={() => createListMutation.mutate()}
          disabled={createListMutation.isPending || !title.trim() || !description.trim()}
          style={{ padding: 10, cursor: "pointer" }}
        >
          {createListMutation.isPending ? "Erstellt..." : "Liste erstellen"}
        </button>

        {createListMutation.isError && (
          <div style={{ color: "red" }}>
            Fehler: {(createListMutation.error as Error).message}
          </div>
        )}
      </div>
    </div>
  );
}