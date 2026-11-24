
export async function loadConstellations() {

    const [constellationsResponse, starsResponse] =
        await Promise.all([
            fetch("data/constellations.json"),
            fetch("data/stars.json")
        ]);

    if (
        !constellationsResponse.ok ||
        !starsResponse.ok
    ) {
        throw new Error(
            "Erro ao carregar os dados astronômicos."
        );
    }

    const constellationsData =
        await constellationsResponse.json();

    const starsData =
        await starsResponse.json();

    // Cria um catálogo para localizar estrelas pelo ID.
    const starsById = new Map(
        starsData.stars.map(star => [
            star.id,
            star
        ])
    );

    // Relaciona cada estrela da constelação
    // aos seus dados completos no catálogo.
    const constellations =
        constellationsData.constellations.map(
            constellation => {

                const resolvedStars =
                    constellation.stars.map(
                        starReference => {

                            const catalogStar =
                                starsById.get(
                                    starReference.id
                                );

                            if (!catalogStar) {
                                throw new Error(
                                    `Estrela não encontrada no catálogo: ${starReference.id}`
                                );
                            }

                            return {
                                ...catalogStar,
                                diagram: starReference.diagram
                            };
                        }
                    );

                return {
                    ...constellation,
                    stars: resolvedStars
                };
            }
        );

    console.log(
        "Constelações carregadas:",
        constellations
    );

    console.log(
        "Estrelas carregadas:",
        starsData.stars
    );

    return {
        constellations,
        stars: starsData.stars
    };
}
