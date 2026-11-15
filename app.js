(function(){
  const data = window.LIVE_SHOWS_DATA;
  const showsEl = document.getElementById('shows');
  const emptyEl = document.getElementById('empty');
  const interestedEl = document.getElementById('interested-list');
  const watchEl = document.getElementById('watchlist');
  const searchEl = document.getElementById('search');
  let filter = 'all';

  const KEY = 'live-shows-chicago-interested-v1';
  function loadInterested(){
    try{
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (Array.isArray(saved)) return new Set(saved);
    }catch(e){}
    return new Set(data.shows.filter(s=>s.interested).map(s=>s.id));
  }
  let interested = loadInterested();
  function saveInterested(){ localStorage.setItem(KEY, JSON.stringify([...interested])); }

  document.getElementById('show-count').textContent = data.shows.length + ' shows';
  document.getElementById('artist-count').textContent = data.tracked_artists.length + ' tracked artists';
  document.getElementById('generated').textContent = data.generated;

  function fmtDate(iso){
    const d = new Date(iso + 'T12:00:00');
    return { dow:d.toLocaleDateString('en-US',{weekday:'short'}), day:d.getDate(),
             mon:d.toLocaleDateString('en-US',{month:'short'}),
             long:d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}),
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

  function render(){
    const q = (searchEl.value || '').trim().toLowerCase();
    const filtered = data.shows.filter(s=>{
      if(filter==='interested' && !interested.has(s.id)) return false;
      if(filter!=='all' && filter!=='interested' && s.category!==filter) return false;
      if(q && !(s.artist+' '+s.title+' '+s.venue+' '+s.city).toLowerCase().includes(q)) return false;
      return true;
    });
    emptyEl.hidden = filtered.length !== 0;

    const byMonth = new Map();
    filtered.forEach(s=>{ const k = fmtDate(s.date).monthKey; if(!byMonth.has(k)) byMonth.set(k,[]); byMonth.get(k).push(s); });

    showsEl.innerHTML = [...byMonth.entries()].map(([month, list])=>`
      <div class="month"><h3>${esc(month)}</h3><div class="grid">
      ${list.map(s=>{ const d=fmtDate(s.date); return `
        <article class="card">
          <div class="date-badge"><div class="dow">${esc(d.dow)}</div><div class="day">${d.day}</div><div class="mon">${esc(d.mon)}</div></div>
          <div>
            <h4>${esc(s.artist)}${s.suggested?'<span class="badge">Suggested</span>':''}${s.category==='local'?'<span class="badge local">Local</span>':''}</h4>
            <p class="title">${esc(s.title)}</p>
            <p class="venue">${esc(fmtTime(s.time))} &middot; ${esc(s.venue)}, ${esc(s.city)}</p>
            ${s.note?`<p class="note">${esc(s.note)}</p>`:''}
            <p class="source">Source: ${esc(s.source)}${s.ticket_url?` &middot; <a href="${esc(s.ticket_url)}" target="_blank" rel="noopener">Tickets / details</a>`:''}</p>
            <label class="interested-toggle"><input type="checkbox" data-interested="${esc(s.id)}" ${interested.has(s.id)?'checked':''}> Interested?</label>
          </div>
        </article>`;}).join('')}
      </div></div>`).join('');

    const mine = data.shows.filter(s=>interested.has(s.id)).sort((a,b)=>a.date.localeCompare(b.date));
    interestedEl.innerHTML = mine.length ? mine.map(s=>{
      const d=fmtDate(s.date);
      return `<div class="interested-item"><strong>${esc(d.long)} &middot; ${esc(fmtTime(s.time))}</strong> — ${esc(s.artist)} at ${esc(s.venue)}, ${esc(s.city)}</div>`;
    }).join('') : '<p class="hint">Nothing marked yet.</p>';

    showsEl.querySelectorAll('[data-interested]').forEach(cb=>{
      cb.addEventListener('change', ()=>{ cb.checked ? interested.add(cb.dataset.interested) : interested.delete(cb.dataset.interested); saveInterested(); render(); });
    });
  }

  watchEl.innerHTML = data.tracked_artists.map(a=>`
    <div class="watch-item"><strong>${esc(a.name)}${a.suggested?'<span class="badge">Suggested</span>':''}</strong>
    <span>${esc(a.kind)}${a.next?` &middot; Next: ${esc(fmtDate(a.next).long)}`:''}${a.note?`<br>${esc(a.note)}`:''}</span></div>`).join('');

  document.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.chip').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active'); filter = btn.dataset.filter; render();
    });
  });
  searchEl.addEventListener('input', render);
  render();
})();
