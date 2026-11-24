
export function createShootingStars() {

    const shootingStars = [];

    // CRIAR UMA ESTRELA CADENTE

    function createShootingStar(width, height) {

        const startX =
            Math.random() * width;

        const startY =
            Math.random() * height * 0.5;

        // DIREÇÃO ALEATÓRIA

        // DIREÇÃO ALEATÓRIA: DIREITA OU ESQUERDA

        const direction =
            Math.random() < 0.5 ? 1 : -1;

        const angle =
            Math.PI / 6 + Math.random() * Math.PI / 6;

        // VELOCIDADE VARIÁVEL

        const speed =
            250 + Math.random() * 550;

        // COMPRIMENTO DO RASTRO

        const length =
            40 + Math.random() * 110;
        return {

            x: startX,
            y: startY,

            vx: direction * Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            length,

            opacity: 1,

            life: 0,
            duration: 0.8 + Math.random() * 0.7,
            // APARÊNCIA

            thickness: 1 + Math.random() * 2,

            brightness: 0.4 + Math.random() * 0.6,
        };

    }


    // ATUALIZAR ESTRELAS CADENTES

    function update(deltaTime, width, height) {

        for (let i = shootingStars.length - 1; i >= 0; i--) {

            const star = shootingStars[i];

            star.x += star.vx * deltaTime;
            star.y += star.vy * deltaTime;

            star.life += deltaTime;

            star.opacity =
                Math.max(
                    0,
                    1 - star.life / star.duration
                );

            // REMOVER QUANDO TERMINAR

            if (
                star.life >= star.duration ||
                star.x > width + star.length ||
                star.y > height + star.length
            ) {

                shootingStars.splice(i, 1);

            }

        }

    }


    // ADICIONAR UMA ESTRELA CADENTE

    function spawn(width, height) {

        shootingStars.push(
            createShootingStar(width, height)
        );

    }


    return {

        update,
        spawn,

        getStars() {
            return shootingStars;
        }

    };

}
