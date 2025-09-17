// src/config/upload.js
const multer = require('multer');
const path = require('path');

// Define o diretório onde as imagens serão salvas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // O diretório 'static/uploads' deve existir
    cb(null, 'static/uploads/');
  },
  filename: (req, file, cb) => {
    // Cria um nome de arquivo único para evitar sobrescrever
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;