const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📌 SERVIR FRONTEND ESTÁTICO (PRIMERO, antes de otras rutas)
app.use(express.static(path.join(__dirname, '../frontend')));

// 📌 RUTA PRINCIPAL - SIEMPRE sirve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 📌 SI ALGUIEN ACCEDE A /index.html también
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rutas de API
app.get('/api/automata/types', (req, res) => {
    console.log('GET /api/automata/types recibido');
    res.json({ 
        types: ['DFA', 'NFA', 'PDA', 'TM'],
        message: 'Tipos de autómatas disponibles'
    });
});

app.post('/api/automata/process', (req, res) => {
    console.log('POST /api/automata/process recibido', req.body);
    res.json({ 
        success: true,
        message: 'Autómata procesado correctamente',
        data: req.body
    });
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Automata System Backend',
        frontend: 'Available at /',
        api: 'Available at /api/automata/*',
        timestamp: new Date().toISOString() 
    });
});

// Para debug: mostrar todas las rutas disponibles
app.get('/routes', (req, res) => {
    res.json({
        routes: [
            'GET  /                 → Frontend (index.html)',
            'GET  /health          → Health check',
            'GET  /api/automata/types → Tipos de autómatas',
            'POST /api/automata/process → Procesar cadena'
        ]
    });
});

// Manejo de errores 404 - solo para API, no para archivos estáticos
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Ruta API no encontrada' });
});

// Para cualquier otra ruta que no sea /api, intenta servir archivo estático
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor backend corriendo en puerto ${PORT}`);
    console.log(`🌐 Frontend disponible en: http://localhost:${PORT}/`);
    console.log(`🔌 API disponible en: http://localhost:${PORT}/api/automata/types`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Debug routes: http://localhost:${PORT}/routes`);
});
