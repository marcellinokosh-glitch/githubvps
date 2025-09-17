const mongoose = require('mongoose');
const uri = 'mongodb+srv://Vicieu:VicieuBot11@cluster0.imbjid9.mongodb.net/?retryWrites=true&w=majority';

console.log('Tentative de connexion MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err);
    process.exit(1);
  });
