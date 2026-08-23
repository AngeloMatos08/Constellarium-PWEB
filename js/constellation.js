export async function loadConstellations() {

    const response = await fetch("data/constellations.json");

    const data = await response.json();

    console.log("Constelações carregadas:", data);

    return data.constellations;
}