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

let caughtPokemon = JSON.parse(localStorage.getItem(currentGame.storageKey)) || [];
let cachedPokemonList = []; // "Local Cache"

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
        const isCaught = caughtPokemon.includes(pokemonId);

        const card = document.createElement('div');
        card.className = `pokemon-card ${isCaught ? 'caught' : ''}`;
        
        card.innerHTML = `
            <span class="dex-id">#${pokemonId}</span>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" alt="${pokemon.name}">
            <p class="name">${pokemon.name}</p>
        `;

        card.onclick = () => toggleCatch(pokemonId);
        grid.appendChild(card);
    });
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

loadPokemon();