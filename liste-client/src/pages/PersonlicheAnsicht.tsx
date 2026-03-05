import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listeClient } from "../listeClient";

interface Submission {
  id: number;
  key: string; // edit key
  listId: number;
  name: string;
  item: string;
  guests?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export default function PersonlicheAnsicht() {
  const { key, submissionKey } = useParams<{ key: string; submissionKey: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [guests, setGuests] = useState("");

  const submissionsQuery = useQuery<Submission[]>({
    queryKey: ["submissions", key],
    queryFn: () => listeClient(`/public/api/submissions?listKey=${key}`),
    enabled: !!key,
  });

  const mySubmission = submissionsQuery.data?.find((s) => s.key === submissionKey);

  useEffect(() => {
    if (!mySubmission) return;
    setName(mySubmission.name);
    setItem(mySubmission.item);
    setGuests(mySubmission.guests ?? "");
  }, [mySubmission]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!submissionKey) throw new Error("Missing submissionKey");

      return listeClient<Submission>(`/public/api/submissions/${submissionKey}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          item,
          guests: guests.trim() ? guests : undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", key] });
      queryClient.invalidateQueries({ queryKey: ["liste", key] });
      alert("Erfolgreich aktualisiert ✅");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!submissionKey) throw new Error("Missing submissionKey");

      return listeClient<void>(`/public/api/submissions/${submissionKey}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", key] });
      queryClient.invalidateQueries({ queryKey: ["liste", key] });
      navigate(`/liste/${key}`);
    },
  });

  if (!key || !submissionKey) return <div style={{ padding: 20 }}>Fehlende Parameter.</div>;
  if (submissionsQuery.isLoading) return <div style={{ padding: 20 }}>Lädt...</div>;

  if (submissionsQuery.isError) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        Fehler: {(submissionsQuery.error as Error).message}
      </div>
    );
  }

  if (!mySubmission) {
    return (
      <div style={{ padding: 20 }}>
        Eintrag nicht gefunden أو تم حذفه.
        <div style={{ marginTop: 10 }}>
          <button onClick={() => navigate(`/liste/${key}`)} style={{ padding: 10 }}>
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Eintrag bearbeiten</h1>
      <p>Hier kannst du deine Angaben ändern oder löschen.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8 }} />
        <input value={item} onChange={(e) => setItem(e.target.value)} style={{ padding: 8 }} />
        <input
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          placeholder="Gäste (optional)"
          style={{ padding: 8 }}
        />

        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending || !name.trim() || !item.trim()}
          style={{ padding: 10, cursor: "pointer" }}
        >
          {updateMutation.isPending ? "Speichert..." : "Änderungen speichern"}
        </button>

        <button
          onClick={() => {
            if (window.confirm("Wirklich löschen?")) deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          style={{
            padding: 10,
            cursor: "pointer",
            border: "none",
            color: "white",
            backgroundColor: "#ff4d4d",
          }}
        >
          {deleteMutation.isPending ? "Löscht..." : "Eintrag löschen"}
        </button>

        <button
          onClick={() => navigate(`/liste/${key}`)}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          ← Zurück zur Liste
        </button>
      </div>
    </div>
  );
}