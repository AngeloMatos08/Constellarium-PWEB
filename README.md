<p align="center">
<img src="https://img.shields.io/github/repo-size/AngeloMatos08/Constellarium-PWEB?style=for-the-badge" alt="Tamanho do repositório">
<img src="https://img.shields.io/github/languages/count/AngeloMatos08/Constellarium-PWEB?style=for-the-badge" alt="Quantidade de linguagens">
<img src="https://img.shields.io/github/languages/top/AngeloMatos08/Constellarium-PWEB?style=for-the-badge" alt="Linguagem principal">
<img src="https://img.shields.io/github/last-commit/AngeloMatos08/Constellarium-PWEB?style=for-the-badge" alt="Último commit">
src="https://img.shields.io/github/commit-activity/t/AngeloMatos08/Constellarium-PWEB?style=for-the-badge" alt="Atividade de commits">
</p>
<h1 align="center">Constellarium</h1>  <p align="center">  
  Um jogo educativo para explorar o céu e reconhecer constelações.  
</p>  <p align="center">  
  <a href="https://github.com/AngeloMatos08/Constellarium-PWEB">Repositório</a>  
  ·  
  <a href="https://github.com/AngeloMatos08/Constellarium-PWEB/issues">Reportar um problema</a>  
</p>  
---

Índice

Sobre o projeto

Funcionalidades

Tecnologias

Rotas

Estrutura do projeto

Pré-requisitos

Como executar

Como jogar

Estado do desenvolvimento

Objetivo acadêmico



---

Sobre o projeto

O Constellarium é um jogo educativo de astronomia em que a pessoa observa estrelas, orienta um telescópio virtual e tenta reconhecer constelações conectando os pontos que formam cada padrão.

O projeto combina uma experiência web com conceitos de programação e astronomia. As páginas institucionais apresentam o jogo, explicam como jogar e documentam sua arquitetura; a tela de gameplay permanece separada da apresentação.

Funcionalidades

[x] Homepage com apresentação do projeto e mapa celeste ilustrativo.

[x] Página visual com as instruções do jogo.

[x] Página sobre o propósito, conceitos e arquitetura do projeto.

[x] Navegação entre páginas por rotas Express.

[x] Carregamento de constelações a partir de um arquivo JSON local.

[x] Seleção de uma constelação para cada partida.

[x] Renderização de estrelas e conexões usando Canvas.

[x] Seleção de estrelas para criar conexões.

[x] Validação das conexões feitas pelo jogador.

[x] Controles de RA (Ascensão Reta) e DEC (Declinação) do telescópio.

[x] Reinício das conexões e avanço para outra constelação.

[ ] Integrar a projeção astronômica ao campo de visão do jogo.

[ ] Substituir os dados de teste por fontes astronômicas documentadas.


> Os controles de RA e DEC já alteram a posição do telescópio. A projeção das coordenadas das estrelas ainda está em desenvolvimento e não está integrada ao fluxo de renderização atual.



Tecnologias

HTML5 para a estrutura das páginas.

CSS3 para identidade visual e layouts responsivos.

JavaScript ES Modules para as funcionalidades do cliente.

Canvas API para desenhar o campo de estrelas.

Node.js para executar o servidor.

Express 5 e express.Router() para as rotas e arquivos estáticos.

JSON local para os dados de constelações.


Não é utilizado framework CSS. A tipografia da interface usa Manrope e DM Mono, carregadas pelo Google Fonts.

Rotas

Caminho	Página

/	Homepage
/como-jogar	Instruções
/sobre	Sobre o projeto
/jogo	Gameplay


O servidor também mantém aliases com extensão, como /jogo.html. CSS, JavaScript e dados são servidos nas rotas estáticas /css, /js e /data.

Estrutura do projeto

Constellarium-PWEB/  
├── como-jogar.html       # Guia visual de gameplay  
├── index.html            # Homepage  
├── jogo.html             # Tela do jogo  
├── sobre.html            # Apresentação e documentação do projeto  
├── css/  
│   ├── site.css          # Identidade visual e páginas institucionais  
│   └── style.css         # Estilos do gameplay  
├── data/  
│   └── constellations.json  
├── js/  
│   ├── constellation.js  # Carregamento dos dados JSON  
│   ├── game.js           # Estado e conexões do jogo  
│   ├── home.js           # Mapa celeste ilustrativo da homepage  
│   ├── input.js          # Reservado para código de entrada  
│   ├── main.js           # Inicialização e eventos do gameplay  
│   ├── projection.js     # Projeção astronômica em desenvolvimento  
│   ├── renderer.js       # Desenho no Canvas  
│   ├── telescope.js      # Estado e controles de RA/DEC  
│   └── validator.js      # Validação das conexões  
├── routes/  
│   └── pages.js          # Rotas das páginas  
├── server.js             # Aplicação Express  
├── package.json  
└── package-lock.json

Pré-requisitos

Node.js 18 ou superior.

npm.


Como executar

1. Clone o repositório:

git clone https://github.com/AngeloMatos08/Constellarium-PWEB.git


2. Acesse a pasta do projeto:

cd Constellarium-PWEB


3. Instale as dependências:

npm install


4. Inicie o servidor:

npm start


5. Abra http://localhost:3000 no navegador.



Para desenvolvimento com reinicialização automática do servidor ao editar arquivos:

npm run dev

Para usar outra porta, defina a variável PORT:

PORT=4173 npm start

Como jogar

1. Acesse a rota /jogo.


2. Observe o nome da constelação do desafio.


3. Use os controles de RA e DEC para orientar o telescópio virtual.


4. Selecione estrelas no Canvas para conectá-las e formar o padrão.


5. Use Limpar conexões para reiniciar o desenho.


6. Use Finalizar tentativa para verificar as conexões.


7. Selecione Continuar para receber outro desafio.



Estado do desenvolvimento

O Constellarium está em desenvolvimento acadêmico. As constelações incluídas atualmente são dados de teste locais. A implementação de projeção astronômica está em pausa e deve ser integrada em uma etapa futura, sem confundir o protótipo atual com uma representação completa do céu.

O servidor Express atende as páginas e os arquivos estáticos. O projeto ainda não utiliza banco de dados, autenticação, API externa, Express-Generator, template engine ou partials.

Objetivo acadêmico

O projeto explora a construção de uma aplicação web modular e responsiva, além de conceitos introdutórios de astronomia, como reconhecimento de constelações, Ascensão Reta e Declinação.