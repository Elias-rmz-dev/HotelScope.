const formulario = document.getElementById("formulario-contacto");
const mensaje_exito = document.getElementById("mensaje-exito");

formulario.addEventListener("submit", function(evento){

    evento.preventDefault();

    mensaje_exito.classList.add("mostrar");

    formulario.reset();

    setTimeout(function(){
        mensaje_exito.classList.remove("mostrar");
    }, 4000);

});