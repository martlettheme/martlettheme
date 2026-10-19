// Stub the Google tag so verification never submits real Analytics data.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const content=await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(content);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const id = 'G-FSDET4HG4L';
const tagUrl = `https://www.googletagmanager.com/gtag/js?id=${id}`;
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const results = [];
const stored = (decision, extra={}) => encodeURIComponent(JSON.stringify({ decision, version:`1:${id}`, expires:Date.now()+86400000, ...extra }));
const settings = page => page.locator('footer [data-cookie-preferences]').click();

async function scenario(name, run, { cookie, gpc=false, javaScriptEnabled=true }={}) {
  const context = await browser.newContext({ viewport:{width:1440,height:1000}, javaScriptEnabled });
  const requests=[], errors=[];
  await context.route('**/*', async route => {
    const url=route.request().url();
    if (url.startsWith(base+'/')) return route.continue();
    requests.push(url);
    if (url===tagUrl) return route.fulfill({contentType:'application/javascript',body:'window.__testTagLoaded=true;'});
    return route.abort();
  });
  if (cookie) await context.addCookies([{ name:'martlet-consent',value:cookie,url:base,sameSite:'Lax' }]);
  if (gpc) await context.addInitScript(() => Object.defineProperty(navigator,'globalPrivacyControl',{value:true}));
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(base+'/?q=private-search#fragment');
    if (javaScriptEnabled) await page.waitForFunction(() => document.querySelector('[data-cookie-state]').textContent);
    await run({page,context,requests});
    assert.deepEqual(errors,[]);
    assert.ok(requests.every(url=>url===tagUrl),'Unexpected third-party request: '+requests.join(', '));
    results.push(name);
    console.log('PASS '+name);
  } finally { await context.close(); }
}

try {
  await scenario('no decision loads no external services or cookies',async({page,context,requests})=>{
    assert.equal(await page.locator('#cookie-banner').isVisible(),true);
    assert.deepEqual(requests,[]);
    assert.deepEqual(await context.cookies(),[]);
    await mkdir('artifacts/qa',{recursive:true});
    await page.screenshot({path:'artifacts/qa/desktop-consent.png'});
  });
  await scenario('rejection persists across pages and settings remain accessible',async({page,context,requests})=>{
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    await page.reload();
    assert.equal(await page.locator('#cookie-banner').isVisible(),false);
    await page.goto(base+'/privacy-and-cookie-notice/');
    await settings(page);
    assert.equal(await page.locator('#cookie-settings-dialog').isVisible(),true);
    assert.match(await page.locator('[data-cookie-state]').textContent(),/rejected/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('footer [data-cookie-preferences]').evaluate(e=>e===document.activeElement),true);
    const cookie=(await context.cookies()).find(c=>c.name==='martlet-consent');
    assert.equal(JSON.parse(decodeURIComponent(cookie.value)).decision,'rejected');
    assert.equal(cookie.sameSite,'Lax');assert.equal(cookie.path,'/');
    assert.deepEqual(requests,[]);
  });
  await scenario('acceptance loads once, withdrawal clears cookies, reacceptance works',async({page,context,requests})=>{
    await page.locator('#cookie-banner [data-cookie-accept]').click();
    await page.waitForFunction(()=>window.__testTagLoaded);
    assert.equal(requests.length,1);
    const config=await page.evaluate(()=>[...window.dataLayer].map(args=>[...args]).find(row=>row[0]==='config'));
    assert.equal(config[1],id);
    assert.equal(config[2].page_location,base+'/');
    assert.equal(config[2].cookie_expires,31536000);
    assert.equal(config[2].allow_google_signals,false);
    assert.equal(config[2].allow_ad_personalization_signals,false);
    await context.addCookies([{name:'_ga',value:'test',url:base},{name:'_ga_TEST',value:'test',url:base}]);
    await settings(page);
    await page.locator('#cookie-settings-dialog [data-cookie-accept]').click();
    assert.equal(requests.length,1);
    await settings(page);
    await Promise.all([page.waitForEvent('load'),page.locator('#cookie-settings-dialog [data-cookie-reject]').click()]);
    assert.equal(await page.locator('script[data-consent-analytics]').count(),0);
    assert.equal(requests.length,1);
    assert.ok((await context.cookies()).every(c=>!c.name.startsWith('_ga')));
    await settings(page);
    await page.locator('#cookie-settings-dialog [data-cookie-accept]').click();
    await page.waitForFunction(()=>window.__testTagLoaded);
    assert.equal(requests.length,2);
  });
  await scenario('saved acceptance loads the tag once',async({page,requests})=>{
    await page.waitForFunction(()=>window.__testTagLoaded);
    assert.equal(requests.length,1);
    assert.equal(await page.locator('#cookie-banner').isVisible(),false);
  },{cookie:stored('accepted')});
  for (const [name,cookie] of [['malformed choice','%not-json'],['expired choice',stored('accepted',{expires:0})],['changed policy',stored('accepted',{version:'old'})]]) {
    await scenario(name+' requires fresh consent',async({page,requests})=>{
      assert.equal(await page.locator('#cookie-banner').isVisible(),true);
      assert.deepEqual(requests,[]);
    },{cookie});
  }
  await scenario('Global Privacy Control overrides prior acceptance',async({page,requests})=>{
    await settings(page);
    assert.equal(await page.locator('#cookie-settings-dialog [data-cookie-accept]').isDisabled(),true);
    assert.match(await page.locator('[data-cookie-state]').textContent(),/Global Privacy Control/);
    assert.deepEqual(requests,[]);
  },{cookie:stored('accepted'),gpc:true});
  await scenario('JavaScript disabled leaves analytics off and the notice readable',async({page,requests})=>{
    assert.equal(await page.locator('#cookie-banner').isVisible(),false);
    await page.locator('footer a[href="/privacy-and-cookie-notice/"]').click();
    assert.equal(await page.getByRole('heading',{name:'Privacy and Cookie Notice',exact:true}).count(),1);
    assert.deepEqual(requests,[]);
  },{javaScriptEnabled:false});
  await scenario('responsive site, artwork, favicon, and Light/Dark preview',async({page})=>{
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.images].every(e=>e.complete&&e.naturalWidth>0));
    await page.evaluate(()=>window.scrollTo(0,0));
    assert.equal(await page.locator('img').evaluateAll(els=>els.every(e=>e.complete&&e.naturalWidth>0)),true);
    await page.getByRole('button',{name:'☀ Martlet Light'}).click();
    assert.equal(await page.locator('#demo').getAttribute('data-martlet'),'light');
    await page.getByRole('button',{name:'☾ Martlet Dark'}).click();
    assert.equal(await page.locator('#demo').getAttribute('data-martlet'),'dark');
    for(const width of [320,390,710,950,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}px`);
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:'artifacts/qa/desktop.png'});
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.screenshot({path:'artifacts/qa/footer.png'});
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/');
    await page.screenshot({path:'artifacts/qa/mobile.png'});
    for(const file of ['favicon.svg','favicon.ico','apple-touch-icon.png','site.webmanifest']) assert.equal((await page.request.get(base+'/'+file)).ok(),true);
    await page.goto(base+'/privacy-and-cookie-notice/');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Privacy notice overflows');
  });
  console.log(`${results.length} browser scenarios passed. Google requests were intercepted.`);
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
