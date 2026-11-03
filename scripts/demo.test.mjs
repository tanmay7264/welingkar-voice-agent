import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import Vapi from '../src/vapi-client.js';
import {callErrorMessage, callEndMessage, isNormalEndReason, isRoomClosedError} from '../src/call-error.js';

test('the installed Vapi SDK resolves to the callable client constructor',()=>{
  assert.equal(typeof Vapi,'function');
  assert.equal(typeof Vapi.prototype.start,'function');
  assert.equal(typeof Vapi.prototype.stop,'function');
});

test('unsupported 3D rendering keeps the decorative fallback without throwing',()=>{
  let fallbackRetained=false;
  const source=readFileSync(new URL('../src/visual.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  const host={classList:{remove(name){fallbackRetained=name==='webgl-ready';}}};
  const THREE={WebGLRenderer:class{constructor(){throw new Error('WebGL is unavailable');}}};
  assert.doesNotThrow(()=>vm.runInNewContext(source,{THREE,document:{getElementById(id){return id==='visual'?host:{};}}}));
  assert.equal(fallbackRetained,true);
});

function setup({noMic=false,reject=false,startImpl}={}) {
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
  let copiedUrl;
  let client;
  class Vapi {
    constructor(){client=this;this.events={};this.starts=0;this.muted=false;}
    on(name,fn){this.events[name]=fn;}
    async start(){this.starts++;if(startImpl)return startImpl(this);if(reject)throw new Error('test connection failure');return{id:'test-call'};}
    stop(){this.events['call-end']();}
    isMuted(){return this.muted;}
    setMuted(value){this.muted=value;}
  }
  const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInNewContext(source,{Vapi,callErrorMessage,callEndMessage,isNormalEndReason,isRoomClosedError,config:{publicKey:'test-public',assistantId:'test-assistant'},document:{getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},querySelectorAll(){return[];},createElement(){return new Element();},createTextNode(text){return {text};}},navigator:{mediaDevices:noMic?undefined:{getUserMedia(){}},clipboard:{async writeText(value){copiedUrl=value;}}},window:{location:{href:'https://example.github.io/welingkar-voice-agent/?demo=1#page-title'},addEventListener(){}},setInterval(){return 1;},clearInterval(){},setTimeout(){},Date,URL,Blob});
  return {client,el:id=>elements.get(id),copiedUrl:()=>copiedUrl};
}

test('sharing preserves the GitHub Pages project path without query or fragment',async()=>{
  const page=setup();
  await page.el('share').listeners.click();
  assert.equal(page.copiedUrl(),'https://example.github.io/welingkar-voice-agent/');
});

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

test('audio connection failures expose the correct cause and allow another attempt',async()=>{
  const {client,el}=setup();
  await el('start').listeners.click();
  client.events['call-start-progress']({stage:'daily-call-join',status:'started'});
  assert.match(el('voice-status').textContent,/Connecting live audio/);
  client.events.error({type:'daily-call-join-error',error:{message:'websocket connection timed out'}});
  assert.match(el('error').textContent,/live audio connection failed/);
  assert.doesNotMatch(el('error').textContent,/balance|credits/);
  assert.equal(el('start-label').textContent,'Try connecting again');
  assert.equal(el('start').disabled,false);
  await el('start').listeners.click();
  assert.equal(client.starts,2);
});

test('nested microphone errors remain actionable and optional audio processing errors do not end a call',()=>{
  assert.match(callErrorMessage({error:{name:'NotAllowedError',message:'Permission denied'}}),/Microphone access is blocked/);
  const {client,el}=setup();
  client.events['call-start']();
  client.events.error({type:'audio-processing-setup-error',error:{message:'Krisp initialization canceled'}});
  assert.equal(el('end').hidden,false);
});

test('join failure keeps retry locked until SDK cleanup finishes and preserves its cause',async()=>{
  let finish;
  const {client,el}=setup({startImpl:()=>new Promise(resolve=>{finish=resolve;})});
  const attempt=el('start').listeners.click();
  client.events.error({type:'daily-call-join-error',error:{message:'WebSocket connection timed out'}});
  client.events['call-end']();
  assert.equal(el('start').disabled,true);
  await el('start').listeners.click();
  assert.equal(client.starts,1);
  finish(null);
  await attempt;
  assert.equal(el('start').disabled,false);
  assert.match(el('error').textContent,/outside the in-app browser/);
  assert.doesNotMatch(el('error').textContent,/assistant is available/);
});

test('recovered start clears stale errors and billing takes priority over transport wrapper',async()=>{
  assert.match(callErrorMessage({type:'daily-error',error:{message:'402 credit limit'}}),/billing or credit limit/);
  const {client,el}=setup();
  await el('start').listeners.click();
  client.events.error({type:'daily-error',error:{message:'network connection failed'}});
  assert.equal(el('error').hidden,false);
  client.events['call-start']();
  assert.equal(el('error').hidden,true);
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
  assert.match(failed.el('error').textContent,/live audio connection failed/);
});

test('normal assistant and silence endings do not show a failed-room-join error',async()=>{
  for (const reason of ['assistant-ended-call','assistant-ended-call-after-message-spoken','silence-timed-out','exceeded-max-duration']) {
    const {client,el}=setup();
    await el('start').listeners.click();
    client.events['call-start']();
    client.events.message({type:'status-update',status:'ended',endedReason:reason});
    client.events.error({type:'daily-error',error:{message:'Meeting has ended'}});
    client.events['call-end']();
    assert.equal(el('error').hidden,true,reason);
    assert.equal(el('start').disabled,false,reason);
    assert.equal(el('end').hidden,true,reason);
    if(reason==='silence-timed-out')assert.match(el('voice-status').textContent,/period of silence/);
  }
});

test('room closure can precede terminal status without producing a connection error',async()=>{
  const {client,el}=setup();
  await el('start').listeners.click();
  client.events['call-start']();
  client.events.error({type:'daily-error',error:{errorMsg:'Meeting has ended'}});
  assert.equal(el('error').hidden,true);
  assert.match(el('voice-status').textContent,/call has ended/);
  client.events.message({type:'status-update',status:'ended',endedReason:'silence-timed-out'});
  assert.match(el('voice-status').textContent,/period of silence/);
});

test('real mid-call network failures remain visible after SDK synthetic leave status',async()=>{
  const {client,el}=setup();
  await el('start').listeners.click();
  client.events['call-start']();
  client.events.error({type:'daily-error',error:{message:'WebSocket connection timed out'}});
  client.events['call-end']();
  client.events.message({type:'status-update',status:'ended',endedReason:'customer-ended-call'});
  assert.equal(el('error').hidden,false);
  assert.match(el('error').textContent,/connection was interrupted/);
  assert.doesNotMatch(el('error').textContent,/could not connect/);
});

test('normal ending state resets before retry and does not hide the next join failure',async()=>{
  const {client,el}=setup();
  await el('start').listeners.click();
  client.events['call-start']();
  client.events.message({type:'status-update',status:'ended',endedReason:'assistant-ended-call'});
  await el('start').listeners.click();
  client.events.error({type:'daily-call-join-error',error:{message:'Meeting has ended'}});
  assert.equal(el('error').hidden,false);
  assert.match(el('error').textContent,/connection failed/);
});

test('server-reported failure after room closure remains an unexpected end',async()=>{
  const {client,el}=setup();
  await el('start').listeners.click();
  client.events['call-start']();
  client.events.error({type:'daily-error',error:{message:'Meeting has ended'}});
  client.events.message({type:'status-update',status:'ended',endedReason:'pipeline-error-openai-llm-failed'});
  assert.equal(el('error').hidden,false);
  assert.match(el('error').textContent,/ended unexpectedly/);
});
