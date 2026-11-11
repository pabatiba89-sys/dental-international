/* Shared progressive enhancement. No reference-site runtime or tracking. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behaviour = reduced ? 'instant' : 'smooth';
  let previousFocus;
  const dialog = document.createElement('dialog');
  dialog.className = 'media-dialog';
  dialog.innerHTML = '<button type="button" class="dialog-close" aria-label="Close preview">×</button><div class="dialog-content"></div>';
  document.body.append(dialog);
  let stopFilm = () => {};
  function closeDialog() { stopFilm(); dialog.close(); previousFocus?.focus(); }
  $('.dialog-close', dialog).addEventListener('click', closeDialog);
  dialog.addEventListener('click', e => { if(e.target === dialog) closeDialog(); });
  dialog.addEventListener('cancel', () => { stopFilm(); previousFocus?.focus(); });
  function openDialog(html) {
    previousFocus = document.activeElement;
    $('.dialog-content', dialog).innerHTML = html;
    dialog.showModal();
    $('.dialog-close', dialog).focus();
  }

  // Mobile menu includes the same child routes as desktop, without hover-only controls.
  const toggle = $('button[aria-label="Toggle menu"]');
  const rootHeader = $('body > header') || $('header');
  if(toggle && rootHeader) {
    const menu = document.createElement('nav');
    menu.id = 'mobile-navigation'; menu.className = 'mobile-navigation';
    menu.setAttribute('aria-label', 'Mobile navigation'); menu.hidden = true;
    const routes = [['Home','/'],['Dental Implants','/dental-implants'],['Single / Multiple Implants','/single-multiple-implants'],['All-on-4®','/all-on-4'],['All-on-6®','/all-on-6'],['Porcelain Veneers','/porcelain-veneers'],['Implants for Type 2 Diabetes','/implants-for-type-2-diabetes'],['General Anesthesia Care','/general-anesthesia-care'],['Pricing','/pricing'],['About Us','/about-us'],['Our Work','/our-work'],['FAQ','/faq'],['Blog','/blog'],['Contact Us','/contact-us']];
    routes.forEach(([name,href])=>{const a=document.createElement('a');a.textContent=name;a.href=href;menu.append(a);});
    rootHeader.append(menu); toggle.setAttribute('aria-controls', menu.id);
    toggle.addEventListener('click', () => { menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded', String(!menu.hidden)); if(!menu.hidden) $('a',menu).focus(); });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
  }
  // Desktop drop-downs remain available to keyboard and pointer users.
  $$('header nav a').forEach(a=>{
    if(new URL(a.href).pathname === location.pathname && a.getAttribute('href') !== '#') a.setAttribute('aria-current','page');
  });

  // Native scroll-snap carousel with controls, keyboard and gentle automatic movement.
  $$('[aria-roledescription="carousel"]').forEach(carousel => {
    const viewport = $('[class*="auto-carousel_viewport"]', carousel);
    if(!viewport) return;
    let paused = false;
    const move = dir => {
      const first = $('[aria-roledescription="slide"]', viewport);
      const step = first ? first.getBoundingClientRect().width + 24 : viewport.clientWidth;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const next = dir>0 && viewport.scrollLeft>=max-8 ? 0 : dir<0 && viewport.scrollLeft<8 ? max : viewport.scrollLeft+dir*step;
      viewport.scrollTo({left:next, behavior:behaviour});
    };
    $$('button[aria-label="Previous slide"]',carousel).forEach(b=>b.addEventListener('click',()=>move(-1)));
    $$('button[aria-label="Next slide"]',carousel).forEach(b=>b.addEventListener('click',()=>move(1)));
    viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
    carousel.addEventListener('mouseenter',()=>paused=true);carousel.addEventListener('mouseleave',()=>paused=false);
    carousel.addEventListener('focusin',()=>paused=true);carousel.addEventListener('focusout',()=>paused=false);
    if(!reduced)setInterval(()=>{if(!paused&&!document.hidden&&!dialog.open&&carousel.getBoundingClientRect().top<innerHeight&&carousel.getBoundingClientRect().bottom>0)move(1);},6500);
  });

  // Pointer and keyboard comparison sliders. No simulated clinical outcome images.
  $$('[data-compare]').forEach(wrap=>{
    const slider=$('[role="slider"]',wrap), overlay=$('[data-compare-overlay]',wrap);
    if(!slider||!overlay)return;
    const line=$('div[style*="left:"]',wrap);
    function update(value){value=Math.max(0,Math.min(100,value));slider.setAttribute('aria-valuenow',String(Math.round(value)));slider.style.left=value+'%';overlay.style.clipPath=`inset(0 ${100-value}% 0 0)`;if(line)line.style.left=value+'%';}
    function pointer(e){const r=wrap.getBoundingClientRect();update((e.clientX-r.left)/r.width*100);}
    wrap.addEventListener('pointerdown',e=>{e.preventDefault();wrap.setPointerCapture(e.pointerId);pointer(e);slider.focus();});
    wrap.addEventListener('pointermove',e=>{if(wrap.hasPointerCapture(e.pointerId))pointer(e);});
    wrap.addEventListener('pointerup',e=>{if(wrap.hasPointerCapture(e.pointerId))wrap.releasePointerCapture(e.pointerId);});
    slider.addEventListener('keydown',e=>{const v=Number(slider.getAttribute('aria-valuenow'));const values={ArrowLeft:v-5,ArrowRight:v+5,Home:0,End:100};if(e.key in values){e.preventDefault();update(values[e.key]);}});
  });

  // Enlarged illustrative scenes.
  $$('[aria-roledescription="carousel"] img, main img').forEach(img=>{
    if(img.closest('[data-compare],button,a,figure.article-image') || img.classList.contains('absolute'))return;
    img.classList.add('zoomable');img.tabIndex=0;img.setAttribute('role','button');
    const show=()=>openDialog(`<figure><img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt')||'Illustrative dental scene'}"><figcaption>AI-generated illustrative image. No real patient, facility or clinical result is represented.</figcaption></figure>`);
    img.addEventListener('click',show);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}});
  });

  // A motion presentation replaces copied third-party testimonial videos.
  $$('[data-film]').forEach(button=>button.addEventListener('click',()=>{
    const scenes=[['clinic','A welcoming space','Start with a clear plan for your visit.'],['care','A thoughtful conversation','Discuss the choices that matter to you.'],['travel','A journey with time to breathe','Plan treatment, recovery and follow-up together.']];
    let i=Number(button.dataset.film), playing=true;
    openDialog('<div class="care-film"><img alt="AI-generated care journey illustration"><div class="care-film-copy"><span>AI VISUAL PREVIEW</span><h2></h2><p></p></div><div class="care-film-controls"><button type="button" aria-label="Previous scene">←</button><button type="button" aria-label="Pause presentation">Pause</button><button type="button" aria-label="Next scene">→</button><span></span></div></div>');
    const film=$('.care-film',dialog), buttons=$$('button',film);
    const render=()=>{const s=scenes[(i+3)%3];$('img',film).src='/assets/'+s[0]+'.png';$('h2',film).textContent=s[1];$('p',film).textContent=s[2];$('.care-film-controls span',film).textContent=((i+3)%3+1)+' / 3';};
    buttons[0].onclick=()=>{i=(i+2)%3;render();};buttons[2].onclick=()=>{i=(i+1)%3;render();};
    buttons[1].onclick=()=>{playing=!playing;buttons[1].textContent=playing?'Pause':'Play';buttons[1].setAttribute('aria-label',playing?'Pause presentation':'Play presentation');};
    render();const interval=setInterval(()=>{if(playing){i=(i+1)%3;render();}},4500);stopFilm=()=>clearInterval(interval);
  }));

  // Original editorial index: deep-linked categories, search and pagination.
  const cards=$$('[data-blog-card]'), search=$('#blog-search');
  if(cards.length){
    let category=new URL(location.href).searchParams.get('category')||'all',page=Number(new URL(location.href).searchParams.get('page'))||1;
    const filters=$$('[data-category-filter]'), pagination=$('.blog-pagination'), count=$('#blog-count');const perPage=12;
    function render(updateURL=false){
      const query=(search?.value||'').trim().toLowerCase();const matches=cards.filter(c=>(category==='all'||c.dataset.category===category)&&c.dataset.search.includes(query));
      const pages=Math.max(1,Math.ceil(matches.length/perPage));page=Math.max(1,Math.min(page,pages));
      cards.forEach(c=>c.hidden=true);matches.slice((page-1)*perPage,page*perPage).forEach(c=>c.hidden=false);
      filters.forEach(f=>{const on=f.dataset.categoryFilter===category;f.classList.toggle('filter-active',on);f.setAttribute('aria-current',on?'true':'false');});
      if(count)count.textContent=matches.length+' guides';const empty=$('#blog-empty');if(empty)empty.hidden=matches.length!==0;
      if(pagination){pagination.replaceChildren();for(let n=1;n<=pages;n++){const b=document.createElement('button');b.type='button';b.textContent=n;b.setAttribute('aria-label','Page '+n);if(n===page)b.setAttribute('aria-current','page');b.onclick=()=>{page=n;render(true);search?.scrollIntoView({behavior:behaviour,block:'center'});};pagination.append(b);}}
      if(updateURL){const u=new URL(location.href);u.searchParams.delete('category');u.searchParams.delete('page');if(category!=='all')u.searchParams.set('category',category);if(page>1)u.searchParams.set('page',String(page));history.replaceState(null,'',u);}
    }
    filters.forEach(f=>f.addEventListener('click',e=>{e.preventDefault();category=f.dataset.categoryFilter;page=1;render(true);}));
    search?.addEventListener('input',()=>{page=1;render(true);});window.addEventListener('popstate',()=>{category=new URL(location.href).searchParams.get('category')||'all';page=Number(new URL(location.href).searchParams.get('page'))||1;render();});render();
  }

  // Prepare a real downloadable enquiry, with an honest delivery state.
  $$('form[data-consultation]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const values=Object.fromEntries(new FormData(form));if(values.website)return;
    const result=$('.form-result',form);result.hidden=false;result.replaceChildren();
    const heading=document.createElement('h3');heading.textContent='Your request is ready to download.';
    const message=document.createElement('p');message.textContent='This preview has not sent your details to a clinic. Download the request and keep it until the clinic contact channel is configured.';
    const lines=['CONSULTATION REQUEST','Prepared: '+new Date().toISOString(),'Name: '+values.name,'Country: '+(values.country||''),'Phone: '+values.phone,'Email: '+(values.email||''),'Interest: '+(values.serviceType||''),'Message: '+(values.message||''),'','PREVIEW: Not delivered to a clinic.'];
    const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='consultation-request.txt';a.className='btn btn-navy';a.textContent='Download consultation request';result.append(heading,message,a);result.scrollIntoView({behavior:behaviour,block:'center'});
    form.addEventListener('reset',()=>URL.revokeObjectURL(url),{once:true});
  }));

  const top=$('.back-to-top');if(top){const check=()=>top.classList.toggle('visible',scrollY>600);addEventListener('scroll',check,{passive:true});check();}
  // Interface language selection is explicit; editorial articles remain in English.
  const words={
    zh:['首页','种植牙','单颗／多颗种植','瓷贴面','技术与诊疗','价格','关于我们','诊疗展示','常见问题','联系我们','博客','免费线上咨询','免费牙科评估','隐私政策','牙科服务','公司信息','姓名','国家／地区','电话号码','电子邮箱','咨询项目','留言','准备咨询申请','返回文章列表','目录','全部','口腔健康','牙科旅行','正畸','病例','二型糖尿病种植评估','全身麻醉诊疗'],
    ja:['ホーム','インプラント','単歯・複数歯インプラント','ポーセレンベニア','診療技術','料金','私たちについて','診療のご紹介','よくある質問','お問い合わせ','ブログ','無料オンライン相談','歯科相談','プライバシー','歯科診療','運営情報','氏名','国・地域','電話番号','メール','ご希望の治療','メッセージ','相談内容を作成','記事一覧へ','目次','すべて','お口の健康','歯科旅行','矯正','症例','糖尿病の方の相談','全身麻酔による診療'],
    de:['Startseite','Zahnimplantate','Einzel- / Mehrfachimplantate','Keramikveneers','Behandlung & Technik','Preise','Über uns','Einblicke','Häufige Fragen','Kontakt','Ratgeber','Kostenlose Online-Beratung','Zahnärztliche Beratung','Datenschutz','Behandlungen','Unternehmen','Ihr Name','Land / Region','Telefonnummer','E-Mail','Gewünschte Behandlung','Nachricht','Beratungsanfrage vorbereiten','Zurück zum Ratgeber','Inhalt','Alle','Mundgesundheit','Zahnreise','Kieferorthopädie','Beispiele','Implantatberatung bei Diabetes','Behandlung unter Vollnarkose'],
    fr:['Accueil','Implants dentaires','Implants simples / multiples','Facettes en céramique','Soins & technologie','Tarifs','À propos','Nos soins','Questions fréquentes','Contact','Conseils','Consultation en ligne gratuite','Consultation dentaire','Confidentialité','Soins dentaires','Établissement','Votre nom','Pays / région','Téléphone','E-mail','Soin souhaité','Message','Préparer une demande','Retour aux articles','Sommaire','Tous','Santé bucco-dentaire','Voyage dentaire','Orthodontie','Exemples','Implants et diabète','Soins sous anesthésie générale']
  };
  const english=['Home','Dental Implants','Single / Multiple Implants','Porcelain Veneers','Technology Highlights','Pricing','About Us','Our Work','FAQ','Contact Us','Blog','Free Online Consultation','Free Dental Evaluation','Privacy Policy','Dental Services','Company','Your Name','Country/Region','Phone Number','Email Address','Treatment of Interest','Message','Prepare Consultation Request','Back to Blog','Table of contents','All','Oral Health','Dental Tourism','Orthodontics','Cases','Implants for Type 2 Diabetes','General Anesthesia Care'];
  const nodes=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('script,style,dialog,[role="group"][aria-label="Language"]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  while(walker.nextNode()){const n=walker.currentNode;if(english.some(s=>n.textContent.trim().toLowerCase()===s.toLowerCase()))nodes.push({node:n,original:n.textContent,index:english.findIndex(s=>n.textContent.trim().toLowerCase()===s.toLowerCase())});}
  let localeNote;
  function setLanguage(lang){
    nodes.forEach(({node,original,index})=>node.textContent=lang==='en'?original:original.replace(original.trim(),words[lang][index]));
    $$('[aria-label="Language"] button').forEach(b=>{const selected=({EN:'en','中':'zh','日':'ja',DE:'de',FR:'fr'}[b.textContent.trim()]===lang);b.setAttribute('aria-pressed',String(selected));b.classList.toggle('language-active',selected);});
    document.documentElement.lang=lang;try{localStorage.setItem('dental-language',lang);}catch{}
    if(!localeNote){localeNote=document.createElement('div');localeNote.className='locale-note';$('main')?.prepend(localeNote);}
    localeNote.hidden=lang==='en';localeNote.textContent={zh:'导航与表单已切换为中文。诊疗介绍和文章正文当前使用英文，完整译稿待审核。',ja:'メニューとフォームを日本語で表示しています。診療情報と記事の本文は現在英語です。',de:'Menüs und Formulare sind auf Deutsch. Behandlungsinformationen und Artikeltexte sind derzeit auf Englisch.',fr:'Les menus et formulaires sont en français. Les informations cliniques et les articles restent en anglais.'}[lang]||'';
  }
  $$('[aria-label="Language"] button').forEach(b=>b.addEventListener('click',()=>setLanguage({EN:'en','中':'zh','日':'ja',DE:'de',FR:'fr'}[b.textContent.trim()])));
  let saved='en';try{saved=localStorage.getItem('dental-language')||'en';}catch{}setLanguage(words[saved]?saved:'en');
})();
