(function(){
  const data = window.LIVE_SHOWS_DATA;
  const showsEl = document.getElementById('shows');
  const emptyEl = document.getElementById('empty');
  const interestedEl = document.getElementById('interested-list');
  const watchEl = document.getElementById('watchlist');
  const searchEl = document.getElementById('search');
  const removedSection = document.getElementById('removed-section');
  const removedEl = document.getElementById('removed-list');
  const playsSection = document.getElementById('plays-section');
  const playsNowEl = document.getElementById('plays-now');
  const playsSoonEl = document.getElementById('plays-soon');
  const playsNowEmpty = document.getElementById('plays-now-empty');
  const playsSoonEmpty = document.getElementById('plays-soon-empty');
  const showsSection = document.getElementById('shows-section');
  let filter = 'all';

  // "Today" in Chicago, so past shows and ended play runs fall off automatically.
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const allShows = (data.shows || []).filter(s=>s.date >= today);
  const allPlays = (data.plays || []).filter(p=>p.run_end >= today);

  function loadSet(key, seed){
    try{
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (Array.isArray(saved)) return new Set(saved);
    }catch(e){}
    return new Set(seed || []);
  }
  function saveSet(key, set){ localStorage.setItem(key, JSON.stringify([...set])); }

  const INT_KEY = 'live-shows-chicago-interested-v1';
  let interested = loadSet(INT_KEY, [...allShows.filter(s=>s.interested), ...allPlays.filter(p=>p.interested)].map(x=>x.id));
  const IGN_KEY = 'live-shows-chicago-ignored-v1';
  let ignored = loadSet(IGN_KEY, [...allShows.filter(s=>s.ignored), ...allPlays.filter(p=>p.ignored)].map(x=>x.id));
  const HIDE_KEY = 'live-shows-chicago-hidden-artists-v1';
  let hidden = loadSet(HIDE_KEY, data.removed_artists || []);

  const TOG_KEY = 'live-shows-chicago-sections-v1';
  let toggles = { comics:true, concerts:true, plays:true };
  try{
    const saved = JSON.parse(localStorage.getItem(TOG_KEY) || 'null');
    if (saved && typeof saved === 'object') toggles = { comics: saved.comics !== false, concerts: saved.concerts !== false, plays: saved.plays !== false };
  }catch(e){}
  function saveToggles(){ localStorage.setItem(TOG_KEY, JSON.stringify(toggles)); }

  document.getElementById('generated').textContent = data.generated;

  function fmtDate(iso){
    const d = new Date(iso + 'T12:00:00');
    return { dow:d.toLocaleDateString('en-US',{weekday:'short'}), day:d.getDate(),
             mon:d.toLocaleDateString('en-US',{month:'short'}),
             long:d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}),
             short:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
             monthKey:d.toLocaleDateString('en-US',{month:'long',year:'numeric'}) };
  }
  function fmtTime(t){
    if(!t) return 'Time TBA';
    const [h,m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return hr + ':' + String(m).padStart(2,'0') + ' ' + ampm;
  }
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function showGroup(s){ return s.category === 'comedian' ? 'comics' : 'concerts'; }
  function thumb(url, label, company){
    if (url) return `<div class="thumb"><span>${esc(company || label)}</span><img src="${esc(url)}" alt="${esc(label)} artwork" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove();"></div>`;
    return `<div class="thumb thumb-fallback"><span>${esc(company || label)}</span></div>`;
  }

  function showCard(s){
    const d = fmtDate(s.date);
    const isIgn = ignored.has(s.id);
    return `
        <article class="card${isIgn?' is-ignored':''}">
          ${thumb(s.image_url, s.artist, s.artist)}
          <div class="card-row">
          <div class="date-badge"><div class="dow">${esc(d.dow)}</div><div class="day">${d.day}</div><div class="mon">${esc(d.mon)}</div></div>
          <div class="card-body">
            <h4>${esc(s.artist)}${s.suggested?'<span class="badge">Suggested</span>':''}${s.category==='local'?'<span class="badge local">Local</span>':''}</h4>
            <p class="title">${esc(s.title)}</p>
            <p class="venue">${esc(fmtTime(s.time))} &middot; ${esc(s.venue)}, ${esc(s.city)}</p>
            ${s.note?`<p class="note">${esc(s.note)}</p>`:''}
            <p class="source">Source: ${esc(s.source)}${s.ticket_url?` &middot; <a href="${esc(s.ticket_url)}" target="_blank" rel="noopener">Tickets / details</a>`:''}</p>
            <div class="card-actions">
              <label class="interested-toggle"><input type="checkbox" data-interested="${esc(s.id)}" ${interested.has(s.id)?'checked':''}> Interested?</label>
              <button type="button" class="ignore-btn${isIgn?' is-on':''}" data-ignore="${esc(s.id)}">${isIgn?'Ignored — undo':'Ignore'}</button>
            </div>
            <div><button type="button" class="not-interested-btn" data-hide-artist="${esc(s.artist)}">Not interested in ${esc(s.artist)}</button></div>
          </div>
          </div>
        </article>`;
  }

  function playCard(p){
    const isIgn = ignored.has(p.id);
    const range = fmtDate(p.run_start).short + ' – ' + fmtDate(p.run_end).short;
    return `
        <article class="card play-card${isIgn?' is-ignored':''}">
          ${thumb(p.image_url, p.title, p.company)}
          <div class="card-body pad">
            <h4>${esc(p.title)}<span class="badge play">${esc(p.kind === 'musical' ? 'Musical' : 'Play')}</span></h4>
            <p class="venue"><strong>${esc(p.company)}</strong> &middot; ${esc(p.venue)}, ${esc(p.city)}</p>
            <p class="run">${esc(range)}</p>
            ${p.description?`<p class="desc">${esc(p.description)}</p>`:''}
            ${p.highlights?`<p class="note">Cast &amp; creatives: ${esc(p.highlights)}</p>`:''}
            ${p.note?`<p class="note">${esc(p.note)}</p>`:''}
            <p class="source">Source: ${esc(p.source)}${p.listing_url?` &middot; <a href="${esc(p.listing_url)}" target="_blank" rel="noopener">Listing</a>`:''}</p>
            <div class="card-actions">
              <label class="interested-toggle"><input type="checkbox" data-interested="${esc(p.id)}" ${interested.has(p.id)?'checked':''}> Interested?</label>
              <button type="button" class="ignore-btn${isIgn?' is-on':''}" data-ignore="${esc(p.id)}">${isIgn?'Ignored — undo':'Ignore'}</button>
            </div>
          </div>
        </article>`;
  }

  function render(){
    const visibleShows = allShows.filter(s=>!hidden.has(s.artist));
    const visibleArtists = data.tracked_artists.filter(a=>!hidden.has(a.name));
    const q = (searchEl.value || '').trim().toLowerCase();
    const matchQ = txt => !q || txt.toLowerCase().includes(q);

    // Category toggles (nav bar)
    document.querySelectorAll('[data-toggle]').forEach(btn=>{
      const on = toggles[btn.dataset.toggle];
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const comicsCount = visibleShows.filter(s=>showGroup(s)==='comics').length;
    const concertsCount = visibleShows.filter(s=>showGroup(s)==='concerts').length;
    document.getElementById('count-comics').textContent = '(' + comicsCount + ')';
    document.getElementById('count-concerts').textContent = '(' + concertsCount + ')';
    document.getElementById('count-plays').textContent = '(' + allPlays.length + ')';
    document.getElementById('jump-plays').style.display = toggles.plays ? '' : 'none';
    document.getElementById('jump-shows').style.display = (toggles.comics || toggles.concerts) ? '' : 'none';

    document.getElementById('show-count').textContent = visibleShows.length + ' shows';
    document.getElementById('play-count').textContent = allPlays.length + ' plays';
    document.getElementById('artist-count').textContent = visibleArtists.length + ' tracked artists';

    // Shows
    showsSection.style.display = (toggles.comics || toggles.concerts) ? '' : 'none';
    const filtered = visibleShows.filter(s=>{
      if(!toggles[showGroup(s)]) return false;
      if(filter==='interested' && !interested.has(s.id)) return false;
      if(filter!=='all' && filter!=='interested' && s.category!==filter) return false;
      return matchQ(s.artist+' '+s.title+' '+s.venue+' '+s.city);
    });
    emptyEl.hidden = filtered.length !== 0;
    const byMonth = new Map();
    filtered.forEach(s=>{ const k = fmtDate(s.date).monthKey; if(!byMonth.has(k)) byMonth.set(k,[]); byMonth.get(k).push(s); });
    showsEl.innerHTML = [...byMonth.entries()].map(([month, list])=>`
      <div class="month"><h3>${esc(month)}</h3><div class="grid">
      ${list.map(showCard).join('')}
      </div></div>`).join('');

    // Plays
    playsSection.style.display = toggles.plays ? '' : 'none';
    if (toggles.plays){
      const playsFiltered = allPlays.filter(p=>{
        if(filter==='interested' && !interested.has(p.id)) return false;
        return matchQ(p.title+' '+p.company+' '+p.venue+' '+(p.highlights||''));
      });
      const now = playsFiltered.filter(p=>p.run_start <= today);
      const soon = playsFiltered.filter(p=>p.run_start > today);
      playsNowEl.innerHTML = now.map(playCard).join('');
      playsSoonEl.innerHTML = soon.map(playCard).join('');
      playsNowEmpty.hidden = now.length !== 0;
      playsSoonEmpty.hidden = soon.length !== 0;
    }

    // Interested (shows + plays, honoring toggles)
    const mineShows = visibleShows.filter(s=>interested.has(s.id) && toggles[showGroup(s)]).sort((a,b)=>a.date.localeCompare(b.date));
    const minePlays = toggles.plays ? allPlays.filter(p=>interested.has(p.id)).sort((a,b)=>a.run_start.localeCompare(b.run_start)) : [];
    const items = [
      ...mineShows.map(s=>({when:s.date, html:`<div class="interested-item"><strong>${esc(fmtDate(s.date).long)} &middot; ${esc(fmtTime(s.time))}</strong> — ${esc(s.artist)} at ${esc(s.venue)}, ${esc(s.city)}</div>`})),
      ...minePlays.map(p=>({when:p.run_start, html:`<div class="interested-item"><strong>${esc(fmtDate(p.run_start).short)} – ${esc(fmtDate(p.run_end).short)}</strong> — ${esc(p.title)} (${esc(p.company)}) at ${esc(p.venue)}, ${esc(p.city)}</div>`}))
    ].sort((a,b)=>a.when.localeCompare(b.when));
    interestedEl.innerHTML = items.length ? items.map(i=>i.html).join('') : '<p class="hint">Nothing marked yet.</p>';

    // Watch list (honoring toggles + search)
    const watchFiltered = visibleArtists.filter(a=>{
      const grp = a.kind === 'comedian' ? 'comics' : 'concerts';
      if(!toggles[grp]) return false;
      return matchQ(a.name+' '+a.kind);
    });
    watchEl.innerHTML = watchFiltered.map(a=>`
    <div class="watch-item"><strong>${esc(a.name)}${a.suggested?'<span class="badge">Suggested</span>':''}</strong>
    <span>${esc(a.kind)}${a.next?` &middot; Next: ${esc(fmtDate(a.next).long)}`:''}${a.note?`<br>${esc(a.note)}`:''}</span></div>`).join('');

    // Removed artists
    if (removedSection && removedEl){
      const removedNames = [...hidden].sort((a,b)=>a.localeCompare(b));
      removedSection.hidden = removedNames.length === 0;
      removedEl.innerHTML = removedNames.map(name=>`
      <div class="removed-item"><span>${esc(name)}</span><button type="button" class="restore-btn" data-restore-artist="${esc(name)}">Restore</button></div>`).join('');
      removedEl.querySelectorAll('[data-restore-artist]').forEach(btn=>{
        btn.addEventListener('click', ()=>{ hidden.delete(btn.dataset.restoreArtist); saveSet(HIDE_KEY, hidden); render(); });
      });
    }

    document.querySelectorAll('[data-interested]').forEach(cb=>{
      cb.addEventListener('change', ()=>{ cb.checked ? interested.add(cb.dataset.interested) : interested.delete(cb.dataset.interested); saveSet(INT_KEY, interested); render(); });
    });
    document.querySelectorAll('[data-ignore]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ ignored.has(btn.dataset.ignore) ? ignored.delete(btn.dataset.ignore) : ignored.add(btn.dataset.ignore); saveSet(IGN_KEY, ignored); render(); });
    });
    document.querySelectorAll('[data-hide-artist]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ hidden.add(btn.dataset.hideArtist); saveSet(HIDE_KEY, hidden); render(); });
    });
  }

  document.querySelectorAll('[data-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{ toggles[btn.dataset.toggle] = !toggles[btn.dataset.toggle]; saveToggles(); render(); });
  });
  document.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.chip').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active'); filter = btn.dataset.filter; render();
    });
  });
  searchEl.addEventListener('input', render);
  render();
})();
