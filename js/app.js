/* =====================================================================
   Tech Talent Summit 2026 - Lógica del landing
   ===================================================================== */
'use strict';

const RUTA_DATOS = 'data/';
const RUTA_FOTOS = 'assets/speakers/';

const $ = (id) => document.getElementById(id);

/* Evita que un texto de los JSON (o de la futura base de datos) se interprete como HTML. */
function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

async function cargarJSON(archivo) {
    const respuesta = await fetch(RUTA_DATOS + archivo);
    if (!respuesta.ok) throw new Error(`No se pudo cargar ${archivo} (${respuesta.status})`);
    return respuesta.json();
}

/* ---------------------------- RENDER ---------------------------- */

function pintarEvento(ev) {
    $('ev-fecha').textContent = `${ev.fecha_texto} · ${ev.hora}`;
    $('ev-sede').textContent = ev.auditorio ? `${ev.sede} · ${ev.auditorio}` : ev.sede;
    $('ev-dirigido').textContent = ev.dirigido_a;
    $('ev-direccion').innerHTML = ev.direccion.map(esc).join('<br>');
}

/* ------------------------- CARRUSEL DE SPEAKERS ------------------------- */

const INTERVALO_CARRUSEL = 6000; // milisegundos por speaker
let carruselIndice = 0;
let carruselTotal = 0;
let pausaHover = false;
let pausaFoco = false;
let pausaOculta = false;

const ICONO_USUARIO = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';

function pintarCarrusel(lista) {
    const contenedor = $('speakers-carousel');
    carruselTotal = lista.length;
    if (carruselTotal === 0) { contenedor.hidden = true; return; }

    contenedor.style.setProperty('--spk-dur', `${INTERVALO_CARRUSEL}ms`);
    const estatico = carruselTotal < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    contenedor.classList.toggle('spk--static', estatico);

    $('carousel-track').innerHTML = lista.map((s, i) => `
        <div class="spk-slide" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${carruselTotal}">
            <article class="spk-card">
                <div class="spk-photo">
                    <div class="spk-frame">
                        ${ICONO_USUARIO}
                        <img src="${RUTA_FOTOS}${esc(s.foto)}" alt="Foto de ${esc(s.nombre)}">
                    </div>
                </div>
                <div class="spk-body">
                    <h2 class="spk-name">${esc(s.nombre)}</h2>
                    <p class="spk-role"><span>${esc(s.cargo)}</span><span class="spk-company">${esc(s.empresa)}</span></p>
                    <div class="spk-talk">
                        <span class="spk-talk-label">Ponencia</span>
                        <p class="spk-talk-title">${esc(s.tema)}</p>
                    </div>
                </div>
            </article>
        </div>
    `).join('');

    // Foto que no existe: se quita y queda el ícono de respaldo
    $('carousel-track').querySelectorAll('img').forEach((img) => {
        const quitar = () => img.remove();
        img.addEventListener('error', quitar);
        if (img.complete && img.naturalWidth === 0) quitar();
    });

    // Una pestaña por speaker: barra de progreso + nombre
    $('carousel-tabs').innerHTML = lista.map((s, i) => `
        <button type="button" class="spk-tab" data-slide="${i}" aria-label="Ir a ${esc(s.nombre)}">
            <span class="spk-tab-bar"><span class="spk-tab-fill"></span></span>
            <span class="spk-tab-name">${esc(s.nombre.split(' ')[0])}<span class="spk-rest"> ${esc(s.nombre.split(' ').slice(1).join(' '))}</span></span>
        </button>
    `).join('');

    // Con un solo speaker no hace falta navegación
    if (carruselTotal === 1) contenedor.querySelector('.spk-controls').hidden = true;

    activarCarrusel();
    irASlide(0);
}

function irASlide(indice) {
    carruselIndice = (indice + carruselTotal) % carruselTotal; // da la vuelta al llegar al final
    $('carousel-track').style.transform = `translateX(-${carruselIndice * 100}%)`;

    [...$('carousel-track').children].forEach((slide, i) => {
        if (i === carruselIndice) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden', 'true');
    });

    const pestanas = [...$('carousel-tabs').children];
    pestanas.forEach((p, i) => {
        p.classList.remove('is-active');
        p.classList.toggle('is-done', i < carruselIndice);
        if (i === carruselIndice) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    });
    void $('carousel-tabs').offsetWidth; // reinicia la animación de la barra
    pestanas[carruselIndice].classList.add('is-active');
}

function actualizarPausa() {
    $('speakers-carousel').classList.toggle('is-paused', pausaHover || pausaFoco || pausaOculta);
}

function activarCarrusel() {
    const contenedor = $('speakers-carousel');

    $('carousel-prev').addEventListener('click', () => irASlide(carruselIndice - 1));
    $('carousel-next').addEventListener('click', () => irASlide(carruselIndice + 1));
    $('carousel-tabs').addEventListener('click', (evento) => {
        const pestana = evento.target.closest('[data-slide]');
        if (pestana) irASlide(Number(pestana.dataset.slide));
    });

    // Cuando la barra del speaker actual se llena, pasa al siguiente
    $('carousel-tabs').addEventListener('animationend', (evento) => {
        if (evento.animationName === 'spk-fill') irASlide(carruselIndice + 1);
    });

    // Pausa: mouse encima, foco de teclado dentro o pestaña oculta
    contenedor.addEventListener('mouseenter', () => { pausaHover = true; actualizarPausa(); });
    contenedor.addEventListener('mouseleave', () => { pausaHover = false; actualizarPausa(); });
    contenedor.addEventListener('focusin', (e) => { pausaFoco = e.target.matches(':focus-visible'); actualizarPausa(); });
    contenedor.addEventListener('focusout', () => { pausaFoco = false; actualizarPausa(); });
    document.addEventListener('visibilitychange', () => { pausaOculta = document.hidden; actualizarPausa(); });

    // Teclado: flechas izquierda/derecha con el foco dentro del carrusel
    contenedor.addEventListener('keydown', (evento) => {
        if (evento.key === 'ArrowLeft') irASlide(carruselIndice - 1);
        if (evento.key === 'ArrowRight') irASlide(carruselIndice + 1);
    });

    // Celular: deslizar con el dedo
    let inicioX = null;
    contenedor.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
    contenedor.addEventListener('touchend', (e) => {
        if (inicioX === null) return;
        const diferencia = e.changedTouches[0].clientX - inicioX;
        if (Math.abs(diferencia) > 50) irASlide(carruselIndice + (diferencia < 0 ? 1 : -1));
        inicioX = null;
    }, { passive: true });
}

/* ---------------------------- COMITÉ ---------------------------- */

/* Iniciales para el círculo cuando no hay foto*/
function iniciales(nombre) {
    const ignorar = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'por']);
    const palabras = String(nombre ?? '').trim().split(/\s+/)
        .filter((p) => p && !ignorar.has(p.toLowerCase()));
    return palabras.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

function pintarComite(lista) {
    $('comite-grid').innerHTML = lista.map((m) => `
        <article class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-soft-xl transition-all">
            <div class="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-brand-blue to-brand-cyan text-white flex items-center justify-center mb-3 shadow-sm">
                <span class="text-xl font-extrabold tracking-wide" aria-hidden="true">${esc(iniciales(m.nombre))}</span>
                ${m.foto ? `<img src="assets/comite/${esc(m.foto)}" alt="Foto de ${esc(m.nombre)}" loading="lazy" class="absolute inset-0 w-full h-full object-cover object-top">` : ''}
            </div>
            <h3 class="text-sm font-bold text-slate-900">${esc(m.nombre)}</h3>
            <p class="text-xs text-brand-blue font-semibold mt-0.5">${esc(m.rol)}</p>
        </article>
    `).join('');

    // Foto opcional: si el archivo no existe, se queda el círculo con iniciales
    $('comite-grid').querySelectorAll('img').forEach((img) => {
        const quitar = () => img.remove();
        img.addEventListener('error', quitar);
        if (img.complete && img.naturalWidth === 0) quitar();
    });
}

/* ------------------------------ INICIO ------------------------------ */

async function iniciar() {
    try {
        const [evento, speakers, comite] = await Promise.all([
            cargarJSON('evento.json'),
            cargarJSON('speakers.json'),
            cargarJSON('comite.json')
        ]);
        pintarEvento(evento);
        pintarCarrusel(speakers);
        pintarComite(comite);
    } catch (error) {
        console.error(error);
        $('error-banner').classList.remove('hidden');
    }
    lucide.createIcons(); // dibuja los íconos de todo lo recién creado
}

document.addEventListener('DOMContentLoaded', iniciar);
