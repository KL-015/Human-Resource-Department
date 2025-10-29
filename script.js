let allNames = [];
let cadetMerit = 0;
const apiUrl = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"; // ← Replace with your Web App URL

function initPage(page) {
  if (page === "merit") setupMeritLookup();
  if (page === "store") setupStore();
}

// ----------- Merit Lookup Page -----------
function setupMeritLookup() {
  // Load names for autocomplete
  fetch(`${apiUrl}?action=getAllNames`)
    .then(r=>r.json())
    .then(names => allNames = names);

  const cadetInput = document.getElementById('cadetName');
  const suggestions = document.getElementById('suggestions');

  cadetInput.addEventListener('input', e=>{
    const val = e.target.value.toUpperCase();
    if(!val){ suggestions.classList.remove('show'); suggestions.innerHTML=''; return; }
    const matches = allNames.filter(n=>n.toUpperCase().includes(val)).slice(0,4);
    suggestions.innerHTML='';
    matches.forEach(name=>{
      const div = document.createElement('div');
      div.className='suggestion-item';
      div.textContent=name;
      div.onclick = () => { cadetInput.value=name; suggestions.classList.remove('show'); };
      suggestions.appendChild(div);
    });
    if(matches.length) suggestions.classList.add('show');
  });

  document.getElementById('meritForm').addEventListener('submit', e=>{
    e.preventDefault();
    const name = cadetInput.value.trim();
    if(!name) return alert('Enter cadet name');
    document.getElementById('result').classList.add('show');
    document.getElementById('cadetResultName').textContent=name;
    document.getElementById('meritPoints').textContent='Loading…';
    document.getElementById('activityContainer').innerHTML='Loading…';

    fetch(`${apiUrl}?action=getMerits&name=${encodeURIComponent(name)}`)
      .then(r=>r.json())
      .then(m=>{
        document.getElementById('meritPoints').textContent = m==='Not found' ? 'No record' : m;
      });

    fetch(`${apiUrl}?action=getActivities&name=${encodeURIComponent(name)}`)
      .then(r=>r.json())
      .then(a=>{
        const actContainer = document.getElementById('activityContainer');
        actContainer.innerHTML='';
        if(!a.length) { actContainer.innerHTML='<p style="text-align:center;color:#999;">No recent activity.</p>'; return; }
        a.forEach(item=>{
          const parts = item.split('  ');
          const div = document.createElement('div');
          div.className='activity-item';
          div.innerHTML=`<span>${parts[0]}</span><span>${parts[1]}</span>`;
          actContainer.appendChild(div);
        });
      });
  });
}

// ----------- Store Page -----------
function setupStore() {
  // Get cadet name
  const cadetName = prompt("Enter your full name to view your merit balance:");
  if(!cadetName) return alert('Name required');

  fetch(`${apiUrl}?action=getMerits&name=${encodeURIComponent(cadetName)}`)
    .then(r=>r.json())
    .then(m=>{
      cadetMerit = parseInt(m) || 0;
      document.getElementById('meritBalance').textContent=cadetMerit;
    });

  const storeItems = [
    {name:'Item A', cost:10},
    {name:'Item B', cost:25},
    {name:'Item C', cost:50},
  ];

  const container = document.getElementById('storeItems');
  storeItems.forEach(item=>{
    const div = document.createElement('div');
    div.className='store-item';
    div.innerHTML = `<span>${item.name} - ${item.cost} merits</span>`;
    const btn = document.createElement('button');
    btn.textContent='Buy';
    btn.onclick = () => buyItem(item, cadetName);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

function buyItem(item, name){
  if(cadetMerit < item.cost){ alert("Not enough merits"); return; }
  cadetMerit -= item.cost;
  document.getElementById('meritBalance').textContent = cadetMerit;

  fetch(`${apiUrl}?action=addOrder&name=${encodeURIComponent(name)}&item=${encodeURIComponent(item.name)}&cost=${item.cost}`)
    .then(r=>r.json())
    .then(res=>{
      if(res.status==='success') alert(`Order successful! ${item.cost} merits deducted.`);
      else alert('Order failed, try again.');
    });
}

