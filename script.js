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