import { Lecture } from '@/types/Lecture';

const API_BASE = 'http://localhost:4000';

export async function fetchLectures(): Promise<Lecture[]> {
  const res = await fetch(`${API_BASE}/lectures`);
  return res.json();
}

export async function fetchLecture(id: number): Promise<Lecture> {
  const res = await fetch(`${API_BASE}/lectures/${id}`);
  return res.json();
}

export async function updateLecture(id: number, updates: Partial<Lecture>): Promise<{ message: string; lecture: Lecture }> {
  const res = await fetch(`${API_BASE}/lectures/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function summarizeLecture(id: number): Promise<{ summary: string }> {
  const res = await fetch(`${API_BASE}/lectures/${id}/summarize`, {
    method: 'POST',
  });
  return res.json();
}
