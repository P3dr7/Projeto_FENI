// Remova as declarações de pedidos e entregues, pois o backend as gerenciará
// let pedidos = [];
// let entregues = [];

// Funções de simulação não são mais necessárias, pois o backend enviará os dados.
// Você pode remover ou comentar as funções:
// simularMensagem()
// processarMensagemN8N()

// A função adicionarPedido não será mais usada, pois o backend enviará o estado completo.
// Você pode remover ou comentar a função adicionarPedido()

// Funções para renderizar e atualizar estatísticas permanecem as mesmas
function renderizarPedidos() {
    const container = document.getElementById('pedidos-container');

    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 3rem;">📱</div>
                <h3>Aguardando mensagens do WhatsApp</h3>
                <p>Os pedidos aparecerão aqui automaticamente quando chegarem via N8N</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pedidos.map(pedido => `
        <div class="pedido-card">
            <div class="pedido-header">
                <div class="cliente-nome">👤 ${pedido.cliente}</div>
            </div>
            
            <div class="pedido-info">
                <div class="info-item">
                    <div class="info-label">Pedido</div>
                    <div class="info-value">🍞 ${pedido.pedido}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Entrega</div>
                    <div class="info-value">🚚 ${pedido.entrega}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Contato</div>
                    <div class="info-value">📞 ${pedido.telefone}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Recebido</div>
                    <div class="info-value">⏰ ${new Date(pedido.timestamp).toLocaleString('pt-BR')}</div>
                </div>
            </div>
            
            <button class="btn-entregue" onclick="marcarComoEntregue('${pedido.cliente}')">
                ✅ Marcar como Entregue
            </button>
        </div>
    `).join('');
}

// Essa função precisa ser alterada para comunicar com o backend
function marcarComoEntregue(cliente) {
    fetch('http://localhost:3000/api/webhook/pedido', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cliente: cliente,
            tipo: 'pedido_entregue'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Pedido marcado como entregue com sucesso!');
        }
    })
    .catch(error => {
        console.error('Erro ao marcar pedido como entregue:', error);
    });
}


function renderizarEntregues() {
    const container = document.getElementById('entregues-container');

    if (entregues.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 2rem;">📦</div>
                <p>Pedidos entregues aparecerão aqui</p>
            </div>
        `;
        return;
    }

    container.innerHTML = entregues.slice(0, 10).map(pedido => `
        <div class="pedido-entregue">
            <div class="cliente-nome">✅ ${pedido.cliente}</div>
            <div style="margin: 10px 0;">
                <strong>Pedido:</strong> ${pedido.pedido}
            </div>
            <div class="timestamp">
                Entregue em: ${new Date(pedido.dataEntrega).toLocaleString('pt-BR')}
            </div>
        </div>
    `).join('');
}

function atualizarStats() {
    document.getElementById('pedidos-count').textContent = pedidos.length;
    document.getElementById('entregues-count').textContent = entregues.length;
}

// --- Esta é a parte mais importante para a mudança ---
function setupWebSocket() {
    // Conecta ao servidor Socket.IO
    const socket = io('http://localhost:3000');

    // Ouve o evento 'pedido_update'
    socket.on('pedido_update', (data) => {
        console.log('Dados atualizados recebidos:', data);
        
        // Atualiza os estados globais do frontend com os dados do backend
        pedidos = data.pedidos;
        entregues = data.entregues;

        // Renderiza as listas e estatísticas com os novos dados
        renderizarPedidos();
        renderizarEntregues();
        atualizarStats();
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setupWebSocket();
});