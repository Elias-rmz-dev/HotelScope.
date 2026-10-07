/* =========================================================
   HotelScope - Sistema de reservas simulado (Ver reseñas + Mis reservas)
   Este archivo es nuevo: no modifica sesion.js ni buscar.js.
   ========================================================= */

/* ---------- Datos de los hoteles precios reales de referencia ---------- */
const HOTELES_DATA = { /* - - - - este es un objeto - - - -*/

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
 
 
 
    /* ================= MODAL DE PAGO ================= */ 
 
    const modalPago = document.createElement("div"); 
 
    modalPago.id = "modal-pago"; 
 
    modalPago.className = "modal-pago oculto"; 
 
    document.body.appendChild(modalPago); 
 
 
    function actualizarCamposPago(metodoPago){ 
 
        const datosPago = document.getElementById("datos-pago"); 
 
        if(!datosPago) return; 
 
        if(metodoPago === "Tarjeta de crédito" || metodoPago === "Tarjeta de débito"){ 
 
            datosPago.innerHTML = 
                "<div class='campo-pago'>" + 
                    "<label for='numero-tarjeta'>Número de tarjeta</label>" + 
                    "<input type='text' id='numero-tarjeta' inputmode='numeric' maxlength='19' placeholder='0000 0000 0000 0000'>" + 
                "</div>" + 
                "<div class='campo-pago'>" + 
                    "<label for='nombre-titular'>Nombre del titular</label>" + 
                    "<input type='text' id='nombre-titular' placeholder='Nombre que aparece en la tarjeta'>" + 
                "</div>" + 
                "<div class='fila-campos-pago'>" + 
                    "<div class='campo-pago'>" + 
                        "<label for='fecha-vencimiento'>Fecha de vencimiento</label>" + 
                        "<input type='text' id='fecha-vencimiento' inputmode='numeric' maxlength='5' placeholder='MM/AA'>" + 
                    "</div>" + 
                    "<div class='campo-pago'>" + 
                        "<label for='cvv'>CVV</label>" + 
                        "<input type='password' id='cvv' inputmode='numeric' maxlength='4' placeholder='***'>" + 
                    "</div>" + 
                "</div>" + 
                "<p class='ayuda-pago'>La información de pago se utiliza únicamente para esta simulación y no se almacena.</p>"; 
 
            const numeroTarjeta = document.getElementById("numero-tarjeta"); 
 
            numeroTarjeta.addEventListener("input", function(){ 
 
                let valor = numeroTarjeta.value.replace(/\D/g, "").substring(0, 16); 
 
                valor = valor.replace(/(.{4})/g, "$1 ").trim(); 
 
                numeroTarjeta.value = valor; 
 
            }); 
 
            const fechaVencimiento = document.getElementById("fecha-vencimiento"); 
 
            fechaVencimiento.addEventListener("input", function(){ 
 
                let valor = fechaVencimiento.value.replace(/\D/g, "").substring(0, 4); 
 
                if(valor.length >= 3){ 
 
                    valor = valor.substring(0, 2) + "/" + valor.substring(2); 
 
                } 
 
                fechaVencimiento.value = valor; 
 
            }); 
 
            return; 
 
        } 
 
        if(metodoPago === "Transferencia bancaria"){ 
 
            datosPago.innerHTML = 
                "<div class='campo-pago'>" + 
                    "<label for='banco-transferencia'>Banco</label>" + 
                    "<select id='banco-transferencia'>" + 
                        "<option value=''>Selecciona un banco</option>" + 
                        "<option value='Banco Agrícola'>Banco Agrícola</option>" + 
                        "<option value='Banco de América Central'>Banco de América Central</option>" + 
                        "<option value='Banco Cuscatlán'>Banco Cuscatlán</option>" + 
                        "<option value='Banco Davivienda'>Banco Davivienda</option>" + 
                    "</select>" + 
                "</div>" + 
                "<div class='campo-pago'>" + 
                    "<label for='referencia-transferencia'>Referencia</label>" + 
                    "<input type='text' id='referencia-transferencia' maxlength='30' placeholder='Ingrese la referencia'>" + 
                "</div>" + 
                "<p class='ayuda-pago'>En un sistema real, la transferencia sería verificada antes de marcar el pago como aprobado.</p>"; 
 
            return; 
 
        } 
 
        if(metodoPago === "Pago móvil"){ 
 
            datosPago.innerHTML = 
                "<div class='campo-pago'>" + 
                    "<label for='telefono-pago'>Número de teléfono</label>" + 
                    "<input type='tel' id='telefono-pago' maxlength='9' placeholder='7000-0000'>" + 
                "</div>" + 
                "<div class='campo-pago'>" + 
                    "<label for='proveedor-pago'>Proveedor</label>" + 
                    "<select id='proveedor-pago'>" + 
                        "<option value=''>Selecciona un proveedor</option>" + 
                        "<option value='Tigo Money'>Tigo Money</option>" + 
                        "<option value='Claro'>Claro</option>" + 
                        "<option value='Banco'>Banco</option>" + 
                    "</select>" + 
                "</div>"; 
 
            return; 
 
        } 
 
        if(metodoPago === "PayPal"){ 
 
            datosPago.innerHTML = 
                "<div class='condiciones-pago'>" + 
                    "<strong>Pago con PayPal</strong>" + 
                    "<p>En un sistema real serías dirigido al sitio oficial de PayPal para completar la autorización.</p>" + 
                    "<p>En HotelScope este proceso será simulado.</p>" + 
                "</div>"; 
 
            return; 
 
        } 
 
        if(metodoPago === "Efectivo"){ 
 
            datosPago.innerHTML = 
                "<div class='condiciones-pago'>" + 
                    "<strong>Pago en efectivo</strong>" + 
                    "<p>El pago se realizará directamente en el hotel al momento del check-in.</p>" + 
                    "<p>La reserva quedará con estado de pago pendiente.</p>" + 
                "</div>"; 
 
            return; 
 
        } 
 
        datosPago.innerHTML = ""; 
 
    } 
 
 
    function obtenerDatosPago(metodoPago){ 
 
        const datos = {}; 
 
        if(metodoPago === "Tarjeta de crédito" || metodoPago === "Tarjeta de débito"){ 
 
            const numeroTarjeta = document.getElementById("numero-tarjeta"); 
            const nombreTitular = document.getElementById("nombre-titular"); 
            const fechaVencimiento = document.getElementById("fecha-vencimiento"); 
            const cvv = document.getElementById("cvv"); 
 
            if(!numeroTarjeta || !nombreTitular || !fechaVencimiento || !cvv){ 
 
                return null; 
 
            } 
 
            const numero = numeroTarjeta.value.replace(/\D/g, ""); 
 
            if(numero.length !== 16){ 
 
                return null; 
 
            } 
 
         
            const partesFecha = fechaVencimiento.value.split("/"); 
 
            const mes = parseInt(partesFecha[0], 10); 
 
            const anio = 2000 + parseInt(partesFecha[1], 10); 
 
            const fechaActual = new Date(); 
 
            const anioActual = fechaActual.getFullYear(); 
 
            const mesActual = fechaActual.getMonth() + 1; 
 
            if(mes < 1 || mes > 12 || anio < anioActual || (anio === anioActual && mes < mesActual)){ 
 
                return null; 
 
            } 
 
            if(!/^\d{3,4}$/.test(cvv.value)){ 
 
                return null; 
 
            } 
 
            datos.tipo = "Tarjeta"; 
 
            return datos; 
 
        } 
 
        if(metodoPago === "Transferencia bancaria"){ 
 
            const banco = document.getElementById("banco-transferencia"); 
            const referencia = document.getElementById("referencia-transferencia"); 
 
            if(!banco || !referencia || !banco.value || !referencia.value.trim()){ 
 
                return null; 
 
            } 
 
            datos.tipo = "Transferencia"; 
 
            return datos; 
 
        } 
 
        if(metodoPago === "Pago móvil"){ 
 
            const telefono = document.getElementById("telefono-pago"); 
            const proveedor = document.getElementById("proveedor-pago"); 
 
            if(!telefono || !proveedor || !telefono.value.trim() || !proveedor.value){ 
 
                return null; 
 
            } 
 
            datos.tipo = "Pago móvil"; 
 
            return datos; 
 
        } 
 
        if(metodoPago === "PayPal"){ 
 
            datos.tipo = "PayPal"; 
 
            return datos; 
 
        } 
 
        if(metodoPago === "Efectivo"){ 
 
            datos.tipo = "Efectivo"; 
 
            return datos; 
 
        } 
 
        return null; 
 
    } 
 
 
    function obtenerEstadoPago(metodoPago){ 
 
        if(metodoPago === "Efectivo" || metodoPago === "Transferencia bancaria"){ 
 
            return "Pendiente"; 
 
        } 
 
        return "Aprobado"; 
 
    } 
 
 
    function mostrarModalPago(datosReserva){ 
 
        modalPago.classList.remove("oculto"); 
 
        modalPago.innerHTML = 
            "<div class='contenedor-pago'>" + 
 
                "<div class='encabezado-pago'>" + 
                    "<h2>Revisar reserva y pago</h2>" + 
                    "<button type='button' class='btn-cerrar-pago' id='btn-cerrar-pago'>&times;</button>" + 
                "</div>" + 
 
                "<div class='resumen-pago'>" + 
                    "<h3>" + datosReserva.hotel + "</h3>" + 
                    "<div class='fila-pago'><span>Entrada:</span><strong>" + formatearFecha(datosReserva.fechaEntrada) + " · " + HORA_ENTRADA + "</strong></div>" + 
                    "<div class='fila-pago'><span>Salida:</span><strong>" + formatearFecha(datosReserva.fechaSalida) + " · " + HORA_SALIDA + "</strong></div>" + 
                    "<div class='fila-pago'><span>Huéspedes:</span><strong>" + datosReserva.huespedes + "</strong></div>" + 
                    "<div class='fila-pago'><span>Habitaciones:</span><strong>" + datosReserva.habitaciones + "</strong></div>" + 
                    "<div class='fila-pago'><span>Subtotal:</span><strong>$" + datosReserva.subtotal.toFixed(2) + "</strong></div>" + 
                    "<div class='fila-pago'><span>Impuestos (13%):</span><strong>$" + datosReserva.impuestos.toFixed(2) + "</strong></div>" + 
                    "<div class='fila-pago total'><span>Total:</span><strong>$" + datosReserva.total.toFixed(2) + "</strong></div>" + 
                "</div>" + 
 
                "<div class='metodo-pago'>" + 
                    "<label for='metodo-pago-modal'>Método de pago</label>" + 
                    "<select id='metodo-pago-modal'>" + 
                        "<option value=''>Selecciona un método de pago</option>" + 
                        "<option value='Efectivo'>💵 Efectivo</option>" + 
                        "<option value='Tarjeta de crédito'>💳 Tarjeta de crédito</option>" + 
                        "<option value='Tarjeta de débito'>💳 Tarjeta de débito</option>" + 
                        "<option value='Transferencia bancaria'>🏦 Transferencia bancaria</option>" + 
                        "<option value='Pago móvil'>📱 Pago móvil</option>" + 
                        "<option value='PayPal'>🅿️ PayPal</option>" + 
                    "</select>" + 
                "</div>" + 
 
                "<div id='datos-pago' class='datos-pago'></div>" + 
 
                "<p id='mensaje-pago-modal' class='mensaje-pago'></p>" + 
 
                "<button type='button' class='btn-pagar' id='btn-pagar'>Confirmar y continuar</button>" + 
 
            "</div>"; 
 
        const cerrar = document.getElementById("btn-cerrar-pago"); 
        const selectModal = document.getElementById("metodo-pago-modal"); 
        const botonPagar = document.getElementById("btn-pagar"); 
 
        cerrar.addEventListener("click", cerrarModalPago); 
 
        modalPago.addEventListener("click", function(evento){ 
 
            if(evento.target === modalPago){ 
 
                cerrarModalPago(); 
 
            } 
 
        }); 
 
        selectModal.addEventListener("change", function(){ 
 
            actualizarCamposPago(selectModal.value); 
 
        }); 
 
        botonPagar.addEventListener("click", function(){ 
 
            const mensajeModal = document.getElementById("mensaje-pago-modal"); 
            const metodoPago = selectModal.value; 
 
            if(!metodoPago){ 
 
                mensajeModal.textContent = "Selecciona un método de pago."; 
 
                return; 
 
            } 
 
            const datosPago = obtenerDatosPago(metodoPago); 
 
            if(!datosPago){ 
 
                mensajeModal.textContent = "Completa correctamente los datos del método de pago."; 
 
                return; 
 
            } 
 
            botonPagar.disabled = true; 
 
            modalPago.querySelector(".contenedor-pago").innerHTML = 
                "<div class='procesando-pago'>" + 
                    "<div class='spinner-pago'></div>" + 
                    "<h2>Procesando pago...</h2>" + 
                    "<p>Estamos verificando tu información.</p>" + 
                "</div>"; 
 
            setTimeout(function(){ 
 
                finalizarReserva(datosReserva, metodoPago); 
 
            }, 1200); 
 
        }); 
 
    } 
 
 
    function cerrarModalPago(){ 
 
        modalPago.classList.add("oculto"); 
 
        modalPago.innerHTML = ""; 
 
    } 
 
 
    function finalizarReserva(datosReserva, metodoPago){ 
 
        const estadoPago = obtenerEstadoPago(metodoPago); 
 
        const pagoSimulado = { 
 
            metodo: metodoPago, 
 
            monto: datosReserva.total, 
 
            estado: estadoPago, 
 
            tipo: "Simulado" 
 
        }; 
 
        const reserva = { 
 
            codigo: generarCodigoReserva(), 
 
            hotelId: hotelId, 
 
            hotel: hotel.nombre, 
 
            ubicacion: hotel.ubicacion, 
 
            imagen: hotel.imagen, 
 
            huesped: datosReserva.huesped, 
 
            fechaEntrada: datosReserva.fechaEntrada, 
 
            fechaSalida: datosReserva.fechaSalida, 
 
            horaEntrada: HORA_ENTRADA, 
 
            horaSalida: HORA_SALIDA, 
 
            huespedes: datosReserva.huespedes, 
 
            habitaciones: datosReserva.habitaciones, 
 
            noches: datosReserva.noches, 
 
            precioNoche: hotel.precioNoche, 
 
            subtotal: datosReserva.subtotal, 
 
            impuestos: datosReserva.impuestos, 
 
            total: datosReserva.total, 
 
            metodoPago: metodoPago, 
 
            pago: pagoSimulado, 
 
            estado: "Confirmada" 
 
        }; 
 
        const reservas = obtenerReservas(); 
 
        reservas.push(reserva); 
 
        guardarReservas(reservas); 
 
        localStorage.removeItem("hotelscope_reserva_pendiente"); 
 
        modalPago.querySelector(".contenedor-pago").innerHTML = 
            "<div class='confirmacion-pago'>" + 
                "<div class='confirmacion-exito'>✓</div>" + 
                "<h2>Reserva confirmada</h2>" + 
                "<p>Tu reserva en <strong>" + reserva.hotel + "</strong> ha sido registrada correctamente.</p>" + 
                "<div class='codigo-reserva'>Código: " + reserva.codigo + "</div>" + 
                "<div class='detalles-confirmacion'>" + 
                    "<p>Entrada: <strong>" + formatearFecha(reserva.fechaEntrada) + " · " + HORA_ENTRADA + "</strong></p>" + 
                    "<p>Salida: <strong>" + formatearFecha(reserva.fechaSalida) + " · " + HORA_SALIDA + "</strong></p>" + 
                    "<p>Método de pago: <strong>" + reserva.metodoPago + "</strong></p>" + 
                    "<p>Estado del pago: <strong>" + reserva.pago.estado + "</strong></p>" + 
                    "<p>Total: <strong>$" + reserva.total.toFixed(2) + "</strong></p>" + 
                "</div>" + 
                "<button type='button' class='btn-finalizar-pago' id='btn-finalizar-pago'>Finalizar</button>" + 
            "</div>"; 
 
        document.getElementById("btn-finalizar-pago").addEventListener("click", function(){ 
 
            cerrarModalPago(); 
 
            mensaje.textContent = 
                "¡Reserva confirmada! Código: " + 
                reserva.codigo + 
                ". Puedes verla en \"Mis reservas\"."; 
 
            mensaje.className = "mensaje-reserva exito"; 
 
            form.reset(); 
 
            inputEntrada.value = isoHoy; 
 
            inputSalida.value = isoManana; 
 
            inputHuespedes.value = 1; 
 
            actualizarResumen(); 
 
        }); 
 
    } 
 
 
    const hoy = new Date(); 
 
    const isoHoy = hoy.toISOString().split("T")[0]; 
 
    const manana = new Date(); 
 
    manana.setDate(manana.getDate() + 1); 
 
    const isoManana = manana.toISOString().split("T")[0]; 
 
    inputEntrada.min = isoHoy; 
 
    inputEntrada.value = isoHoy; 
 
    inputSalida.min = isoManana; 
 
    inputSalida.value = isoManana; 
 
    inputHuespedes.min = 1; 
 
    inputHuespedes.max = 4; 
 
    if(parseInt(inputHuespedes.value) > 4){ 
 
        inputHuespedes.value = 4; 
 
    } 
 
    function actualizarResumen(){ 
 
        let huespedes = parseInt(inputHuespedes.value) || 1; 
 
        const habitaciones = parseInt(selectHabitaciones.value) || 1; 
 
        if(huespedes < 1){ 
 
            huespedes = 1; 
 
            inputHuespedes.value = 1; 
 
        } 
 
        if(huespedes > 4){ 
 
            huespedes = 4; 
 
            inputHuespedes.value = 4; 
 
        } 
 
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
 
    const reservaPendiente = JSON.parse(localStorage.getItem("hotelscope_reserva_pendiente")); 
 
    if(reservaPendiente && reservaPendiente.hotelId === hotelId){ 
 
        const nombreHuesped = document.getElementById("nombre-huesped"); 
 
        if(nombreHuesped) nombreHuesped.value = reservaPendiente.huesped || ""; 
 
        inputEntrada.value = reservaPendiente.fechaEntrada || isoHoy; 
 
        inputSalida.value = reservaPendiente.fechaSalida || isoManana; 
 
        inputHuespedes.value = reservaPendiente.huespedes || 1; 
 
        selectHabitaciones.value = reservaPendiente.habitaciones || 1; 
 
        localStorage.removeItem("hotelscope_reserva_pendiente"); 
 
        actualizarResumen(); 
 
    } 
 
 form.addEventListener("submit", function(evento){ 
 
     evento.preventDefault(); 
 
     const sesion_iniciada = localStorage.getItem("sesion_iniciada"); 
 
     const nombreHuesped = document.getElementById("nombre-huesped").value.trim(); 
 
     const huespedes = parseInt(inputHuespedes.value) || 1; 
 
     const habitaciones = parseInt(selectHabitaciones.value) || 1; 
 
     if(huespedes < 1 || huespedes > 4){ 
 
        mensaje.textContent = "La cantidad de huéspedes debe ser de 1 a 4 por habitación."; 
 
        mensaje.className = "mensaje-reserva error"; 
 
        inputHuespedes.value = 4; 
 
        actualizarResumen(); 
 
        return; 
 
     } 
 
     if(sesion_iniciada !== "true"){ 
 
        const datosPendientes = { 
 
            hotelId: hotelId, 
 
            huesped: nombreHuesped, 
 
            fechaEntrada: inputEntrada.value, 
 
            fechaSalida: inputSalida.value, 
 
            huespedes: huespedes, 
 
            habitaciones: habitaciones 
 
        }; 
 
        localStorage.setItem("hotelscope_reserva_pendiente", JSON.stringify(datosPendientes)); 
 
        localStorage.setItem("pagina_anterior_login", window.location.href); 
 
        window.location.replace(ruta_login); 
 
        return; 
 
     } 
 
        const noches = calcularNoches(inputEntrada.value, inputSalida.value); 
 
        if(!nombreHuesped){ 
 
            mensaje.textContent = "Por favor ingresa el nombre del huésped."; 
 
            mensaje.className = "mensaje-reserva error"; 
 
            return; 
 
        } 
 
        if(noches < 1){ 
 
            mensaje.textContent = "La fecha de salida debe ser posterior a la fecha de entrada."; 
 
            mensaje.className = "mensaje-reserva error"; 
 
            return; 
 
        } 
 
        const subtotal = noches * hotel.precioNoche * huespedes * habitaciones; 
 
        const impuestos = subtotal * IVA_RESERVA; 
 
        const total = subtotal + impuestos; 
 
        const datosReserva = { 
 
            huesped: nombreHuesped, 
 
            fechaEntrada: inputEntrada.value, 
 
            fechaSalida: inputSalida.value, 
 
            noches: noches, 
 
            huespedes: huespedes, 
 
            habitaciones: habitaciones, 
 
            subtotal: subtotal, 
 
            impuestos: impuestos, 
 
            total: total, 
 
            hotel: hotel.nombre 
 
        }; 
 
        mostrarModalPago(datosReserva); 
 
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
 
    const menu = document.getElementById("menuDesplegable"); 
 
    if(!menu) return; 

    if (window.matchMedia && window.matchMedia('(max-width: 1000px)').matches && typeof prepararMenuHamburguesa === "function") {
        prepararMenuHamburguesa(menu);
    }
 
    menu.classList.toggle("mostrar"); 
    document.body.classList.toggle("menu-abierto-responsive", menu.classList.contains("mostrar"));
} 

function cerrarMenuHamburguesa(){
    const menu = document.getElementById("menuDesplegable");
    if(menu) menu.classList.remove("mostrar");
    document.body.classList.remove("menu-abierto-responsive");
}
 
function mostrarMisResenas(){ 
 
    const sesion_iniciada = localStorage.getItem("sesion_iniciada"); 
 
    if(sesion_iniciada !== "true"){ 
 
        window.location.replace(ruta_login); 
 
        return; 
 
    } 
 
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