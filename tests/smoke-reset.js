const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
// erwartet eine vollständige HTML-Datei als Argument
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch({executablePath:fs.readdirSync('/opt/pw-browsers').filter(d=>/^chromium-/.test(d)).map(d=>'/opt/pw-browsers/'+d+'/chrome-linux/chrome')[0]}));
const errs=[];const c=await b.newContext({viewport:{width:1100,height:800}});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
const T=async l=>console.log(l,'|',await p.textContent('#ptext'),'|',(await p.textContent('#reset')).slice(0,90));
await p.goto('file://'+require('path').resolve(process.argv[2])+'#eva');await p.waitForTimeout(200);await T('eva leer');
await p.check('#eva-t0-0');await p.check('#eva-t0-1');await T('eva 2 Haken');
await p.goto('file://'+require('path').resolve(process.argv[2])+'#text');await p.waitForTimeout(200);await p.check('#text-t0-0');await T('text 1 Haken');
await p.reload();await p.waitForTimeout(200);await T('nach Neuladen');
await p.click('#reset button');await T('Rückfrage');await p.screenshot({path:__dirname+'/reset.png',clip:{x:0,y:0,width:1100,height:800}});
await p.click('#reset button:has-text("Abbrechen")');await T('abgebrochen');
await p.click('#reset button');await p.click('#reset .warn');await T('Blatt gelöscht');console.log('checkbox text:',await p.isChecked('#text-t0-0'));
await p.click('a[href="#start"]');await p.waitForTimeout(100);await T('Start');
await p.click('#reset button');await p.click('#reset .warn');await T('alles gelöscht');
await p.reload();await p.waitForTimeout(200);await T('nach Neuladen 2');
console.log('errors',errs);await b.close()})();
