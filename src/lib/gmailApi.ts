/** Gmail REST API helpers — used with OAuth access token from Google Identity Services. */

const API = "https://gmail.googleapis.com/gmail/v1";

export type GmailMessageListItem = { id: string; threadId: string };

export type GmailMessageSummary = {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  labelIds: string[];
  subject: string;
  from: string;
  dateHeader: string;
};

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Gmail API error ${res.status}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function listMessageIds(
  token: string,
  maxResults = 50,
  query?: string,
): Promise<GmailMessageListItem[]> {
  const params = new URLSearchParams({ maxResults: String(maxResults) });
  if (query) params.set("q", query);
  const res = await fetch(`${API}/users/me/messages?${params}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ messages?: GmailMessageListItem[] }>(res);
  return data.messages ?? [];
}

type Header = { name: string; value: string };

type Payload = {
  mimeType?: string;
  headers?: Header[];
  body?: { data?: string; size?: number };
  parts?: Payload[];
};

type MessageResource = {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
  labelIds?: string[];
  payload?: Payload;
};

function headerMap(payload?: Payload): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of payload?.headers ?? []) {
    map[h.name.toLowerCase()] = h.value;
  }
  return map;
}

export async function getMessageMetadata(
  token: string,
  id: string,
): Promise<GmailMessageSummary> {
  const params = new URLSearchParams({
    format: "metadata",
    metadataHeaders: "Subject",
  });
  params.append("metadataHeaders", "From");
  params.append("metadataHeaders", "Date");
  const res = await fetch(`${API}/users/me/messages/${encodeURIComponent(id)}?${params}`, {
    headers: authHeaders(token),
  });
  const m = await parseJson<MessageResource>(res);
  const headers = headerMap(m.payload);
  const subject = headers["subject"] ?? "(No subject)";
  const from = headers["from"] ?? "(Unknown)";
  const dateHeader = headers["date"] ?? "";
  return {
    id: m.id,
    threadId: m.threadId,
    snippet: m.snippet ?? "",
    internalDate: m.internalDate ?? "0",
    labelIds: m.labelIds ?? [],
    subject,
    from,
    dateHeader,
  };
}

export async function loadInboxSummaries(
  token: string,
  maxResults = 50,
): Promise<GmailMessageSummary[]> {
  const ids = await listMessageIds(token, maxResults);
  if (ids.length === 0) return [];
  const summaries = await Promise.all(ids.map((item) => getMessageMetadata(token, item.id)));
  return summaries.sort((a, b) => Number(b.internalDate) - Number(a.internalDate));
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  try {
    const binary = atob(base64 + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return "";
  }
}

function collectBodyParts(
  part: Payload | undefined,
  out: { html: string[]; plain: string[] },
): void {
  if (!part) return;
  const mt = part.mimeType ?? "";
  if (mt === "text/html" && part.body?.data) {
    out.html.push(decodeBase64Url(part.body.data));
  } else if (mt === "text/plain" && part.body?.data) {
    out.plain.push(decodeBase64Url(part.body.data));
  }
  if (part.parts) {
    for (const p of part.parts) collectBodyParts(p, out);
  }
}

export type FullMessageBody = {
  subject: string;
  from: string;
  to: string;
  date: string;
  html: string | null;
  plain: string | null;
};

export async function getFullMessage(token: string, id: string): Promise<FullMessageBody> {
  const res = await fetch(
    `${API}/users/me/messages/${encodeURIComponent(id)}?format=full`,
    { headers: authHeaders(token) },
  );
  const m = await parseJson<MessageResource>(res);
  const headers = headerMap(m.payload);
  const out = { html: [] as string[], plain: [] as string[] };
  collectBodyParts(m.payload, out);
  const html = out.html.length ? out.html.join("\n") : null;
  const plain = out.plain.length ? out.plain.join("\n\n") : null;
  return {
    subject: headers["subject"] ?? "(No subject)",
    from: headers["from"] ?? "",
    to: headers["to"] ?? "",
    date: headers["date"] ?? "",
    html,
    plain,
  };
}

export async function modifyLabels(
  token: string,
  id: string,
  addLabelIds?: string[],
  removeLabelIds?: string[],
): Promise<void> {
  const res = await fetch(
    `${API}/users/me/messages/${encodeURIComponent(id)}/modify`,
    {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        addLabelIds: addLabelIds ?? [],
        removeLabelIds: removeLabelIds ?? [],
      }),
    },
  );
  await parseJson(res);
}

export async function trashMessage(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/users/me/messages/${encodeURIComponent(id)}/trash`, {
    method: "POST",
    headers: authHeaders(token),
  });
  await parseJson(res);
}

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sendRawMessage(token: string, rawMime: string): Promise<void> {
  const raw = utf8ToBase64Url(rawMime);
  const res = await fetch(`${API}/users/me/messages/send`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  await parseJson(res);
}

export function buildMimeMessage(to: string, subject: string, body: string): string {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body.replace(/\r?\n/g, "\r\n"),
  ];
  return lines.join("\r\n");
}
