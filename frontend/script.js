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
    
    // URL del backend - USAR URL RELATIVA para producción
    const API_URL = window.location.origin; // Esto toma la URL actual
    
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
    
    // Mostrar estado de procesamiento
    function showProcessingState() {
        resultCard.style.display = 'block';
        detailsSection.style.display = 'block';
        
        resultCard.innerHTML = `
            <div class="result-header">
                <h3>Procesando...</h3>
            </div>
            <div class="result-body">
                <div class="spinner"></div>
                <p>Procesando cadena con ${selectedAutomata}...</p>
            </div>
        `;
        
        detailsSection.innerHTML = `
            <h3>Detalles del Procesamiento</h3>
            <p>Esperando resultados del servidor...</p>
        `;
    }
    
    // Mostrar resultado
    function showResult(result) {
        resultCard.innerHTML = `
            <div class="result-header">
                <h3>Resultado del Procesamiento</h3>
            </div>
            <div class="result-body">
                <p><strong>Cadena:</strong> ${result.input}</p>
                <p><strong>Autómata:</strong> ${result.automataType}</p>
                <p><strong>Estado:</strong> <span class="${result.success ? 'status-success' : 'status-error'}">
                    ${result.success ? 'VÁLIDO' : 'INVÁLIDO'}
                </span></p>
                <p><strong>Mensaje:</strong> ${result.message}</p>
            </div>
        `;
        
        if (result.details) {
            detailsSection.innerHTML = `
                <h3>Detalles del Procesamiento</h3>
                <pre>${JSON.stringify(result.details, null, 2)}</pre>
            `;
        }
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
            
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const result = await response.json();
            showResult(result);
            
        } catch (error) {
            console.error('Error:', error);
            
            // Resultado de respaldo si el backend falla
            showResult({
                input: stringToProcess,
                automataType: selectedAutomata,
                success: Math.random() > 0.5, // Simulación
                message: error.message || 'Error al conectar con el servidor',
                details: { error: error.toString() }
            });
        }
    }
});
