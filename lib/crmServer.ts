const SERVER_URL = process.env.NEXT_PUBLIC_CRM_SERVER_URL || "http://localhost:4000";

export async function saveBinOnServer(payload: any): Promise<string> {
  const res = await fetch(`${SERVER_URL}/bins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed to save bin");
  const json = await res.json();
  return json.id as string;
}

export async function fetchBinFromServer(id: string): Promise<any> {
  const res = await fetch(`${SERVER_URL}/bins/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("bin not found");
  return res.json();
}
