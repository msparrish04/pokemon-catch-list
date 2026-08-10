const GAMES = {
    leafgreen: {
        title: "LeafGreen",
        offset: 0,
        limit: 151,
        storageKey: "pkmn_caught_lg"
    },
    // TODO: Add future games-- starting with LeafGreen
};

const currentGame = GAMES.leafgreen;

document.getElementById('game-title').innerText = currentGame.title;

let pokemonData = JSON.parse(localStorage.getItem(currentGame.storageKey)) || {};
let cachedPokemonList = []; // "Local Cache"
let activePokemonId = null;

function getEntry(id) {
    return pokemonData[id] || { caught: false, shiny: false, gender: "unknown", notes: "" };
}

function saveData() {
    localStorage.setItem(currentGame.storageKey, JSON.stringify(pokemonData));
}

async function loadPokemon() {
    // 1. Check if the list is already in localStorage (Persistent Cache)
    const localData = localStorage.getItem(`data_${currentGame.storageKey}`);
    
    if (localData) {
        cachedPokemonList = JSON.parse(localData);
        renderGrid(cachedPokemonList);
        return;
    }

    // 2. If not in localStorage, fetch from API
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${currentGame.limit}&offset=${currentGame.offset}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        cachedPokemonList = data.results;

        // 3. Save the fetched list to localStorage for next time
        localStorage.setItem(`data_${currentGame.storageKey}`, JSON.stringify(cachedPokemonList));
        
        renderGrid(cachedPokemonList);
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}

function renderGrid(pokemonList) {
    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = ''; // Clear current grid

    pokemonList.forEach((pokemon, index) => {
        const pokemonId = index + 1 + currentGame.offset;
        const entry = getEntry(pokemonId);

        const card = document.createElement('div');
        card.className = `pokemon-card ${entry.caught ? 'caught' : ''} ${entry.shiny ? 'shiny' : ''}`;
        card.innerHTML = `
            <span class="dex-id">#${pokemonId}</span>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" alt="${pokemon.name}">
            <p class="name">${pokemon.name}</p>
        `;

        card.onclick = () => openModal(pokemonId, pokemon.name);        grid.appendChild(card);
    });

    updateProgress();
}

function toggleCatch(id) {
    if (caughtPokemon.includes(id)) {
        // Remove from list if already there
        caughtPokemon = caughtPokemon.filter(pId => pId !== id);
    } else {
        // Add to list if missing
        caughtPokemon.push(id);
    }

    localStorage.setItem(currentGame.storageKey, JSON.stringify(caughtPokemon));
    
    renderGrid(cachedPokemonList);
}

function updateProgress() {
    const total = currentGame.limit;
    const caughtCount = Object.values(pokemonData).filter(e => e.caught).length;
    const percent = total > 0 ? Math.round((caughtCount / total) * 100) : 0;

    document.getElementById('progress-bar-fill').style.width = `${percent}%`;
    document.getElementById('progress-text').innerText = `${caughtCount} / ${total} caught (${percent}%)`;
}

function openModal(id, name) {
    activePokemonId = id;
    const entry = getEntry(id);

    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    document.getElementById('modal-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    document.getElementById('modal-name').innerText = displayName;
    document.getElementById('modal-id').innerText = `#${id}`;
    document.getElementById('modal-caught').checked = entry.caught;
    document.getElementById('modal-shiny').checked = entry.shiny;
    document.getElementById('modal-notes').value = entry.notes;

    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.checked = radio.value === entry.gender;
    });

    document.getElementById('detail-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    activePokemonId = null;
}

function saveActiveEntry() {
    if (activePokemonId === null) return;

    const selectedGender = document.querySelector('input[name="gender"]:checked');

    pokemonData[activePokemonId] = {
        caught: document.getElementById('modal-caught').checked,
        shiny: document.getElementById('modal-shiny').checked,
        gender: selectedGender ? selectedGender.value : "unknown",
        notes: document.getElementById('modal-notes').value
    };

    saveData();
    renderGrid(cachedPokemonList); // refresh grid to reflect caught/shiny visuals
}

// Save on every change, so nothing is lost if the user just closes the modal
document.getElementById('modal-caught').addEventListener('change', saveActiveEntry);
document.getElementById('modal-shiny').addEventListener('change', saveActiveEntry);
document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', saveActiveEntry);
});
document.getElementById('modal-notes').addEventListener('input', saveActiveEntry);

document.getElementById('modal-close').onclick = closeModal;
document.getElementById('detail-modal').onclick = (e) => {
    // close if clicking the dark overlay, not the modal content itself
    if (e.target.id === 'detail-modal') closeModal();
};

loadPokemon();

/* 
TODO:
- Add shiny tracker
- Implement all other games
- Implement search bar
- Let user add catch notes and other stats
*/