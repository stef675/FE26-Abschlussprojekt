import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listeClient } from "../listeClient";
import type { ListeData, Submission } from "../types";

export default function PersonlicheAnsicht() {
  const { key, submissionKey } = useParams<{ key: string; submissionKey: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [guests, setGuests] = useState("");
  const [saved, setSaved] = useState(false);
  const [copiedList, setCopiedList] = useState(false);
  const [copiedPersonal, setCopiedPersonal] = useState(false);

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
      setTimeout(() => setSaved(false), 1800);
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

  const listLink = `${window.location.origin}/liste/${key}`;
  const personalLink = `${window.location.origin}/liste/${key}/${submissionKey}`;

  const copyPersonalLink = async () => {
    try {
      await navigator.clipboard.writeText(personalLink);
      setCopiedPersonal(true);
      setTimeout(() => setCopiedPersonal(false), 1800);
    } catch {
      alert("Kopieren nicht möglich");
    }
  };

  const copyListLink = async () => {
    try {
      await navigator.clipboard.writeText(listLink);
      setCopiedList(true);
      setTimeout(() => setCopiedList(false), 1800);
    } catch {
      alert("Kopieren nicht möglich");
    }
  };

  const sortedEntries = useMemo(() => {
    return [...(submissionsQuery.data ?? [])].sort((a, b) => {
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });
  }, [submissionsQuery.data]);

  if (!key || !submissionKey) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-box">Fehlende Parameter.</div>
        </div>
      </div>
    );
  }

  if (listQuery.isLoading || submissionsQuery.isLoading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">Lädt...</div>
        </div>
      </div>
    );
  }

  if (listQuery.isError || submissionsQuery.isError || !listQuery.data) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-box">
            Fehler beim Laden der Daten.
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

  const liste = listQuery.data;

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="title">{liste.title}</h1>
          <p className="subtitle">{liste.description}</p>
        </div>

        <div className="card prominent-card">
          <h2 className="section-title">Dein persönlicher Link</h2>
          <p className="section-subtitle">
            Speichere diesen Link, um deinen Eintrag später zu bearbeiten.
          </p>

          <div className="copy-row">
            <input className="input" value={personalLink} readOnly />
            <button type="button" className="button-secondary" onClick={copyPersonalLink}>
              Kopieren
            </button>
          </div>

          {copiedPersonal && <div className="success-box">Persönlicher Link kopiert ✅</div>}
        </div>

        <div className="card">
          <h2 className="section-title">Link zur Liste</h2>
          <p className="section-subtitle">
            Schicke diesen Link an alle Gäste – sie können sich direkt eintragen.
          </p>

          <div className="copy-row">
            <input className="input" value={listLink} readOnly />
            <button type="button" className="button-secondary" onClick={copyListLink}>
              Kopieren
            </button>
          </div>

          {copiedList && <div className="success-box">Listen-Link kopiert ✅</div>}
        </div>

        <div className="card">
          <h2 className="section-title">Dein Eintrag</h2>

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
              {updateMutation.isPending ? "Speichert..." : "Speichern →"}
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
                if (window.confirm("Wirklich löschen?")) deleteMutation.mutate();
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

        <div className="card">
          <h2 className="section-title">Einträge</h2>

          <div className="entry-list">
            {sortedEntries.map((s) => (
              <div
                key={s.id}
                className={`entry-card ${s.key === submissionKey ? "entry-card-own" : ""}`}
              >
                <div className="entry-left">
                  <div className="entry-name">
                    {s.name}
                    {s.key === submissionKey && <span className="me-badge">Du</span>}
                  </div>
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