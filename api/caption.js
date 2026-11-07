export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin',process.env.ALLOWED_ORIGIN||'https://pengbaiwei.github.io');
res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers','Content-Type');
if(req.method==='OPTIONS')return res.status(204).end();
if(req.method!=='POST')return res.status(405).json({error:'仅支持 POST'});
if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'服务端尚未配置 OPENAI_API_KEY'});
try{
const {image,style}=req.body||{};
if(typeof image!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(image)||image.length>4000000)return res.status(400).json({error:'图片格式或大小不符合要求'});
const styles={minimal:'极简摄影风格，8到22个汉字，克制、干净，不要煽情',documentary:'文学纪实风格，15到40个汉字，观察具体细节，不要空泛',quote:'当代年轻人金句，幽默、有洞察、自然不矫情，12到35个汉字',bilingual:'中英双语，中文一行英文一行，短而有质感'};
const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4.1-mini',max_output_tokens:180,input:[{role:'user',content:[{type:'input_text',text:'请根据照片可见内容创作一条用于摄影作品边框排版的文案。'+(styles[style]||styles.minimal)+'。只输出文案本身，不要标题、引号或解释。不要编造照片里看不到的事实。'},{type:'input_image',image_url:image}]}]})});
const json=await response.json();if(!response.ok)return res.status(502).json({error:json.error?.message||'OpenAI 请求失败'});
const caption=(json.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('').trim();
if(!caption)return res.status(502).json({error:'未生成有效文案'});return res.status(200).json({caption:caption.slice(0,300)});
}catch(e){return res.status(500).json({error:'生成失败，请稍后重试'})}
}