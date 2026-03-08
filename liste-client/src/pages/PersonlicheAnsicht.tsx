import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listeClient } from "../listeClient";

interface Submission {
  id: number;
  key: string;
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
  const [saved, setSaved] = useState(false);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
      navigate(`/liste/${key}`);
    },
  });

  if (!key || !submissionKey) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-box">Fehlende Parameter.</div>
        </div>
      </div>
    );
  }

  if (submissionsQuery.isLoading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">Lädt...</div>
        </div>
      </div>
    );
  }

  if (submissionsQuery.isError) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-box">
            Fehler: {(submissionsQuery.error as Error).message}
          </div>
        </div>
      </div>
    );
  }

  if (!mySubmission) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-box">Eintrag nicht gefunden oder wurde gelöscht.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="section-title">Dein Eintrag</h1>
          <p className="section-subtitle">
            Hier kannst du deine Angaben ändern oder löschen.
          </p>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Dein Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Was bringst du mit?</label>
              <input
                className="input"
                value={item}
                onChange={(e) => setItem(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Gäste (optional)</label>
            <input
              className="input"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          <div className="actions">
            <button
              className="button-primary"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !name.trim() || !item.trim()}
            >
              {updateMutation.isPending ? "Speichert..." : "Speichern"}
            </button>

            <button
              className="button-secondary"
              onClick={() => navigate(`/liste/${key}`)}
            >
              Abbrechen
            </button>

            <button
              className="button-danger"
              onClick={() => {
                if (window.confirm("Wirklich löschen?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Löscht..." : "Eintrag löschen"}
            </button>
          </div>

          {saved && <div className="success-box">Änderungen wurden gespeichert ✅</div>}

          {updateMutation.isError && (
            <div className="error-box">
              Fehler: {(updateMutation.error as Error).message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}