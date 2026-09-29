const sesion_iniciada = localStorage.getItem("sesion_iniciada");

let ruta_login;

if (window.location.pathname.includes("/HTML/")) {

    const ruta_proyecto = window.location.pathname.split("/HTML/")[0];

    ruta_login = ruta_proyecto + "/HTML/login.html";

} else {

    const ruta_proyecto = window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf("/")
    );

    ruta_login = ruta_proyecto + "/HTML/login.html";

}


if (sesion_iniciada === "true") {

} else {

    localStorage.clear();

    window.location.replace(ruta_login);

}


function mostrarMenu() {

    const menu_desplegable = document.getElementById("menuDesplegable");

    if (menu_desplegable) {

        menu_desplegable.classList.toggle("mostrar");

    }

}


function cerrarSesion() {

    localStorage.clear();

    window.location.replace(ruta_login);

}