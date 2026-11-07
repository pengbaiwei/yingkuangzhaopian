export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','https://pengbaiwei.github.io');
res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers','Content-Type');
if(req.method==='OPTIONS')return res.status(204).end();
if(req.method!=='POST')return res.status(405).json({error:'仅支持 POST'});
const text=req.body?.text;
if(typeof text!=='string'||!text.trim()||text.length>450)return res.status(400).json({error:'请输入450字以内的中文'});
try{
const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text.trim())+'&langpair=zh-CN%7Cen';
const r=await fetch(url,{signal:AbortSignal.timeout(12000)});
const json=await r.json();
const translation=json.responseData?.translatedText;
if(!r.ok||typeof translation!=='string'||!translation.trim()||json.responseStatus!==200)return res.status(502).json({error:'免费翻译服务暂时不可用，请稍后重试'});
return res.status(200).json({translation});
}catch{return res.status(502).json({error:'翻译服务连接失败，请稍后重试'})}
}