const MAX_FILA = 9;
const MAX_COL = 9;
let fila = 0;
let col = 0;

function procesa3GL(instrucciones) {
    //separar instrucciones por punto y coma
    instrucciones = instrucciones.toUpperCase();
    let instruccionesArray = instrucciones.split(';');
    for (let instruccion of instruccionesArray) {
        procesaSimpleGL(instruccion);
    }
}

function procesaSimpleGL(instruccion) {
    instruccion = instruccion.trim();
    let palabras = instruccion.split(" ");
    if (palabras.length == 1) {
        if (palabras[0].toUpperCase() == "BORRAR")
            procesa2GL("BOR");
        else if (palabras[0].toUpperCase() == "PINTAR")
            procesa2GL("PIN");
        else if (palabras[0].toUpperCase() == "BORRARTODO")
            procesa2GL("BOT");
        else if (palabras[0].toUpperCase() == "PINTARTODO")
            procesa2GL("PIT");
    } else if (palabras.length == 2) {
        direccion = palabras[1].trim();
        if (palabras[0].toUpperCase() == "MOVER") {
            if (direccion == "ARRIBA")
                procesa2GL("SUB");
            else if (direccion == "ABAJO")
                procesa2GL("BAJ");
            else if (direccion == "IZQUIERDA")
                procesa2GL("IZQ");
            else if (direccion == "DERECHA")
                procesa2GL("DER");
        }
        else if(palabras[0] == "PINTAR"){
            if (direccion == "ARRIBA")
                procesa2GL("SUB PIN");
            else if (direccion == "ABAJO")
                procesa2GL("BAJ PIN");
            else if (direccion == "IZQUIERDA")
                procesa2GL("IZQ PIN");
            else if (direccion == "DERECHA")
                procesa2GL("DER PIN");
        }
        else if(palabras[0] == "BORRAR"){
            if (direccion == "ARRIBA")
                procesa2GL("SUB BOR");
            else if (direccion == "ABAJO")
                procesa2GL("BAJ BOR");
            else if (direccion == "IZQUIERDA")
                procesa2GL("IZQ BOR");
            else if (direccion == "DERECHA")
                procesa2GL("DER BOR");
        }
        //Es la instrucción más compleja
        else if(palabras[0] == "CUADRADO" && !isNaN(palabras[1])){
            let veces = parseInt(palabras[1]);
            for (let i = 0; i < veces; i++) {
                for(let j=0;j<veces;j++){
                    procesa2GL("PIN");
                    if(j<veces-1) procesa2GL("DER");
                }
                procesa3GL("REPETIR MOVER IZQUIERDA " + (veces-1));
                procesa2GL("BAJ");

            }
            procesa2GL("SUB");
            procesa3GL("REPETIR MOVER DERECHA "+(veces-1));
        }
    } else if (palabras.length == 4) {
        if (palabras[0].toUpperCase() == "REPETIR" && !isNaN(palabras[3])) {
            let veces = parseInt(palabras[3]);
            for (let i = 1; i <= veces; i++) {
                procesaSimpleGL(palabras[1] + " " + palabras[2]);
            }
        }
    }
}

function procesa2GL(instrucciones) {
    let instNorm = instrucciones.replace(/\s+/g, '');
    let instr = "";
    let instrBin = "";

    for (let inicio = 0; inicio < instNorm.length; inicio += 3) {
        capa = document.getElementById("c" + fila + col);
        instr = instNorm.substr(inicio, 3).toUpperCase();


        if (instr == "BOR") {//borrar
            instrBin += "101"
        } else if (instr == "PIN") {//pintar
            instrBin += "110";
        } else if (instr == "SUB") { //subir
            instrBin += "001";
        } else if (instr == "BAJ") {//bajar
            instrBin += "010"
        } else if (instr == "IZQ") {//izda
            instrBin += "011"
        } else if (instr == "DER") {//dcha
            instrBin += "100"
        } else if (instr == "PIT") {
            instrBin += "111";
        } else if (instr == "BOT") {
            instrBin += "000";
        }
    }//for

    procesa1GL(instrBin);
}

function procesa1GL(instrucciones) {
    //borrado espacios en blanco
    let instNorm = instrucciones.replace(/\s+/g, '');
    let instr = "";
    let capa = document.getElementById("c" + fila + col);
    //quitar borde rojo a la capa anterior
    capa.classList.remove("actual");
    for (let inicio = 0; inicio < instNorm.length; inicio += 3) {
        let instr = instNorm.substr(inicio, 3);
        let error = false;
        capa = document.getElementById("c" + fila + col);

        if (instr == "101") {//borrar
            capa.style.backgroundColor = "transparent";
        } else if (instr == "110") {//pintar
            capa.style.backgroundColor = "black";
        } else if (instr == "001") { //subir
            fila = (fila > 0 ? fila - 1 : fila);
        } else if (instr == "010") {//bajar
            fila = (fila < MAX_FILA ? fila + 1 : fila);
        } else if (instr == "011") {//izda
            col = (col > 0 ? col - 1 : col);
        } else if (instr == "100") {//dcha
            col = (col < MAX_COL ? col + 1 : col);
        } else if (instr == "000") {
            //borrar toda
            for (let i = 0; i <= MAX_FILA; i++) {
                for (let j = 0; j <= MAX_COL; j++) {
                    document.getElementById("c" + i + j).style.backgroundColor = "transparent";
                }
            }
            fila = 0;
            col = 0;
        } else if (instr == "111") {
            //pintar toda
            for (let i = 0; i <= MAX_FILA; i++) {
                for (let j = 0; j <= MAX_COL; j++) {
                    document.getElementById("c" + i + j).style.backgroundColor = "black";
                }
            }
            fila = 0;
            col = 0;
        }
        else{
            error = true;
        }
        if(!error){
            resultadoBinario.innerHTML += instr + "<br>";
        }
    }

    capa = document.getElementById("c" + fila + col);
    //poner borde rojo a la capa actual
    capa.classList.add("actual");
}

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



