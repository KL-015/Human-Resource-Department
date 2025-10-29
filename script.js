const apiUrl = "https://script.google.com/macros/s/AKfycbyvnzD48ihAt9sb7VJL1_RNZLT1o269WnKG7KJpT0ulMLBWVw4dwwudQr8ufAhegSfF/exec";

async function loadStore() {
  const res = await fetch(`${apiUrl}?sheet=Store`);
  const items = await res.json();

  const container = document.getElementById("store-container");
  container.innerHTML = items.map(item => `
    <div class="item">
      <h3>${item.Name}</h3>
      <p>Category: ${item.Category}</p>
      <p>Cost: ${item.Cost}</p>
      <button onclick="buyItem('${item.Name}', '${item.Category}')">Buy</button>
    </div>
  `).join('');
}

async function buyItem(name, category) {
  const data = {
    Name: prompt("Enter your full name:"),
    Category: category,
    Batch: prompt("Enter your batch:"),
    Section: prompt("Enter your section:")
  };

  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(data)
  });

  alert(`Order recorded for ${data.Name}!`);
}

async function searchMerit() {
  const name = document.getElementById("searchName").value.trim().toLowerCase();
  const res = await fetch(`${apiUrl}?sheet=Merit`);
  const data = await res.json();

  const found = data.find(c => c.Name.toLowerCase() === name);
  document.getElementById("result").innerText = found
    ? `${found.Name} has ${found.Balance} merits.`
    : "Cadet not found.";
}
