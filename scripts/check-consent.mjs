// Stub the Google tag so verification never submits real Analytics data.
import { chromium } from 'playwright';
import { version as coreVersion, foundation, design, capabilities } from '@martlet/theme';
import { createRequire } from 'node:module';
const { version: astroVersion } = createRequire(import.meta.url)('@martlet/astro/package.json');
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json' };
const serve = root => createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const content=await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(content);
  } catch { res.writeHead(404).end(); }
});
const server=serve(root), reactServer=serve(resolve('dist/react'));
await new Promise(done => server.listen(0, '127.0.0.1', done));
await new Promise(done => reactServer.listen(0, '127.0.0.1', done));
const reactBase=`http://127.0.0.1:${reactServer.address().port}`;
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
    if (url.startsWith(base+'/') || url.startsWith(reactBase+'/')) return route.continue();
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
  await scenario('navigation and footer identity refinements', async ({page}) => {
    assert.equal(await page.locator('.mast nav').getByRole('link',{name:'The Language',exact:true}).count(),1);
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    const owner=page.locator('.site-footer .footer-identity');
    await owner.hover();
    assert.equal(await owner.evaluate(e=>getComputedStyle(e).textDecorationLine),'none');
  });

  await scenario('origin link hover and footer treatment', async ({page}) => {
  await page.goto(base+'/');
  const source=page.locator('.source-link');
  await source.hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.source-link')).color === 'rgb(128, 85, 15)');
  const action=page.locator('.terminal-download-links a').first();
  await action.hover();
  assert.equal(await action.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
  const footer=page.locator('footer').getByRole('link',{name:'React reference',exact:true});
  await footer.hover();
  assert.equal(await footer.evaluate(e=>getComputedStyle(e).textDecorationLine),'underline');
});

await scenario('footer typography follows the rendered origin cascade',async({page})=>{
    const heading=await page.locator('footer h2').first().evaluate(e=>{
      const s=getComputedStyle(e);return {family:s.fontFamily,weight:s.fontWeight,size:s.fontSize,leading:s.lineHeight};
    });
    assert.ok(heading.family.includes('Cambo'));
    assert.equal(heading.weight,'400');
    assert.ok(Math.abs(parseFloat(heading.leading)-17.3696)<.05);
    const centers=await page.locator('.footer-bottom').evaluate(e=>Array.from(e.children).map(child=>{const r=child.getBoundingClientRect();return r.top+r.height/2;}));
    assert.ok(Math.abs(centers[0]-centers[1])<1,'Copyright and identity must share the source vertical center');

  });
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
    assert.equal(await page.locator('.theme-specimen[data-martlet="light"]').count(),1);
    assert.equal(await page.locator('.theme-specimen[data-martlet="dark"]').count(),1);
    await page.getByRole('button',{name:'Code',exact:true}).click();
    assert.equal(await page.locator('[data-example-panel="code"]:visible').count(),2);
    assert.equal(await page.locator('[data-example-panel="interface"]:visible').count(),0);
    await page.getByRole('button',{name:'Terminal',exact:true}).click();
    assert.equal(await page.locator('[data-example-panel="terminal"]:visible').count(),2);
    await page.locator('#preview').scrollIntoViewIfNeeded();
    await page.screenshot({path:'artifacts/qa/terminal.png'});
    await page.getByRole('button',{name:'Interface',exact:true}).click();
    for(const width of [280,307,320,360,390,430,710,950,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}px`);
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:'artifacts/qa/desktop.png'});
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.screenshot({path:'artifacts/qa/footer.png'});
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/');
    await page.screenshot({path:'artifacts/qa/mobile.png'});
    for(const file of ['favicon.svg','favicon.ico','apple-touch-icon.png','site.webmanifest','downloads/martlet-light.terminal','downloads/martlet-dark.terminal','downloads/martlet-light.zsh-theme','downloads/martlet-dark.zsh-theme', 'downloads/martlet-vim.zip', 'downloads/martlet-emacs.zip', 'downloads/martlet-light-chrome.zip', 'downloads/martlet-dark-chrome.zip', 'downloads/martlet-firefox.zip', 'downloads/martlet-light-chatgpt.json', 'downloads/martlet-dark-chatgpt.json', 'downloads/martlet-light-chatgpt.txt', 'downloads/martlet-dark-chatgpt.txt', `downloads/martlet-theme-${coreVersion}.tgz`]) assert.equal((await page.request.get(base+'/'+file)).ok(),true,file);
    await page.goto(base+'/privacy-and-cookie-notice/');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Privacy notice overflows');
  });
  await scenario('native desktop imports copy intact and match their downloads',async({page})=>{
    await page.goto(base+'/#downloads');
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__copied=value;}}}));
    for(const mode of ['light','dark']){
      const button=page.locator('.chatgpt-port [data-copy-label]').filter({hasText:mode==='light'?'Copy Light theme':'Copy Dark theme'});
      await button.click();
      const value=await page.evaluate(()=>window.__copied);
      assert.ok(value.startsWith('codex-theme-v1:'));
      const payload=JSON.parse(value.slice('codex-theme-v1:'.length));
      assert.equal(payload.variant,mode);assert.equal(payload.codeThemeId,'codex');
      const download=await page.request.get(base+'/downloads/martlet-'+mode+'-chatgpt.txt');
      assert.equal(download.ok(),true);assert.equal((await download.text()).trim(),value);
      assert.ok((await page.locator('#copy-status').textContent()).length<80);
    }
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
    const button=page.locator('.chatgpt-port [data-copy-label]').first();
    await button.click();
    assert.equal(await page.locator('#copy-value').inputValue(),await button.getAttribute('data-copy'));
    await page.locator('[data-copy-close]').click();
  });
  await scenario('token search, palette switching, copying, and contrast calculation',async({page})=>{
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__copied=value;}}}));
    await page.locator('#token-search').fill('--martlet-accent');
    assert.equal(await page.locator('[data-token]:visible').count(),4);
    await page.getByRole('button',{name:'Dark palette',exact:true}).click();
    await page.locator('[data-token="accent"] [data-copy]').click();
    assert.equal(await page.evaluate(()=>window.__copied),'#FEE46E');
    assert.match(await page.locator('#copy-status').textContent(),/Copied #FEE46E/);
    await page.locator('#token-search').fill('not-a-token');
    assert.equal(await page.locator('#no-tokens').isVisible(),true);
    await page.locator('#token-search').fill('');
    await page.locator('#token-category').selectOption('syntax');
    assert.equal(await page.locator('[data-token]:visible').count(),15);
    await page.locator('#contrast-foreground').selectOption('bg');
    await page.locator('#contrast-background').selectOption('bg');
    assert.equal(await page.locator('#contrast-ratio').textContent(),'1.00:1');
    assert.match(await page.locator('#contrast-verdict').textContent(),/Below AA/);
    await page.locator('#contrast-foreground').selectOption('text');
    assert.match(await page.locator('#contrast-verdict').textContent(),/AA and AAA/);
    await page.getByRole('button',{name:'Light palette',exact:true}).click();
    assert.equal(await page.locator('#contrast-sample').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
    await page.locator('#palette').scrollIntoViewIfNeeded();
    await page.screenshot({path:'artifacts/qa/workspace.png'});
    const details=page.locator('.theme-specimen[data-martlet="light"] [data-show-note]');
    await details.click();
    assert.equal(await details.getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('#light-note').isVisible(),true);
  });
  await scenario('narrow phone layouts and enlarged text stay inside the viewport',async({page})=>{
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    const assertFits=async(label)=>{
      const layout=await page.evaluate(()=>({
        viewport:document.documentElement.clientWidth,
        width:document.documentElement.scrollWidth,
        offenders:[...document.body.querySelectorAll('*')].filter(e=>{
          const r=e.getBoundingClientRect();
          return r.width&&getComputedStyle(e).visibility!=='hidden'&&r.right>document.documentElement.clientWidth+1&&!e.closest('pre,.token-scroll');
        }).map(e=>({element:e.tagName+'.'+e.className,parent:e.parentElement.className,text:e.textContent.slice(0,80)})).slice(0,12)
      }));
      assert.ok(layout.width<=layout.viewport,`${label}: ${JSON.stringify(layout)}`);
    };
    for(const width of [280,307,320,360,390,430]) {
      await page.setViewportSize({width,height:844});
      for(const example of ['Interface','Code','Terminal']) {
        await page.getByRole('button',{name:example,exact:true}).click();
        await assertFits(`${width}px ${example}`);
      }
      await page.locator('.css-instructions').evaluate(e=>{e.open=true;});
      await page.locator('.terminal-download details').evaluate(e=>{e.open=true;});
      await page.locator('.zsh-download details').evaluate(e=>{e.open=true;});
      await page.locator('.app-ports details').evaluateAll(els=>els.forEach(e=>{e.open=true;}));
      await assertFits(`${width}px expanded download instructions`);
    }
    await page.setViewportSize({width:307,height:844});
    await page.getByRole('button',{name:'Interface',exact:true}).click();
    // Approximate browser text enlargement without disabling a user's zoom preferences.
    await page.evaluate(()=>{
      const text=[...document.querySelectorAll('h1,h2,h3,p,a,button,label,summary,.brand small,.footer-brand-copy strong,.footer-brand-copy>span')];
      const sizes=text.map(e=>parseFloat(getComputedStyle(e).fontSize)*1.5);
      text.forEach((e,i)=>{e.style.fontSize=sizes[i]+'px';});
    });
    await assertFits('307px with 150% text');
    await page.goto(base+'/privacy-and-cookie-notice/');
    await assertFits('307px privacy notice');
  });
  await scenario('clipboard unavailable gives a selectable manual-copy value',async({page})=>{
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
    const button=page.getByRole('button',{name:'Copy Martlet Dark accent #FEE46E',exact:true});
    await button.click();
    assert.equal(await page.locator('#copy-dialog').isVisible(),true);
    assert.equal(await page.locator('#copy-value').inputValue(),'#FEE46E');
    await page.locator('[data-copy-close]').click();
    assert.equal(await button.evaluate(e=>e===document.activeElement),true);
  });
  await scenario('public package links and generated design system reference',async({page})=>{
    await page.locator('#cookie-banner [data-cookie-reject]').click();
    await page.goto(base+'/#downloads');
    assert.equal(await page.locator('#npm-title').count(),1);
    assert.equal(await page.locator('.app-ports a[href="https://www.npmjs.com/package/@martlet/theme"]').count(),1);
    assert.equal(await page.locator('.app-ports a[href="https://www.npmjs.com/package/@martlet/astro"]').count(),1);
    await page.locator('.mast nav a[href="/design-system/"]').click();await page.waitForURL(base+'/design-system/');
    assert.equal(await page.getByRole('heading',{name:'Build with Martlet.',exact:true}).count(),1);
    const response=await page.request.get(base+'/design-system.json');
    assert.equal(response.ok(),true);
    const spec=await response.json();
    assert.equal(spec.packages.core.version,coreVersion);
    assert.equal(spec.packages.astro.version,astroVersion);
    assert.deepEqual(spec.foundation,foundation);
    assert.deepEqual(spec.design,design);
    assert.deepEqual(spec.capabilities,capabilities);
    assert.equal(await page.locator('#foundation tbody tr').count(),Object.keys(foundation.tokens).length);
    assert.equal(await page.locator('#astro tbody tr').count(),5);
    for(const width of [280,307,390,1440]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Design reference overflow at ${width}px`);
    }
    await page.setViewportSize({width:307,height:900});
    await page.addStyleTag({content:'html{font-size:150% !important}'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Design reference overflow with enlarged text');
    await mkdir('artifacts/qa',{recursive:true});
    await page.screenshot({path:'artifacts/qa/design-system-mobile.png'});
  });
  await scenario('canonical language guidance, framework availability and readable hierarchy',async({page})=>{
    await page.goto(base+'/design-language/');
    assert.equal(await page.locator('main h1').count(),1);
    assert.equal(await page.locator('#support tbody tr').count(),6);
    assert.equal(await page.locator('#coverage tbody tr').count(),18);
    assert.equal(await page.locator('#form-pattern').getByRole('heading',{name:'Validation and state transitions'}).count(),1);
    assert.equal(await page.locator('#results-pattern').getByRole('heading',{name:'Selection and dialog contract'}).count(),1);
    const spec=await (await page.request.get(base+'/design-system.json')).json();
    assert.equal(spec.language.family,'martlet');assert.equal(spec.language.implementation.Astro.status,'experimental');
    assert.match(spec.language.canonicalSource.commit,/^[a-f0-9]{40}$/);
    for(const width of [280,320,768,1440]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Language reference overflow at ${width}px`);
    }
    await page.screenshot({path:'artifacts/qa/design-language-desktop.png',fullPage:true});
    await page.setViewportSize({width:320,height:900});await page.addStyleTag({content:'html{font-size:200% !important}'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Language reference overflow with enlarged text');
    await page.screenshot({path:'artifacts/qa/design-language-mobile.png'});
  });
  await scenario('hosted agent setup, optional skill and release availability',async({page})=>{
    await page.goto(base+'/agents/');
    assert.equal(await page.locator('main h1').count(),1);
    assert.equal((await page.getByRole('region',{name:'MCP endpoint',exact:true}).innerText()).trim(),'https://martletdesign.dev/mcp');
    assert.equal(await page.getByRole('heading',{name:'ChatGPT',exact:true}).count(),1);
    assert.equal(await page.getByRole('heading',{name:'Claude',exact:true}).count(),1);
    const zip=await page.request.get(base+'/agents/martlet-builder.zip');assert.equal(zip.ok(),true);assert.equal((await zip.body()).subarray(0,2).toString(),'PK');
    for(const width of [280,320,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Agent setup overflow at ${width}px`);}
    await page.setViewportSize({width:320,height:900});await page.addStyleTag({content:'html{font-size:200% !important}'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Agent setup overflow with enlarged text');
    await page.screenshot({path:'artifacts/qa/agent-setup-mobile.png'});
  });
  await scenario('0.3 design home and public React reference preserve the language and local assets',async({page})=>{
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://martletdesign.dev/');
    assert.ok((await page.locator('main').innerText()).includes('0.3 preview'));
    await page.goto(reactBase+'/');assert.equal(await page.locator('main h1').count(),1);
    for(const name of ['martlet-builder.zip','martlet-agent-tools.tar.gz']) {
      assert.deepEqual(await (await page.request.get(base+'/agents/'+name)).body(),await (await page.request.get(reactBase+'/agents/'+name)).body(),'Both download locations must expose the same current agent archive');
    }
    const metadata=await (await page.request.get(reactBase+'/preview.json')).json();assert.equal(metadata.family,'martlet');assert.equal(metadata.preview.version,'0.3.0');
    await page.goto(reactBase+'/?page=agents');assert.equal(await page.locator('main h1').count(),1);
    assert.equal(await page.getByRole('textbox',{name:'Copyable example source'}).first().inputValue(),'https://martletdesign.dev/mcp');
    await page.setViewportSize({width:320,height:900});await page.addStyleTag({content:'html{font-size:200% !important}'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Public React reference reflows with enlarged text');
    await page.screenshot({path:'artifacts/qa/public-react-agents.png'});
  });

} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
  await new Promise(done=>reactServer.close(done));
}

