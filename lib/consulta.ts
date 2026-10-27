export type Config = Record<string, string | undefined>;
export type Resultado = { folio: string; etapa: string | null; tarea: string | null; avance: number | null; actualizado: string | null; observacion: string | null };
const headers = { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" };
export function reply(body: object, status = 200, extra: Record<string,string> = {}) {
  return Response.json(body, { status, headers: { ...headers, ...extra } });
}
function text(value: unknown): string | null {
  if (typeof value === "string") return value.trim().slice(0, 1500) || null;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) return value.filter(v => typeof v === "string").join(" · ").slice(0,1500) || null;
  return null;
}
export function progress(value: unknown, scale = "fraction"): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return value.length === 1 ? progress(value[0], scale) : null;
  const percentText = typeof value === "string" && value.trim().endsWith("%");
  if (typeof value !== "number" && typeof value !== "string") return null;
  const n = typeof value === "number" ? value : Number(value.trim().replace(/%$/, "").replace(",", "."));
  if (!Number.isFinite(n)) return null;
  const result = percentText || scale === "percent" ? n : n * 100;
  return result >= 0 && result <= 100 ? Math.round(result) : null;
}
export function createLimiter(now = Date.now) {
  const attempts = new Map<string, { count: number; expires: number }>();
  return (key: string) => {
    const t = now();
    for (const [k,v] of attempts) if (v.expires <= t) attempts.delete(k);
    const entry = attempts.get(key);
    if (entry) return ++entry.count > 8;
    if (attempts.size >= 5000) return true;
    attempts.set(key, { count: 1, expires: t + 60000 });
    return false;
  };
}
export async function consulta(request: Request, env: Config, upstream: typeof fetch = fetch): Promise<Response> {
  if (request.method !== "POST") return reply({ code: "METHOD", message: "Utiliza el formulario de consulta." },405,{Allow:"POST"});
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== new URL(request.url).origin))
    return reply({code:"ORIGIN",message:"Abre la consulta desde el sitio de SIGRI."},403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
    return reply({code:"FORMAT",message:"La consulta no tiene un formato válido."},415);
  if (Number(request.headers.get("content-length") || 0) > 1024)
    return reply({code:"SIZE",message:"La consulta es demasiado extensa."},413);
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("empty");
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const {done,value} = await reader.read(); if(done) break;
      length += value.byteLength;
      if (length > 1024) { await reader.cancel(); return reply({code:"SIZE",message:"La consulta es demasiado extensa."},413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset=0;
    for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    body=JSON.parse(new TextDecoder().decode(bytes));
  } catch { return reply({code:"FORMAT",message:"La consulta no tiene un formato válido."},400); }
  const raw = body && typeof body === "object" && "folio" in body ? body.folio : null;
  const folio = typeof raw === "string" ? raw.trim() : "";
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(folio))
    return reply({code:"INVALID_FOLIO",message:"Escribe tu folio completo. Solo admite letras, números, guiones y guiones bajos."},400);
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_NAME)
    return reply({code:"UNAVAILABLE",message:"La consulta no está disponible por el momento. Comunícate con SIGRI."},503);
  const fields = { folio:env.AIRTABLE_FIELD_FOLIO||"Folio", etapa:env.AIRTABLE_FIELD_ETAPA||"Etapa", tarea:env.AIRTABLE_FIELD_TAREA||"Tarea", avance:env.AIRTABLE_FIELD_AVANCE||"Porcentaje" };
  const optional = { actualizado:env.AIRTABLE_FIELD_ACTUALIZADO?.trim(), observacion:env.AIRTABLE_FIELD_OBSERVACION?.trim() };
  if (/[{}\\]/.test(fields.folio))
    return reply({code:"UNAVAILABLE",message:"La consulta no está disponible por el momento."},503);
  const url=new URL("https://api.airtable.com/v0/"+encodeURIComponent(env.AIRTABLE_BASE_ID)+"/"+encodeURIComponent(env.AIRTABLE_TABLE_NAME));
  url.searchParams.set("maxRecords","2");
  if(env.AIRTABLE_VIEW_NAME) url.searchParams.set("view",env.AIRTABLE_VIEW_NAME);
  url.searchParams.set("filterByFormula",'EXACT({'+fields.folio+'}&"", "'+folio+'")');
  for(const name of new Set([...Object.values(fields),...Object.values(optional)].filter(Boolean))) url.searchParams.append("fields[]",name!);
  try {
    const response = await upstream(url,{ headers:{Authorization:"Bearer "+env.AIRTABLE_TOKEN}, cache:"no-store",signal:AbortSignal.timeout(10000)});
    if(response.status===429) return reply({code:"BUSY",message:"Hay varias consultas en curso. Espera 30 segundos y vuelve a intentarlo."},429,{"Retry-After":"30"});
    if(!response.ok) return reply({code:"UNAVAILABLE",message:"El sistema de seguimiento no está disponible por el momento. Intenta más tarde."},502);
    const data=await response.json();
    if(!Array.isArray(data.records)) throw new Error("invalid response");
    if(data.records.length===0) return reply({code:"NOT_FOUND",message:"No encontramos una carpeta con ese folio. Revisa letras, números y guiones; si el problema continúa, contacta a SIGRI."},404);
    if(data.records.length>1) return reply({code:"DUPLICATE",message:"No podemos identificar una sola carpeta con este folio. Contacta a SIGRI para revisarlo."},409);
    const record=data.records[0]?.fields;
    if(!record || typeof record!=="object") throw new Error("invalid fields");
    if(String(record[fields.folio]??"")!==folio) throw new Error("mismatched folio");
    const updated = optional.actualizado ? text(record[optional.actualizado]) : null;
    return reply({
      folio,
      etapa:text(record[fields.etapa]),
      tarea:text(record[fields.tarea]),
      avance:progress(record[fields.avance],env.AIRTABLE_PROGRESS_SCALE||"fraction"),
      actualizado:updated && !Number.isNaN(Date.parse(updated)) ? updated : null,
      observacion:optional.observacion ? text(record[optional.observacion]) : null,
    } satisfies Resultado);
  } catch { return reply({code:"CONNECTION",message:"No pudimos conectar con el sistema de seguimiento. Intenta nuevamente en unos minutos."},502); }
}

