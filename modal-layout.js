// Keep dialog controls inside the current visible viewport, including the keyboard.
function updateModalViewport(){
  const viewport=window.visualViewport;
  const height=viewport?.height||window.innerHeight;
  const offset=viewport?.offsetTop||0;
  const mobile=window.matchMedia('(max-width: 650px)').matches;
  // Leave room for the in-app browser's overlaid controls on phones.
  const gutter=mobile?Math.min(64,height*.08):24;
  const dialog=document.querySelector('#dialog');
  dialog.style.setProperty('--modal-center',`${offset+height/2}px`);
  dialog.style.setProperty('--modal-room',`${Math.max(120,height-2*gutter)}px`);
}
window.visualViewport?.addEventListener('resize',updateModalViewport);
window.visualViewport?.addEventListener('scroll',updateModalViewport);
window.addEventListener('resize',updateModalViewport);
