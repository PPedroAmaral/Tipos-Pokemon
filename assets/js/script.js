// limite de tipos

function limiteTipos(checkbox) {
    const checkboxes = document.querySelectorAll('input[name="type"]:checked');

    if (checkboxes.length > 2) {
        checkbox.checked = false;
        alert("Você só pode selecionar no máximo 2 tipos!");
        return;
    }

    buscarPokemons();
    mostrarVantagensDesvantagens();
}

function obterTiposSelecionados() {
    return Array.from(document.querySelectorAll('input[name="type"]:checked')).map(input => input.value);
}

// Mostrar pokemons correspondentes

async function buscarPokemons() {
    const selecionados = obterTiposSelecionados();
    const lista = document.getElementById('pokemon-list');
    lista.innerHTML = '';

    if (selecionados.length === 0) {
        lista.innerHTML = "<h4>Selecione um tipo!</h4>";
        return;
    }

    try {
        const pokemonsPorTipo = await Promise.all(selecionados.map(tipo =>
            fetch(`https://pokeapi.co/api/v2/type/${tipo}`).then(response => response.json())
        ));

        const resultado = pokemonsPorTipo.reduce((acumulador, data) => {
            const nomes = data.pokemon.map(p => p.pokemon.name);
            return acumulador.length === 0 ? nomes : acumulador.filter(pokemon => nomes.includes(pokemon));
        }, []);

        exibirPokemons(resultado);
    } catch (error) {
        console.error("Erro ao buscar Pokémon:", error);
        lista.innerHTML = "<li>Erro ao buscar Pokémon.</li>";
    }
}

async function exibirPokemons(pokemons) {
    const lista = document.getElementById("pokemon-list");
    lista.innerHTML = "";

    if (pokemons.length === 0) {
        lista.innerHTML = "<h4>Nenhum Pokémon encontrado com esses dois tipos.</h4>";
        return;
    }

    for (let i = 0; i < Math.min(9, pokemons.length); i++) {
        const pokemon = pokemons[i];
        const item = document.createElement("li");

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
            const data = await response.json();

            const img = document.createElement("img");
            img.src = data.sprites.front_default;
            img.alt = pokemon;

            const nome = document.createElement("span");
            nome.textContent = pokemon;

            item.appendChild(nome);
            item.appendChild(img);
            lista.appendChild(item);
        } catch (error) {
            console.error(`Erro ao buscar dados do Pokémon ${pokemon}:`, error);
            item.textContent = `Erro ao buscar ${pokemon}`;
            lista.appendChild(item);
        }
    }
}

// vantagens e desvantagens

function calcularMultiplicadores(tiposSelecionados, tiposData, propriedade) {
    const multiplicadores = {};
    tiposSelecionados.forEach(tipo => {
        const tipoData = tiposData[tipo];
        tipoData[propriedade].forEach(item => {
            if (propriedade === 'resiste' || propriedade === 'resisteAele') {
                multiplicadores[item] = (multiplicadores[item] || 1) * 0.5;
            } else {
                multiplicadores[item] = (multiplicadores[item] || 1) * 2;
            }
        });
    });
    return multiplicadores;
}

function calcularImunidades(tiposSelecionados, tiposData) {
    const imunidades = {};
    tiposSelecionados.forEach(tipo => {
        const tipoData = tiposData[tipo];
        tipoData.imune.forEach(imunidade => {
            imunidades[imunidade] = 0;
        });
    });
    return imunidades;
}

function formatarMultiplicadores(multiplicadores) {

    const resultados = [];

    for (const tipo in multiplicadores) {

        if (multiplicadores[tipo] === 2) {

            resultados.push(`${tipo} (2x)`);

        } else if (multiplicadores[tipo] === 4) {

            resultados.push(`${tipo} (4x)`);

        } else if (multiplicadores[tipo] === 0.5) {

            resultados.push(`${tipo} (1/2x)`);

        } else if (multiplicadores[tipo] === 0.25) {

            resultados.push(`${tipo} (1/4x)`);

        } else if (multiplicadores[tipo] === 0) {

            resultados.push(`${tipo} (0x)`);

        }

    }

    return resultados.length > 0 ? resultados.join('<br>') : 'Nenhuma';

}

function exibirResultado(div, titulo, resultado) {
    div.innerHTML = `<h3  class="fontezinha">${titulo}:</h3><p  class="fonte">${resultado}</p>`;
}

function exibirVantagens(tiposSelecionados, tiposData) {
    const vantagensMultiplicadores = calcularMultiplicadores(tiposSelecionados, tiposData, 'vantagens');
    exibirResultado(document.querySelector('.vantagens'), 'Vantagens', formatarMultiplicadores(vantagensMultiplicadores));
}

function exibirFraquezas(tiposSelecionados, tiposData) {
    const fraquezasMultiplicadores = calcularMultiplicadores(tiposSelecionados, tiposData, 'fraquezas');
    exibirResultado(document.querySelector('.desvantagens'), 'Fraquezas', formatarMultiplicadores(fraquezasMultiplicadores));
}

function exibirResistencias(tiposSelecionados, tiposData) {
    const resisteMultiplicadores = calcularMultiplicadores(tiposSelecionados, tiposData, 'resiste');
    exibirResultado(document.querySelector('.resite'), 'Resistências', formatarMultiplicadores(resisteMultiplicadores));
}

function exibirImunidades(tiposSelecionados, tiposData) {
    const imuneMultiplicadores = calcularImunidades(tiposSelecionados, tiposData);
    exibirResultado(document.querySelector('.imune'), 'Imunidades', formatarMultiplicadores(imuneMultiplicadores));
}

function exibirResisteAele(tiposSelecionados, tiposData) {
    const resisteAeleMultiplicadores = calcularMultiplicadores(tiposSelecionados, tiposData, 'resisteAele');
    exibirResultado(document.querySelector('.resisteAele'), 'Resiste a ele', formatarMultiplicadores(resisteAeleMultiplicadores));
}

async function carregarTipos() {
    const response = await fetch('./assets/js/tipos.json');
    const data = await response.json();
    return data;
}

async function mostrarVantagensDesvantagens() {
    const tiposSelecionados = obterTiposSelecionados();
    const tiposData = await carregarTipos();

    exibirVantagens(tiposSelecionados, tiposData);
    exibirFraquezas(tiposSelecionados, tiposData);
    exibirResistencias(tiposSelecionados, tiposData);
    exibirImunidades(tiposSelecionados, tiposData);
    exibirResisteAele(tiposSelecionados, tiposData);
}