// Abre/cierra la barra de búsqueda y recuerda el estado entre páginas
function toggleBusqueda(){
    const input = document.querySelector('.input-buscar');
    input.classList.toggle('activo');
    const activa = input.classList.contains('activo');

    sessionStorage.setItem('busquedaActiva', activa ? 'true' : 'false');

    if(activa){
        input.focus();
        mostrarSugerenciasEscritorio(input.value.trim());
    } else {
        input.value = '';
        sessionStorage.removeItem('busquedaTexto');
        cerrarSugerenciasEscritorio();
    }
}

// Se ejecuta al hacer clic en el ícono de la lupa
function manejarClicBuscar(){
    if (window.matchMedia && window.matchMedia('(max-width: 1000px)').matches) {
        abrirBuscadorResponsive();
        return;
    }

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

// Busca la ruta real a pagina1.html usando el enlace "Hoteles" del menú,
// así funciona sin importar en qué carpeta esté cada página
function obtenerUrlHoteles(){
    const enlaces = document.querySelectorAll('.nav-link a');
    for(const enlace of enlaces){
        if(enlace.textContent.trim().toLowerCase() === 'hoteles'){
            return enlace.getAttribute('href');
        }
    }
    return 'pagina1.html'; // valor de respaldo si no se encuentra el enlace
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
// o redirige a pagina1.html
async function ejecutarBusqueda(){
    const input = document.querySelector('.input-buscar');
    const texto = input.value.trim();
    if(!texto) return;
    cerrarSugerenciasEscritorio();

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

    // 4. Como último recurso (si esta página no tiene hoteles), ve a pagina1.html
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
        // Si la tarjeta está envuelta por su enlace, se oculta el enlace completo
        const base = hotel.parentElement && hotel.parentElement.matches('a.hotel-enlace') ? hotel.parentElement : hotel;
        const grupo = [base];
        let siguiente = base.nextElementSibling;
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

    // Filtra en tiempo real mientras se escribe, guarda el texto
    // y muestra las coincidencias debajo de la barra (estilo Tripadvisor)
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('input', () => {
        sessionStorage.setItem('busquedaTexto', input.value);
        if(document.querySelectorAll('.hotel').length > 0){
            filtrarHoteles(input.value.trim());
        }
        mostrarSugerenciasEscritorio(input.value.trim());
    });

    input.addEventListener('focus', () => {
        if(input.classList.contains('activo')) mostrarSugerenciasEscritorio(input.value.trim());
    });

    // Enter busca (o abre la coincidencia marcada), flechas recorren la lista
    input.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
            e.preventDefault();
            moverSeleccionSugerencia(e.key === 'ArrowDown' ? 1 : -1);
            return;
        }
        if(e.key === 'Escape'){
            cerrarSugerenciasEscritorio();
            return;
        }
        if(e.key === 'Enter'){
            const marcada = document.querySelector('.sugerencias-busqueda-resultado.seleccionada');
            if(marcada){
                window.location.href = marcada.href;
                return;
            }
            cerrarSugerenciasEscritorio();
            ejecutarBusqueda();
        }
    });

    // Cierra las sugerencias al hacer clic fuera del buscador
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.busqueda-container')) cerrarSugerenciasEscritorio();
    });

    if(window.matchMedia && window.matchMedia('(max-width: 1000px)').matches){
        prepararMenuHamburguesa(document.getElementById('menuDesplegable'));
    }
});

/* =========================================================
   MENU HAMBURGUESA RESPONSIVE
   ========================================================= */
function prepararMenuHamburguesa(menu){
    if(!menu || menu.dataset.preparado === 'true') return;

    const navLinks = Array.from(document.querySelectorAll('.nav-link a'));
    const enlacesPrincipales = navLinks.filter(a => {
        const texto = a.textContent.trim().toLowerCase();
        return ['inicio','hoteles','reseñas','destinos','contacto'].includes(texto);
    });

    menu.innerHTML = '';

    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'menu-cerrar';
    cerrar.setAttribute('aria-label', 'Cerrar menú');
    cerrar.textContent = '×';
    cerrar.addEventListener('click', cerrarMenuHamburguesa);
    menu.appendChild(cerrar);

    const navegacion = document.createElement('div');
    navegacion.className = 'menu-navegacion';

    enlacesPrincipales.forEach(enlace => {
        const a = document.createElement('a');
        a.href = enlace.getAttribute('href');
        a.textContent = enlace.textContent.trim();
        a.addEventListener('click', cerrarMenuHamburguesa);
        navegacion.appendChild(a);
    });

    menu.appendChild(navegacion);

    const separador = document.createElement('hr');
    separador.className = 'menu-separador';
    menu.appendChild(separador);

    const secundario = document.createElement('div');
    secundario.className = 'menu-secundario';

    const reservas = document.createElement('button');
    reservas.type = 'button';
    reservas.textContent = 'Mis reservas';
    reservas.addEventListener('click', () => {
        cerrarMenuHamburguesa();
        mostrarMisReservas();
    });

    const resenas = document.createElement('button');
    resenas.type = 'button';
    resenas.textContent = 'Mis reseñas';
    resenas.addEventListener('click', () => {
        cerrarMenuHamburguesa();
        mostrarMisResenas();
    });

    const sesion = document.createElement('button');
    sesion.type = 'button';
    sesion.textContent = 'Cerrar sesión';
    sesion.addEventListener('click', cerrarSesion);

    secundario.append(reservas, resenas, sesion);
    menu.appendChild(secundario);
    menu.dataset.preparado = 'true';
}

/* =========================================================
   CATÁLOGO DE BÚSQUEDA (compartido por escritorio y responsive)
   Junta páginas del menú, destinos y hoteles de todo el sitio.
   ========================================================= */
let catalogoBusqueda = null;
let promesaCatalogoBusqueda = null;

// Minúsculas y sin acentos: "Usulután" coincide con "usulutan"
function normalizarTexto(texto){
    return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function obtenerRutaLogoBusqueda(){
    const imagen = document.querySelector('.buscar-icono img');
    return imagen ? imagen.getAttribute('src') : '../IMG/PNG/Buscarlogo.png';
}

function convertirEnUrlAbsoluta(ruta, base = window.location.href){
    try { return new URL(ruta, base).href; } catch(e) { return ruta; }
}

function agregarResultadoAlCatalogo(catalogo, indice, item){
    if(!item || !item.nombre || !item.href) return;
    item.href = convertirEnUrlAbsoluta(item.href);

    // Un hotel puede aparecer en varias páginas: se guarda una sola vez
    // y se conserva la versión con más datos (imagen y ubicación)
    const clave = item.tipo === 'hotel' ? 'hotel|' + item.href : normalizarTexto(item.nombre) + '|' + item.href;
    const existente = indice.get(clave);
    if(existente){
        if(!existente.imagen && item.imagen) existente.imagen = item.imagen;
        if(existente.subtituloGenerico && !item.subtituloGenerico){
            existente.subtitulo = item.subtitulo;
            existente.nombre = item.nombre;
            existente.subtituloGenerico = false;
        }
        return;
    }
    indice.set(clave, item);
    catalogo.push(item);
}

function extraerDatosHotel(elemento, paginaBase = window.location.href){
    const titulo = elemento.querySelector('h2, h3, .titulo-hotel');
    // En algunas páginas el enlace está dentro de la tarjeta y en otras la envuelve
    const enlace = elemento.closest('a[href]') || elemento.querySelector('a.hotel-enlace, a[href]');
    if(!titulo || !enlace) return null;

    const img = elemento.querySelector('.hotel-imagen img, img');
    const ubicacion = elemento.querySelector('.hotel-ubicacion span, .hotel-ubicacion');
    const textoUbicacion = ubicacion ? ubicacion.textContent.replace(/\s+/g, ' ').trim() : '';

    return {
        nombre: titulo.textContent.replace(/\s+/g, ' ').trim(),
        href: convertirEnUrlAbsoluta(enlace.getAttribute('href'), paginaBase),
        imagen: img ? convertirEnUrlAbsoluta(img.getAttribute('src'), paginaBase) : '',
        subtitulo: textoUbicacion ? textoUbicacion + ', El Salvador' : 'El Salvador',
        subtituloGenerico: !textoUbicacion,
        tipo: 'hotel'
    };
}

function agregarHotelesDeDocumento(doc, paginaBase, catalogo, indice){
    doc.querySelectorAll('.hotel, .card-hotel').forEach(elemento => {
        agregarResultadoAlCatalogo(catalogo, indice, extraerDatosHotel(elemento, paginaBase));
    });
}

function cargarCatalogoBusqueda(){
    if(catalogoBusqueda) return Promise.resolve(catalogoBusqueda);
    if(promesaCatalogoBusqueda) return promesaCatalogoBusqueda;

    promesaCatalogoBusqueda = (async () => {
        const catalogo = [];
        const indice = new Map();

        // Páginas del menú principal
        document.querySelectorAll('.nav-link a').forEach(a => {
            agregarResultadoAlCatalogo(catalogo, indice, {
                nombre: a.textContent.trim(),
                href: a.getAttribute('href'),
                tipo: 'pagina',
                imagen: '',
                subtitulo: 'Página de HotelScope'
            });
        });

        // Destinos populares del footer
        obtenerEnlacesDestinosPopulares().forEach(a => {
            const nombre = a.textContent.trim();
            agregarResultadoAlCatalogo(catalogo, indice, {
                nombre: 'Hoteles en ' + nombre,
                href: a.getAttribute('href'),
                tipo: 'destino',
                imagen: '',
                subtitulo: 'Departamento de ' + nombre + ', El Salvador'
            });
        });

        // Hoteles de esta página y de las páginas de destinos
        agregarHotelesDeDocumento(document, window.location.href, catalogo, indice);

        const paginas = new Set(obtenerPaginasDeHoteles().map(p => convertirEnUrlAbsoluta(p)));
        await Promise.all(Array.from(paginas).map(async pagina => {
            try{
                const respuesta = await fetch(pagina);
                if(!respuesta.ok) return;
                const html = await respuesta.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                agregarHotelesDeDocumento(doc, pagina, catalogo, indice);
            }catch(error){
                console.warn('No se pudo cargar una página para el buscador:', pagina);
            }
        }));

        catalogoBusqueda = catalogo;
        return catalogo;
    })();

    return promesaCatalogoBusqueda;
}

// Devuelve las coincidencias ordenadas: primero las que empiezan
// con el texto, luego las que lo contienen
function buscarCoincidencias(texto, limite = 8){
    const buscar = normalizarTexto(texto);
    if(!buscar || !catalogoBusqueda) return [];

    const ordenTipo = { destino: 0, pagina: 1, hotel: 2 };
    return catalogoBusqueda
        .map(item => {
            const nombre = normalizarTexto(item.nombre);
            const subtitulo = normalizarTexto(item.subtitulo);
            let puntaje = -1;
            if(nombre.startsWith(buscar)) puntaje = 0;
            else if(nombre.split(/\s+/).some(p => p.startsWith(buscar))) puntaje = 1;
            else if(nombre.includes(buscar)) puntaje = 2;
            else if(subtitulo.includes(buscar)) puntaje = 3;
            return { item, puntaje };
        })
        .filter(r => r.puntaje >= 0)
        .sort((a, b) => a.puntaje - b.puntaje || ordenTipo[a.item.tipo] - ordenTipo[b.item.tipo])
        .slice(0, limite)
        .map(r => r.item);
}

const ICONOS_BUSQUEDA = {
    hotel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v12M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11.5" r="1.8"/></svg>',
    destino: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v12M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11.5" r="1.8"/></svg>',
    pagina: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>'
};

// Crea una fila de resultado: imagen (hotel) o ícono en recuadro + título + subtítulo
function crearElementoResultado(item, prefijo){
    const a = document.createElement('a');
    a.className = prefijo + '-resultado';
    a.href = item.href;

    if(item.imagen){
        const img = document.createElement('img');
        img.className = prefijo + '-resultado-imagen';
        img.src = item.imagen;
        img.alt = '';
        img.loading = 'lazy';
        a.appendChild(img);
    } else {
        const icono = document.createElement('span');
        icono.className = prefijo + '-resultado-icono';
        icono.innerHTML = ICONOS_BUSQUEDA[item.tipo] || ICONOS_BUSQUEDA.pagina;
        a.appendChild(icono);
    }

    const texto = document.createElement('span');
    texto.className = prefijo + '-resultado-texto';

    const titulo = document.createElement('span');
    titulo.className = prefijo + '-resultado-titulo';
    titulo.textContent = item.nombre;

    const subtitulo = document.createElement('span');
    subtitulo.className = prefijo + '-resultado-subtitulo';
    subtitulo.textContent = item.subtitulo || 'El Salvador';

    texto.append(titulo, subtitulo);
    a.appendChild(texto);
    return a;
}

/* =========================================================
   SUGERENCIAS DEBAJO DE LA BARRA (ordenadores y laptops)
   ========================================================= */
function obtenerPanelSugerencias(){
    let panel = document.getElementById('sugerenciasBusqueda');
    if(panel) return panel;

    const contenedor = document.querySelector('.busqueda-container');
    if(!contenedor) return null;

    panel = document.createElement('div');
    panel.id = 'sugerenciasBusqueda';
    panel.className = 'sugerencias-busqueda';
    panel.setAttribute('role', 'listbox');
    contenedor.appendChild(panel);
    return panel;
}

function esVistaResponsive(){
    return window.matchMedia && window.matchMedia('(max-width: 1000px)').matches;
}

function mostrarSugerenciasEscritorio(texto){
    if(esVistaResponsive()) return;

    const input = document.querySelector('.input-buscar');
    const panel = obtenerPanelSugerencias();
    if(!panel || !input) return;

    if(!texto || !input.classList.contains('activo')){
        cerrarSugerenciasEscritorio();
        return;
    }

    if(!catalogoBusqueda){
        panel.innerHTML = '<div class="sugerencias-busqueda-vacio">Buscando...</div>';
        panel.classList.add('mostrar');
        cargarCatalogoBusqueda().then(() => {
            // Solo se actualiza si el usuario no cambió el texto mientras cargaba
            if(input.value.trim() === texto) mostrarSugerenciasEscritorio(texto);
        });
        return;
    }

    const coincidencias = buscarCoincidencias(texto);
    panel.innerHTML = '';

    if(!coincidencias.length){
        panel.innerHTML = '<div class="sugerencias-busqueda-vacio">No se encontraron coincidencias</div>';
    } else {
        coincidencias.forEach(item => panel.appendChild(crearElementoResultado(item, 'sugerencias-busqueda')));
    }
    panel.classList.add('mostrar');
}

function cerrarSugerenciasEscritorio(){
    const panel = document.getElementById('sugerenciasBusqueda');
    if(panel) panel.classList.remove('mostrar');
}

function moverSeleccionSugerencia(direccion){
    const panel = document.getElementById('sugerenciasBusqueda');
    if(!panel || !panel.classList.contains('mostrar')) return;

    const items = Array.from(panel.querySelectorAll('.sugerencias-busqueda-resultado'));
    if(!items.length) return;

    let actual = items.findIndex(el => el.classList.contains('seleccionada'));
    if(actual >= 0) items[actual].classList.remove('seleccionada');
    actual = (actual + direccion + items.length) % items.length;
    items[actual].classList.add('seleccionada');
    items[actual].scrollIntoView({ block: 'nearest' });
}

/* =========================================================
   BUSCADOR RESPONSIVE DE PANTALLA COMPLETA (tablets y teléfonos)
   ========================================================= */
function abrirBuscadorResponsive(){
    let overlay = document.getElementById('busquedaResponsiveOverlay');
    if(!overlay) overlay = crearBuscadorResponsive();

    const menu = document.getElementById('menuDesplegable');
    if(menu && menu.classList.contains('mostrar')) cerrarMenuHamburguesa();

    overlay.classList.add('mostrar');
    document.body.classList.add('busqueda-responsive-abierta');

    const input = overlay.querySelector('.busqueda-responsive-input');
    input.value = '';
    actualizarBotonLimpiarResponsive();
    setTimeout(() => input.focus(), 120);

    mostrarResultadosResponsive('');
    cargarCatalogoBusqueda().then(() => {
        if(input.value.trim()) mostrarResultadosResponsive(input.value.trim());
    });
}

function cerrarBuscadorResponsive(){
    const overlay = document.getElementById('busquedaResponsiveOverlay');
    if(overlay) overlay.classList.remove('mostrar');
    document.body.classList.remove('busqueda-responsive-abierta');
}

function crearBuscadorResponsive(){
    const overlay = document.createElement('div');
    overlay.id = 'busquedaResponsiveOverlay';
    overlay.className = 'busqueda-responsive-overlay';

    overlay.innerHTML = `
        <div class="busqueda-responsive-barra-superior">
            <button type="button" class="busqueda-responsive-volver" aria-label="Volver">←</button>
        </div>
        <form class="busqueda-responsive-input-wrap" role="search">
            <button type="submit" class="busqueda-responsive-ejecutar" aria-label="Buscar">
                <img src="${obtenerRutaLogoBusqueda()}" alt="Buscar">
            </button>
            <input type="text" class="busqueda-responsive-input" autocomplete="off" enterkeyhint="search" placeholder="Buscar hoteles..." aria-label="Buscar hoteles">
            <button type="button" class="busqueda-responsive-limpiar" aria-label="Borrar texto" hidden>×</button>
        </form>
        <div class="busqueda-responsive-resultados" aria-live="polite"></div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('.busqueda-responsive-input');
    const limpiar = overlay.querySelector('.busqueda-responsive-limpiar');

    overlay.querySelector('.busqueda-responsive-volver').addEventListener('click', cerrarBuscadorResponsive);

    // La equis solo aparece cuando hay texto escrito
    limpiar.addEventListener('click', () => {
        input.value = '';
        actualizarBotonLimpiarResponsive();
        mostrarResultadosResponsive('');
        input.focus();
    });

    input.addEventListener('input', () => {
        actualizarBotonLimpiarResponsive();
        mostrarResultadosResponsive(input.value.trim());
    });

    input.addEventListener('keydown', e => {
        if(e.key === 'Escape') cerrarBuscadorResponsive();
    });

    // Clic en la lupa o Enter: busca de verdad
    overlay.querySelector('.busqueda-responsive-input-wrap').addEventListener('submit', e => {
        e.preventDefault();
        ejecutarBusquedaResponsive();
    });

    return overlay;
}

function actualizarBotonLimpiarResponsive(){
    const input = document.querySelector('.busqueda-responsive-input');
    const limpiar = document.querySelector('.busqueda-responsive-limpiar');
    if(input && limpiar) limpiar.hidden = input.value.length === 0;
}

// Abre la mejor coincidencia; si no hay, muestra el aviso.
// Si el texto está vacío, solo enfoca el campo.
async function ejecutarBusquedaResponsive(){
    const input = document.querySelector('.busqueda-responsive-input');
    const texto = input ? input.value.trim() : '';
    if(!texto){
        if(input) input.focus();
        return;
    }

    await cargarCatalogoBusqueda();
    const coincidencias = buscarCoincidencias(texto, 30);

    if(coincidencias.length){
        window.location.href = coincidencias[0].href;
        return;
    }
    mostrarResultadosResponsive(texto);
}

function mostrarResultadosResponsive(texto){
    const contenedor = document.querySelector('.busqueda-responsive-resultados');
    if(!contenedor) return;

    contenedor.innerHTML = '';
    if(!texto) return;

    if(!catalogoBusqueda){
        contenedor.innerHTML = '<div class="busqueda-responsive-vacio">Buscando...</div>';
        return;
    }

    const coincidencias = buscarCoincidencias(texto, 30);

    if(!coincidencias.length){
        const vacio = document.createElement('div');
        vacio.className = 'busqueda-responsive-vacio';
        vacio.textContent = 'No se encontraron resultados';
        contenedor.appendChild(vacio);
        return;
    }

    coincidencias.forEach(item => {
        contenedor.appendChild(crearElementoResultado(item, 'busqueda-responsive'));
    });
}

