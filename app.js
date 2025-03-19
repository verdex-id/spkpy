function addWeight() {
    const name = document.getElementById("weight-name").value;
    const value = parseFloat(document.getElementById("weight-value").value);
    const type = document.getElementById("weight-type").value;

    if (!name || isNaN(value) || value <= 0) {
        alert("Weight name, value, and type are required!");
        return;
    }

    const weights = JSON.parse(localStorage.getItem("weights")) || {};
    const total = Object.values(weights).reduce((acc, val) => acc + val.Bobot, 0) + value;

    if (total > 1) {
        alert("Total weight must not exceed 1!");
        return;
    }

    weights[name] = { Bobot: value, Jenis: type };
    localStorage.setItem("weights", JSON.stringify(weights));
    localStorage.removeItem("alternatives")

    renderWeights();
    renderAlternatives();
    document.getElementById("weight-name").value = "";
    document.getElementById("weight-value").value = "";
}

function renderWeights() {
    const weights = JSON.parse(localStorage.getItem("weights")) || {};
    const container = document.getElementById("weights-container");
    container.innerHTML = "";

    Object.keys(weights).forEach(key => {
        const div = document.createElement("div");
        div.classList.add("flex", "flex-wrap", "items-center", "justify-center", "mb-2", "gap-2");

        const label = document.createElement("p");
        label.textContent = `${key.toUpperCase()} (${weights[key].Jenis.toLowerCase()})`;
        label.classList.add("border", "p-2", "rounded", "flex-1", "focus:outline-none", "focus:ring-2", "focus:ring-purple-500");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("bg-red-100", "text-red-500", "p-2", "rounded", "hover:bg-red-500", "hover:text-white", "transition");
        deleteBtn.onclick = () => deleteWeight(key);

        const bobot = document.createElement("p");
        bobot.textContent = `${weights[key].Bobot}`;
        bobot.classList.add("border", "p-2", "rounded", "flex-1", "focus:outline-none", "focus:ring-2", "focus:ring-purple-500");

        div.appendChild(deleteBtn);
        div.appendChild(label);
        div.appendChild(bobot);

        container.appendChild(div);
    });
}

function deleteWeight(key) {
    const weights = JSON.parse(localStorage.getItem("weights")) || {};
    delete weights[key];
    localStorage.setItem("weights", JSON.stringify(weights));
    localStorage.removeItem("alternatives")
    renderWeights();
    renderAlternatives();
}

function addAlternative() {
    let alternatives = JSON.parse(localStorage.getItem("alternatives")) || [];
    alternatives.push({ Nama: "", Kriteria: {} });
    localStorage.setItem("alternatives", JSON.stringify(alternatives));
    renderAlternatives();
}

function renderAlternatives() {
    const weights = JSON.parse(localStorage.getItem("weights")) || {};
    const alternatives = JSON.parse(localStorage.getItem("alternatives")) || [];
    const container = document.getElementById("alternatives-container");
    container.innerHTML = "";
    const someKrit = document.getElementById("some-krit");
    someKrit.innerHTML = `
        <span class="p-2 flex-1 min-w-[150px] ">Alternative Name</span>
        <span class="p-2" id="action-header">Action</span>
    `;

    const actionHeader = document.getElementById("action-header");

    Object.keys(weights).forEach(key => {
        const header = document.createElement("span");
        header.textContent = key;
        header.classList.add("flex-1", "min-w-[100px]", "text-center", "px-2", "border-l", "border-r", "border-gray-300");

        actionHeader.before(header);
    });

    alternatives.forEach((alt, index) => {
        const altDiv = document.createElement("div");
        altDiv.classList.add("flex", "flex-wrap", "items-center", "mb-2", "gap-2");

        const nameInput = document.createElement("input");
        nameInput.placeholder = "Alternative Name";
        nameInput.value = alt.Nama;
        nameInput.classList.add("border", "p-2", "rounded", "flex-1", "min-w-[150px]", "focus:outline-none", "focus:ring-2", "focus:ring-purple-500");
        nameInput.onchange = () => updateAlternativeName(index, nameInput.value);

        altDiv.appendChild(nameInput);

        Object.keys(weights).forEach(key => {
            const input = document.createElement("input");
            input.placeholder = key;
            input.type = "number";
            input.value = alt.Kriteria[key] || "";
            input.classList.add("border", "p-2", "rounded", "flex-1", "min-w-[100px]", "focus:outline-none", "focus:ring-2", "focus:ring-purple-500");
            input.onchange = () => updateAlternativeValue(index, key, parseFloat(input.value));
            altDiv.appendChild(input);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("bg-red-100", "text-red-500", "p-2", "rounded", "hover:bg-red-500", "hover:text-white", "transition");
        deleteBtn.onclick = () => deleteAlternative(index);

        altDiv.appendChild(deleteBtn);
        container.appendChild(altDiv);
    });
}


function updateAlternativeName(index, name) {
    let alternatives = JSON.parse(localStorage.getItem("alternatives")) || [];
    alternatives[index].Nama = name;
    localStorage.setItem("alternatives", JSON.stringify(alternatives));
}

function updateAlternativeValue(index, key, value) {
    let alternatives = JSON.parse(localStorage.getItem("alternatives")) || [];
    alternatives[index].Kriteria[key] = value;
    localStorage.setItem("alternatives", JSON.stringify(alternatives));
}

function deleteAlternative(index) {
    let alternatives = JSON.parse(localStorage.getItem("alternatives")) || [];
    alternatives.splice(index, 1);
    localStorage.setItem("alternatives", JSON.stringify(alternatives));
    renderAlternatives();
}

function calculateSAW() {
    const weights = JSON.parse(localStorage.getItem("weights")) || {};
    const alternatives = JSON.parse(localStorage.getItem("alternatives")) || [];
    const totalWeight = Math.round( Object.values(weights).reduce((acc, val) => acc + val.Bobot, 0));

    console.log(totalWeight)

    if (totalWeight !== 1) {
        alert("Total weight must be exactly 1!");
        return;
    }

    // Generate criteria dengan format C1, C2, C3, ...
    const generatedCriteria = {};
    let index = 1;
    for (const [key, value] of Object.entries(weights)) {
        const criteriaKey = `C${index}`;
        generatedCriteria[criteriaKey] = {
            Jenis: value.Jenis,
            Bobot: value.Bobot
        };
        index++;
    }

    // Generate alternatives dengan format C1, C2, C3, ...
    const formattedAlternatives = alternatives.map((alt) => {
        const formattedKriteria = {};
        let idx = 1;
        for (const [key, value] of Object.entries(alt.Kriteria)) {
            const criteriaKey = `C${idx}`;
            formattedKriteria[criteriaKey] = value;
            idx++;
        }
        return {
            Nama: alt.Nama,
            Kriteria: formattedKriteria
        };
    });

    console.log(JSON.stringify({ alternatives: formattedAlternatives, criteria: generatedCriteria }));

    fetch("http://localhost:5000/saw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: formattedAlternatives, criteria: generatedCriteria })
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `
            <h3 class="text-lg font-bold mb-2">Ranking:</h3>
            <ul class="space-y-1">
                ${data.ranking.map((rank, index) => `
                    <li class="flex justify-between items-center p-2 bg-gray-50 rounded-md shadow-sm">
                        <span>${index + 1}. ${rank.Nama}</span>
                        <span class="font-semibold text-gray-600">Skor: ${rank.Skor.toFixed(2)}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    })
    .catch(err => alert("Error calculating SAW!"));
}



renderWeights();
renderAlternatives();
