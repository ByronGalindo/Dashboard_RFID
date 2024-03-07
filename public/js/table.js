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
    
    // Función para manejar el clic en el botón de descarga
    function handleDownloadButtonClick() {
        const wb = XLSX.utils.table_to_book(document.getElementById('totalScans'), {sheet: 'Scans'});
        XLSX.writeFile(wb, 'scans.xlsx');
    }

    // Asociar la función al evento de clic del botón de descarga
    document.querySelector('.btn-outline-primary').addEventListener('click', handleDownloadButtonClick);


})(jQuery);

// Referencia a la base de datos de Firebase
const db = firebase.database();
const historialRef = db.ref('Historial');
const scansTableBody = document.getElementById('scansTable');

// Función para agregar filas a la tabla
function addTableRow(i, date, time, rfid, user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${i}</td>
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
        const dateA = new Date(`${monthA}-${dayA}-${yearA} ${a.time}`);
        const dateB = new Date(`${monthB}-${dayB}-${yearB} ${b.time}`);
        return dateB - dateA;
    });

    const recentScans = allDatesAndTimes;

    var i = 0;
    recentScans.forEach(({ date, time }) => {
        i = i + 1;
        const { RFID, Usuario } = data[date][time];
        addTableRow(i, date, time, RFID, Usuario);
    });
}



// Escuchar cambios en el nodo "Historial" de la base de datos
historialRef.on('value', (snapshot) => {
    const dataHistorico = snapshot.val();
    showRecentScans(dataHistorico);
});
