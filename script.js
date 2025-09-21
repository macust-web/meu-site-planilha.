// Cole aqui as suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcqvJ0pkjadnI_gkRmemnYyQYGzeah1UM",
  authDomain: "meu-site-planilha-12345.firebaseapp.com",
  projectId: "meu-site-planilha-12345",
  storageBucket: "meu-site-planilha-12345.firebasestorage.app",
  messagingSenderId: "899557528243",
  appId: "1:899557528243:web:bffe219d6ebfb0b8f396c6"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- LÓGICA PARA LER A PLANILHA ---
document.getElementById('upload-excel').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        displayTable(json);
    };

    reader.readAsArrayBuffer(file);
});

// --- LÓGICA PARA EXIBIR A TABELA ---
async function displayTable(data) {
    const container = document.getElementById('tabela-container');
    if (data.length === 0) {
        container.innerHTML = '<p>A planilha está vazia.</p>';
        return;
    }

    const table = document.createElement('table');
    
    // Cria o cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    data[0].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    // Adiciona a nova coluna de anotações no cabeçalho
    const thAnotacao = document.createElement('th');
    thAnotacao.textContent = 'Anotação (Salva na Nuvem)';
    headerRow.appendChild(thAnotacao);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Cria o corpo da tabela
    const tbody = document.createElement('tbody');
    for (let i = 1; i < data.length; i++) {
        const rowData = data[i];
        const tr = document.createElement('tr');

        // Cria um ID único para cada linha (usando o conteúdo da primeira célula)
        // IMPORTANTE: Assumindo que a primeira coluna tem um valor único por linha
        const rowId = String(rowData[0] || `linha-${i}`).replace(/[^a-zA-Z0-9]/g, '-');

        rowData.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            tr.appendChild(td);
        });

        // Adiciona a célula da anotação
        const tdAnotacao = document.createElement('td');
        
        const anotacaoInput = document.createElement('input');
        anotacaoInput.type = 'text';
        anotacaoInput.className = 'anotacao-input';
        anotacaoInput.id = `anotacao-${rowId}`;
        anotacaoInput.placeholder = 'Digite a anotação...';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Salvar';
        saveButton.className = 'salvar-anotacao-btn';
        saveButton.onclick = function() {
            salvarAnotacao(rowId);
        };

        tdAnotacao.appendChild(anotacaoInput);
        tdAnotacao.appendChild(saveButton);
        tr.appendChild(tdAnotacao);
        tbody.appendChild(tr);

        // Carrega a anotação existente para esta linha
        carregarAnotacao(rowId);
    }
    table.appendChild(tbody);

    container.innerHTML = ''; // Limpa o container
    container.appendChild(table);
}

// --- FUNÇÕES DO FIREBASE ---

// Função para salvar a anotação de uma linha específica
function salvarAnotacao(rowId) {
    const input = document.getElementById(`anotacao-${rowId}`);
    const texto = input.value;

    // Salva no Firestore usando o ID da linha como ID do documento
    db.collection('anotacoes').doc(rowId).set({
        texto: texto
    })
    .then(() => {
        console.log(`Anotação para ${rowId} salva com sucesso!`);
        input.style.backgroundColor = '#d4edda'; // Feedback visual de sucesso
        setTimeout(() => { input.style.backgroundColor = ''; }, 2000);
    })
    .catch((error) => {
        console.error("Erro ao salvar anotação: ", error);
        input.style.backgroundColor = '#f8d7da'; // Feedback visual de erro
    });
}

// Função para carregar a anotação de uma linha específica
function carregarAnotacao(rowId) {
    const input = document.getElementById(`anotacao-${rowId}`);
    
    db.collection('anotacoes').doc(rowId).get().then((doc) => {
        if (doc.exists) {
            input.value = doc.data().texto;
        } else {
            console.log(`Nenhuma anotação encontrada para ${rowId}`);
        }
    }).catch((error) => {
        console.error("Erro ao carregar anotação: ", error);
    });
}
