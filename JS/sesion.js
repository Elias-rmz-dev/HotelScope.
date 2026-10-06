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
 
    localStorage.clear(); 
 
    window.location.replace(ruta_login.replace("/HTML/login.html", "/index.html")); 
 
} 