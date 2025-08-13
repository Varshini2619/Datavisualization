(function themeInit(){
  const cb = document.getElementById('theme');
  const saved = localStorage.getItem('theme');
  const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function apply(mode){
    document.body.classList.toggle('dark', mode === 'dark');
    const fakeSwitch = document.querySelector('header .theme-switch .theme-toggle');
    if (fakeSwitch) fakeSwitch.classList.toggle('checked', mode === 'dark');
  }

  const initial = saved || (preferDark ? 'dark' : 'light');
  apply(initial);
  cb.checked = initial === 'dark';

  cb.addEventListener('change', () => {
    const mode = cb.checked ? 'dark' : 'light';
    apply(mode);
    localStorage.setItem('theme', mode);
  });
})();

(function virtualTable(){
  const viewport = document.getElementById('txnViewport');
  const spacer = document.getElementById('vpSpacer');
  const body = document.getElementById('vpBody');
  const rowCountChip = document.getElementById('rowCountChip');

  let data;
  try {
    const raw = document.getElementById('transactions-data').textContent.trim();
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
  rowCountChip.textContent = data.length.toLocaleString() + ' rows';

  const tmp = document.createElement('tr');
  tmp.innerHTML = `<td>#0000</td><td>Sample Name</td><td>$000.00</td><td><span class="status ok">Paid</span></td>`;
  body.appendChild(tmp);
  const ROW_H = tmp.getBoundingClientRect().height || 40;
  body.removeChild(tmp);

  const totalHeight = data.length * ROW_H;
  spacer.style.height = totalHeight + 'px';

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

  viewport.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { requestAnimationFrame(render); }, { passive: true });

  render();
  window.setTableData = function(newData){
    data = Array.isArray(newData) ? newData : [];
    rowCountChip.textContent = data.length.toLocaleString() + ' rows';
    spacer.style.height = (data.length * ROW_H) + 'px';
    viewport.scrollTop = 0;
    lastStart = lastEnd = -1;
    render();
  };
})();

(function perfNote(){
  if (!performance || !performance.now) return;
  const start = performance.now();
  requestAnimationFrame(() => {
    const t = (performance.now() - start).toFixed(1);
    console.log(`Dashboard initial paint in ~${t} ms (incl. virtualization).`);
  });
})();
(function sections(){
  const fmt = n => n.toLocaleString();

  const SECTIONS = {
    dashboard: {
      kpis:{ orders:201, ordersDelta:'+12%', ordersNote:'vs last week',
             users:4890, usersNote:'Avg. session 6m 12s',
             conv:'1.20%', convNote:'+0.14% MoM',
             rev:'$30,562', revNote:'MRR · Q2' },
      bar:{ title:'Weekly Sales (Bar)', chip1:'This week', chip2:'USD',
            labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            values:[35,52,68,74,56,92,44],
            tooltips:['3.5k','5.2k','6.8k','7.4k','5.6k','9.2k','4.4k'] },
      donut:{ title:'Orders by Source (Donut)', chip:'Last 30 days', percent:68,
              legend:['Paid Ads','Organic','Referral'] },
      line:{ title:'Monthly Trend (Line)', chip:'2025',
             months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
             values:[12.0,14.2,15.1,17.9,21.4,19.6,22.8,24.0,25.2,22.3,26.8,25.6] },
      table:{ rows:10000, statuses:['Paid','Pending','Failed'] }
    },
    products: {
      kpis:{ orders:540, ordersDelta:'+8%', ordersNote:'new SKUs',
             users:2180, usersNote:'Avg. views 4.1',
             conv:'2.04%', convNote:'+0.22% MoM',
             rev:'$64,210', revNote:'Last 30 days' },
      bar:{ title:'Units Sold / Day', chip1:'Top SKU', chip2:'Units',
            labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            values:[20,34,50,72,80,90,60],
            tooltips:['200','340','500','720','800','900','600'] },
      donut:{ title:'Inventory Health', chip:'In-stock %', percent:82,
              legend:['In Stock','Backorder','Discontinued'] },
      line:{ title:'Price vs Sales Trend', chip:'12 mo',
             months:['J','F','M','A','M','J','J','A','S','O','N','D'],
             values:[10,12,13,15,16,18,20,19,17,18,19,21] },
      table:{ rows:6000, statuses:['Paid','Paid','Pending'] }
    },
    customers: {
      kpis:{ orders:120, ordersDelta:'+3%', ordersNote:'new signups',
             users:9800, usersNote:'MAU',
             conv:'0.92%', convNote:'-0.05% MoM',
             rev:'$12,404', revNote:'ARPU $1.26' },
      bar:{ title:'New Customers / Day', chip1:'This week', chip2:'People',
            labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            values:[30,48,54,60,66,58,40],
            tooltips:['30','48','54','60','66','58','40'] },
      donut:{ title:'Acquisition Source', chip:'Last 30 days', percent:56,
              legend:['Organic','Paid','Referral'] },
      line:{ title:'Retention Trend', chip:'Cohort 2025',
             months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
             values:[26,24,23,22,21,21,20,20,19,19,18,18] },
      table:{ rows:8000, statuses:['Paid','Paid','Paid','Pending'] }
    },
    reports: {
      kpis:{ orders:310, ordersDelta:'+18%', ordersNote:'QoQ',
             users:3520, usersNote:'Report views',
             conv:'1.56%', convNote:'+0.08% QoQ',
             rev:'$98,700', revNote:'Quarter total' },
      bar:{ title:'Report Downloads', chip1:'This week', chip2:'Count',
            labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            values:[15,22,30,45,55,70,24],
            tooltips:['15','22','30','45','55','70','24'] },
      donut:{ title:'Report Types Share', chip:'QTD', percent:44,
              legend:['PDF','Dashboard','CSV'] },
      line:{ title:'Quarterly Revenue Trend', chip:'Q1–Q4',
             months:['Q1','Q2','Q3','Q4','Q1','Q2','Q3','Q4','Q1','Q2','Q3','Q4'],
             values:[18,22,25,27,20,24,28,30,22,26,31,33] },
      table:{ rows:5000, statuses:['Paid','Pending','Pending','Failed'] }
    },
    settings: {
      kpis:{ orders:0, ordersDelta:'+0%', ordersNote:'system',
             users:1, usersNote:'Admin online',
             conv:'—', convNote:'No data',
             rev:'$0', revNote:'—' },
      bar:{ title:'No Sales Data', chip1:'Settings', chip2:'—',
            labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            values:[0,0,0,0,0,0,0],
            tooltips:['0','0','0','0','0','0','0'] },
      donut:{ title:'Config Completion', chip:'Profile, Billing, API', percent:88,
              legend:['Complete','Left','N/A'] },
      line:{ title:'System Health', chip:'Uptime % (12 mo)',
             months:['J','F','M','A','M','J','J','A','S','O','N','D'],
             values:[99.8,99.7,99.9,99.9,99.8,99.9,99.9,99.9,99.8,99.9,99.9,99.9] },
      table:{ rows:300, statuses:['Paid'] }
    }
  };

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

    const labelsWrap = document.getElementById('barLabels');
    labelsWrap.innerHTML = b.labels.map(l=>`<span>${l}</span>`).join('');

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

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('side-wrapper').classList.toggle('active');
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});
