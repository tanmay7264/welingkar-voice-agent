import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../src/theme.js',import.meta.url),'utf8');
function setup({stored=null,dark=false,blocked=false}={}) {
  const root={dataset:{}};
  const buttons=['light','dark'].map(theme=>({dataset:{themeChoice:theme},attributes:{},listeners:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.listeners[k]=v;}}));
  const storage=new Map(stored?[['campus-connect-theme',stored]]:[]);
  const media={matches:dark,addEventListener(k,fn){this.changed=fn;}};
  const meta={setAttribute(k,v){this[k]=v;}};
  const document={documentElement:root,readyState:'complete',querySelector(){return meta;},querySelectorAll(){return buttons;}};
  const window={matchMedia(){return media;},localStorage:{getItem(k){if(blocked)throw Error('Storage blocked');return storage.get(k);},setItem(k,v){if(blocked)throw Error('Storage blocked');storage.set(k,v);}}};
  vm.runInNewContext(source,{document,window});
  return {root,buttons,storage,media,meta};
}

test('theme follows the device initially and remembers an explicit choice across reloads',()=>{
  const page=setup({dark:true});
  assert.equal(page.root.dataset.theme,'dark');
  assert.equal(page.buttons[1].attributes['aria-pressed'],'true');
  page.buttons[0].listeners.click();
  assert.equal(page.root.dataset.theme,'light');
  assert.equal(page.meta.content,'#f7f7f2');
  assert.equal(page.storage.get('campus-connect-theme'),'light');
  page.media.changed({matches:true});
  assert.equal(page.root.dataset.theme,'light');
  assert.equal(setup({stored:page.storage.get('campus-connect-theme'),dark:true}).root.dataset.theme,'light');
});

test('both themes remain usable when browser storage is blocked or invalid',()=>{
  const page=setup({blocked:true});
  assert.equal(page.root.dataset.theme,'light');
  assert.doesNotThrow(()=>page.buttons[1].listeners.click());
  assert.equal(page.root.dataset.theme,'dark');
  assert.equal(page.buttons[0].attributes['aria-pressed'],'false');
  assert.equal(page.buttons[1].attributes['aria-pressed'],'true');
  assert.equal(setup({stored:'unexpected-value',dark:true}).root.dataset.theme,'dark');
});
