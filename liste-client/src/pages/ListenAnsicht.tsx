import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listeClient } from "../listeClient";

interface ListeData {
  id: number;
  key: string;
  title: string;
  description: string;
}

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

export default function ListenAnsicht() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [item, setItem] = useState("");

  // 1) Load list
  const listQuery = useQuery<ListeData>({
    queryKey: ["liste", key],
    queryFn: () => listeClient(`/public/api/lists/${key}`),
    enabled: !!key,
  });

  // 2) Load submissions for this list
  const submissionsQuery = useQuery<Submission[]>({
    queryKey: ["submissions", key],
    queryFn: () => listeClient(`/public/api/submissions?listKey=${key}`),
    enabled: !!key,
  });

  // 3) Create submission
  const createMutation = useMutation({
    mutationFn: async (neuerEintrag: { name: string; item: string }) => {
      if (!listQuery.data) throw new Error("Liste not loaded yet");

      return listeClient<Submission>("/public/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          listId: listQuery.data.id,
          name: neuerEintrag.name,
          item: neuerEintrag.item,
        }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["submissions", key] });
      queryClient.invalidateQueries({ queryKey: ["liste", key] });
      setName("");
      setItem("");
      navigate(`/liste/${key}/${data.key}`);
    },
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;
    createMutation.mutate({ name, item });
  };

  if (!key) return <div style={{ padding: 20 }}>Fehlender Listen-Key.</div>;

  if (listQuery.isLoading) return <div style={{ padding: 20 }}>Lädt die Liste...</div>;
  if (listQuery.isError || !listQuery.data) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        Fehler beim Laden der Liste: {(listQuery.error as Error)?.message}
      </div>
    );
  }

  const liste = listQuery.data;

  return (
    <div style={{ padding: 20 }}>
      <h1>{liste.title}</h1>
      <p>{liste.description}</p>

      <hr />

      <h3>Wer bringt was mit?</h3>

      {submissionsQuery.isLoading && <div>Lädt Einträge...</div>}

      {submissionsQuery.isError && (
        <div style={{ color: "red" }}>
          Fehler beim Laden der Einträge: {(submissionsQuery.error as Error).message}
        </div>
      )}

      {!submissionsQuery.isLoading && !submissionsQuery.isError && (
        <ul>
          {(submissionsQuery.data ?? []).map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong> bringt mit: {s.item}
              {s.guests ? ` (Gäste: ${s.guests})` : ""}
              {" — "}
              <Link to={`/liste/${key}/${s.key}`}>bearbeiten</Link>
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Dich eintragen</h3>
      <form
        onSubmit={handleAddEntry}
        style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}
      >
        <input
          placeholder="Dein Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: 8 }}
        />

        <input
          placeholder="Was bringst du mit?"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          required
          style={{ padding: 8 }}
        />

        <button
          type="submit"
          disabled={createMutation.isPending}
          style={{ padding: 10, cursor: "pointer" }}
        >
          {createMutation.isPending ? "Sendet..." : "Eintrag erstellen"}
        </button>

        {createMutation.isError && (
          <div style={{ color: "red" }}>
            Fehler: {(createMutation.error as Error).message}
          </div>
        )}
      </form>
    </div>
  );
}