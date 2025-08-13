(function themeInit(){
  const saved = localStorage.getItem('theme');
  const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  function applyTheme(mode){
    document.body.classList.toggle('dark', mode === 'dark');
    document.body.classList.toggle('light-theme', mode === 'light');

    const fakeSwitch = document.querySelector('header .theme-switch .theme-toggle');
    if (fakeSwitch) fakeSwitch.classList.toggle('checked', mode === 'dark');

    const themeCheckbox = document.getElementById('theme');
    if (themeCheckbox) themeCheckbox.checked = mode === 'dark';
  }

  const initial = saved || (preferDark ? 'dark' : 'light');
  applyTheme(initial);

  function toggleTheme(){
    const mode = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(mode);
    localStorage.setItem('theme', mode);
  }

  // Desktop theme toggle (checkbox)
  const cb = document.getElementById('theme');
  if (cb) cb.addEventListener('change', toggleTheme);

  // Mobile theme toggle (button/icon)
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
})();

// Virtual table
(function virtualTable(){
  const viewport = document.getElementById('txnViewport');
  const spacer = document.getElementById('vpSpacer');
  const body = document.getElementById('vpBody');
  const rowCountChip = document.getElementById('rowCountChip');

  let data;
  try {
    const raw = document.getElementById('transactions-data')?.textContent.trim();
    data = raw ? JSON.parse(raw) : null;
  } catch(e){ data = null; }
  if (!Array.isArray(data)) {
    data = Array.from({length: 10000}, (_, i) => {
      const id = (8451 + i).toString();
      const customer = ['Riya','Arjun','Nora','Rahul','Fatima','John','Meera','Karan','Akira','Leah'][i % 10] + ' ' + String.fromCharCode(65 + (i%26));
      const amount = (Math.random()*1500 + 20).toFixed(2);
      const status = ['Paid','Pending','Failed'][(i*7)%3];
      return { id: '#'+id, customer, amount: '$'+amount, status };
    });
  }
  if (rowCountChip) rowCountChip.textContent = data.length.toLocaleString() + ' rows';

  const tmp = document.createElement('tr');
  tmp.innerHTML = `<td>#0000</td><td>Sample Name</td><td>$000.00</td><td><span class="status ok">Paid</span></td>`;
  body.appendChild(tmp);
  const ROW_H = tmp.getBoundingClientRect().height || 40;
  body.removeChild(tmp);

  const totalHeight = data.length * ROW_H;
  if (spacer) spacer.style.height = totalHeight + 'px';

  const BUFFER = 10; 
  let lastStart = -1, lastEnd = -1, ticking = false;

  function render(){
    const scrollTop = viewport.scrollTop - (viewport.querySelector('thead')?.offsetHeight || 0);
    const vpHeight = viewport.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / ROW_H) - BUFFER);
    const end = Math.min(data.length, Math.ceil((scrollTop + vpHeight) / ROW_H) + BUFFER);
    if (start === lastStart && end === lastEnd) { ticking = false; return; }

    lastStart = start; lastEnd = end;
    body.style.transform = `translateY(${start * ROW_H}px)`;

    let html = '';
    for (let i = start; i < end; i++){
      const d = data[i];
      const ok = d.status === 'Paid';
      html += `<tr>
        <td>${d.id}</td>
        <td>${d.customer}</td>
        <td>${d.amount}</td>
        <td><span class="status ${ok ? 'ok' : 'warn'}">${d.status}</span></td>
      </tr>`;
    }
    body.innerHTML = html;
    ticking = false;
  }

  function onScroll(){
    if (!ticking){
      window.requestAnimationFrame(render);
      ticking = true;
    }
  }

  if (viewport) {
    viewport.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { requestAnimationFrame(render); }, { passive: true });
    render();
  }

  window.setTableData = function(newData){
    data = Array.isArray(newData) ? newData : [];
    if (rowCountChip) rowCountChip.textContent = data.length.toLocaleString() + ' rows';
    if (spacer) spacer.style.height = (data.length * ROW_H) + 'px';
    if (viewport) viewport.scrollTop = 0;
    lastStart = lastEnd = -1;
    render();
  };
})();

// Performance note
(function perfNote(){
  if (!performance || !performance.now) return;
  const start = performance.now();
  requestAnimationFrame(() => {
    const t = (performance.now() - start).toFixed(1);
    console.log(`Dashboard initial paint in ~${t} ms (incl. virtualization).`);
  });
})();

// Sections handling
(function sections(){
  const fmt = n => n.toLocaleString();

  const SECTIONS = { /* KEEP YOUR EXISTING SECTIONS OBJECT EXACTLY AS IS */ };

  function animateCards(){
    document.querySelectorAll('.card').forEach(el=>{
      el.classList.remove('fade-in');
      void el.offsetWidth;
      el.classList.add('fade-in');
    });
  }

  function setKpis(k){
    document.getElementById('kpiOrders').textContent = fmt(k.orders);
    document.getElementById('kpiOrdersDelta').textContent = k.ordersDelta;
    document.getElementById('kpiOrdersNote').textContent = k.ordersNote;
    document.getElementById('kpiUsers').textContent = fmt(k.users);
    document.getElementById('kpiUsersNote').textContent = k.usersNote;
    document.getElementById('kpiConv').textContent = k.conv;
    document.getElementById('kpiConvNote').textContent = k.convNote;
    document.getElementById('kpiRev').textContent = k.rev;
    document.getElementById('kpiRevNote').textContent = k.revNote;
  }

  function setBars(b){
    document.getElementById('barTitle').textContent = b.title;
    document.getElementById('barChip1').textContent = b.chip1;
    document.getElementById('barChip2').textContent = b.chip2;

    const barChart = document.getElementById('barChart');
    const bars = barChart.querySelectorAll('.bar');
    const needed = b.values.length;

    while (bars.length < needed){
      barChart.appendChild(Object.assign(document.createElement('div'),{className:'bar'}));
    }
    while (barChart.querySelectorAll('.bar').length > needed){
      barChart.removeChild(barChart.lastElementChild);
    }

    document.getElementById('barLabels').innerHTML = b.labels.map(l=>`<span>${l}</span>`).join('');

    Array.from(barChart.querySelectorAll('.bar')).forEach((el, i)=>{
      const v = b.values[i] || 0;
      const tip = (b.labels[i] || '') + ' ' + (b.tooltips[i] || '');
      el.style.setProperty('--value', v + '%');
      el.setAttribute('data-value', tip.trim());
    });
  }

  function setDonut(d){
    document.getElementById('donutTitle').textContent = d.title;
    document.getElementById('donutChip').textContent = d.chip;
    const donut = document.getElementById('donut');
    donut.style.setProperty('--percent', d.percent);
    document.getElementById('donutLabel').textContent = d.percent + '%';
    document.getElementById('donutLegend').innerHTML =
      d.legend.map((name, i)=>{
        const cls = ['yellow','blue','green'][i%3];
        return `<span><i class="swatch ${cls}"></i> ${name}</span>`;
      }).join('');
  }

  function setLine(l){
    document.getElementById('lineTitle').textContent = l.title;
    document.getElementById('lineChip').textContent = l.chip;

    const W = 600, H = 240;
    const left = 0, right = 600;
    const top = 40, bottom = 200;
    const n = l.values.length;
    const step = (right - left) / (n - 1 || 1);

    const vals = l.values.slice();
    const vmin = Math.min(...vals), vmax = Math.max(...vals);
    const scaleY = v => {
      const t = (v - vmin) / (vmax - vmin || 1);
      return bottom - t * (bottom - top);
    };

    const points = vals.map((v,i)=>`${(left + step*i).toFixed(0)},${scaleY(v).toFixed(0)}`).join(' ');
    document.getElementById('linePath').setAttribute('points', points);

    const dots = document.getElementById('lineDots');
    dots.innerHTML = vals.map((v,i)=>{
      const x = (left + step*i).toFixed(0);
      const y = scaleY(v).toFixed(0);
      const label = (l.months[i] || `M${i+1}`);
      return `<circle class="dot" cx="${x}" cy="${y}"><title>${label}: ${v}${/^\d+(\.\d+)?$/.test(v)?'k':''}</title></circle>`;
    }).join('');
  }

  function makeRows(count, statuses){
    const names = ['Riya','Arjun','Nora','Rahul','Fatima','John','Meera','Karan','Akira','Leah'];
    return Array.from({length: count}, (_, i) => {
      const id = (1000 + i).toString();
      const customer = names[i % names.length] + ' ' + String.fromCharCode(65 + (i%26));
      const amount = '$' + (Math.random()*1500 + 10).toFixed(2);
      const status = statuses[Math.floor(Math.random()*statuses.length)];
      return { id:'#'+id, customer, amount, status };
    });
  }

  function applySection(key){
    const s = SECTIONS[key] || SECTIONS.dashboard;
    document.querySelectorAll('.side-item').forEach(el=>{
      el.classList.toggle('active', el.dataset.section === key);
    });

    setKpis(s.kpis);
    setBars(s.bar);
    setDonut(s.donut);
    setLine(s.line);

    const rows = makeRows(s.table.rows, s.table.statuses);
    if (window.setTableData) window.setTableData(rows);

    animateCards();
  }

  document.querySelectorAll('.side-item').forEach(el=>{
    el.addEventListener('click', ()=>applySection(el.dataset.section));
  });

  applySection('dashboard');
})();

// Mobile menu toggle
document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('side-wrapper')?.classList.toggle('active');
});

