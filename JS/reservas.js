/* =========================================================
   HotelScope - Sistema de reservas simulado (Ver reseñas + Mis reservas)
   Este archivo es nuevo: no modifica sesion.js ni buscar.js.
   ========================================================= */

/* ---------- Datos de los hoteles precios reales de referencia ---------- */
const HOTELES_DATA = {

    decameron: {

        nombre: "Royal Decameron",
        ubicacion: "Playa El Toro, Usulután",
        precioNoche: 145,
        imagen: "IMG/JPG/Decameron.jpeg"

    },

    ancla: {

    nombre: "El Ancla Hostal de playa",
    ubicacion: "Metalio, Acajutla",
    precioNoche: 65,
    imagen: "IMG/JPG/El Ancla.jpeg"

    },

    paraiso: {

        nombre: "Hotel Paraíso",
        ubicacion: "Sonsonate",
        precioNoche: 90,
        imagen: "IMG/JPG/Hotel Paraiso.jpeg"

    },

    sol_a_sol: {

        nombre: "Hotel Sol a Sol",
        ubicacion: "Playa El Toro, Usulután",
        precioNoche: 139,
        imagen: "IMG/JPG/sol a sol.avif"

    },

    sevilla: {

        nombre: "Hotel Sevilla",
        ubicacion: "Hotel Sevilla, Usulután, El Salvador",
        precioNoche: 80,
        imagen: "IMG/JPG/Sevilla.jpeg"

    },

    tekapa: {

        nombre: "Hotel Tekapa",
        ubicacion: "Alegría, Usulután",
        precioNoche: 60,
        imagen: "IMG/JPG/tekapa.jpg"

    },

    puerto_barillas: {

        nombre: "Hotel Puerto Barillas",
        ubicacion: "Puerto Barillas, Usulután",
        precioNoche: 84,
        imagen: "IMG/JPG/puerto barillas.jpg"

    },

    las_palmeras: {

        nombre: "Hotel Las Palmeras",
        ubicacion: "Carretera El Litoral, La Libertad",
        precioNoche: 64,
        imagen: "IMG/JPG/Hotel las palmeras.jpeg"

    },

    hotel_1800_cerro_verde: {

        nombre: "Hotel 1800 Cerro Verde",
        ubicacion: "Calle al Cerro Verde, Santa Ana",
        precioNoche: 145,
        imagen: "IMG/PNG/Hotel 1800.jpeg"

    },

    remfort: {

        nombre: "Remfort Hotel",
        ubicacion: "Avenida Independencia Sur y 11a Calle Poniente, Santa Ana",
        precioNoche: 80,
        imagen: "IMG/PNG/Hotel Remfort.jpeg"

    },

    equinoccio: {

        nombre: "Equinoccio Hotel",
        ubicacion: "Calle Circunvalación al Lago de Coatepeque, Santa Ana",
        precioNoche: 150,
        imagen: "IMG/PNG/Equinocci%20hotel.jpeg"

    },

    tolteka_plaza: {

        nombre: "Tolteka Plaza Hotel",
        ubicacion: "Calle Circunvalación al Lago de Coatepeque, Santa Ana",
        precioNoche: 125,
        imagen: "IMG/PNG/Hotel Tolteka.jpeg"

    },

    boca_olas: {

        nombre: "Boca Olas Resort Villas",
        ubicacion: "Km 42, Carretera al Litoral, Playa El Tunco, Tamanique, La Libertad",
        precioNoche: 175,
        imagen: "IMG/JPG/Hotel Boca Ola.peg.jpeg"

    },

    atami_escape: {

        nombre: "Atami Escape",
        ubicacion: "Carretera El Litoral, La Libertad",
        precioNoche: 83,
        imagen: "IMG/JPG/Hotel Atami Escape.jpeg"

    },

    hotel_farallones: {

        nombre: "Hotel Los Farallones",
        ubicacion: "Carretera El Litoral, La Libertad",
        precioNoche: 130,
        imagen: "IMG/JPG/Hotel farallones.jpeg"

    },

    hotel_acantilados: {

        nombre: "Hotel Acantilados",
        ubicacion: "Carretera El Litoral, La Libertad",
        precioNoche: 120,
        imagen: "IMG/JPG/Hotel Alcatilados.jpeg"

    }

};
const IVA_RESERVA = 0.13;

const HORA_ENTRADA = "3:00 PM";

const HORA_SALIDA = "12:00 PM";

const CLAVE_STORAGE = "hotelscope_reservas";

function obtenerRutaImagen(rutaImagen){

    const scriptReservas = document.querySelector(
        'script[src*="reservas.js"]'
    );

    if(!scriptReservas) return rutaImagen;

    const rutaProyecto = new URL(
        "../",
        scriptReservas.src
    );

    return new URL(
        rutaImagen,
        rutaProyecto
    ).href;
}


/* ================= Utilidades de almacenamiento ================= */

function obtenerReservas(){
    try{
        return JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || [];
    }catch(error){
        return [];
    }
}

function guardarReservas(listaReservas){
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(listaReservas));
}

function generarCodigoReserva(){
    return "HS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calcularNoches(fechaEntrada, fechaSalida){
    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    const entrada = new Date(fechaEntrada + "T00:00:00");
    const salida = new Date(fechaSalida + "T00:00:00");
    return Math.round((salida - entrada) / milisegundosPorDia);
}

function formatearFecha(fechaISO){
    const opciones = { day: "2-digit", month: "long", year: "numeric" };
    const fecha = new Date(fechaISO + "T00:00:00");
    return fecha.toLocaleDateString("es-ES", opciones);
}


/* ================= Formulario de reserva (página de hotel) ================= */

function inicializarFormularioReserva(hotelId){

    const hotel = HOTELES_DATA[hotelId];
    if(!hotel) return;

    const form = document.getElementById("form-reserva");
    if(!form) return;

    const inputEntrada = document.getElementById("fecha-entrada");
    const inputSalida = document.getElementById("fecha-salida");
    const inputHuespedes = document.getElementById("num-huespedes");
    const selectHabitaciones = document.getElementById("num-habitaciones");
    const resumen = document.getElementById("resumen-reserva");
    const mensaje = document.getElementById("mensaje-reserva");
    const precioNoche = document.querySelector(".precio-noche");


    /* ================= MÉTODO DE PAGO ================= */

    const contenedorPago = document.createElement("div");

    contenedorPago.style.marginTop = "15px";

    contenedorPago.innerHTML =
        "<label for='metodo-pago'><strong>Método de pago:</strong></label>" +
        "<select id='metodo-pago' required>" +
            "<option value=''>Selecciona un método de pago</option>" +
            "<option value='Efectivo'>💵 Efectivo</option>" +
            "<option value='Tarjeta de crédito'>💳 Tarjeta de crédito</option>" +
            "<option value='Tarjeta de débito'>💳 Tarjeta de débito</option>" +
            "<option value='Transferencia bancaria'>🏦 Transferencia bancaria</option>" +
            "<option value='Pago móvil'>📱 Pago móvil</option>" +
            "<option value='PayPal'>🅿️ PayPal</option>" +
        "</select>";

    form.appendChild(contenedorPago);

    const selectMetodoPago = document.getElementById("metodo-pago");


    /* ================= MENSAJE DE PAGO SIMULADO ================= */

    const mensajePago = document.createElement("p");

    mensajePago.id = "mensaje-pago";

    mensajePago.style.marginTop = "8px";

    mensajePago.style.display = "none";

    contenedorPago.appendChild(mensajePago);


    /* ================= CAMBIO DE MÉTODO DE PAGO ================= */

    selectMetodoPago.addEventListener("change", function(){

        if(selectMetodoPago.value){

            mensajePago.textContent =
                "Pago simulado: " + selectMetodoPago.value + ".";

            mensajePago.style.display = "block";

        }else{

            mensajePago.textContent = "";

            mensajePago.style.display = "none";
        }
    });


    const hoy = new Date();
    const isoHoy = hoy.toISOString().split("T")[0];

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const isoManana = manana.toISOString().split("T")[0];

    inputEntrada.min = isoHoy;
    inputEntrada.value = isoHoy;
    inputSalida.min = isoManana;
    inputSalida.value = isoManana;

    function actualizarResumen(){

        const huespedes = parseInt(inputHuespedes.value) || 1;
        const habitaciones = parseInt(selectHabitaciones.value) || 1;

        let noches = calcularNoches(inputEntrada.value, inputSalida.value);

        if(noches < 1){
            const nuevaSalida = new Date(inputEntrada.value + "T00:00:00");
            nuevaSalida.setDate(nuevaSalida.getDate() + 1);
            inputSalida.value = nuevaSalida.toISOString().split("T")[0];
            inputSalida.min = inputSalida.value;
            noches = 1;
        }

        const subtotal = noches * hotel.precioNoche * huespedes * habitaciones;
        const impuestos = subtotal * IVA_RESERVA;
        const total = subtotal + impuestos;
        const precioPorNoche = hotel.precioNoche * huespedes * habitaciones;

        if(precioNoche){
            precioNoche.innerHTML = "$" + precioPorNoche.toFixed(2) + " <span>/ noche</span>";
        }

        resumen.innerHTML =
            "<p><strong>" + noches + "</strong> noche(s) &middot; " + habitaciones +
            " habitación(es) &middot; " + huespedes + " huésped(es)</p>" +
            "<p>Subtotal: $" + subtotal.toFixed(2) + "</p>" +
            "<p>Impuestos (13%): $" + impuestos.toFixed(2) + "</p>" +
            "<p class='total-reserva'>Total: $" + total.toFixed(2) + "</p>";
    }

    inputEntrada.addEventListener("change", actualizarResumen);
    inputSalida.addEventListener("change", actualizarResumen);
    inputHuespedes.addEventListener("input", actualizarResumen);
    selectHabitaciones.addEventListener("change", actualizarResumen);

    actualizarResumen();

    form.addEventListener("submit", function(evento){

        evento.preventDefault();

        const nombreHuesped = document.getElementById("nombre-huesped").value.trim();
        const noches = calcularNoches(inputEntrada.value, inputSalida.value);

        const metodoPago = selectMetodoPago.value;


        /* ================= VALIDAR MÉTODO DE PAGO ================= */

        if(!nombreHuesped){
            mensaje.textContent = "Por favor ingresa el nombre del huésped.";
            mensaje.className = "mensaje-reserva error";
            return;
        }

        if(!metodoPago){
            mensaje.textContent = "Por favor selecciona un método de pago.";
            mensaje.className = "mensaje-reserva error";
            return;
        }

        if(noches < 1){
            mensaje.textContent = "La fecha de salida debe ser posterior a la fecha de entrada.";
            mensaje.className = "mensaje-reserva error";
            return;
        }


        const huespedes = parseInt(inputHuespedes.value) || 1;
        const habitaciones = parseInt(selectHabitaciones.value) || 1;
        const subtotal = noches * hotel.precioNoche * huespedes * habitaciones;
        const impuestos = subtotal * IVA_RESERVA;
        const total = subtotal + impuestos;


        /* ================= PAGO SIMULADO ================= */

        const pagoSimulado = {
            metodo: metodoPago,
            monto: total,
            estado: "Aprobado",
            tipo: "Simulado"
        };


        /* ================= CREAR RESERVA ================= */

        const reserva = {
            codigo: generarCodigoReserva(),
            hotelId: hotelId,
            hotel: hotel.nombre,
            ubicacion: hotel.ubicacion,
            imagen: hotel.imagen,
            huesped: nombreHuesped,
            fechaEntrada: inputEntrada.value,
            fechaSalida: inputSalida.value,
            horaEntrada: HORA_ENTRADA,
            horaSalida: HORA_SALIDA,
            huespedes: huespedes,
            habitaciones: habitaciones,
            noches: noches,
            precioNoche: hotel.precioNoche,
            subtotal: subtotal,
            impuestos: impuestos,
            total: total,

            /* ================= DATOS DEL PAGO ================= */

            metodoPago: metodoPago,
            pago: pagoSimulado,

            estado: "Confirmada"
        };


        /* ================= GUARDAR RESERVA ================= */

        const reservas = obtenerReservas();

        reservas.push(reserva);

        guardarReservas(reservas);


        /* ================= MENSAJE DE CONFIRMACIÓN ================= */

        mensaje.textContent =
            "¡Reserva confirmada y pago simulado aprobado! Código: " +
            reserva.codigo +
            ". Puedes verla en \"Mis reservas\".";

        mensaje.className = "mensaje-reserva exito";


        /* ================= LIMPIAR FORMULARIO ================= */

        form.reset();

        inputEntrada.value = isoHoy;

        inputSalida.value = isoManana;

        selectMetodoPago.value = "";

        mensajePago.textContent = "";

        mensajePago.style.display = "none";

        actualizarResumen();
    });
}


/* ================= Panel "Mis reservas" ================= */

function mostrarMisReservas(){

    cerrarMenusDesplegables();

    const overlayExistente = document.getElementById("overlay-mis-reservas");

    if(overlayExistente) overlayExistente.remove();

    const reservas = obtenerReservas();

    const overlay = document.createElement("div");

    overlay.id = "overlay-mis-reservas";

    overlay.className = "overlay-reservas";

    let contenidoLista = "";

    if(reservas.length === 0){

        contenidoLista =
            "<p class='sin-reservas'>Aún no tienes hoteles reservados.</p>";

    }else{

        contenidoLista = reservas.map(function(reserva, indice){

            return (

                "<div class='card-mi-reserva'>" +

                     "<img src='" + obtenerRutaImagen(reserva.imagen) + "' alt='" + reserva.hotel + "'>" +

                     "<div class='datos-mi-reserva'>" +

                        "<h3>" + reserva.hotel + "</h3>" +

                        "<p>" + reserva.ubicacion + "</p>" +

                        "<p>Entrada: " +
                        formatearFecha(reserva.fechaEntrada) +
                        " &middot; " +
                        reserva.horaEntrada +
                        "</p>" +

                        "<p>Salida: " +
                        formatearFecha(reserva.fechaSalida) +
                        " &middot; " +
                        reserva.horaSalida +
                        "</p>" +

                        "<p>" +
                        reserva.noches +
                        " noche(s) &middot; " +
                        reserva.habitaciones +
                        " habitación(es) &middot; " +
                        reserva.huespedes +
                        " huésped(es)" +
                        "</p>" +

                        "<p>Código: <strong>" +
                        reserva.codigo +
                        "</strong></p>" +

                        "<p>Método de pago: <strong>" +
                        (reserva.metodoPago || "No especificado") +
                        "</strong></p>" +

                        "<p>Estado del pago: <strong>" +
                        (reserva.pago ? reserva.pago.estado : "No especificado") +
                        "</strong></p>" +

                        "<p class='total-mi-reserva'>Total: $" +
                        reserva.total.toFixed(2) +
                        "</p>" +

                    "</div>" +

                    "<button class='btn-cancelar-reserva' onclick='cancelarReserva(" +
                    indice +
                    ")'>Cancelar</button>" +

                "</div>"

            );

        }).join("");
    }

    overlay.innerHTML =

        "<div class='modal-reservas'>" +

            "<div class='encabezado-modal-reservas'>" +

                "<h2>Mis reservas</h2>" +

                "<button class='cerrar-modal-reservas' onclick='cerrarMisReservas()'>" +
                "&times;" +
                "</button>" +

            "</div>" +

            "<div class='cuerpo-modal-reservas'>" +
            contenidoLista +
            "</div>" +

        "</div>";


    document.body.appendChild(overlay);


    overlay.addEventListener("click", function(evento){

        if(evento.target === overlay){

            cerrarMisReservas();

        }

    });
}


function cerrarMisReservas(){

    const overlay =
        document.getElementById("overlay-mis-reservas");

    if(overlay) overlay.remove();
}


function cancelarReserva(indice){

    if(!confirm("¿Deseas cancelar esta reserva?")) return;

    const reservas = obtenerReservas();

    reservas.splice(indice, 1);

    guardarReservas(reservas);

    mostrarMisReservas();
}


/* ================= Ver reseñas desde el menú de tres puntos ================= */

function mostrarMenu(){

    const menu =
        document.getElementById("menuDesplegable");

    if(!menu) return;

    menu.classList.toggle("mostrar");
}


function mostrarMisResenas(){

    cerrarMenusDesplegables();

    const seccion =
        document.getElementById("reseñas");

    if(seccion){

        seccion.scrollIntoView({
            behavior: "smooth"
        });

    }
}


function verResenas(anclaId, urlAlterna){

    cerrarMenusDesplegables();

    if(anclaId){

        const seccion =
            document.getElementById(anclaId);

        if(seccion){

            seccion.scrollIntoView({
                behavior: "smooth"
            });

            return;
        }
    }

    if(urlAlterna){

        window.location.href = urlAlterna;

    }
}


/* ================= Utilidad compartida ================= */

function cerrarMenusDesplegables(){

    document.querySelectorAll(
        ".menu-desplegable.mostrar"
    ).forEach(function(menu){

        menu.classList.remove("mostrar");

    });
}