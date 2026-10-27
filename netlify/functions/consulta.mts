import { consulta, createLimiter, reply } from "../../lib/consulta.ts";
const limited=createLimiter();
export default async function handler(request:Request,context:{ip:string}) {
 if(limited(context.ip || "unknown")) return reply({code:"RATE_LIMIT",message:"Has realizado varias consultas. Espera un minuto antes de continuar."},429,{"Retry-After":"60"});
 return consulta(request,process.env);
}
export const config={
 path:"/api/consulta",
 rateLimit:{windowLimit:8,windowSize:60,aggregateBy:["ip","domain"]},
};

