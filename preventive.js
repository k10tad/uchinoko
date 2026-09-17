function heartwormData(){
 const p=pet();
 if(!p.heartworm)p.heartworm={name:'',stock:0,lastDate:'',history:[]};
 if(!Array.isArray(p.heartworm.history))p.heartworm.history=[];
 return p.heartworm;
}
function vaccineData(){const p=pet();if(!Array.isArray(p.vaccinations))p.vaccinations=[];return p.vaccinations}
function dayNumber(date){return date?Math.max(1,diff(date,today())+1):null}
function latestVaccine(){return[...vaccineData()].sort((a,b)=>b.date.localeCompare(a.date))[0]}
function preventiveSettings(){
 const hw=heartwormData(),vaccine=latestVaccine(),history=[...vaccineData()].sort((a,b)=>b.date.localeCompare(a.date));
 return`<section class="card settings-block preventive-card"><div class="row between"><div><h3>フィラリア予防薬</h3><span class="small muted">${esc(pet().name)}の記録</span></div>${action('heartworm-settings','設定','link')}</div><div class="preventive-summary"><div><small>薬の名前</small><b>${esc(hw.name||'未登録')}</b></div><div><small>残薬</small><b>${Number(hw.stock)||0} 個</b></div><div><small>最終投薬日</small><b>${hw.lastDate?fmt(hw.lastDate):'未登録'}</b></div><div><small>投薬から</small><b>${hw.lastDate?dayNumber(hw.lastDate)+'日目':'—'}</b></div></div>${action('heartworm-dose','投薬を記録','secondary wide')}</section><section class="card settings-block preventive-card"><div class="row between"><div><h3>ワクチン</h3><span class="small muted">${esc(pet().name)}の接種記録</span></div>${action('vaccine-add','＋ 接種を記録','link')}</div>${vaccine?`<div class="vaccine-latest"><span class="eyebrow">LATEST</span><strong>${esc(vaccine.type)}</strong><p>${fmt(vaccine.date)} · 接種から ${dayNumber(vaccine.date)}日目</p></div>`:'<p class="small muted">ワクチンの接種記録はありません。</p>'}${history.length?`<div class="vaccine-history">${history.map(v=>`<div><span><b>${esc(v.type)}</b><small>${fmt(v.date)}</small></span>${action('vaccine-delete','削除','link',`data-id="${v.id}"`)}</div>`).join('')}</div>`:''}</section>`;
}
function heartwormSettingsModal(){
 const hw=heartwormData();
 modal('フィラリア予防薬の設定',field('薬の名前','name',hw.name||'','text','maxlength="100"')+field('現在の残薬数','stock',Number(hw.stock)||0,'number','min="0" step="1" required')+field('最終投薬日（任意）','lastDate',hw.lastDate||'','date','max="'+today()+'"'),f=>{
  const stock=Number(f.get('stock')),date=f.get('lastDate');
  if(!Number.isInteger(stock)||stock<0){toast('残薬数を0以上の整数で入力してください');return false}
  if(date&&date>today()){toast('未来の日付は登録できません');return false}
  hw.name=String(f.get('name')||'').trim();hw.stock=stock;hw.lastDate=date;
  if(date&&!hw.history.some(item=>item.date===date))hw.history.push({id:uid(),date,amount:0,manual:true});
  commit('フィラリア予防薬を保存しました');
 });
}
function heartwormDoseModal(){
 const hw=heartwormData();
 modal('フィラリア薬の投薬を記録',`<p class="small muted">${esc(hw.name||'薬名未登録')} · 残り ${Number(hw.stock)||0} 個</p>`+field('投薬日','date',today(),'date','required max="'+today()+'"')+field('使用した数','amount',1,'number','min="1" step="1" required')+textarea('メモ（任意）','memo'),f=>{
  const date=f.get('date'),amount=Number(f.get('amount'));
  if(!date||date>today()){toast('今日までの日付を入力してください');return false}
  if(!Number.isInteger(amount)||amount<1){toast('使用した数を1以上の整数で入力してください');return false}
  if(amount>Number(hw.stock||0)){toast('残薬数を超えています。先に残薬数を修正してください');return false}
  hw.stock-=amount;hw.history.push({id:uid(),date,amount,memo:f.get('memo')});
  hw.lastDate=[hw.lastDate,date].filter(Boolean).sort().at(-1)||date;
  commit('フィラリア薬の投薬を記録しました');
 });
}
const vaccineTypes=['狂犬病','5種混合','6種混合','7種混合','8種混合','10種混合','その他'];
function vaccineModal(){
 modal('ワクチン接種を記録',select('ワクチンの種類','type',vaccineTypes.map(type=>[type,type]),'狂犬病')+field('「その他」の名称','other','','text','placeholder="種類が一覧にない場合" maxlength="100"')+field('接種日','date',today(),'date','required max="'+today()+'"')+textarea('メモ（任意）','memo'),f=>{
  const date=f.get('date'),type=f.get('type')==='その他'?String(f.get('other')||'').trim():f.get('type');
  if(!type){toast('ワクチンの種類を入力してください');return false}
  if(!date||date>today()){toast('今日までの接種日を入力してください');return false}
  vaccineData().push({id:uid(),type,date,memo:f.get('memo')});commit('ワクチン接種を記録しました');
 });
}
function deleteVaccine(id){modal('接種記録を削除','<p>このワクチン接種記録を削除します。</p>',()=>{pet().vaccinations=vaccineData().filter(item=>item.id!==id);commit('接種記録を削除しました')},'削除する')}
