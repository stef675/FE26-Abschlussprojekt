import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listeClient } from "../listeClient";
import type { ListeData, Submission } from "../types";

export default function ListenAnsicht() {
  const { key } = useParams<{ key: string }>();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [guests, setGuests] = useState("");
  const [copied, setCopied] = useState(false);

  const listQuery = useQuery<ListeData>({
    queryKey: ["liste", key],
    queryFn: () => listeClient(`/public/api/lists/${key}`),
    enabled: !!key,
  });

  const submissionsQuery = useQuery<Submission[]>({
    queryKey: ["submissions", key],
    queryFn: () => listeClient(`/public/api/submissions?listKey=${key}`),
    enabled: !!key,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!listQuery.data) throw new Error("Liste not loaded yet");

      return listeClient<Submission>("/public/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          listId: listQuery.data.id,
          name,
          item,
          guests: guests.trim() ? guests : undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", key] });
      setName("");
      setItem("");
      setGuests("");
    },
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;
    createMutation.mutate();
  };

  const copyListLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Kopieren nicht möglich");
    }
  };

  const sortedEntries = useMemo(() => {
    return [...(submissionsQuery.data ?? [])].sort((a, b) => {
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });
  }, [submissionsQuery.data]);

  if (!key) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-box">Fehlender Listen-Key.</div>
        </div>
      </div>
    );
  }

  if (listQuery.isLoading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">Lädt die Liste...</div>
        </div>
      </div>
    );
  }

  if (listQuery.isError || !listQuery.data) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-box">
            Fehler beim Laden der Liste: {(listQuery.error as Error)?.message}
          </div>
        </div>
      </div>
    );
  }

  const liste = listQuery.data;

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="title">{liste.title}</h1>
          <p className="subtitle">{liste.description}</p>

          {(liste.eventDate || liste.attendees !== null) && (
            <div className="info-box">
              {liste.eventDate && <div>📅 Datum: {liste.eventDate}</div>}
              {liste.attendees !== undefined && liste.attendees !== null && (
                <div>👥 Erwartete Gäste: {liste.attendees}</div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Link zur Liste</h2>
          <p className="section-subtitle">
            Schicke diesen Link an alle Gäste – sie können sich direkt eintragen, ganz ohne Account.
          </p>

          <div className="copy-row">
            <input className="input" value={window.location.href} readOnly />
            <button type="button" className="button-secondary" onClick={copyListLink}>
              Kopieren
            </button>
          </div>

          {copied && <div className="success-box">Link wurde kopiert ✅</div>}
        </div>

        <div className="card">
          <h2 className="section-title">Jetzt eintragen</h2>

          <form onSubmit={handleAddEntry}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Dein Name</label>
                <input
                  className="input"
                  placeholder="z. B. Anna"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Was bringst du mit?</label>
                <input
                  className="input"
                  placeholder="z. B. Kartoffelsalat"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Gäste (optional)</label>
              <input
                className="input"
                placeholder="z. B. 3 Personen"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="button-primary"
              disabled={
                createMutation.isPending || !name.trim() || !item.trim()
              }
            >
              {createMutation.isPending ? "Sendet..." : "Eintragen →"}
            </button>

            {createMutation.isError && (
              <div className="error-box">
                Fehler: {(createMutation.error as Error).message}
              </div>
            )}
          </form>
        </div>

        <div className="card">
          <h2 className="section-title">Einträge</h2>

          {submissionsQuery.isLoading && (
            <div className="empty-state">Lädt Einträge...</div>
          )}

          {submissionsQuery.isError && (
            <div className="error-box">
              Fehler beim Laden der Einträge: {(submissionsQuery.error as Error).message}
            </div>
          )}

          {!submissionsQuery.isLoading &&
            !submissionsQuery.isError &&
            sortedEntries.length === 0 && (
              <div className="empty-state">Noch keine Einträge — sei der Erste!</div>
            )}

          <div className="entry-list">
            {sortedEntries.map((s) => (
              <div key={s.id} className="entry-card">
                <div className="entry-left">
                  <div className="entry-name">{s.name}</div>
                  <div className="entry-item">{s.item}</div>
                </div>

                {s.guests && <div className="badge">{s.guests}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}