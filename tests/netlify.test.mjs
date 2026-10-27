import test from "node:test";
import assert from "node:assert/strict";
import handler,{config} from "../netlify/functions/consulta.mts";
test("Ruta Netlify coincide con el formulario y tiene límite por IP",()=>{
 assert.equal(config.path,"/api/consulta");
 assert.deepEqual(config.rateLimit.aggregateBy,["ip","domain"]);
 assert.equal(config.rateLimit.windowLimit,8);
});
test("Adaptador devuelve el resultado público de Airtable",async t=>{
 const keys={AIRTABLE_TOKEN:"test-only-token",AIRTABLE_BASE_ID:"appTest",AIRTABLE_TABLE_NAME:"Seguimiento"};
 for(const [k,v] of Object.entries(keys)){const old=process.env[k];process.env[k]=v;t.after(()=>old===undefined?delete process.env[k]:process.env[k]=old);}
 t.mock.method(globalThis,"fetch",async()=>Response.json({records:[{fields:{Folio:"128",Etapa:"Revisión",Tarea:"Verificación",Porcentaje:.25,Privado:"No publicar"}}]}));
 const r=await handler(new Request("https://sigri.netlify.app/api/consulta",{method:"POST",headers:{"Content-Type":"application/json",Origin:"https://sigri.netlify.app"},body:JSON.stringify({folio:"128"})}),{ip:"192.0.2.1"});
 assert.equal(r.status,200);const data=await r.json();assert.equal(data.avance,25);assert.equal(data.folio,"128");assert.equal(data.Privado,undefined);
});
test("Se limita por context.ip sin confiar en cabeceras enviadas por el visitante",async()=>{
 for(let n=0;n<8;n++){const r=await handler(new Request("https://sigri.netlify.app/api/consulta",{method:"POST",headers:{"Content-Type":"application/json","cf-connecting-ip":String(n)},body:"{}"}),{ip:"192.0.2.2"});assert.equal(r.status,400);}
 const r=await handler(new Request("https://sigri.netlify.app/api/consulta",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),{ip:"192.0.2.2"});assert.equal(r.status,429);
});

