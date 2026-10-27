import { useRef, useState, type FormEvent } from "react";
import type { Resultado } from "../lib/consulta";
type Estado={type:"idle"}|{type:"loading"}|{type:"success";data:Resultado}|{type:"error";code:string;message:string};
export function ConsultaForm(){
 const [folio,setFolio]=useState("");const [estado,setEstado]=useState<Estado>({type:"idle"});
 const input=useRef<HTMLInputElement>(null);const busy=useRef(false);
 async function consultar(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy.current)return;
  const limpio=folio.trim();
  if(!/^[a-zA-Z0-9_-]{1,40}$/.test(limpio)){setEstado({type:"error",code:"INVALID",message:"Escribe el folio completo, sin espacios intermedios."});input.current?.focus();return;}
  busy.current=true;setEstado({type:"loading"});
  try{
   const response=await fetch("/api/consulta",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({folio:limpio}),signal:AbortSignal.timeout(15000)});
   let payload;
   try{payload=await response.json();}catch{payload={};}
   if(response.status===429){setEstado({type:"error",code:"RATE_LIMIT",message:payload.message||"Has realizado varias consultas. Espera un minuto e intenta nuevamente."});return;}
   if(!response.ok){setEstado({type:"error",code:payload.code||"UNAVAILABLE",message:payload.message||"La consulta no está disponible. Intenta más tarde."});return;}
   if(typeof payload.folio!=="string"||!(payload.avance===null||(typeof payload.avance==="number"&&payload.avance>=0&&payload.avance<=100)))throw Error("Invalid response");
   setEstado({type:"success",data:payload});
  }catch{setEstado({type:"error",code:"CONNECTION",message:"No fue posible conectar con el sistema. Revisa tu conexión e intenta más tarde."});}
  finally{busy.current=false;}
 }
 function nuevaConsulta(){setFolio("");setEstado({type:"idle"});input.current?.focus();}
 const titles:Record<string,string>={NOT_FOUND:"Revisa tu folio",INVALID:"Escribe un folio válido",RATE_LIMIT:"Espera un momento",DUPLICATE:"Necesitamos revisar tu folio"};
 return <div className="query-card">
  <div className="query-card-head"><span>Consulta de expediente</span><span className="query-status">Seguimiento por folio</span></div>
  <form onSubmit={consultar} aria-label="Consulta de carpeta por folio" aria-busy={estado.type==="loading"}>
   <label htmlFor="folio">Número de folio</label>
   <div className="folio-control"><span aria-hidden="true">#</span><input ref={input} id="folio" name="folio" value={folio} onChange={e=>{setFolio(e.target.value);if(estado.type!=="idle")setEstado({type:"idle"});}} placeholder="Ej. 128" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={40} disabled={estado.type==="loading"} aria-describedby="folio-help" aria-invalid={estado.type==="error"&&estado.code==="INVALID"}/></div>
   <p id="folio-help" className="field-help">Escríbelo tal como aparece en la información que recibiste.</p>
   <button className="query-button" type="submit" disabled={estado.type==="loading"}>{estado.type==="loading"?"Consultando…":"Consultar progreso"}<span aria-hidden="true">→</span></button>
  </form>
  <div className="query-feedback" aria-live="polite" aria-atomic="true">
   {estado.type==="loading"&&<p className="query-loading" role="status">Buscando el avance de tu carpeta…</p>}
   {estado.type==="error"&&<div className="query-error" role="alert"><span aria-hidden="true">!</span><div><p><strong>{titles[estado.code]||"Consulta no disponible"}</strong>{estado.message}</p><a className="query-support" href="tel:+524431467867">Contactar a SIGRI ↗</a></div></div>}
   {estado.type==="success"&&<div className="query-result">
    <div className="result-title"><span>Carpeta</span><strong>{estado.data.folio}</strong></div>
    <div className="result-progress-head"><span>Avance general</span><strong>{estado.data.avance===null?"Sin dato":estado.data.avance+"%"}</strong></div>
    {estado.data.avance!==null&&<div className="result-progress" role="progressbar" aria-label="Avance de la carpeta" aria-valuemin={0} aria-valuemax={100} aria-valuenow={estado.data.avance}><span style={{width:estado.data.avance+"%"}}/></div>}
    <dl><div><dt>Etapa actual</dt><dd>{estado.data.etapa||"Pendiente de actualizar"}</dd></div><div><dt>Tarea actual</dt><dd>{estado.data.tarea||"Pendiente de actualizar"}</dd></div>{estado.data.actualizado&&<div><dt>Última actualización</dt><dd>{new Intl.DateTimeFormat("es-MX",{dateStyle:"long",timeZone:"UTC"}).format(new Date(estado.data.actualizado))}</dd></div>}{estado.data.observacion&&<div><dt>Observación</dt><dd>{estado.data.observacion}</dd></div>}</dl>
    <button className="new-query" type="button" onClick={nuevaConsulta}>Consultar otro folio</button>
   </div>}
  </div>
  <p className="query-note">La consulta muestra el avance registrado. Para aclaraciones, contacta a SIGRI.</p>
 </div>
}

