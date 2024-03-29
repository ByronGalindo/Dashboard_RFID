(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });
    
})(jQuery);

// Referencia a la base de datos de Firebase
const db = firebase.database();
const historialRef = db.ref('Historial');
const scansTableBody = document.getElementById('scansTable');
const lastHourScanElement = document.getElementById('lastHourScan');
const lastUserScanElement = document.getElementById('lastUserScan');
const firstHourScanElement = document.getElementById('firstHourScan');
const lastMembraneElement = document.getElementById('lastMembrane');

// Función para agregar filas a la tabla
function addTableRow(date, time, rfid, user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${rfid}</td>
        <td>${user}</td>
    `;
    scansTableBody.appendChild(row);
}

// Función para limpiar la tabla
function clearTable() {
    scansTableBody.innerHTML = '';
}

// Función para mostrar los escaneos recientes en la tabla
function showRecentScans(data) {
    clearTable();

    const allDatesAndTimes = [];
    for (const date in data) {
        for (const time in data[date]) {
            allDatesAndTimes.push({ date, time });
        }
    }

    allDatesAndTimes.sort((a, b) => {
        const [yearA, monthA,  dayA] = a.date.split('-');
        const [yearB, monthB,  dayB] = b.date.split('-');
        const dateA = new Date(`${yearA}-${monthA}-${dayA} ${a.time}`);
        const dateB = new Date(`${yearB}-${monthB}-${dayB} ${b.time}`);
        return dateB - dateA;
    });

    const recentScans = allDatesAndTimes.slice(0, 5);

    recentScans.forEach(({ date, time }) => {
        const { RFID, Usuario } = data[date][time];
        addTableRow(date, time, RFID, Usuario);
    });

    // Obtener el registro más reciente
    const lastScanDate = recentScans[0].date;
    const lastScanTime = recentScans[0].time;
    const lastScanData = data[lastScanDate][lastScanTime];


    // Obtener el registro mas antiguo/dia
    const scansDate = data[lastScanDate];
    const scansLastDate = Object.keys(scansDate);
    const firstHourScan = scansLastDate[0];
    

    // Actualizar los valores de los elementos
    lastHourScanElement.textContent = lastScanTime;
    lastUserScanElement.textContent = lastScanData.Usuario;
    lastMembraneElement.textContent = lastScanData.RFID;
    firstHourScanElement.textContent = firstHourScan;

}

// Función para obtener y mostrar el conteo de todos los escaneos realizados el día de hoy y el total de escaneos realizados en el mes
function updateTodayScansCount(dataHistorico) {
    const today = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Bogota' };
    const [month, day, year]= today.toLocaleDateString('en-US', options).split('/');;
    const formattedTodayDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    let todayScansCount = 0;
    let totalScansCount = 0;

    for (const date in dataHistorico) {
        if (date === formattedTodayDate) {
            todayScansCount += Object.keys(dataHistorico[date]).length;
        }
        totalScansCount += Object.keys(dataHistorico[date]).length;
    }

    todayScansElement.textContent = todayScansCount;
    totalScansElement.textContent = totalScansCount;
}

// Escuchar cambios en el nodo "Historial" de la base de datos
historialRef.on('value', (snapshot) => {
    const dataHistorico = snapshot.val();
    showRecentScans(dataHistorico);
    updateTodayScansCount(dataHistorico); // Actualizar el contador de escaneos de hoy
});

// Obtener y mostrar el conteo de todos los escaneos realizados el día de hoy y el total de escaneos realizados en el mes
historialRef.once('value', (snapshot) => {
    const dataHistorico = snapshot.val();
    updateTodayScansCount(dataHistorico); // Actualizar el contador de escaneos de hoy
});