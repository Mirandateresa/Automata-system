document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputString = document.getElementById('inputString');
    const processBtn = document.getElementById('processBtn');
    const resultCard = document.getElementById('resultCard');
    const detailsSection = document.getElementById('detailsSection');
    const automataOptions = document.getElementById('automataOptions');
    const exampleButtons = document.querySelectorAll('.btn-example');
    
    // Estado de la aplicación
    let selectedAutomata = 'par_impar';
    let automataTypes = [];
    
    // URL del backend
    const API_URL = 'http://localhost:3000';
    
    // Inicializar la aplicación
    init();
    
    // Función de inicialización
    async function init() {
        // Cargar tipos de autómatas desde el backend
        await loadAutomataTypes();
        
        // Establecer eventos
        setupEventListeners();
        
        // Seleccionar el primer autómata por defecto
        selectAutomata(selectedAutomata);
    }
    
    // Cargar tipos de autómatas desde el backend
    async function loadAutomataTypes() {
        try {
            const response = await fetch(`${API_URL}/api/automata/types`);
            if (!response.ok) throw new Error('Error al cargar tipos de autómatas');
            
            automataTypes = await response.json();
            renderAutomataOptions();
        } catch (error) {
            console.error('Error:', error);
            // Datos de respaldo en caso de que el backend no esté disponible
            automataTypes = [
                { id: 'par_impar', name: 'Par/Impar', description: 'Determina si la cantidad de 1s es par o impar' },
                { id: 'binario', name: 'Binario Válido', description: 'Verifica si la cadena es binaria (solo 0s y 1s)' },
                { id: 'vocales', name: 'Secuencia de Vocales', description: 'Verifica secuencias específicas de vocales' },
                { id: 'custom', name: 'Autómata Personalizado', description: 'Procesa cadenas con un autómata definido' }
            ];
            renderAutomataOptions();
        }
    }
    
    // Renderizar opciones de autómatas
    function renderAutomataOptions() {
        automataOptions.innerHTML = '';
        
        automataTypes.forEach(automata => {
            const icon = getAutomataIcon(automata.id);
            const optionElement = document.createElement('div');
            optionElement.className = `automata-option ${automata.id === selectedAutomata ? 'selected' : ''}`;
            optionElement.dataset.id = automata.id;
            
            optionElement.innerHTML = `
                <div class="automata-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="automata-info">
                    <h3>${automata.name}</h3>
                    <p>${automata.description}</p>
                </div>
            `;
            
            optionElement.addEventListener('click', () => selectAutomata(automata.id));
            automataOptions.appendChild(optionElement);
        });
    }
    
    // Obtener icono para cada tipo de autómata
    function getAutomataIcon(automataId) {
        switch(automataId) {
            case 'par_impar': return 'fas fa-divide';
            case 'binario': return 'fas fa-digital-tachograph';
            case 'vocales': return 'fas fa-font';
            case 'custom': return 'fas fa-project-diagram';
            default: return 'fas fa-robot';
        }
    }
    
    // Seleccionar autómata
    function selectAutomata(automataId) {
        selectedAutomata = automataId;
        
        // Actualizar interfaz
        document.querySelectorAll('.automata-option').forEach(option => {
            if (option.dataset.id === automataId) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    // Configurar eventos
    function setupEventListeners() {
        // Botón de procesar
        processBtn.addEventListener('click', processString);
        
        // Enter en el input
        inputString.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                processString();
            }
        });
        
        // Botones de ejemplo
        exampleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const exampleString = this.dataset.example;
                inputString.value = exampleString;
                processString();
            });
        });
    }
    
    // Procesar cadena con el autómata seleccionado
    async function processString() {
        const stringToProcess = inputString.value.trim();
        
        if (!stringToProcess) {
            alert('Por favor, ingresa una cadena para procesar');
            return;
        }
        
        // Mostrar estado de procesamiento
        showProcessingState();
        
        try {
            // Enviar solicitud al backend
            const response = await fetch(`${API_URL}/api/automata/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: stringToProcess,
                    automataType: selectedAutomata
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }
            
            const result = await response.json();
            
            // Mostrar resultados
            showResults(result);
            
        } catch (error) {
            console.error('Error:', error);
            
            // Mostrar error al usuario
            resultCard.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff3333; margin-bottom: 15px;"></i>
                    <h3>Error de conexión</h3>
                    <p>No se pudo conectar con el backend. Asegúrate de que el servidor esté ejecutándose en http://localhost:3000</p>
                    <p style="margin-top: 10px; font-size: 0.9rem;">Error: ${error.message}</p>
                </div>
            `;
            
            detailsSection.innerHTML = `
                <h3><i class="fas fa-info-circle"></i> Solución</h3>
                <p>Por favor, verifica que:</p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>El backend esté ejecutándose</li>
                    <li>La terminal muestre el mensaje "Servidor backend corriendo en http://localhost:3000"</li>
                    <li>Puedas acceder a <a href="http://localhost:3000" target="_blank">http://localhost:3000</a> en tu navegador</li>
                </ol>
            `;
        }
    }
    
    // Mostrar estado de procesamiento
    function showProcessingState() {
        resultCard.innerHTML = `
            <div class="processing-state">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #ff66b2; margin-bottom: 15px;"></i>
                <h3>Procesando cadena...</h3>
                <p>Ejecutando autómata con estructuras CASE y WHILE</p>
            </div>
        `;
        
        detailsSection.innerHTML = '';
    }
    
    // Mostrar resultados
    function showResults(data) {
        if (!data.success) {
            resultCard.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff3333; margin-bottom: 15px;"></i>
                    <h3>Error en el procesamiento</h3>
                    <p>${data.error || 'Ocurrió un error al procesar la cadena'}</p>
                </div>
            `;
            return;
        }
        
        const result = data.result;
        const isAccepted = result.aceptada;
        
        resultCard.innerHTML = `
            <div class="result-content">
                <div class="result-header">
                    <h3>Resultado del Autómata</h3>
                    <div class="result-status ${isAccepted ? 'status-accepted' : 'status-rejected'}">
                        <i class="fas fa-${isAccepted ? 'check-circle' : 'times-circle'}"></i>
                        <span>${isAccepted ? 'CADENA ACEPTADA' : 'CADENA RECHAZADA'}</span>
                    </div>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">Cadena procesada:</span>
                        <span class="detail-value">"${data.input}"</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Autómata utilizado:</span>
                        <span class="detail-value">${getAutomataName(data.automataType)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estado final:</span>
                        <span class="detail-value">${result.estadoFinal}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mensaje:</span>
                        <span class="detail-value">${result.mensaje}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Mostrar detalles del procesamiento si están disponibles
        if (result.pasos && result.pasos.length > 0) {
            renderProcessingDetails(result);
        } else {
            detailsSection.innerHTML = `
                <h3><i class="fas fa-list-ol"></i> Información de Procesamiento</h3>
                <p>El autómata procesó la cadena en ${data.input.length} paso(s) utilizando estructuras WHILE y CASE.</p>
                <p>La cadena fue analizada símbolo por símbolo hasta llegar al estado final: <strong>${result.estadoFinal}</strong></p>
            `;
        }
    }
    
    // Renderizar detalles del procesamiento (pasos)
    function renderProcessingDetails(result) {
        let stepsHTML = `
            <h3><i class="fas fa-list-ol"></i> Detalles del Procesamiento (${result.totalPasos} pasos)</h3>
            <table class="steps-table">
                <thead>
                    <tr>
                        <th>Paso</th>
                        <th>Símbolo</th>
                        <th>Estado Anterior</th>
                        <th>Estado Nuevo</th>
                        <th>Transición</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        result.pasos.forEach(paso => {
            stepsHTML += `
                <tr>
                    <td>${paso.paso}</td>
                    <td><strong>${paso.simbolo}</strong></td>
                    <td>${paso.estadoAnterior}</td>
                    <td>${paso.estadoNuevo}</td>
                    <td>${paso.transicion}</td>
                </tr>
            `;
        });
        
        stepsHTML += `
                </tbody>
            </table>
        `;
        
        detailsSection.innerHTML = stepsHTML;
    }
    
    // Obtener nombre del autómata por ID
    function getAutomataName(automataId) {
        const automata = automataTypes.find(a => a.id === automataId);
        return automata ? automata.name : automataId;
    }
});
