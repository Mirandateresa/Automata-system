const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta para procesar autómata Par/Impar
app.post('/api/automata/process', (req, res) => {
  try {
    const { input, automataType } = req.body;
    
    if (!input || !automataType) {
      return res.status(400).json({ error: 'Se requiere input y tipo de autómata' });
    }
    
    let result;
    
    // Usando estructura SWITCH (CASE) para seleccionar el autómata
    switch(automataType) {
      case 'par_impar':
        result = checkParImpar(input);
        break;
      case 'binario':
        result = checkBinarioValido(input);
        break;
      case 'vocales':
        result = checkSecuenciaVocales(input);
        break;
      case 'custom':
        result = procesarCadenaCustom(input);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de autómata no válido' });
    }
    
    res.json({
      success: true,
      input: input,
      automataType: automataType,
      result: result
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el procesamiento del autómata' });
  }
});

// Autómata 1: Determina si la cantidad de 1s es par o impar
function checkParImpar(cadena) {
  let estado = 0; // 0 = par, 1 = impar
  let i = 0;
  
  // Usando estructura WHILE para recorrer la cadena
  while (i < cadena.length) {
    const simbolo = cadena[i];
    
    // Usando estructura CASE para las transiciones
    switch(estado) {
      case 0: // Estado par
        if (simbolo === '1') estado = 1; // Cambia a impar
        break;
      case 1: // Estado impar
        if (simbolo === '1') estado = 0; // Cambia a par
        break;
    }
    i++;
  }
  
  return {
    aceptada: true,
    mensaje: estado === 0 ? 
      `La cantidad de 1s en "${cadena}" es PAR` : 
      `La cantidad de 1s en "${cadena}" es IMPAR`,
    estadoFinal: estado === 0 ? 'Par' : 'Impar'
  };
}

// Autómata 2: Verifica si una cadena es binaria válida
function checkBinarioValido(cadena) {
  let estado = 'q0';
  let i = 0;
  
  while (i < cadena.length) {
    const simbolo = cadena[i];
    
    switch(estado) {
      case 'q0':
        if (simbolo === '0' || simbolo === '1') {
          estado = 'q1';
        } else {
          estado = 'q_error';
        }
        break;
      case 'q1':
        if (simbolo === '0' || simbolo === '1') {
          estado = 'q1';
        } else {
          estado = 'q_error';
        }
        break;
      case 'q_error':
        break;
    }
    i++;
  }
  
  const aceptada = estado === 'q1';
  return {
    aceptada: aceptada,
    mensaje: aceptada ? 
      `"${cadena}" es una cadena binaria VÁLIDA` : 
      `"${cadena}" NO es una cadena binaria válida`,
    estadoFinal: estado
  };
}

// Autómata 3: Verifica secuencia específica de vocales
function checkSecuenciaVocales(cadena) {
  let estado = 0;
  let i = 0;
  const cadenaLower = cadena.toLowerCase();
  
  while (i < cadenaLower.length) {
    const simbolo = cadenaLower[i];
    
    switch(estado) {
      case 0:
        if (simbolo === 'a') estado = 1;
        else estado = -1;
        break;
      case 1:
        if (simbolo === 'e') estado = 2;
        else estado = -1;
        break;
      case 2:
        if (simbolo === 'i') estado = 3;
        else estado = -1;
        break;
      case 3:
        break;
      case -1:
        break;
    }
    i++;
    if (estado === -1) break;
  }
  
  const aceptada = estado === 3;
  return {
    aceptada: aceptada,
    mensaje: aceptada ? 
      `"${cadena}" sigue la secuencia 'a' -> 'e' -> 'i'` : 
      `"${cadena}" NO sigue la secuencia 'a' -> 'e' -> 'i'`,
    estadoFinal: estado
  };
}

// Autómata 4: Autómata personalizado
function procesarCadenaCustom(cadena) {
  let estado = 'A';
  let i = 0;
  let pasos = [];
  
  while (i < cadena.length) {
    const simbolo = cadena[i];
    const estadoAnterior = estado;
    
    switch(estado) {
      case 'A':
        if (simbolo === 'x') estado = 'B';
        else if (simbolo === 'y') estado = 'C';
        else estado = 'ERROR';
        break;
      case 'B':
        if (simbolo === 'x') estado = 'A';
        else if (simbolo === 'y') estado = 'D';
        else estado = 'ERROR';
        break;
      case 'C':
        if (simbolo === 'x') estado = 'D';
        else if (simbolo === 'y') estado = 'A';
        else estado = 'ERROR';
        break;
      case 'D':
        if (simbolo === 'x' || simbolo === 'y') estado = 'D';
        else estado = 'ERROR';
        break;
      case 'ERROR':
        break;
    }
    
    pasos.push({
      paso: i + 1,
      simbolo: simbolo,
      estadoAnterior: estadoAnterior,
      estadoNuevo: estado,
      transicion: `${estadoAnterior} -> ${estado}`
    });
    
    i++;
    if (estado === 'ERROR') break;
  }
  
  const aceptada = estado === 'A' || estado === 'D';
  return {
    aceptada: aceptada,
    mensaje: aceptada ? 
      `"${cadena}" es ACEPTADA (estado final: ${estado})` : 
      `"${cadena}" es RECHAZADA`,
    estadoFinal: estado,
    pasos: pasos,
    totalPasos: pasos.length
  };
}

// Ruta para obtener información de los autómatas
app.get('/api/automata/types', (req, res) => {
  const automataTypes = [
    { id: 'par_impar', name: 'Par/Impar', description: 'Determina si la cantidad de 1s es par o impar' },
    { id: 'binario', name: 'Binario Válido', description: 'Verifica si la cadena es binaria (solo 0s y 1s)' },
    { id: 'vocales', name: 'Secuencia de Vocales', description: 'Verifica secuencias específicas de vocales' },
    { id: 'custom', name: 'Autómata Personalizado', description: 'Procesa cadenas con un autómata definido' }
  ];
  
  res.json(automataTypes);
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend de Autómatas funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📁 Rutas disponibles:`);
  console.log(`   - GET  /api/automata/types`);
  console.log(`   - POST /api/automata/process`);
});
