const KEY=process.env.DEEPSEEK_API_KEY||"";
const BASE="https://api.deepseek.com/v1";
type ChatResponse = { choices?: Array<{ message?: { content?: string } }> };
export async function chat(m,t=512){
 let r=await fetch(BASE+"/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+KEY},body:JSON.stringify({model:"deepseek-chat",messages:m,max_tokens:t,temperature:0.7})});
 if(!r.ok)throw Error("DS"+r.status);
 let j=await r.json() as ChatResponse;return j.choices?.[0]?.message?.content||"";
}
export async function recommendPlan(i){
 try{
  let r=await chat([{role:"system",content:"Recommend 3 performance plans for the event. Return ONLY JSON with top-level keys: budget, recommended, upgrade. Each plan has fields: tier (T0-T6), duration (minutes as number), price (CNY as number), reason (Chinese text)."},{role:"user",content:JSON.stringify(i)}],512);
  let a=JSON.parse(r);
  if(a.budget) return {budget:a.budget,recommended:a.recommended,upgrade:a.upgrade};
  return {budget:a.budget||a,recommended:a.recommended||a.main||a,upgrade:a.upgrade||a};
 }catch{
  return{budget:{tier:"T4",duration:45,price:4800,reason:"省钱版"},recommended:{tier:"T3",duration:60,price:6000,reason:"主推版"},upgrade:{tier:"T2",duration:90,price:9000,reason:"升级版"}};
 }
}
export async function generateFollowUp(i){
 try{let r=await chat([{role:"system",content:"Generate a follow-up message. Return ONLY JSON with script and suggestedAction fields."},{role:"user",content:JSON.stringify(i)}],256);return JSON.parse(r)}
 catch{return{script:"您好。",suggestedAction:"wechat"}}
}
export async function scoreOpportunity(i){
 try{let r=await chat([{role:"system",content:"Score this opportunity 0-100. Return ONLY JSON with score, priority, reasoning, riskTags fields."},{role:"user",content:JSON.stringify(i)}],256);return JSON.parse(r)}
 catch{return{score:50,priority:"medium",reasoning:"failed",riskTags:[]}}
}
