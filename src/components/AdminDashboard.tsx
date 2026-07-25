'use client';

import { useState, useEffect, useCallback } from 'react';

const A = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';

function T():string{if(typeof window==='undefined')return '';return new URLSearchParams(window.location.search).get('token')||''}
async function P(p:string):Promise<any>{const t=T();if(!t)return{ok:false};try{const r=await fetch(A+p,{headers:{'x-admin-token':t},signal:AbortSignal.timeout(8e3)});return r.json()}catch{return{ok:false}}}
function F(d:any):string{if(!d)return'-';try{return new Date(d).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}catch{return d||'-'}}

type T='overview'|'users'|'queries'|'feedback'|'revenue'|'errors'|'settings';

const TABS:{k:T;l:string}[]=[
  {k:'overview',l:'总览'},{k:'users',l:'用户'},{k:'queries',l:'查询'},{k:'feedback',l:'反馈'},{k:'revenue',l:'收入'},{k:'errors',l:'错误'},{k:'settings',l:'设置'},
];

export default function Admin(){
  const [tab,setTab]=useState<T>('overview');
  const [ok,setOk]=useState(false);
  const [ch,setCh]=useState(true);
  const [on,setOn]=useState<number|null>(null);
  const [st,setSt]=useState<any>(null);
  const [tr,setTr]=useState<any[]>([]);
  const [us,setUs]=useState<any[]>([]);
  const [rv,setRv]=useState<any>(null);
  const [er,setEr]=useState<any[]>([]);
  const [fb,setFb]=useState<any[]>([]);

  // Auth on mount
  useEffect(()=>{
    const token=T();
    if(!token){setCh(false);return}
    P('/web/admin/stats').then(d=>{if(d.ok){setOk(true);setSt(d)}else{setCh(false)}}).catch(()=>setCh(false));
  },[]);

  // Load tab data
  const load=useCallback(async(tab:T)=>{
    switch(tab){
      case'overview':{const[s,_,o,u,r,e]=await Promise.all([P('/web/admin/stats'),P('/web/admin/traffic?days=30'),P('/web/admin/online'),P('/web/admin/users'),P('/web/admin/revenue'),P('/web/admin/errors')]);s.ok&&setSt(s);_.ok&&setTr(_.days||[]);o.ok&&setOn(o.online);u.ok&&setUs(u.users||[]);r.ok&&setRv(r);e.ok&&setEr(e.errors||[]);break}
      case'users':{const u=await P('/web/admin/users');u.ok&&setUs(u.users||[]);break}
      case'queries':{break}
      case'feedback':{const f=await P('/web/admin/feedback');f.ok&&setFb(f.feedback||[]);break}
      case'revenue':{const r=await P('/web/admin/revenue');r.ok&&setRv(r);break}
      case'errors':{const e=await P('/web/admin/errors');e.ok&&setEr(e.errors||[]);break}
    }
  },[]);

  useEffect(()=>{if(ok)load(tab)},[ok,tab,load]);
  useEffect(()=>{if(!ok)return;const i=setInterval(()=>P('/web/admin/online').then(d=>d.ok&&setOn(d.online)),3e4);return ()=>clearInterval(i)},[ok]);

  if(!ok)return <div style={{maxWidth:480,margin:'80px auto',padding:20,textAlign:'center',fontFamily:'-apple-system, BlinkMacSystemFont, sans-serif'}}>
    <h2 style={{fontSize:22,fontWeight:700,marginBottom:12,color:'#000'}}>Readlyne 管理后台</h2>
    {ch?<p style={{fontSize:14,color:'#8e8e93'}}>验证中…</p>:<div style={{background:'#fff5f5',border:'1px solid #ffd7d5',borderRadius:10,padding:'16px 20px'}}>
      <p style={{fontSize:14,color:'#d70015',margin:0}}>访问需要 token 参数</p>
      <p style={{fontSize:12,color:'#8e8e93',marginTop:8}}>readlyne.com/dashboard?token=&lt;管理密码&gt;</p>
    </div>}
  </div>;

  const nav=(k:T)=>{setTab(k);window.location.hash=k};

  return <div style={{minHeight:'100vh',background:'#fff',color:'#000',fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',display:'flex'}}>
    <style>{'.site-footer,.bottom-nav,[aria-label="Toggle theme"]{display:none!important}'}</style>
    <aside style={{width:220,borderRight:'1px solid #e5e5e5',padding:'0 12px',position:'fixed',top:0,left:0,bottom:0,background:'#fff',zIndex:100,overflowY:'auto'}}>
      <div style={{padding:'20px 12px 16px',borderBottom:'1px solid #f0f0f0',marginBottom:8}}>
        <div style={{fontSize:18,fontWeight:700,letterSpacing:'-0.03em'}}>懂了么</div>
        <div style={{fontSize:11,color:'#8e8e93',marginTop:1}}>Admin</div>
      </div>
      <div style={{padding:'8px 12px 16px',borderBottom:'1px solid #f0f0f0',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#34c759'}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#34c759',display:'inline-block'}} />Online: {on!==null?on:'…'}
        </div>
      </div>
      <nav style={{display:'flex',flexDirection:'column',gap:2}}>
        {TABS.map(t=>
          <button key={t.k} onClick={()=>nav(t.k)}
            style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'8px 12px',borderRadius:6,fontSize:13,fontWeight:500,border:'none',cursor:'pointer',textAlign:'left',color:tab===t.k?'#000':'#666',background:tab===t.k?'#f5f5f5':'transparent'}}
          ><span style={{fontSize:14,opacity:0.6}}>{'📈📊💬📧💰⚠️⚙️'['overview users queries feedback revenue errors settings'.split(' ').indexOf(t.k)]}</span>{t.l}</button>
        )}
      </nav>
    </aside>
    <main style={{flex:1,marginLeft:220,padding:'32px 40px',maxWidth:'calc(100vw - 220px)'}}>
      {tab==='overview'&&<OverviewD st={st} tr={tr} on={on} us={us} rv={rv} er={er} />}
      {tab==='users'&&<UsersD us={us} />}
      {tab==='queries'&&<div><h2 style={{fontSize:18,fontWeight:700}}>用户查询</h2><p style={{fontSize:13,color:'#8e8e93'}}>（开发中 - 需要重建数据接口）</p></div>}
      {tab==='feedback'&&<FeedbackD fb={fb} />}
      {tab==='revenue'&&<RevenueD rv={rv} />}
      {tab==='errors'&&<ErrorsD er={er} />}
      {tab==='settings'&&<div style={{border:'1px solid #e5e5e5',borderRadius:10,padding:60,textAlign:'center',color:'#aeaeb2'}}><div style={{fontSize:32,marginBottom:12}}>⚙️</div><p style={{margin:0}}>开发中</p></div>}
    </main>
  </div>;
}

function OverviewD({st,tr,on,us,rv,er}:any){
  if(!st)return <p style={{color:'#8e8e93',padding:40}}>加载中…</p>;
  const mR=Math.max(...(tr||[]).map((d:any)=>d.requests),1);
  const mU=Math.max(...(tr||[]).map((d:any)=>d.users),1);
  return <div>
    <div style={{marginBottom:28}}>
      <h1 style={{fontSize:22,fontWeight:700,letterSpacing:'-0.03em',margin:0}}>总览</h1>
      <p style={{fontSize:13,color:'#8e8e93',margin:'4px 0 0'}}>
        {new Date().toLocaleDateString('zh-CN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        {on!==null?<span style={{marginLeft:12,color:'#34c759'}}>🟢 {on} 在线</span>:''}
      </p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:24}}>
      <C i='👤' l='注册设备' v={st.installations} />
      <C i='🆕' l='今日用户' v={st.today.unique_users} />
      <C i='📊' l='今日分析' v={st.today.analyze_count} />
      <C i='💬' l='今日回复' v={st.today.reply_count} />
      <C i='💰' l='历史付费' v={st.paid_users} c='#0060df' />
      <C i='😊' l='活跃用户' v={st.today.unique_users} />
    </div>
    {tr&&tr.length>0&&<div style={{border:'1px solid #e5e5e5',borderRadius:10,padding:20,marginBottom:24}}>
      <h2 style={{fontSize:14,fontWeight:600,margin:'0 0 16px'}}>30天趋势</h2>
      <div style={{height:180}}>
        <svg width="100%" height="180" viewBox="0 0 600 180" preserveAspectRatio="none" style={{overflow:'visible'}}>
          {[0,1,2,3,4].map(i=><line key={i} x1={0} y1={36*i} x2={600} y2={36*i} stroke="#f0f0f0" strokeWidth={1} />)}
          <polyline points={tr.map((d:any,i:number)=>`${(i/(tr.length-1))*600},${180-(d.users/mU)*160}`).join(' ')} fill="none" stroke="#0066ff" strokeWidth={2} strokeLinecap="round" />
          <polyline points={tr.map((d:any,i:number)=>`${(i/(tr.length-1))*600},${180-(d.requests/mR)*160}`).join(' ')} fill="none" stroke="#34c759" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{display:'flex',gap:20,marginTop:8,fontSize:11,color:'#8e8e93'}}>
        <span>━<span style={{color:'#0066ff'}}>用户</span></span>
        <span>━<span style={{color:'#34c759'}}>请求</span></span>
      </div>
    </div>}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
      <div style={{border:'1px solid #e5e5e5',borderRadius:10,padding:20}}>
        <h2 style={{fontSize:14,fontWeight:600,margin:'0 0 12px'}}>最近用户</h2>
        {(us||[]).slice(0,8).map((u:any,i:number)=>
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 10px',borderRadius:6,background:'#fafafa',fontSize:12,marginBottom:3}}>
            <span style={{fontFamily:'monospace',fontSize:11,color:'#666'}}>{(u.installation_id||'').slice(0,14)}</span>
            <span>📊{u.total_requests||0}{(u.credits||0)>0?<span style={{color:'#34c759',fontSize:10,marginLeft:4}}>PAID</span>:''}</span>
          </div>
        )}
        {(!us||us.length===0)&&<p style={{color:'#aeaeb2',fontSize:12}}>暂无数据</p>}
      </div>
      <div style={{border:'1px solid #e5e5e5',borderRadius:10,padding:20}}>
        <h2 style={{fontSize:14,fontWeight:600,margin:'0 0 12px'}}>收入概览</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {['today','week','month'].map((k,i)=><div key={k} style={{background:'#fafafa',borderRadius:8,padding:12,textAlign:'center'}}>
            <div style={{fontSize:11,color:'#8e8e93',marginBottom:4}}>{['今日','本周','本月'][i]}</div>
            <div style={{fontSize:18,fontWeight:700}}>{rv?`$${((rv[k]||0)/100).toFixed(2)}`:'—'}</div>
          </div>)}
          <div style={{background:'#fafafa',borderRadius:8,padding:12,textAlign:'center'}}>
            <div style={{fontSize:11,color:'#8e8e93',marginBottom:4}}>付款/退款</div>
            <div style={{fontSize:18,fontWeight:700}}>{rv?.payers||0}<span style={{fontSize:12,fontWeight:400,color:'#ff3b30'}}> / {rv?.refunds||0}</span></div>
          </div>
        </div>
      </div>
    </div>
    <div style={{border:'1px solid #e5e5e5',borderRadius:10,padding:20}}>
      <h2 style={{fontSize:14,fontWeight:600,margin:'0 0 12px'}}>最近错误</h2>
      {(er||[]).slice(0,6).map((e:any,i:number)=>
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 10px',borderRadius:6,background:'#fafafa',fontSize:11,marginBottom:3}}>
          <span style={{color:'#d70015',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{e.message_snippet||'-'}</span>
          <span style={{color:'#aeaeb2',marginLeft:8}}>{F(e.created_at)}</span>
        </div>
      )}
      {(!er||er.length===0)&&<p style={{color:'#aeaeb2',fontSize:12}}>暂无错误 🎉</p>}
    </div>
  </div>;
}

function C({i,l,v,c}:{i:string;l:string;v:string|number;c?:string}){return <div style={{border:'1px solid #e5e5e5',borderRadius:10,padding:'14px 16px'}}>
  <div style={{fontSize:20}}>{i}</div>
  <div style={{fontSize:22,fontWeight:700,color:c||'#000',marginTop:4}}>{v}</div>
  <div style={{fontSize:12,color:'#8e8e93',marginTop:2}}>{l}</div>
</div>}

function UsersD({us}:{us:any[]}){
  const [q,setQ]=useState('');
  const f=us.filter(u=>(u.installation_id||'').includes(q.toLowerCase()));
  return <div>
    <h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>用户</h1>
    <p style={{fontSize:13,color:'#8e8e93',marginBottom:16}}>{us.length} 条</p>
    <input placeholder="搜索用户ID…" value={q} onChange={e=>setQ(e.target.value)} style={{width:320,maxWidth:'100%',padding:'8px 12px',border:'1px solid #e5e5e5',borderRadius:6,fontSize:13,marginBottom:16,background:'#fff',color:'#000',outline:'none'}} />
    <div style={{overflowX:'auto',border:'1px solid #e5e5e5',borderRadius:10}}>
      <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
        <thead><tr>{['ID','请求','Credits','购买','注册','活跃'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',fontWeight:500,color:'#8e8e93',borderBottom:'2px solid #e5e5e5'}}>{h}</th>)}</tr></thead>
        <tbody>{f.map((u:any,i:number)=><tr key={i} style={{borderBottom:'1px solid #f5f5f5'}}>
          <td style={{padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:'#666'}}>{(u.installation_id||'').slice(0,18)}</td>
          <td style={{padding:'8px 10px',fontWeight:600}}>{u.total_requests||0}</td>
          <td style={{padding:'8px 10px',color:(u.credits||0)>0?'#34c759':'#aeaeb2',fontWeight:600}}>{u.credits||0}</td>
          <td style={{padding:'8px 10px'}}>{(u.total_purchases||0)>0?`$${u.total_purchases}`:'—'}</td>
          <td style={{padding:'8px 10px',color:'#8e8e93',fontSize:11}}>{F(u.created_at)}</td>
          <td style={{padding:'8px 10px',color:'#8e8e93',fontSize:11}}>{F(u.updated_at)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function FeedbackD({fb}:{fb:any[]}){
  return <div>
    <h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>反馈</h1>
    <p style={{fontSize:13,color:'#8e8e93',marginBottom:16}}>{fb.length} 条</p>
    {fb.length===0&&<p style={{color:'#aeaeb2'}}>暂无数据</p>}
    {fb.map((f:any,i:number)=><div key={i} style={{border:'1px solid #e5e5e5',borderRadius:10,padding:'12px 14px',marginBottom:8}}>
      <div style={{fontSize:14,marginBottom:4,whiteSpace:'pre-wrap'}}>{f.text}</div>
      <div style={{fontSize:11,color:'#8e8e93'}}>{F(f.time)} · {f.installation_id_hash||'-'}</div>
    </div>)}
  </div>;
}

function RevenueD({rv}:{rv:any}){
  if(!rv)return <p style={{color:'#8e8e93',padding:40}}>加载中…</p>;
  return <div>
    <h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>收入</h1>
    <p style={{fontSize:13,color:'#8e8e93',marginBottom:16}}>Stripe 付款</p>
    <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
      {[['今日',`$${(rv.today/100).toFixed(2)}`],['本周',`$${(rv.week/100).toFixed(2)}`],['本月',`$${(rv.month/100).toFixed(2)}`],['付款',rv.payers],['退款',rv.refunds]].map(([k,v],i)=><div key={i} style={{background:'#fafafa',border:'1px solid #e5e5e5',borderRadius:8,padding:'12px 18px',minWidth:90}}>
        <div style={{fontSize:11,color:'#8e8e93',marginBottom:4}}>{k}</div>
        <div style={{fontSize:18,fontWeight:700}}>{v}</div>
      </div>)}
    </div>
    <div style={{overflowX:'auto',border:'1px solid #e5e5e5',borderRadius:10}}>
      <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
        <thead><tr>{['时间','金额','状态','用户'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:500,color:'#8e8e93',borderBottom:'2px solid #e5e5e5'}}>{h}</th>)}</tr></thead>
        <tbody>{rv.records.map((r:any,i:number)=><tr key={i} style={{borderBottom:'1px solid #f5f5f5'}}>
          <td style={{padding:'10px 14px',color:'#8e8e93',fontSize:11}}>{F(r.time)}</td>
          <td style={{padding:'10px 14px',fontWeight:600}}>{r.amount}</td>
          <td style={{padding:'10px 14px'}}><span style={{background:r.status==='paid'?'#e8f5e9':'#fce8e6',color:r.status==='paid'?'#248a3d':'#d70015',fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4}}>{r.status==='paid'?'成功':r.status==='refunded'?'退款':r.status}</span></td>
          <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:11,color:'#666'}}>{(r.installation_id||'').slice(0,14)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function ErrorsD({er}:{er:any[]}){
  return <div>
    <h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>错误</h1>
    <p style={{fontSize:13,color:'#8e8e93',marginBottom:16}}>{er.length} 条</p>
    <div style={{overflowX:'auto',border:'1px solid #e5e5e5',borderRadius:10}}>
      <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
        <thead><tr>{['时间','模式','信息'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:500,color:'#8e8e93',borderBottom:'2px solid #e5e5e5'}}>{h}</th>)}</tr></thead>
        <tbody>{er.length===0&&<tr><td colSpan={3} style={{padding:40,textAlign:'center',color:'#aeaeb2'}}>暂无错误 🎉</td></tr>}
          {er.map((e:any,i:number)=><tr key={i} style={{borderBottom:'1px solid #f5f5f5'}}>
            <td style={{padding:'10px 14px',color:'#8e8e93',fontSize:11}}>{F(e.created_at)}</td>
            <td style={{padding:'10px 14px'}}>{e.mode}</td>
            <td style={{padding:'10px 14px',color:'#d70015',fontSize:11}}>{e.message_snippet||'-'}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>;
}
