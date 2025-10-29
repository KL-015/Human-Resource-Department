let allNames = [];
let cadetMerit = 0;
const apiUrl = "https://script.google.com/macros/s/AKfycbyvnzD48ihAt9sb7VJL1_RNZLT1o269WnKG7KJpT0ulMLBWVw4dwwudQr8ufAhegSfF/exec"; // ← Replace with your Web App URL

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
  if(!cad
