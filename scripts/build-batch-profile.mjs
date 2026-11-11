import {cpSync,mkdirSync,rmSync} from 'node:fs';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const destination=new URL('../dist/batch-profile/',import.meta.url);
rmSync(destination,{recursive:true,force:true});
mkdirSync(destination,{recursive:true});
cpSync(new URL('../src/batch-profile/index.html',import.meta.url),new URL('index.html',destination));
cpSync(new URL('../vendor/batch-profile/brand/',import.meta.url),new URL('brand/',destination),{recursive:true});
await build({entryPoints:[fileURLToPath(new URL('../src/batch-profile/app.jsx',import.meta.url))],bundle:true,minify:true,format:'esm',entryNames:'batch',outdir:fileURLToPath(destination),loader:{'.woff2':'file','.woff':'file'},define:{'process.env.NODE_ENV':'"production"'}});
