// Variáveis globais
let people = [];
let items = [];

// Elementos DOM
const personNameInput = document.getElementById('person-name');
const addPersonBtn = document.getElementById('add-person');
const peopleList = document.getElementById('people-list');
const itemNameInput = document.getElementById('item-name');
const itemValueInput = document.getElementById('item-value');
const participantsCheckbox = document.getElementById('participants-checkbox');
const addItemBtn = document.getElementById('add-item');
const itemsList = document.getElementById('items-list');
const calculateBtn = document.getElementById('calculate');
const resultsDiv = document.getElementById('results');
const clearAllBtn = document.getElementById('clear-all');

// Adicionar pessoa
addPersonBtn.addEventListener('click', () => {
    const name = personNameInput.value.trim();
    if (name && !people.includes(name)) {
        people.push(name);
        personNameInput.value = '';
        renderPeopleList();
        updateParticipantsCheckbox();
    }
});

// Renderizar lista de pessoas
function renderPeopleList() {
    peopleList.innerHTML = '';
    people.forEach(person => {
        const personDiv = document.createElement('div');
        personDiv.className = 'person-tag';
        personDiv.innerHTML = `
            <span>${person}</span>
            <button class="delete-btn" data-name="${person}">Remover</button>
        `;
        peopleList.appendChild(personDiv);
    });
    
    // Adicionar event listeners aos botões de remover
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = e.target.getAttribute('data-name');
            people = people.filter(p => p !== name);
            renderPeopleList();
            updateParticipantsCheckbox();
            // Remover pessoa dos itens existentes
            items.forEach(item => {
                item.participants = item.participants.filter(p => p !== name);
            });
            renderItemsList();
        });
    });
}

// Atualizar checkboxes de participantes
function updateParticipantsCheckbox() {
    participantsCheckbox.innerHTML = '';
    people.forEach(person => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox-item';
        checkboxDiv.innerHTML = `
            <input type="checkbox" id="participant-${person}" value="${person}" checked>
            <label for="participant-${person}">${person}</label>
        `;
        participantsCheckbox.appendChild(checkboxDiv);
    });
}

// Adicionar item
addItemBtn.addEventListener('click', () => {
    const name = itemNameInput.value.trim();
    const value = parseFloat(itemValueInput.value);
    
    if (name && !isNaN(value) && value > 0) {
        // Obter participantes selecionados
        const selectedParticipants = [];
        document.querySelectorAll('#participants-checkbox input:checked').forEach(checkbox => {
            selectedParticipants.push(checkbox.value);
        });
        
        if (selectedParticipants.length > 0) {
            items.push({
                name,
                value,
                participants: selectedParticipants
            });
            
            itemNameInput.value = '';
            itemValueInput.value = '';
            renderItemsList();
        } else {
            alert('Selecione pelo menos um participante para este item.');
        }
    }
});

// Renderizar lista de itens
function renderItemsList() {
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-row';
        itemDiv.innerHTML = `
            <div>
                <strong>${item.name}</strong> - R$ ${item.value.toFixed(2)}
                <div style="font-size: 0.8em; color: #666;">Participantes: ${item.participants.join(', ')}</div>
            </div>
            <button class="delete-btn" data-index="${index}">Remover</button>
        `;
        itemsList.appendChild(itemDiv);
    });
    
    // Adicionar event listeners aos botões de remover
    document.querySelectorAll('.item-row .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            items.splice(index, 1);
            renderItemsList();
        });
    });
}

// Calcular rateio (função modificada)
calculateBtn.addEventListener('click', () => {
    if (people.length === 0 || items.length === 0) {
        alert('Adicione pelo menos uma pessoa e um item para calcular o rateio.');
        return;
    }
    
    const includeTax = document.getElementById('include-service-tax').checked;
    
    // Inicializar totais por pessoa
    const totals = {};
    const baseTotals = {}; // Armazenar valores sem taxa
    people.forEach(person => {
        totals[person] = 0;
        baseTotals[person] = 0;
    });
    
    // Calcular contribuição de cada item
    items.forEach(item => {
        const valuePerPerson = item.value / item.participants.length;
        item.participants.forEach(person => {
            baseTotals[person] += valuePerPerson;
        });
    });
    
    // Aplicar taxa de serviço se necessário
    for (const person in baseTotals) {
        totals[person] = includeTax ? baseTotals[person] * 1.1 : baseTotals[person];
    }
    
    // Exibir resultados
    resultsDiv.innerHTML = '';
    
    // Adicionar informação sobre taxa se aplicável
    if (includeTax) {
        const taxInfo = document.createElement('div');
        taxInfo.className = 'service-tax-info';
        taxInfo.innerHTML = 'Valores incluem <span class="tax-amount">10% de taxa de serviço</span>';
        resultsDiv.appendChild(taxInfo);
    }
    
    for (const person in totals) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        
        let valueDisplay = `R$ ${totals[person].toFixed(2)}`;
        if (includeTax) {
            valueDisplay += ` <span class="service-tax-info">(R$ ${baseTotals[person].toFixed(2)} + R$ ${(baseTotals[person] * 0.1).toFixed(2)})</span>`;
        }
        
        resultDiv.innerHTML = `
            <span>${person}:</span>
            <span class="highlight">${valueDisplay}</span>
        `;
        resultsDiv.appendChild(resultDiv);
    }
    
    // Adicionar total geral
    const baseTotal = Object.values(baseTotals).reduce((sum, value) => sum + value, 0);
    const total = includeTax ? baseTotal * 1.1 : baseTotal;
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'result-item';
    totalDiv.style.marginTop = '20px';
    totalDiv.style.fontWeight = 'bold';
    
    let totalDisplay = `R$ ${total.toFixed(2)}`;
    if (includeTax) {
        totalDisplay += ` <span class="service-tax-info">(R$ ${baseTotal.toFixed(2)} + R$ ${(baseTotal * 0.1).toFixed(2)})</span>`;
    }
    
    totalDiv.innerHTML = `
        <span>Total geral:</span>
        <span>${totalDisplay}</span>
    `;
    resultsDiv.appendChild(totalDiv);
});

// Limpar tudo
clearAllBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Isso não pode ser desfeito.')) {
        // Limpar arrays
        people = [];
        items = [];
        
        // Limpar inputs
        personNameInput.value = '';
        itemNameInput.value = '';
        itemValueInput.value = '';
        
        // Limpar listas
        peopleList.innerHTML = '';
        itemsList.innerHTML = '';
        resultsDiv.innerHTML = '';
        
        // Atualizar checkboxes
        updateParticipantsCheckbox();
    }
});