import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
test('built batch page bundles Astryx and local assets without a remote dashboard',()=>{
  const page=readFileSync(new URL('../dist/batch-profile/index.html',import.meta.url),'utf8');
  for(const name of ['batch.js','batch.css','brand/recruiter-team.png','brand/weschool-logo.svg']) {
    assert.ok(existsSync(new URL('../dist/batch-profile/'+name,import.meta.url)),name);
  }
  assert.ok(!page.includes('iframe'));
  assert.ok(!page.includes('candidate360'));
  assert.ok(readFileSync(new URL('../dist/batch-profile/batch.css',import.meta.url),'utf8').includes('astryx-button'));
});

test('programme search supports partial names, whitespace, case and empty results',async()=>{
  const {filterProgrammes,programmes,sectors,cities}=await import('../src/batch-profile/data.js');
  assert.equal(programmes.reduce((sum,p)=>sum+p.students,0),680);
  assert.equal(sectors.reduce((sum,s)=>sum+s.offers,0),512);
  assert.equal(cities.reduce((sum,c)=>sum+c[1],0),512);
  assert.deepEqual(filterProgrammes(' HEALTH '),[{name:'Healthcare',students:60}]);
  assert.equal(filterProgrammes('business').length,3);
  assert.equal(filterProgrammes('').length,8);
  assert.deepEqual(filterProgrammes('missing programme'),[]);
});

test('Batch Profile navigates to the full local page before opening a dialog',async()=>{
  const {runInNewContext}=await import('node:vm');
  const elements=new Map();
  const element=()=>({addEventListener(){},setAttribute(){},classList:{remove(){}},hidden:false});
  const batch=element();batch.dataset={panel:'batch'};
  let click, destination, modalOpened=false;
  batch.addEventListener=(name,handler)=>{click=handler;};
  const document={
    body:element(),addEventListener(){},
    getElementById(id){
      if(!elements.has(id))elements.set(id,element());
      const result=elements.get(id);
      if(id==='context-dialog')result.showModal=()=>{modalOpened=true;};
      return result;
    },
    querySelectorAll(selector){return selector==='[data-panel]'?[batch]:[];}
  };
  runInNewContext(readFileSync(new URL('../src/dashboard.js',import.meta.url),'utf8'),{
    document,URL,window:{location:{href:'https://example.com/welingkar-voice-agent/',assign(url){destination=url;}}}
  });
  click();
  assert.equal(destination,'https://example.com/welingkar-voice-agent/batch-profile/');
  assert.equal(modalOpened,false);
});
