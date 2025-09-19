import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import './App.css';

import Header from './components/Header';
import PedidosPendentes from './components/PedidosPendentes';
import PedidosEntregues from './components/PedidosEntregues';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [pedidosEntregues, setPedidosEntregues] = useState([]);
  // 1. Estado para controlar o feedback visual de carregamento
  const [isLoading, setIsLoading] = useState(false);

  // 2. A lógica de busca foi extraída para uma função reutilizável
  const fetchPedidos = async () => {
    // Não busca se já estiver buscando, para evitar chamadas duplicadas
    if (isLoading) return; 
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pedidos`);
      const data = await response.json();
      setPedidosPendentes(data.pedidos || []);
      setPedidosEntregues(data.entregues || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false); // Garante que o loading termine, mesmo em caso de erro
    }
  };

  // 3. Efeito para a busca inicial e o polling (busca a cada 15 segundos)
  useEffect(() => {
    // Busca os dados imediatamente quando o componente é montado
    fetchPedidos();

    // Configura um intervalo para chamar a função a cada 15 segundos
    const intervalId = setInterval(fetchPedidos, 15000); // 15000 ms = 15s

    // Função de limpeza: remove o intervalo quando o componente é desmontado para evitar vazamento de memória
    return () => clearInterval(intervalId);
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez (na montagem)

  // Efeito para se conectar ao Pusher e ouvir por atualizações em tempo real
  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('pedidos-channel');

    channel.bind('pedido_update', (data) => {
      console.log('Recebido evento do Pusher:', data);
      setPedidosPendentes(data.pedidos || []);
      setPedidosEntregues(data.entregues || []);
    });

    return () => {
      pusher.unsubscribe('pedidos-channel');
      pusher.disconnect();
    };
  }, []); // Roda apenas uma vez

  const marcarComoEntregue = (cliente) => {
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
      
      {/* 4. Botão de atualização manual */}
      <div className="refresh-container">
        <button onClick={fetchPedidos} disabled={isLoading} className="refresh-button">
          {isLoading ? 'Atualizando...' : 'Atualizar Pedidos'}
        </button>
      </div>

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
