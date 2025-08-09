// Función para formatear la fecha como YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    // Ajustar para evitar problemas de zona horaria
    const offset = d.getTimezoneOffset();
    const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
}

// Función para formatear la fecha en un formato legible (ej: 8 Ago 2023)
function formatDisplayDate(dateString) {
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
    };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}

// Función para actualizar la visualización de la fecha
function updateDateDisplay(input) {
    const dateGroup = input.closest('.date-group');
    if (input.value) {
        const formattedDate = formatDisplayDate(input.value);
        dateGroup.setAttribute('data-date', formattedDate);
    } else {
        dateGroup.removeAttribute('data-date');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Establecer fechas por defecto
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const arrivalDateInput = document.getElementById('arrivalDate');
    const departureDateInput = document.getElementById('departureDate');
    
    // Hacer que el input de fecha sea clickeable en toda su área
    function makeDateInputClickable(input) {
        // Agregar clase para el cursor pointer
        input.style.cursor = 'pointer';
        
        // Manejar clic en cualquier parte del input
        input.addEventListener('click', function(e) {
            // Solo abrir el selector si el clic no fue en el botón del calendario
            if (e.offsetX < this.offsetWidth - 30) { // 30px es el ancho aproximado del icono
                this.showPicker();
            }
        });
        
        // Asegurarse de que el input no tenga eventos que puedan interferir
        input.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
    }
    
    // Aplicar la función a ambos inputs de fecha
    makeDateInputClickable(arrivalDateInput);
    makeDateInputClickable(departureDateInput);
    
    // Establecer fechas por defecto
    arrivalDateInput.value = formatDate(today);
    departureDateInput.value = formatDate(tomorrow);
    
    // Actualizar visualización de fechas
    updateDateDisplay(arrivalDateInput);
    updateDateDisplay(departureDateInput);
    
    // Manejar cambios en las fechas
    arrivalDateInput.addEventListener('change', function() {
        updateDateDisplay(this);
    });
    
    departureDateInput.addEventListener('change', function() {
        updateDateDisplay(this);
    });
    
    // Set default dates
    const arrivalDate = new Date(today);
    arrivalDate.setDate(today.getDate() - 3);
    
    const departureDate = new Date(today);
    departureDate.setDate(today.getDate() + 3);
    
    document.getElementById('arrivalDate').valueAsDate = arrivalDate;
    document.getElementById('departureDate').valueAsDate = departureDate;
    
    // Update labels based on food type
    const foodTypeSelect = document.getElementById('foodType');
    const quantityLabel = document.getElementById('quantityLabel');
    const foodProvidedLabel = document.getElementById('foodProvidedLabel');
    
    function updateLabels() {
        const foodType = foodTypeSelect.value;
        const quantityInput = document.getElementById('quantityPerMeal');
        
        if (foodType === 'grams') {
            quantityLabel.textContent = 'Gramos por comida:';
            foodProvidedLabel.textContent = 'Comida enviada (gramos):';
            quantityInput.disabled = false;
            quantityInput.placeholder = 'Ej: 100';
        } else if (foodType === 'bags') {
            quantityLabel.textContent = 'No aplica (1 bolsa = 1 comida)';
            foodProvidedLabel.textContent = 'Comida enviada (bolsitas):';
            quantityInput.disabled = true;
            quantityInput.value = '1';
            quantityInput.placeholder = '';
        } else if (foodType === 'meatballs') {
            quantityLabel.textContent = 'Bolitas por comida:';
            foodProvidedLabel.textContent = 'Comida enviada (bolitas):';
            quantityInput.disabled = false;
            quantityInput.placeholder = 'Ej: 5';
        }
    }
    
    foodTypeSelect.addEventListener('change', updateLabels);
    updateLabels(); // Initialize labels
    
    // Get result section element
    const resultSection = document.querySelector('.result-section');
    
    // Calculate button event
    document.getElementById('calculateBtn').addEventListener('click', function() {
        calculate();
        // Smooth scroll to result section
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Initial calculation
    calculate();
    
    function calculate() {
        // Get form values and adjust for timezone
        const arrivalDateStr = document.getElementById('arrivalDate').value;
        const departureDateStr = document.getElementById('departureDate').value;
        
        // Parse dates and adjust for local timezone
        const arrivalDate = new Date(arrivalDateStr + 'T00:00:00');
        const departureDate = new Date(departureDateStr + 'T00:00:00');
        
        // Ajustar a la zona horaria local
        arrivalDate.setMinutes(arrivalDate.getMinutes() + arrivalDate.getTimezoneOffset());
        departureDate.setMinutes(departureDate.getMinutes() + departureDate.getTimezoneOffset());
        
        const foodType = document.getElementById('foodType').value;
        const mealsPerDay = parseInt(document.getElementById('mealsPerDay').value);
        const quantityPerMeal = parseInt(document.getElementById('quantityPerMeal').value);
        const arrivalMeals = parseInt(document.getElementById('arrivalMeals').value);
        const departureMeals = parseInt(document.getElementById('departureMeals').value);
        const foodProvided = parseInt(document.getElementById('foodProvided').value);
        
        // Validate dates
        if (arrivalDate >= departureDate) {
            alert('La fecha de salida debe ser posterior a la fecha de llegada');
            return;
        }
        
        // Calculate time difference
        const timeDiff = departureDate.getTime() - arrivalDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const fullDays = totalDays - 1;
        
        // Calculate total meals
        const totalMeals = arrivalMeals + (fullDays * mealsPerDay) + departureMeals;
        
        // Calculate total consumption
        let totalConsumption;
        let unit;
        
        if (foodType === 'grams') {
            totalConsumption = totalMeals * quantityPerMeal;
            unit = 'g';
        } else if (foodType === 'bags') {
            totalConsumption = totalMeals;
            unit = 'bolsitas';
        } else if (foodType === 'meatballs') {
            totalConsumption = totalMeals * quantityPerMeal;
            unit = 'bolitas';
        }
        
        // Calculate balance
        const balance = foodProvided - totalConsumption;
        let balanceText;
        let resultClass;
        let resultSummary;
        
        if (balance > 0) {
            balanceText = `Sobran ${balance} ${unit}`;
            resultClass = 'sobra';
            resultSummary = `✅ Sobran ${balance} ${unit}`;
        } else if (balance < 0) {
            balanceText = `Faltan ${Math.abs(balance)} ${unit}`;
            resultClass = 'falta';
            resultSummary = `❌ Faltan ${Math.abs(balance)} ${unit}`;
        } else {
            balanceText = 'Cantidad exacta';
            resultClass = 'exacto';
            resultSummary = '🟢 Cantidad exacta';
        }
        
        // Format dates using local timezone
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        // Usar la fecha local
        const localArrivalDate = new Date(arrivalDate.getTime() - (arrivalDate.getTimezoneOffset() * 60000));
        const localDepartureDate = new Date(departureDate.getTime() - (departureDate.getTimezoneOffset() * 60000));
        
        const arrivalDay = days[localArrivalDate.getUTCDay()];
        const arrivalDateNum = localArrivalDate.getUTCDate();
        const arrivalMonth = months[localArrivalDate.getUTCMonth()];
        
        const departureDay = days[localDepartureDate.getUTCDay()];
        const departureDateNum = localDepartureDate.getUTCDate();
        const departureMonth = months[localDepartureDate.getUTCMonth()];
        
        // Format full days
        let fullDaysText = '';
        if (fullDays > 0) {
            const fullDaysStart = new Date(arrivalDate);
            fullDaysStart.setDate(fullDaysStart.getDate() + 1);
            
            const fullDaysEnd = new Date(departureDate);
            fullDaysEnd.setDate(fullDaysEnd.getDate() - 1);
            
            if (fullDays === 1) {
                const day = days[fullDaysStart.getDay()];
                const date = fullDaysStart.getDate();
                const month = months[fullDaysStart.getMonth()];
                fullDaysText = `1 día (${day} ${date} de ${month})`;
            } else {
                const startDay = days[fullDaysStart.getDay()];
                const startDate = fullDaysStart.getDate();
                const startMonth = months[fullDaysStart.getMonth()];
                
                const endDay = days[fullDaysEnd.getDay()];
                const endDate = fullDaysEnd.getDate();
                const endMonth = months[fullDaysEnd.getMonth()];
                
                if (startMonth === endMonth) {
                    fullDaysText = `${fullDays} días (${startDay} ${startDate} al ${endDay} ${endDate} de ${startMonth})`;
                } else {
                    fullDaysText = `${fullDays} días (${startDay} ${startDate} de ${startMonth} al ${endDay} ${endDate} de ${endMonth})`;
                }
            }
        } else {
            fullDaysText = '0 días';
        }
        
        // Update result display
        document.getElementById('arrivalSummary').textContent = 
            `${arrivalDay} ${arrivalDateNum} de ${arrivalMonth} (${arrivalMeals} comida${arrivalMeals !== 1 ? 's' : ''})`;
        
        document.getElementById('departureSummary').textContent = 
            `${departureDay} ${departureDateNum} de ${departureMonth} (${departureMeals} comida${departureMeals !== 1 ? 's' : ''})`;
        
        document.getElementById('fullDaysSummary').textContent = fullDaysText;
        document.getElementById('totalDaysSummary').textContent = `${totalDays} días`;
        document.getElementById('totalMeals').textContent = `${totalMeals} comida${totalMeals !== 1 ? 's' : ''}`;
        document.getElementById('totalConsumption').textContent = `${totalConsumption} ${unit}`;
        document.getElementById('foodProvidedResult').textContent = `${foodProvided} ${unit}`;
        document.getElementById('balanceResult').textContent = balanceText;
        document.getElementById('balanceResult').className = `result-value ${resultClass}`;
        document.getElementById('resultSummary').textContent = resultSummary;
        
        // Build consumption details
        let consumptionHTML = `
            <div class="day-info">
                <span class="day-name">Día de llegada:</span>
                <span>${arrivalMeals} comida${arrivalMeals !== 1 ? 's' : ''} = ${foodType === 'grams' ? arrivalMeals * quantityPerMeal + 'g' : 
                     foodType === 'bags' ? arrivalMeals + ' bolsitas' : 
                     arrivalMeals * quantityPerMeal + ' bolitas'}</span>
            </div>
        `;
        
        if (fullDays > 0) {
            consumptionHTML += `
                <div class="day-info">
                    <span class="day-name">Días completos (${fullDays}):</span>
                    <span>${mealsPerDay} comida${mealsPerDay !== 1 ? 's' : ''}/día × ${fullDays} día${fullDays !== 1 ? 's' : ''} = 
                        ${foodType === 'grams' ? mealsPerDay * fullDays * quantityPerMeal + 'g' : 
                         foodType === 'bags' ? mealsPerDay * fullDays + ' bolsitas' : 
                         mealsPerDay * fullDays * quantityPerMeal + ' bolitas'}</span>
                </div>
            `;
        }
        
        consumptionHTML += `
            <div class="day-info">
                <span class="day-name">Día de salida:</span>
                <span>${departureMeals} comida${departureMeals !== 1 ? 's' : ''} = ${foodType === 'grams' ? departureMeals * quantityPerMeal + 'g' : 
                     foodType === 'bags' ? departureMeals + ' bolsitas' : 
                     departureMeals * quantityPerMeal + ' bolitas'}</span>
            </div>
        `;
        
        document.getElementById('consumptionDetails').innerHTML = consumptionHTML;
    }
});
