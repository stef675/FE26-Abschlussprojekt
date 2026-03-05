# Projektaufgabe: liste.live

## Was ist das?

Du baust **liste.live** – eine einfache Web-App zum Erstellen und Teilen von Mitbringlisten für Veranstaltungen.

**Ablauf aus Nutzersicht:**

1. Gastgeber erstellt eine Liste (Name, Beschreibung, optionales Datum & Gästezahl)
2. Gastgeber teilt den Link zur Liste mit seinen Gästen
3. Gäste tragen sich ein (Name + was sie mitbringen)
4. Jeder Gast bekommt einen persönlichen Link zu seinem Eintrag, über den er ihn später bearbeiten oder löschen kann

---

## Tech-Stack

| Was | Womit |
|---|---|
| Framework | React 19 |
| Routing | React Router v7 (Data Mode, `createBrowserRouter`) |
| HTTP-Requests | `fetch` (nativ) oder `axios` (optional) |
| Datenfetching | **TanStack Query** (dringend empfohlen) |
| Styling | nach Wahl (Tailwind, CSS Modules, plain CSS) |
| Sprache | TypeScript (empfohlen) oder JavaScript |

---

## Routen

Die folgende Routenstruktur ist ein Vorschlag – sie ist nicht festgeschrieben. Du kannst die App mit **drei oder vier Routen** umsetzen, je nachdem wie du die persönliche Ansicht löst.

```
/                            → Startseite
/neue-liste                  → Formular: neue Liste erstellen
/liste/:key                  → Listenansicht + Eintragen-Formular
/liste/:key/:submissionKey   → Persönliche Ansicht nach dem Eintragen
```

**Die Herausforderung bei der Beitrags-Route:**

Die persönliche Ansicht nach dem Eintragen zeigt denselben Inhalt wie die Listenansicht – nur ergänzt um den persönlichen Link und das Bearbeiten/Löschen-Formular. Du hast zwei Möglichkeiten:

- **Vier Routen** – `/liste/:key/:submissionKey` ist eine eigene Route. Übersichtlich, aber du hast doppelten Code für die Einträge-Liste und die Listeninfos.
- **Drei Routen** – Die Listenansicht (`/liste/:key`) liest einen Query-Parameter (`?sub=submissionKey`) aus der URL mit `useSearchParams()`. Wenn dieser vorhanden ist, wird die persönliche Ansicht eingeblendet. React Router v7 unterstützt außerdem optionale Parameter (`/liste/:key/:submissionKey?`), womit ebenfalss beides in einer einzigen Route abgedeckt wird.

Es gibt kein "richtig" oder "falsch" – entscheide dich für einen Ansatz, bevor du anfängst.

**Empfehlung: React Router Data Mode**

Nutze `createBrowserRouter` statt `<BrowserRouter>` und `<RouterProvider>` statt `<Router>`. Das ist der moderne Weg in React Router v7 – und die Grundlage für spätere Erweiterungen wie Loaders und Actions:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/neue-liste', element: <NeueListe /> },
  { path: '/liste/:key', element: <Liste /> },
  // Siehe Herausforderung oben
  { path: '/liste/:key/:submissionKey', element: <Beitrag /> },
])

// in main.tsx:
<RouterProvider router={router} />
```

---

## API

Du arbeitest mit einem lokalen Dev-Backend, das du vom Kursleiter erhältst und lokal startest.

**Base URL (öffentlich, kein API-Key nötig):**

```
http://localhost:3000/public
```

Alle Routen und ihre genauen Request/Response-Formate sind auf der **Startseite des Dev-Backends** dokumentiert – öffne dazu einfach `http://localhost:3000` im Browser.

> Hard-coded URLs im Code sind für den Anfang völlig in Ordnung.

---

### Übersicht der Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/lists/:key` | Liste laden |
| `POST` | `/api/lists` | Neue Liste erstellen |
| `GET` | `/api/submissions?listKey=...` | Einträge einer Liste laden |
| `POST` | `/api/submissions` | Neuen Eintrag erstellen |
| `PATCH` | `/api/submissions/:key` | Eintrag bearbeiten |
| `DELETE` | `/api/submissions/:key` | Eintrag löschen |

---

### Wichtige Datenfelder

**Liste** – Antwort von `GET /api/lists/:key`:

```json
{
  "id": 42,
  "key": "abc123",
  "title": "Grillparty bei Julia",
  "description": "Bitte bringt Getränke und Salate mit.",
  "eventDate": "2026-07-12",
  "attendees": 20
}
```

> `eventDate` (Format `YYYY-MM-DD`) und `attendees` sind optional.

**Eintrag** – Antwort von `GET /api/submissions?listKey=...`:

```json
[
  {
    "id": 1,
    "key": "xyz789",
    "name": "Anna",
    "item": "Kartoffelsalat",
    "guests": "3 Personen",
    "createdAt": 1720000000
  }
]
```

> `guests` ist optional. `createdAt` ist ein Unix-Timestamp (Sekunden). Die `id` der Liste (`listId`) wird beim Erstellen eines Eintrags benötigt – sie kommt aus dem Listen-Objekt.

---

## Seiten im Detail

### `/` – Startseite

Einfache Landing Page mit:
- App-Name und kurzer Beschreibung
- Button → `/neue-liste`

---

### `/neue-liste` – Liste erstellen

Formular mit:

| Feld | Typ | Pflicht |
|---|---|---|
| Name der Liste | Text-Input | ja |
| Beschreibung | Textarea | ja |
| Datum der Veranstaltung | Date-Input | nein |
| Erwartete Gäste | Number-Input | nein |

Nach erfolgreichem Absenden: Weiterleitung zu `/liste/:key`.

Validierung:
- Name und Beschreibung dürfen nicht leer sein
- Fehlermeldungen direkt am jeweiligen Feld anzeigen

---

### `/liste/:key` – Listenansicht

Zeigt:
1. **Listeninfos**: Titel, Beschreibung, ggf. Datum und Gästezahl
2. **Teilen-Karte**: URL der Liste zum Kopieren
3. **Eintragen-Formular** (s. u.)
4. **Liste aller Einträge**

**Eintragen-Formular:**

| Feld | Typ | Pflicht |
|---|---|---|
| Dein Name | Text-Input | ja |
| Was bringst du mit? | Text-Input | ja |
| Gäste (optional) | Text-Input | nein |

Nach erfolgreichem Absenden: Weiterleitung zu `/liste/:key/:submissionKey`.

---

### `/liste/:key/:submissionKey` oder `/liste/:key?sub=submissionKey` – Persönliche Ansicht

Zeigt nach dem Eintragen:
1. **Persönliche Link-Karte**: Der Link zu dieser Seite – Gast soll ihn speichern, um seinen Eintrag später zu bearbeiten oder zu löschen
2. **Teilen-Karte**: Link zur Liste (ohne `submissionKey`) zum Weiterschicken
3. **Eintrag bearbeiten**: Vorausgefülltes Formular zum Bearbeiten des eigenen Eintrags
4. **Eintrag löschen**: Button mit Bestätigungsschritt ("Wirklich löschen?") – nach dem Löschen Weiterleitung zur Listenansicht
5. **Liste aller Einträge** – der eigene Eintrag ist hervorgehoben

---

## Aufgaben

Bearbeitet die Aufgaben in dieser Reihenfolge:

### Aufgabe 1 – Projekt aufsetzen

- [ ] React-App mit Vite erstellen: `npm create vite@latest`
- [ ] React Router installieren: `npm install react-router@latest`
- [ ] Router mit `createBrowserRouter` aufsetzen und `<RouterProvider>` in `main.tsx` einbinden (siehe Routen-Abschnitt)
- [ ] TanStack Query installieren: `npm install @tanstack/react-query`
- [ ] `QueryClientProvider` in der App-Root einrichten:
  ```tsx
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  const queryClient = new QueryClient()

  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
  ```
- [ ] Dev-Backend starten: im Backend-Ordner `npm run dev` ausführen
- [ ] Backend unter `http://localhost:3000` im Browser öffnen und API-Dokumentation lesen

### Aufgabe 2 – Startseite

- [ ] Einfache Startseite mit Titel und Link zu `/neue-liste`

### Aufgabe 3 – Liste erstellen

- [ ] Formular auf `/neue-liste` bauen
- [ ] `POST /api/lists` mit `useMutation` aufrufen
- [ ] Bei Erfolg: zu `/liste/:key` weiterleiten (mit `useNavigate`)
- [ ] Validierung: Pflichtfelder prüfen, Fehler am Feld anzeigen

### Aufgabe 4 – Listenansicht

- [ ] Liste und Einträge laden mit `useQuery` – je ein Query für `GET /api/lists/:key` und `GET /api/submissions?listKey=...`
- [ ] Lade- und Fehlerzustand anzeigen (`isLoading`, `isError`)
- [ ] Listeninfos darstellen
- [ ] Einträge auflisten
- [ ] URL der Liste anzeigen + Kopieren-Button

> Mit TanStack Query bekommst du Caching, automatisches Neu-Laden und Ladezustände kostenlos – kein manuelles `useEffect` + `useState` nötig.

**Optional – Annäherndes Real-time mit `refetchInterval`:**

Damit die Einträge-Liste automatisch aktualisiert wird, wenn andere Gäste sich eintragen, kannst du dem Submissions-Query ein Intervall mitgeben:

```tsx
useQuery({
  queryKey: ['submissions', listKey],
  queryFn: () => fetchSubmissions(listKey),
  refetchInterval: 5000, // alle 5 Sekunden neu laden
})
```

> Sinnvoll nur für den Submissions-Query – die Listeninfos ändern sich nicht und müssen nicht wiederholt geladen werden.


### Aufgabe 5 – Eintragen

- [ ] Formular auf der Listenansicht bauen
- [ ] `POST /api/submissions` mit `useMutation` aufrufen
- [ ] Nach Erfolg den Einträge-Query invalidieren (`queryClient.invalidateQueries`), damit die Liste neu geladen wird
- [ ] Bei Erfolg: zu `/liste/:key/:submissionKey` weiterleiten

### Aufgabe 6 – Persönliche Ansicht

- [ ] Eigenen Eintrag in der Einträge-Liste hervorheben
- [ ] Persönlichen Link (diese URL) anzeigen + Kopieren-Button
- [ ] Eigenen Eintrag in der Einträge-Liste hervorheben
- [ ] Persönlichen Link (diese URL) anzeigen + Kopieren-Button
- [ ] Bearbeiten-Formular mit vorausgefüllten Werten
- [ ] `PATCH /api/submissions/:key` mit `useMutation` aufrufen, danach Query invalidieren
- [ ] "Eintrag löschen"-Button mit Bestätigungsschritt implementieren
- [ ] `DELETE /api/submissions/:key` mit `useMutation` aufrufen, danach zu `/liste/:key` weiterleiten

### Bonus-Aufgabe – API-Key und Umgebungsvariablen

Das Dev-Backend kann auch im **geschützten Modus** betrieben werden: Dann werden alle Requests ohne gültigen API-Key mit `401 Unauthorized` abgelehnt. In diesem Modus lautet die Base URL:

```
http://localhost:3000
```

Deine Aufgabe:

- [ ] Alle API-Requests um den Header `X-API-Key: <dein-key>` ergänzen
- [ ] Den API-Key **nicht** direkt in den Code schreiben ("hard-coded"), sondern in einer `.env`-Datei speichern:

```
VITE_API_KEY=dein-schluessel-hier
```

- [ ] Im Code über `import.meta.env.VITE_API_KEY` darauf zugreifen
- [ ] `.env` zur `.gitignore` hinzufügen, damit der Key nicht ins Repository gelangt

> **Warum `.env`?** API-Keys und Passwörter gehören nicht in den Quellcode – sie könnten sonst in der Git-History landen und für andere sichtbar sein. Umgebungsvariablen trennen Konfiguration vom Code.

---

## Tipps

- **TanStack Query** ersetzt `useEffect` + `useState` für alle Datenfetch-Operationen – nutze `useQuery` zum Laden und `useMutation` zum Schreiben/Löschen
- Nach jeder Mutation die betroffenen Queries mit `queryClient.invalidateQueries({ queryKey: [...] })` invalidieren, damit die UI automatisch aktualisiert wird
- `useParams()` gibt dir `:key` und `:submissionKey` aus der URL
- `useSearchParams()` gibt dir `sub` oder was auch immer aus dem QueryString der URL (`/liste/:key?sub=submisssionKey`)
- Du musst kein komplexes State-Management einsetzen – lokaler `useState` reicht für UI-Zustände (Formular offen/zu, Bestätigungsdialog) völlig aus
