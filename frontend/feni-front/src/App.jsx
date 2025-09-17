// frontend/feni-front/src/App.jsx

import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js'; // 1. Importe o Pusher
import './App.css';

import Header from './components/Header';
import PedidosPendentes from './components/PedidosPendentes';
import PedidosEntregues from './components/PedidosEntregues';

// 2. Pegue a URL da API das variáveis de ambiente
// Lembre-se de criar um arquivo .env na raiz do frontend para desenvolvimento local
// VITE_API_URL=http://127.0.0.1:3000
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [pedidosEntregues, setPedidosEntregues] = useState([]);

  // 3. Efeito para buscar os dados iniciais quando o componente monta
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const response = await fetch(`${API_URL}/api/pedidos`);
        const data = await response.json();
        setPedidosPendentes(data.pedidos || []);
        setPedidosEntregues(data.entregues || []);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
      }
    }

    fetchInitialData();
  }, []); // Executa apenas uma vez

  // 4. Efeito para se conectar ao Pusher e ouvir por atualizações
  useEffect(() => {
    // A Vercel injetará as variáveis de ambiente em produção.
    // Para desenvolvimento local, crie um arquivo .env
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    // Se inscreve no canal que definimos no backend
    const channel = pusher.subscribe('pedidos-channel');

    // Ouve pelo evento que definimos no backend
    channel.bind('pedido_update', (data) => {
      console.log('Recebido evento do Pusher:', data);
      setPedidosPendentes(data.pedidos || []);
      setPedidosEntregues(data.entregues || []);
    });

    // Limpa a conexão quando o componente é desmontado
    return () => {
      pusher.unsubscribe('pedidos-channel');
      pusher.disconnect();
    };
  }, []); // Executa apenas uma vez

  const marcarComoEntregue = (cliente) => {
    // 5. Use a variável de ambiente na sua chamada fetch
    fetch(`${API_URL}/api/webhook/pedido`, {
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
        // O estado será atualizado automaticamente pelo evento do Pusher, não precisa de lógica aqui
      } else {
        console.error('Falha ao marcar pedido como entregue.');
      }
    })
    .catch(error => {
      console.error('Erro ao marcar pedido como entregue:', error);
    });
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <PedidosPendentes 
          pedidos={pedidosPendentes} 
          pedidosEntreguesCount={pedidosEntregues.length} 
          onMarcarComoEntregue={marcarComoEntregue}
        />
        <PedidosEntregues 
          pedidos={pedidosEntregues} 
        />
      </div>
    </div>
  );
}

export default App;