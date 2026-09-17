// Diary images share the attachment store and backup, while old inline photos remain readable.
const diaryTileURLs=new Set();
async function hydrateDiaryTiles(){
  for(const url of diaryTileURLs)URL.revokeObjectURL(url);diaryTileURLs.clear();
  for(const img of document.querySelectorAll('[data-diary-media]')){
    try{const row=await mediaGet(img.dataset.diaryMedia);if(!img.isConnected)continue;if(!row)throw Error('写真が見つかりません');const url=URL.createObjectURL(row.blob);diaryTileURLs.add(url);img.src=url}catch{if(img.isConnected)img.alt='写真を読み込めませんでした'}
  }
}
function diaryRecord(id){return db.notes.find(n=>n.id===id&&n.pet===petId)}
async function viewDiary(id){
  const n=diaryRecord(id);if(!n)return;
  modal('日記',`<article class="diary-detail"><div id="diary-images" class="diary-images" aria-label="日記の写真"></div><p id="diary-image-hint" class="small muted"></p><time class="diary-date" datetime="${esc(n.date)}">${esc(n.date.replaceAll('-',' / '))}</time>${n.title?`<h3>${esc(n.title)}</h3>`:''}${n.body?`<p class="note diary-body">${esc(n.body)}</p>`:''}${n.link?`<p class="small muted">関連する記録：${esc(db.logs.find(l=>l.id===n.link)?.detail||'記録')}</p>`:''}<div class="diary-controls">${action('note','編集する','secondary',`data-id="${n.id}"`)}${action('delete-note','削除','link',`data-id="${n.id}"`)}</div></article>`,()=>{},'閉じる');
  // A reading view only needs one dismiss action; retain the fixed close button.
  $('#form .modal-footer [data-action="close"]').remove();
  const target=$('#diary-images');
  if(n.photo){const img=document.createElement('img');img.src=n.photo;img.alt=n.title||'日記の写真';target.append(img)}
  for(const ref of n.attachments||[]){
    try{const row=await mediaGet(ref.id);if(!target.isConnected)return;if(!row)throw Error('写真が見つかりません');const img=document.createElement('img');img.src=mediaURL(row.blob);img.alt=ref.name||'日記の写真';target.append(img)}catch{if(!target.isConnected)return;const msg=document.createElement('p');msg.className='small warn';msg.textContent='写真を読み込めませんでした。添付を含むバックアップから復元してください。';target.append(msg)}
  }
  if(!target.isConnected)return;
  const count=(n.photo?1:0)+(n.attachments?.length||0);
  $('#diary-image-hint').textContent=count>1?`${count}枚の写真 · 横にスワイプして見る`:'';
}
function diaryEditor(id){
  const n=diaryRecord(id),owner=petId;
  const saved=[...(n?.photo?[{id:'legacy',name:'これまでの写真',src:n.photo}]:[]),...(n?.attachments||[])];
  modal(n?'日記を編集':'日記を書く',field('日付','date',n?.date||today(),'date','required')+field('タイトル（任意）','title',n?.title||'','text','maxlength="120"')+textarea('その日の日記・コメント','body',n?.body||'')+`<div class="diary-saved">${saved.map((r,i)=>`<label class="check">${r.src?`<img src="${esc(r.src)}" alt="保存済みの写真">`:icon('photo')}<span>写真 ${i+1}</span><input name="removePhotos" type="checkbox" value="${esc(r.id)}">削除</label>`).join('')}</div>`+field('写真を追加（任意・１回６枚まで）','diaryPhotos','','file','accept="image/*" multiple')+'<div id="diary-selection" class="small muted" aria-live="polite"></div><div id="diary-previews" class="diary-previews"></div>'+select('関連する記録（任意）','link',[['','なし'],...plogs().slice(0,100).map(l=>[l.id,`${l.date} ${labels[l.type]} ${l.detail.slice(0,25)}`])],n?.link||''),async f=>{
    const files=f.getAll('diaryPhotos').filter(f=>f?.size),removed=f.getAll('removePhotos');
    if(files.length>6)throw Error('一度に追加できる写真は６枚までです');
    if(files.some(f=>!f.type.startsWith('image/')))throw Error('写真を選んでください');
    const kept=(n?.attachments||[]).filter(r=>!removed.includes(r.id));
    const photo=removed.includes('legacy')?'':n?.photo||'';
    const title=String(f.get('title')||'').trim(),body=String(f.get('body')||'').trim();
    if(!title&&!body&&!photo&&!kept.length&&!files.length){toast('写真か日記を追加してください');return false}
    // Resize diary photos before storage so an everyday album remains manageable.
    const resized=await Promise.all(files.map(async file=>{const data=await readPhoto(file);const blob=await (await fetch(data)).blob();return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'})}));
    const refs=await saveMediaFiles(resized),previous=db.notes;
    const value={...n,id:n?.id||uid(),pet:owner,date:f.get('date'),title,body,link:f.get('link'),photo,attachments:[...kept,...refs],createdAt:n?.createdAt||new Date().toISOString()};
    db.notes=n?db.notes.map(x=>x.id===n.id?value:x):[...db.notes,value];
    if(!persist()){db.notes=previous;await mediaDelete(refs.map(r=>r.id));return false}
    render();toast('日記を保存しました');
    try{await mediaDelete((n?.attachments||[]).filter(r=>removed.includes(r.id)).map(r=>r.id))}catch{}
  });
  const input=$('#f-diaryPhotos');let previewURLs=[];
  const release=()=>{previewURLs.forEach(u=>URL.revokeObjectURL(u));previewURLs=[]};
  $('#dialog').addEventListener('close',release,{once:true});
  input.addEventListener('change',()=>{
    release();const preview=$('#diary-previews'),selection=$('#diary-selection');preview.replaceChildren();
    const files=Array.from(input.files);
    if(files.length>6||files.some(f=>!f.type.startsWith('image/')||f.size>20000000)){input.value='';selection.textContent='写真は１回６枚・１枚20MB以下で選んでください';return}
    selection.textContent=files.length?`${files.length}枚の写真を追加します`:'';
    files.forEach(file=>{const img=document.createElement('img'),url=URL.createObjectURL(file);previewURLs.push(url);img.src=url;img.alt=file.name;preview.append(img)});
  });
}
function deleteDiary(id){
  const n=diaryRecord(id);if(!n)return;
  modal('日記を削除','<p>この日記と添付した写真を削除します。</p>',async()=>{const previous=db.notes;db.notes=previous.filter(x=>x.id!==id);if(!persist()){db.notes=previous;return false}render();toast('日記を削除しました');try{await mediaDelete((n.attachments||[]).map(r=>r.id))}catch{}},'削除する');
}
