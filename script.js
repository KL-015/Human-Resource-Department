const apiUrl = "https://script.google.com/macros/s/AKfycbwXJnnsmGTQH-2gP-9LimSQQOwRcdZiu-Mm8g5x864SFHfg2AYw1C9gcaqyvJE8lSA/exec"; // Replace with your deployed Apps Script URL

let storeOpen = true; // Admin can toggle in Google Sheet (optional later)

async function loadStore() {
  if (!storeOpen) {
    document.getElementById("store-container").innerHTML = "<p>Store is currently closed.</p>";
    return;
  }

  const res = await fetch(`${apiUrl}?sheet=Store`);
  const items = await res.json();

  const container = document.getElementById("store-container");
  container.innerHTML = items.map(item => `
    <div class="item">
      <h3>${item.Name}</h3>
      <p>Category: ${item.Category}</p>
      <p>Cost: ${item.Cost}</p>
      <button onclick="buyItem('${item.Name}', '${item.Category}', ${item.Cost})">Buy</button>
    </div>
  `).join('');
}

async function buyItem(itemName, category, cost) {
  const cadetName = prompt("Enter your full name:");
  const batch = prompt("Enter your batch:");
  const section = prompt("Enter your section:");

  if (!cadetName) return;

  // Fetch current balance from Summary
  const res = await fetch(`${apiUrl}?sheet=Summary`);
  const cadets = await res.json();
  const cadet = cadets.find(c => c.Name.toLowerCase() === cadetName.trim().toLowerCase());

  if (!cadet) {
    alert("Cadet not found in Summary.");
    return;
  }

  const currentMerit = Number(cadet.Balance);
  if (currentMerit < cost) {
    alert(`Not enough merits! You have ${currentMerit}, but this item costs ${cost}.`);
    return;
  }

  const newBalance = currentMerit - cost;

  // 1️⃣ Deduct merits in Summary
  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "deduct",
      Name: cadetName,
      NewBalance: newBalance
    })
  });

  // 2️⃣ Log order in Order sheet
  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "logOrder",
      Name: cadetName,
      Category: category,
      Batch: batch,
      Section: section,
      Cost: cost
    })
  });

  alert(`Order recorded for ${cadetName}! Remaining merits: ${newBalance}`);
}

