const sesion_iniciada = localStorage.getItem("sesion_iniciada"); 
 
let ruta_login; 
 
const CLAVE_PAGINA_REGRESO = "hotelscope_pagina_regreso"; 
 
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
 
function guardarPaginaRegreso(){ 
 
    localStorage.setItem( 
        CLAVE_PAGINA_REGRESO, 
        window.location.href 
    ); 
 
} 
 
function obtenerPaginaRegreso(){ 
 
    const pagina_regreso = 
        localStorage.getItem(CLAVE_PAGINA_REGRESO); 
 
    if(!pagina_regreso){ 
 
        return null; 
 
    } 
 
    localStorage.removeItem(CLAVE_PAGINA_REGRESO); 
 
    return pagina_regreso; 
 
} 
 
function mostrarMenu() { 
 
    const menu_desplegable = document.getElementById("menuDesplegable"); 
 
    if (!menu_desplegable) return; 
 
    if (window.matchMedia && window.matchMedia('(max-width: 1000px)').matches && typeof prepararMenuHamburguesa === "function") { 
        prepararMenuHamburguesa(menu_desplegable); 
    } 
 
    menu_desplegable.classList.toggle("mostrar"); 
    document.body.classList.toggle("menu-abierto-responsive", menu_desplegable.classList.contains("mostrar")); 
 
} 
 
function cerrarMenuHamburguesa() { 
    const menu = document.getElementById("menuDesplegable"); 
    if (menu) menu.classList.remove("mostrar"); 
    document.body.classList.remove("menu-abierto-responsive"); 
} 
 
 
function cerrarSesion() { 
 
    localStorage.removeItem("sesion_iniciada"); 
    localStorage.removeItem("inicio_sesion"); 
 
    window.location.replace(ruta_login.replace("/HTML/login.html", "/index.html")); 
 
} 