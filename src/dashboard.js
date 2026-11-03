const dialog = document.getElementById('context-dialog');
const content = document.getElementById('dialog-content');
const title = document.getElementById('dialog-title');
const menu = document.getElementById('menu-toggle');
const scrim = document.getElementById('nav-scrim');
const titles = {overview:'A better first hello', programmes:'Programme queries', batch:'Batch profile', placement:'Placement hub', conversations:'Your conversation', insights:'Conversation insights', settings:'Demo settings', help:'How to talk to Aanya'};
let returnFocus;

function closeNavigation() {
  document.body.classList.remove('nav-open');
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label','Open navigation');
  scrim.hidden = true;
}

function openPanel(name, trigger) {
  closeNavigation();
  if (name === 'voice') {
    document.getElementById('voice-workspace').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    document.getElementById('start').focus({preventScroll:true});
    return;
  }
  const template = document.getElementById(`content-${name}`);
  if (!template) return;
  returnFocus = trigger.closest('.sidebar') && window.matchMedia('(max-width:850px)').matches ? menu : trigger;
  dialog.classList.toggle('batch-dialog', name === 'batch');
  title.textContent = titles[name];
  content.replaceChildren(template.content.cloneNode(true));
  if (name === 'conversations') {
    const destination = content.querySelector('#session-transcript');
    const messages = document.querySelectorAll('#transcript .message');
    if (messages.length) messages.forEach(message=>destination.append(message.cloneNode(true)));
    else {
      const note=document.createElement('p');
      note.textContent='No conversation yet. Start a voice call to see your current transcript here.';
      destination.append(note);
    }
  }
  if (name === 'insights') {
    content.querySelector('[data-metric="duration"]').textContent=document.getElementById('timer').textContent;
    for (const role of ['user','assistant']) content.querySelector(`[data-metric="${role}"]`).textContent=String(document.querySelectorAll(`#transcript .message.${role}:not(.interim)`).length);
  }
  content.querySelectorAll('[data-set-theme]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelector(`.theme-switch [data-theme-choice="${button.dataset.setTheme}"]`).click();
  }));
  document.querySelectorAll('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.panel===name));
  dialog.showModal();
}

document.querySelectorAll('[data-panel]').forEach(button=>button.addEventListener('click',()=>openPanel(button.dataset.panel,button)));
dialog.addEventListener('close',()=>{
  content.replaceChildren();
  document.querySelectorAll('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.panel==='voice'));
  returnFocus?.focus({preventScroll:true});
});
menu.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')!=='true';
  document.body.classList.toggle('nav-open',open);
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  scrim.hidden=!open;
});
scrim.addEventListener('click',closeNavigation);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNavigation();});
