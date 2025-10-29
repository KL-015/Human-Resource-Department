const apiUrl = "YOUR_WEB_APP_URL"; // replace with your Google Apps Script URL
let storeOpen = true; // default store status

async function loadStore() {
  const container = document.getElementById("store-container");
  try {
    const res = await fetch(`${apiUrl}?sheet=Store`);
    const items = await res.json();

    if (!storeOpen) {
      container.innerHTML = `<p style="text-align:center; font-weight:bold; font-size:1.2em;">The store is currently closed.</p>`;
      document.getElementById("store-status").innerText = "Store Status: CLOSED";
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="item">
        <h3>${item.Name}</h3>
        <p>Category: ${item.Category}</p>
        <p>Cost: ${item.Cost}</p>
        <button onclick="buyItem('${item.Name}', '${item.Category}', ${item.Cost})">Buy</button>
      </div>
    `).join('');

    document.getElementById("store-status").innerText = "Store Status: OPEN";

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="text-align:center; font-weight:bold;">Failed to load store items.</p>`;
  }
}

async function buyItem(name, category, cost) {
  if (!storeOpen) {
    alert("The store is closed. You cannot purchase items now.");
    return;
  }

  const data = {
    Name: prompt("Enter your full name:"),
    Category: category,
    Batch: prompt("Enter your batch:"),
    Section: prompt("Enter your section:"),
    Item: name,
    Cost: cost,
    Timestamp: new Date().toLocaleString()
  };

  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(data)
  });

  alert(`Order recorded for ${data.Name}!`);
  loadStore(); // refresh store
}

function adminLogin() {
  const password = prompt("Enter admin password:");
  if (password === "admin123") { // change password if needed
    storeOpen = !storeOpen;
    alert(`Store is now ${storeOpen ? "OPEN" : "CLOSED"}.`);
    loadStore();
  } else {
    alert("Incorrect password.");
  }
}

