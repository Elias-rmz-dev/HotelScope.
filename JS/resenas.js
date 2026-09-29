/* =========================================================
   HotelScope - Reseñas de usuarios: ordenar, dejar reseña, "Mis reseñas"
   Reutiliza cerrarMenusDesplegables() de reservas.js, así que esta página
   debe cargar reservas.js ANTES que resenas.js.
   ========================================================= */
 
const CLAVE_STORAGE_RESENAS = "hotelscope_resenas_usuario";
 
function obtenerResenasUsuario(){
    try{
        return JSON.parse(localStorage.getItem(CLAVE_STORAGE_RESENAS)) || [];
    }catch(error){
        return [];
    }
}
 
function guardarResenasUsuario(lista){
    localStorage.setItem(CLAVE_STORAGE_RESENAS, JSON.stringify(lista));
}
 
function contarEstrellas(textoEstrellas){
    return (textoEstrellas.match(/★/g) || []).length;
}
 
/* ---------- Ordenar reseñas existentes de la página ---------- */
function inicializarOrdenResenas(){
    const selector = document.querySelector('.titulo-resenas select');
    const contenedor = document.querySelector('.contenedor-hoteles');
    if(!selector || !contenedor) return;
 
    selector.addEventListener('change', () => {
        const tarjetas = Array.from(contenedor.querySelectorAll('.card-reseñas'));
 
        tarjetas.sort((a, b) => {
            const estrellasA = contarEstrellas(a.querySelector('.estrellas').textContent);
            const estrellasB = contarEstrellas(b.querySelector('.estrellas').textContent);
            // value="1" -> Mejor valorados primero, value="2" -> Peor valorados primero
            return selector.value === '1' ? estrellasB - estrellasA : estrellasA - estrellasB;
        });
 
        tarjetas.forEach(tarjeta => contenedor.appendChild(tarjeta));
    });
}
 
/* ---------- Formulario para dejar una reseña nueva ---------- */
function inicializarFormularioResena(hotelId, nombreHotel){
    const formulario = document.getElementById('form-resena');
    if(!formulario) return;
 
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
 
        const nombre = document.getElementById('resena-nombre').value.trim();
        const estrellas = Number(document.getElementById('resena-estrellas').value);
        const comentario = document.getElementById('resena-comentario').value.trim();
 
        if(!nombre || !comentario) return;
 
        const nuevaResena = {
            id: Date.now(),
            hotelId: hotelId,
            hotel: nombreHotel,
            nombre: nombre,
            estrellas: estrellas,
            comentario: comentario,
            fecha: new Date().toISOString()
        };
 
        // La guarda para que aparezca luego en "Mis reseñas"
        const resenas = obtenerResenasUsuario();
        resenas.push(nuevaResena);
        guardarResenasUsuario(resenas);
 
        // La agrega de inmediato a la lista visible en esta página
        agregarTarjetaResena(nuevaResena);
 
        formulario.reset();
    });
}
 
function agregarTarjetaResena(resena){
    const contenedor = document.querySelector('.contenedor-hoteles');
    if(!contenedor) return;
 
    const inicial = resena.nombre.trim().charAt(0).toUpperCase();
    const estrellasTexto = '★'.repeat(resena.estrellas) + '☆'.repeat(5 - resena.estrellas);
 
    const tarjeta = document.createElement('div');
    tarjeta.className = 'card-reseñas';
    tarjeta.innerHTML = `
        <div class="encabezado-resena">
            <div class="avatar">${inicial}</div>
            <div class="datos-resena">
                <h3>${resena.nombre}</h3>
                <span>Reseña propia</span>
            </div>
            <div class="estrellas">${estrellasTexto}</div>
        </div>
        <p class="parrafo-opinion">${resena.comentario}</p>
    `;
 
    contenedor.prepend(tarjeta);
}
 
/* ---------- "Mis reseñas" desde el menú de tres puntos ---------- */
function mostrarMisResenas(){
    cerrarMenusDesplegables();
 
    const overlayExistente = document.getElementById('overlay-mis-resenas');
    if(overlayExistente) overlayExistente.remove();
 
    const resenas = obtenerResenasUsuario();
 
    const overlay = document.createElement('div');
    overlay.id = 'overlay-mis-resenas';
    overlay.className = 'overlay-reservas';
 
    let contenido = '';
 
    if(resenas.length === 0){
        contenido = '<p class="sin-reservas">Todavía no has dejado ninguna reseña.</p>';
    } else {
        contenido = resenas.map((resena, indice) => {
            const estrellasTexto = '★'.repeat(resena.estrellas) + '☆'.repeat(5 - resena.estrellas);
            return `
                <div class="card-mi-reserva">
                    <div class="datos-mi-reserva">
                        <h3>${resena.hotel}</h3>
                        <p>${estrellasTexto}</p>
                        <p>"${resena.comentario}"</p>
                    </div>
                    <button class="btn-cancelar-reserva" onclick="eliminarResenaUsuario(${indice})">Eliminar</button>
                </div>
            `;
        }).join('');
    }
 
    overlay.innerHTML = `
        <div class="modal-reservas">
            <div class="encabezado-modal-reservas">
                <h2>Mis reseñas</h2>
                <button class="cerrar-modal-reservas" onclick="document.getElementById('overlay-mis-resenas').remove()">&times;</button>
            </div>
            <div class="cuerpo-modal-reservas">${contenido}</div>
        </div>
    `;
 
    document.body.appendChild(overlay);
 
    overlay.addEventListener('click', (evento) => {
        if(evento.target === overlay) overlay.remove();
    });
}
 
function eliminarResenaUsuario(indice){
    if(!confirm('¿Eliminar esta reseña?')) return;
    const resenas = obtenerResenasUsuario();
    resenas.splice(indice, 1);
    guardarResenasUsuario(resenas);
    mostrarMisResenas();
}
 
document.addEventListener('DOMContentLoaded', () => {
    inicializarOrdenResenas();
});
 