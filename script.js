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