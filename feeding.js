const feedingDefaults=()=>({weight:Number(weight()?.value)||'',calories:'',unit:'100g',meals:2});
function feedingValues(){return{...feedingDefaults(),...(pet().feeding||{})}}
function feedingMath(values){
 const kg=Number(values.weight),listed=Number(values.calories),meals=Number(values.meals);
 if(!(kg>0)||!(listed>0)||!(meals>=1))return null;
 const kcalPerGram=values.unit==='kg'?listed/1000:listed/100;
 if(!(kcalPerGram>0))return null;
 const rer=70*Math.pow(kg,.75),dailyKcal=rer*1.6,dailyGrams=dailyKcal/kcalPerGram;
 return{rer,dailyKcal,dailyGrams,mealGrams:dailyGrams/meals};
}
const feedingRound=value=>Math.round(value*10)/10;
function feedingResult(values){
 const result=feedingMath(values);
 if(!result)return'<div class="feeding-empty">3項目を入力すると目安量を計算します。</div>';
 return`<div class="feeding-result"><div><strong>${feedingRound(result.dailyGrams)}<span> g</span></strong><small>1日の目安</small></div><div><strong>${feedingRound(result.mealGrams)}<span> g</span></strong><small>1食の目安</small></div><div><strong>${Math.round(result.dailyKcal)}<span> kcal</span></strong><small>1日の推定必要量</small></div></div><p class="small muted">健康な成犬の開始目安（RER × 1.6）です。病院から指定された量がある場合は、その指示を優先してください。</p>`;
}
function feedingCard(){
 const values=feedingValues();
 return`<section class="card feeding-card section-space"><div class="row between"><div><span class="eyebrow">FOOD CALCULATOR</span><h3>ごはん量の目安</h3></div>${icon('food')}</div><div class="feeding-fields"><div>${field('体重（kg）','feeding-weight',values.weight,'number','min="0.1" step="0.01" inputmode="decimal"')}</div><div>${field('パッケージのカロリー','feeding-calories',values.calories,'number','min="1" step="any" inputmode="decimal"')}</div><div>${select('表示単位','feeding-unit',[['100g','kcal／100g'],['kg','kcal／kg']],values.unit)}</div><div>${field('1日の回数','feeding-meals',values.meals,'number','min="1" max="12" step="1" inputmode="numeric"')}</div></div><div id="feeding-result">${feedingResult(values)}</div>${action('feeding-save','計算して保存','primary')}</section>`;
}
function saveFeeding(){
 const values={weight:Number($('#f-feeding-weight')?.value),calories:Number($('#f-feeding-calories')?.value),unit:$('#f-feeding-unit')?.value||'100g',meals:Number($('#f-feeding-meals')?.value)};
 if(!feedingMath(values)){toast('体重・カロリー・1日の回数を確認してください');return}
 pet().feeding=values;
 if(persist()){render();toast('ごはん量の目安を保存しました')}
}
function assignedTo(item,pid=petId){
 const owners=Array.isArray(item?.pets)?item.pets:[];
 return pid===(owners[0]||db.pets[0]?.id);
}
function petHospitals(pid=petId){return(db.hospitals||[]).filter(item=>assignedTo(item,pid))}
function assignmentChecks(selected){const owner=selected.includes(petId)?petId:(selected[0]||petId);return select('登録する子','assignedPet',db.pets.map(p=>[p.id,p.name]),owner)}
