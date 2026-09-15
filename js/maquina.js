const MAX_FILA = 9;
const MAX_COL = 9;
let fila = 0;
let col = 0;

/* ===========================================================================
   TABLA DE INSTRUCCIONES
   Única fuente de verdad. De aquí salen todas las traducciones entre niveles.
   =========================================================================== */
const INSTRUCCIONES = [
    {bin: "000", mnem: "BOT", alto: "BORRARTODO"},
    {bin: "001", mnem: "SUB", alto: "MOVER ARRIBA"},
    {bin: "010", mnem: "BAJ", alto: "MOVER ABAJO"},
    {bin: "011", mnem: "IZQ", alto: "MOVER IZQUIERDA"},
    {bin: "100", mnem: "DER", alto: "MOVER DERECHA"},
    {bin: "101", mnem: "BOR", alto: "BORRAR"},
    {bin: "110", mnem: "PIN", alto: "PINTAR"},
    {bin: "111", mnem: "PIT", alto: "PINTARTODO"}
];

const BIN_A_MNEM = {};
const MNEM_A_BIN = {};
const MNEM_A_ALTO = {};
for (const i of INSTRUCCIONES) {
    BIN_A_MNEM[i.bin] = i.mnem;
    MNEM_A_BIN[i.mnem] = i.bin;
    MNEM_A_ALTO[i.mnem] = i.alto;
}

const DIRECCIONES = {
    "ARRIBA": "SUB",
    "ABAJO": "BAJ",
    "IZQUIERDA": "IZQ",
    "DERECHA": "DER"
};

/* ===========================================================================
   TROCEADO
   Tanto el binario como el ensamblador se leen de tres en tres caracteres,
   ignorando los espacios en blanco. Es el comportamiento de siempre.
   =========================================================================== */
function troceaEnTres(texto) {
    const normalizado = texto.toUpperCase().replace(/\s+/g, '');
    const trozos = [];
    for (let inicio = 0; inicio < normalizado.length; inicio += 3) {
        trozos.push(normalizado.substr(inicio, 3));
    }
    return trozos;
}

/* Reparte una lista de instrucciones en líneas legibles dentro del textarea. */
function enLineas(lista, porLinea) {
    const lineas = [];
    for (let i = 0; i < lista.length; i += porLinea) {
        lineas.push(lista.slice(i, i + porLinea).join(' '));
    }
    return lineas.join('\n');
}

/* ===========================================================================
   TRADUCTORES
   Son funciones puras: convierten texto en texto y NO dibujan nada.

   Bajar de nivel (3GL -> 2GL -> 1GL) es exacto.
   Subir de nivel es literal, instrucción a instrucción: se recupera un
   programa equivalente, pero se pierde toda la estructura (los REPETIR y los
   CUADRADO desaparecen convertidos en su desarrollo).

   Qué conversiones se ofrecen al usuario NO se decide aquí, sino en
   seTraduce(): hacia el 3GL no se sube nunca.
   =========================================================================== */

/* --- 3GL -> 2GL ---------------------------------------------------------- */
function traduce3GLa2GL(texto) {
    const salida = [];
    for (const instruccion of texto.toUpperCase().split(';')) {
        expandeSimple3GL(instruccion, salida);
    }
    return salida;
}

function expandeSimple3GL(instruccion, salida) {
    instruccion = instruccion.trim();
    if (instruccion === "") return;
    const palabras = instruccion.split(/\s+/);

    if (palabras.length === 1) {
        if (palabras[0] === "BORRAR") salida.push("BOR");
        else if (palabras[0] === "PINTAR") salida.push("PIN");
        else if (palabras[0] === "BORRARTODO") salida.push("BOT");
        else if (palabras[0] === "PINTARTODO") salida.push("PIT");
        else salida.push(palabras[0]);              // no reconocida: se conserva
        return;
    }

    if (palabras.length === 2) {
        const direccion = DIRECCIONES[palabras[1]];

        if (palabras[0] === "MOVER" && direccion) {
            salida.push(direccion);
        } else if (palabras[0] === "PINTAR" && direccion) {
            salida.push(direccion, "PIN");
        } else if (palabras[0] === "BORRAR" && direccion) {
            salida.push(direccion, "BOR");
        } else if (palabras[0] === "CUADRADO" && !isNaN(palabras[1])) {
            const veces = parseInt(palabras[1]);
            for (let i = 0; i < veces; i++) {
                for (let j = 0; j < veces; j++) {
                    salida.push("PIN");
                    if (j < veces - 1) salida.push("DER");
                }
                for (let k = 0; k < veces - 1; k++) salida.push("IZQ");
                salida.push("BAJ");
            }
            salida.push("SUB");
            for (let k = 0; k < veces - 1; k++) salida.push("DER");
        } else {
            salida.push(...palabras);               // no reconocida: se conserva
        }
        return;
    }

    if (palabras.length === 4 && palabras[0] === "REPETIR" && !isNaN(palabras[3])) {
        const veces = parseInt(palabras[3]);
        for (let i = 0; i < veces; i++) {
            expandeSimple3GL(palabras[1] + " " + palabras[2], salida);
        }
        return;
    }

    salida.push(...palabras);                       // no reconocida: se conserva
}

/* Traduce una instrucción con la tabla indicada. Lo que no esté en la tabla
   se devuelve tal cual: así una errata del alumno no se pierde al cambiar
   de pestaña, se queda a la vista. */
function traduceInstruccion(instruccion, tabla) {
    return tabla[instruccion] !== undefined ? tabla[instruccion] : instruccion;
}

/* --- Traducción entre dos niveles cualesquiera --------------------------- */
/* El 2GL hace de nivel intermedio: todo pasa por él. */
function traduce(texto, desde, hasta) {
    if (desde === hasta) return texto;

    // 1. Llevar el programa de partida a una lista de mnemónicos (2GL)
    let mnemonicos;
    if (desde === 3) {
        mnemonicos = traduce3GLa2GL(texto);
    } else if (desde === 1) {
        mnemonicos = troceaEnTres(texto).map(b => traduceInstruccion(b, BIN_A_MNEM));
    } else {
        mnemonicos = troceaEnTres(texto);
    }

    // 2. Y desde ahí, bajar a binario o subir a alto nivel
    if (hasta === 2) return enLineas(mnemonicos, 7);
    if (hasta === 1) return enLineas(mnemonicos.map(m => traduceInstruccion(m, MNEM_A_BIN)), 7);
    return mnemonicos.map(m => traduceInstruccion(m, MNEM_A_ALTO)).join(';\n');
}

/* ===========================================================================
   EJECUCIÓN
   Cada nivel traduce al de abajo y, al final, el 1GL es el único que dibuja.
   =========================================================================== */
function procesa3GL(instrucciones) {
    ejecutaMnemonicos(traduce3GLa2GL(instrucciones));
}

function procesa2GL(instrucciones) {
    ejecutaMnemonicos(troceaEnTres(instrucciones));
}

function ejecutaMnemonicos(lista) {
    procesa1GL(lista.map(m => traduceInstruccion(m, MNEM_A_BIN)).join(' '));
}

function procesa1GL(instrucciones) {
    const instNorm = instrucciones.replace(/\s+/g, '');
    let capa = document.getElementById("c" + fila + col);
    //quitar borde rojo a la capa anterior
    capa.classList.remove("actual");

    for (let inicio = 0; inicio < instNorm.length; inicio += 3) {
        const instr = instNorm.substr(inicio, 3);
        let error = false;
        capa = document.getElementById("c" + fila + col);

        if (instr === "101") {//borrar
            capa.style.backgroundColor = "transparent";
        } else if (instr === "110") {//pintar
            capa.style.backgroundColor = "black";
        } else if (instr === "001") { //subir
            fila = (fila > 0 ? fila - 1 : fila);
        } else if (instr === "010") {//bajar
            fila = (fila < MAX_FILA ? fila + 1 : fila);
        } else if (instr === "011") {//izda
            col = (col > 0 ? col - 1 : col);
        } else if (instr === "100") {//dcha
            col = (col < MAX_COL ? col + 1 : col);
        } else if (instr === "000") {
            //borrar toda
            for (let i = 0; i <= MAX_FILA; i++) {
                for (let j = 0; j <= MAX_COL; j++) {
                    document.getElementById("c" + i + j).style.backgroundColor = "transparent";
                }
            }
            fila = 0;
            col = 0;
        } else if (instr === "111") {
            //pintar toda
            for (let i = 0; i <= MAX_FILA; i++) {
                for (let j = 0; j <= MAX_COL; j++) {
                    document.getElementById("c" + i + j).style.backgroundColor = "black";
                }
            }
            fila = 0;
            col = 0;
        } else {
            error = true;
        }

        if (!error) {
            resultadoBinario.innerHTML += instr + "<br>";
        }
    }

    capa = document.getElementById("c" + fila + col);
    //poner borde rojo a la capa actual
    capa.classList.add("actual");
}

/* ========================================================================= */
window.addEventListener("DOMContentLoaded", (e) => {
    let g1 = document.getElementById("g1");
    let g2 = document.getElementById("g2");
    let g3 = document.getElementById("g3");
    let resultadoBinario = document.getElementById("resultadoBinario");
    let instruc = document.getElementById("instruc");
    let ejecutar = document.getElementById("ejecutar");
    let cerrar = document.getElementById("cerrar");
    let panelInfo = document.getElementById("panelInfo");
    let info = document.getElementById("info");
    let papelera = document.getElementById("papelera");

    /* Nivel en el que está escrito ahora mismo el contenido del textarea. */
    let nivelActual = g3.checked ? 3 : (g2.checked ? 2 : 1);

    /* ¿Se puede reescribir el programa del nivel de partida al de destino?

       - Bajar siempre: 3GL -> 2GL -> 1GL es traducción exacta.
       - Subir, solo de 1GL a 2GL: es un diccionario, cada grupo de tres bits
         tiene una y solo una palabra equivalente.
       - Hacia el 3GL no se sube nunca, ni desde el 1GL ni desde el 2GL: lo
         que caracteriza a un lenguaje de alto nivel son sus estructuras
         (REPETIR, CUADRADO) y ésas no están en el programa traducido. Lo que
         saldría sería una lista literal de instrucciones, no un programa de
         alto nivel, así que se vacía el editor. */
    function seTraduce(desde, hasta) {
        if (hasta < desde) return true;           // bajar de nivel
        return desde === 1 && hasta === 2;        // única subida admitida
    }

    /* Al cambiar de pestaña, el programa se reescribe en el nuevo nivel. */
    function cambiaNivel(nuevoNivel) {
        if (nuevoNivel === nivelActual) return;

        if (!seTraduce(nivelActual, nuevoNivel)) {
            instruc.value = "";
            nivelActual = nuevoNivel;
            return;
        }

        const original = instruc.value;
        if (original.trim() !== "") {
            const convertido = traduce(original, nivelActual, nuevoNivel);
            /* Si la conversión no da nada, se deja lo que había escrito el
               usuario en lugar de borrárselo. */
            if (convertido.trim() !== "") {
                instruc.value = convertido;
            }
        }
        nivelActual = nuevoNivel;
    }

    g1.addEventListener("change", () => cambiaNivel(1));
    g2.addEventListener("change", () => cambiaNivel(2));
    g3.addEventListener("change", () => cambiaNivel(3));

    cerrar.addEventListener("click", (e) => {
        panelInfo.style.display = "none";
    })

    info.addEventListener("click", (e) => {
        panelInfo.style.display = "block";
    })

    ejecutar.addEventListener("click", (e) => {
        resultadoBinario.textContent = "";
        if (g1.checked) {
            procesa1GL(instruc.value);
        } else if (g2.checked) {
            procesa2GL(instruc.value);
        } else if (g3.checked) {
            procesa3GL(instruc.value);
        }
    });

    papelera.addEventListener("click", (e) => {
        instruc.value = "";
    });
});
