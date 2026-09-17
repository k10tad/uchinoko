(()=>{
 const splash=document.getElementById('app-splash');if(!splash)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const remove=()=>splash.remove();
 splash.addEventListener('animationend',event=>{if(event.animationName==='splash-away')remove()});
 // A hard limit also removes the overlay if animation events are unavailable.
 window.setTimeout(remove,reduced?250:1800);
 window.addEventListener('pageshow',event=>{if(event.persisted)remove()});
})();
