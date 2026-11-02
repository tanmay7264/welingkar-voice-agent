import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function setup({noMic=false,reject=false}={}) {
  class Element {
    constructor() {this.children=[];this.listeners={};this.attributes={};this.classList={toggle(){},add(){},remove(){}};this.hidden=false;}
    addEventListener(name,fn){this.listeners[name]=fn;}
    append(...items){for(const item of items){item.parent=this;this.children.push(item);}}
    replaceChildren(...items){this.children=[];this.append(...items);}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
    setAttribute(name,value){this.attributes[name]=value;}
    focus(){}
  }
  const elements=new Map();
  let client;
  class Vapi {
    constructor(){client=this;this.events={};this.starts=0;this.muted=false;}
    on(name,fn){this.events[name]=fn;}
    async start(){this.starts++;if(reject)throw new Error('test connection failure');return{id:'test-call'};}
    stop(){this.events['call-end']();}
    isMuted(){return this.muted;}
    setMuted(value){this.muted=value;}
  }
  const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInNewContext(source,{Vapi,config:{publicKey:'test-public',assistantId:'test-assistant'},document:{getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},querySelectorAll(){return[];},createElement(){return new Element();},createTextNode(text){return {text};}},navigator:{mediaDevices:noMic?undefined:{getUserMedia(){}}},window:{addEventListener(){}},setInterval(){return 1;},clearInterval(){},setTimeout(){},Date,URL,Blob});
  return {client,el:id=>elements.get(id)};
}

test('prevents duplicate starts, renders transcript text safely, and exports only final captions',async()=>{
  const {client,el}=setup();
  await el('start').listeners.click();
  await el('start').listeners.click();
  assert.equal(client.starts,1);
  client.events['call-start']();
  client.events.message({type:'transcript',role:'user',transcriptType:'partial',transcript:'We are'});
  client.events.message({type:'transcript',role:'user',transcriptType:'final',transcript:'<img src=x onerror=alert(1)> We are hiring.'});
  assert.equal(el('transcript').children.length,1);
  assert.equal(el('transcript').children[0].children[1].text,'<img src=x onerror=alert(1)> We are hiring.');
  el('mute').listeners.click();
  assert.equal(client.muted,true);
  el('end').listeners.click();
  assert.equal(el('download').disabled,false);
  assert.equal(el('end').hidden,true);
  assert.equal(el('mute').attributes['aria-pressed'],'false');
});

test('unsupported microphone and connection failures leave an actionable retry state',async()=>{
  const missing=setup({noMic:true});
  await missing.el('start').listeners.click();
  assert.equal(missing.client.starts,0);
  assert.match(missing.el('error').textContent,/Microphone access is unavailable/);
  const failed=setup({reject:true});
  await failed.el('start').listeners.click();
  assert.equal(failed.el('start').disabled,false);
  assert.equal(failed.el('error').hidden,false);
  assert.match(failed.el('error').textContent,/could not connect/);
});
