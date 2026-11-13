window.__kovaRun = async (k, hx) => {
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const base=window.__kovaBase;
  const L = await (await fetch(base+'listings.json')).json(); const x=L[k];
  const raw=new Uint8Array(32); for(let i=0;i<32;i++) raw[i]=parseInt(hx.substr(i*2,2),16);
  const key=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']);
  const files=async names=>{const dt=new DataTransfer(); for(const [bin,name] of names){const b=new Uint8Array(await (await fetch(base+bin)).arrayBuffer()); const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b.subarray(0,12)},key,b.subarray(12)); dt.items.add(new File([pt],name,{type:name.endsWith('.png')?'image/png':name.endsWith('.mp4')?'video/mp4':'application/pdf'}));} return dt;};
  const put=(dt,idx)=>{const inp=document.querySelectorAll('input[type=file]')[idx]; inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true}));};
  const setv=(el,v)=>{const proto=el.tagName=='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v); ['input','change','blur'].forEach(e=>el.dispatchEvent(new Event(e,{bubbles:true})));};
  const log=[]; for(let w=0;w<30&&document.querySelectorAll('input[type=file]').length<3;w++) await sleep(1000);
  const mediaDt=await files(x.media); const pdfDt=await files(x.pdf);
  const da=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()=='Delete all');
  if(da){ da.click(); await sleep(800); const dlg=[...document.querySelectorAll('[role=dialog], .wt-overlay')].find(d=>d.innerText.includes('Delete all photos and video?')); const bs=[...dlg.querySelectorAll('button')].filter(b=>b.textContent.trim()=='Delete all'); bs[bs.length-1].click(); await sleep(1500); }
  put(mediaDt,0); await sleep(12000);
  let rm; let guard=0;
  while((rm=[...document.querySelectorAll('button[aria-label=Remove]')].find(b=>{let p=b; for(let i=0;i<5;i++) p=p.parentElement; return /\.pdf/i.test(p.innerText) && !p.innerText.includes(x.pdf[0][1]);})) && guard++<5){ rm.click(); await sleep(800); }
  put(pdfDt,2); await sleep(5000);
  setv(document.getElementById('listing-title-input'), x.title);
  setv(document.getElementById('listing-description-textarea'), x.desc);
  const pr=document.getElementById('listing-price-input'); if(pr) setv(pr, x.price); else log.push('NO PRICE INPUT');
  let d; while((d=document.querySelector('button[aria-label^="Delete tag "]'))){ d.click(); await sleep(150); }
  const ti=document.getElementById('listing-tags-input'); let p=ti; for(let i=0;i<6;i++){p=p.parentElement; if([...p.querySelectorAll('button')].some(b=>b.textContent.trim()=='Add')) break;}
  const add=[...p.querySelectorAll('button')].find(b=>b.textContent.trim()=='Add');
  for(const t of x.tags){ setv(ti,t); await sleep(100); add.click(); await sleep(250); }
  await sleep(800);
  const t=document.body.innerText; const i=t.indexOf('Add up to 5 files');
  const media=[...document.querySelectorAll('img[alt], video')].map(e=>e.alt||e.tagName).filter(a=>/Listing image|Primary|VIDEO/.test(a)); return {log, media, title:document.getElementById('listing-title-input').value, price:pr&&pr.value, tags:[...document.querySelectorAll('button[aria-label^="Delete tag "]')].length, files:t.slice(i+18,i+200)};
};
