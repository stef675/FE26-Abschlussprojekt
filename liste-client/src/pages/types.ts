export interface ListeData {
  id: number;
  key: string;
  title: string;
  description: string;
  eventDate?: string | null;
  attendees?: number | null;
  createdAt?: number;
}

export interface Submission {
  id: number;
  key: string;
  listId: number;
  name: string;
  item: string;
  guests?: string | null;
  createdAt?: number;
  updatedAt?: number;
}