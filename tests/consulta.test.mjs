import test from "node:test";
import assert from "node:assert/strict";
import {consulta,progress,createLimiter} from "../lib/consulta.ts";
const env={AIRTABLE_TOKEN:"test-secret-not-real",AIRTABLE_BASE_ID:"appTest",AIRTABLE_TABLE_NAME:"Seguimiento",AIRTABLE_VIEW_NAME:"01 DATOS DE LA EMPRESA"};
const request=(data,headers={})=>new Request("https://sigri.example/api/consulta",{method:"POST",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify(data)});
const record={Folio:"00128",Etapa:"Preparación",Tarea:"Integración documental",Porcentaje:.48,Empresa:"NO PUBLICAR",Telefono:"NO PUBLICAR"};
function mock(records=[{fields:record}],status=200){return async()=>Response.json({records},{status});}
test("Consulta exacta, conserva ceros y devuelve solo campos públicos",async()=>{
 let called;
 const response=await consulta(request({folio:" 00128 "}),env,async(url,init)=>{called={url:new URL(url),init};return mock()();});
 assert.equal(response.status,200); const data=await response.json();
 assert.deepEqual(data,{folio:"00128",etapa:"Preparación",tarea:"Integración documental",avance:48,actualizado:null,observacion:null});
 assert.equal(called.url.searchParams.get("filterByFormula"),'EXACT({Folio}&"", "00128")');
 assert.equal(called.url.searchParams.get("maxRecords"),"2");
 assert.deepEqual(called.url.searchParams.getAll("fields[]"),["Folio","Etapa","Tarea","Porcentaje"]);
 assert.equal(called.init.headers.Authorization,"Bearer test-secret-not-real");
 assert.equal(response.headers.get("cache-control"),"no-store, max-age=0");
});
test("No admite inyección de fórmula ni cuerpos inválidos",async()=>{
 for(const data of [null,[],{},123,{folio:123},{folio:'a"OR(TRUE())'},{folio:"a b"},{folio:"a".repeat(41)}]){
 let calls=0; const r=await consulta(request(data),env,async()=>{calls++;return mock()();});assert.equal(r.status,400);assert.equal(calls,0);
 }
});
test("No existe folio de demostración ni resultados simulados",async()=>{
 let calls=0;const r=await consulta(request({folio:"DEMO-2026"}),env,async()=>{calls++;return mock([])();});assert.equal(r.status,404);assert.equal(calls,1);
});
test("Folio inexistente devuelve 404 distinto a error de conexión",async()=>{
 const r=await consulta(request({folio:"00128"}),env,mock([]));assert.equal(r.status,404);assert.equal((await r.json()).code,"NOT_FOUND");
 const failed=await consulta(request({folio:"00128"}),env,async()=>{throw Error("upstream token-private");});
 assert.equal(failed.status,502);const text=await failed.text();assert.ok(!text.includes("token-private"));assert.ok(text.includes("CONNECTION"));
});
test("Folios duplicados no eligen un expediente arbitrario",async()=>{
 const r=await consulta(request({folio:"00128"}),env,mock([{fields:record},{fields:record}]));assert.equal(r.status,409);
});
test("Una respuesta ajena al folio no se expone",async()=>{
 const r=await consulta(request({folio:"otro"}),env,mock());assert.equal(r.status,502);
});
test("Datos ausentes permanecen ausentes",async()=>{
 const r=await consulta(request({folio:"00128"}),env,mock([{fields:{Folio:"00128"}}]));const body=await r.json();
 assert.equal(body.avance,null);assert.equal(body.etapa,null);assert.equal(body.tarea,null);
});
test("Escala porcentual explícita y valores faltantes",()=>{
 for(const value of [null,undefined,"",NaN,Infinity,{},[],true,"no disponible",-.2,1.2])assert.equal(progress(value),null);
 assert.equal(progress(0),0);assert.equal(progress(.01),1);assert.equal(progress(.48),48);assert.equal(progress(1),100);
 assert.equal(progress("48%"),48);assert.equal(progress("0,48"),48);assert.equal(progress(1,"percent"),1);assert.equal(progress(48,"percent"),48);assert.equal(progress([.48]),48);
});
test("Airtable saturado devuelve indicación de reintento",async()=>{
 const r=await consulta(request({folio:"00128"}),env,mock([],429));assert.equal(r.status,429);assert.equal(r.headers.get("retry-after"),"30");
});
test("Errores de permisos o formato de Airtable se ocultan",async()=>{
 for(const status of [401,403,422,500]){const r=await consulta(request({folio:"00128"}),env,mock([],status));assert.equal(r.status,502);}
 const r=await consulta(request({folio:"00128"}),env,async()=>Response.json({oops:true}));assert.equal(r.status,502);
});
test("Sin configuración, no intenta contactar a Airtable",async()=>{
 let called=false; const r=await consulta(request({folio:"00128"}),{},async()=>{called=true;return mock()();});
 assert.equal(r.status,503);assert.equal(called,false);
});
test("Rechaza origen externo, formato no JSON y cuerpos extensos",async()=>{
 assert.equal((await consulta(request({folio:"00128"},{origin:"https://evil.example"}),env,mock())).status,403);
 assert.equal((await consulta(request({folio:"00128"},{"Content-Type":"text/plain"}),env,mock())).status,415);
 assert.equal((await consulta(request({folio:"00128",extra:"a".repeat(1100)}),env,mock())).status,413);
});
test("Acepta origen propio y campos opcionales autorizados",async()=>{
 const r=await consulta(request({folio:"00128"},{origin:"https://sigri.example"}),{...env,AIRTABLE_FIELD_ACTUALIZADO:"Fecha",AIRTABLE_FIELD_OBSERVACION:"Nota"},mock([{fields:{...record,Fecha:"2026-10-23",Nota:"En revisión"}}]));
 const data=await r.json();assert.equal(data.actualizado,"2026-10-23");assert.equal(data.observacion,"En revisión");
});
test("Límite local se restablece al concluir la ventana",()=>{
 let time=0;const limited=createLimiter(()=>time);for(let i=0;i<8;i++)assert.equal(limited("a"),false);
 assert.equal(limited("a"),true);assert.equal(limited("b"),false);time=60001;assert.equal(limited("a"),false);
});

