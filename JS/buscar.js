// Abre/cierra la barra de búsqueda y recuerda el estado entre páginas
function toggleBusqueda(){
    const input = document.querySelector('.input-buscar');
    input.classList.toggle('activo');
    const activa = input.classList.contains('activo');

    sessionStorage.setItem('busquedaActiva', activa ? 'true' : 'false');

    if(activa){
        input.focus();
    } else {
        input.value = '';
        sessionStorage.removeItem('busquedaTexto');
    }
}

// Se ejecuta al hacer clic en el ícono de la lupa
function manejarClicBuscar(){
    const input = document.querySelector('.input-buscar');

    // Si la barra está cerrada, solo la abre
    if(!input.classList.contains('activo')){
        toggleBusqueda();
        return;
    }

    // Si está abierta pero vacía, el clic la cierra (guarda el estado cerrado)
    if(input.value.trim() === ''){
        toggleBusqueda();
        return;
    }

    // Si ya está abierta y tiene texto, ejecuta la búsqueda
    ejecutarBusqueda();
}

// Busca la ruta real a página1.html usando el enlace "Hoteles" del menú,
// así funciona sin importar en qué carpeta esté cada página
function obtenerUrlHoteles(){
    const enlaces = document.querySelectorAll('.nav-link a');
    for(const enlace of enlaces){
        if(enlace.textContent.trim().toLowerCase() === 'hoteles'){
            return enlace.getAttribute('href');
        }
    }
    return 'página1.html'; // valor de respaldo si no se encuentra el enlace
}

// Devuelve los enlaces del bloque "Destinos Populares" del footer
// (Sonsonate, La Libertad, Usulután, Santa Ana)
function obtenerEnlacesDestinosPopulares(){
    const navs = document.querySelectorAll('nav.footer-col');
    for(const nav of navs){
        const titulo = nav.querySelector('h3');
        if(titulo && titulo.textContent.trim().toLowerCase() === 'destinos populares'){
            return Array.from(nav.querySelectorAll('a'));
        }
    }
    return [];
}

// Junta las páginas donde puede haber hoteles: la de "Hoteles" del menú
// más todos los destinos del footer (Sonsonate, Santa Ana, etc.)
function obtenerPaginasDeHoteles(){
    const urls = new Set();
    urls.add(obtenerUrlHoteles());
    obtenerEnlacesDestinosPopulares().forEach(enlace => {
        urls.add(enlace.getAttribute('href'));
    });
    return Array.from(urls);
}

// Si el texto coincide con una página del menú (Inicio, Hoteles, Reseñas,
// Destinos, Contacto) o con un destino del footer (Santa Ana, Usulután...),
// devuelve su URL para ir directo con un clic
function buscarPaginaDelMenu(texto){
    const busqueda = texto.trim().toLowerCase();
    if(!busqueda) return null;

    const enlaces = [
        ...document.querySelectorAll('.nav-link a'),
        ...obtenerEnlacesDestinosPopulares()
    ];

    for(const enlace of enlaces){
        const nombre = enlace.textContent.trim().toLowerCase();
        if(nombre === busqueda || nombre.startsWith(busqueda)){
            return enlace.getAttribute('href');
        }
    }
    return null;
}

// Revisa (sin salir de la página) el HTML de otras páginas de destinos
// para encontrar en cuál está el hotel buscado
async function buscarHotelEnOtrasPaginas(texto){
    const busqueda = texto.trim().toLowerCase();
    const paginas = obtenerPaginasDeHoteles();

    for(const pagina of paginas){
        try{
            const respuesta = await fetch(pagina);
            if(!respuesta.ok) continue;

            const html = await respuesta.text();
            const documento = new DOMParser().parseFromString(html, 'text/html');
            const titulos = documento.querySelectorAll('.hotel h2');

            for(const titulo of titulos){
                if(titulo.textContent.trim().toLowerCase().includes(busqueda)){
                    return pagina;
                }
            }
        } catch(error){
            console.error('No se pudo revisar la página', pagina, error);
        }
    }
    return null;
}

// Decide si filtra en la misma página, busca en otras páginas de destinos,
// o redirige a página1.html
async function ejecutarBusqueda(){
    const input = document.querySelector('.input-buscar');
    const texto = input.value.trim();
    if(!texto) return;

    // 1. ¿El texto es el nombre de una página del menú o un destino? -> ir directo
    const urlPagina = buscarPaginaDelMenu(texto);
    if(urlPagina){
        window.location.href = urlPagina;
        return;
    }

    // 2. Si hay hoteles en esta misma página, filtra aquí primero
    const hayHoteles = document.querySelectorAll('.hotel').length > 0;
    if(hayHoteles){
        const encontroAqui = filtrarHoteles(texto);
        if(encontroAqui) return;
    }

    // 3. Si no se encontró aquí, revisa las demás páginas de destinos
    const paginaEncontrada = await buscarHotelEnOtrasPaginas(texto);
    if(paginaEncontrada){
        window.location.href = paginaEncontrada + '?buscar=' + encodeURIComponent(texto);
        return;
    }

    // 4. Como último recurso (si esta página no tiene hoteles), ve a página1.html
    if(!hayHoteles){
        window.location.href = obtenerUrlHoteles() + '?buscar=' + encodeURIComponent(texto);
    }
}

// Filtra las secciones .hotel según el texto buscado
function filtrarHoteles(texto){
    const hoteles = document.querySelectorAll('.hotel');
    const busqueda = texto.toLowerCase();
    let encontrados = 0;

    hoteles.forEach(hotel => {
        const titulo = hotel.querySelector('h2');
        const nombre = titulo ? titulo.textContent.toLowerCase() : '';
        const coincide = nombre.includes(busqueda);

        if(coincide) encontrados++;

        // Arma el grupo del hotel: el propio .hotel + los <hr> y bloques
        // .reseñas que le sigan directamente. Se detiene en cualquier otra
        // cosa (botones, contenedores, etc.) para no ocultarlos por error.
        const grupo = [hotel];
        let siguiente = hotel.nextElementSibling;
        while(siguiente && (siguiente.tagName === 'HR' || siguiente.classList.contains('reseñas'))){
            grupo.push(siguiente);
            siguiente = siguiente.nextElementSibling;
        }

        grupo.forEach(el => {
            el.style.display = coincide ? '' : 'none';
        });
    });

    // Mensaje opcional de "sin resultados" (requiere un elemento con id="sin-resultados" en el HTML)
    const mensaje = document.getElementById('sin-resultados');
    if(mensaje){
        mensaje.style.display = encontrados === 0 ? 'block' : 'none';
    }

    return encontrados > 0;
}

// Al cargar cualquier página: conecta eventos y restaura el estado del buscador
document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.input-buscar');
    if(!input) return;

    const params = new URLSearchParams(window.location.search);
    const textoUrl = params.get('buscar');

    if(textoUrl){
        // Venimos de una redirección de búsqueda con ?buscar=texto
        input.value = textoUrl;
        input.classList.add('activo');
        sessionStorage.setItem('busquedaActiva', 'true');
        sessionStorage.setItem('busquedaTexto', textoUrl);
        if(document.querySelectorAll('.hotel').length > 0){
            filtrarHoteles(textoUrl);
        }
    } else if(sessionStorage.getItem('busquedaActiva') === 'true'){
        // El buscador estaba abierto en la página anterior: lo restauramos
        const textoGuardado = sessionStorage.getItem('busquedaTexto') || '';
        input.value = textoGuardado;
        input.classList.add('activo');
        if(document.querySelectorAll('.hotel').length > 0){
            filtrarHoteles(textoGuardado);
        }
    }

    // Filtra en tiempo real mientras se escribe y guarda el texto
    input.addEventListener('input', () => {
        sessionStorage.setItem('busquedaTexto', input.value);
        if(document.querySelectorAll('.hotel').length > 0){
            filtrarHoteles(input.value.trim());
        }
    });

    // Permite buscar con la tecla Enter
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            ejecutarBusqueda();
        }
    });
});