const firebaseConfig = {
  apiKey: "AIzaSyAcqvJ0pkjadnI_gkRmemnYyQYGzeah1UM",
  authDomain: "meu-site-planilha-12345.firebaseapp.com",
  projectId: "meu-site-planilha-12345",
  storageBucket: "meu-site-planilha-12345.firebasestorage.app",
  messagingSenderId: "899557528243",
  appId: "1:899557528243:web:bffe219d6ebfb0b8f396c6"
};

// =================================================================
// O RESTANTE DO CÓDIGO (não precisa alterar )
// =================================================================

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- LÓGICA PARA O CAMPO EDITÁVEL (FIREBASE) ---

// Referência ao nosso documento no banco de dados
const docRef = db.collection('anotacoes').doc('principal');

// Elementos da página
const campoEditavel = document.getElementById('campo-editavel');
const botaoSalvar = document.getElementById('salvar-info');
const statusSalvamento = document.getElementById('status-salvamento');

// Função para salvar a anotação no Firebase
botaoSalvar.addEventListener('click', () => {
  const textoParaSalvar = campoEditavel.value;
  statusSalvamento.textContent = 'Salvando...';

  docRef.set({ texto: textoParaSalvar })
    .then(() => {
      statusSalvamento.textContent = 'Salvo com sucesso!';
      setTimeout(() => { statusSalvamento.textContent = ''; }, 3000); // Limpa a mensagem depois de 3 segundos
    })
    .catch((error) => {
      console.error("Erro ao salvar: ", error);
      statusSalvamento.textContent = 'Erro ao salvar.';
    });
});

// Função para carregar a anotação do Firebase assim que a página abre
docRef.onSnapshot((doc) => {
  if (doc.exists) {
    campoEditavel.value = doc.data().texto;
  } else {
    console.log("Nenhum documento encontrado!");
  }
});

// --- LÓGICA PARA O UPLOAD DA PLANILHA (SHEETJS) ---

const uploadExcel = document.getElementById('upload-excel');

uploadExcel.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Pega a primeira planilha do arquivo
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Converte a planilha para um formato de tabela HTML
    const htmlTable = XLSX.utils.sheet_to_html(worksheet);

    // Mostra a tabela na página
    document.getElementById('tabela-container').innerHTML = htmlTable;
  };

  reader.readAsArrayBuffer(file);
});
