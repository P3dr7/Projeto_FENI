import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

import Header from './components/Header';
import PedidosPendentes from './components/PedidosPendentes';
import PedidosEntregues from './components/PedidosEntregues';


function App() {
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [pedidosEntregues, setPedidosEntregues] = useState([]);

  useEffect(() => {
    const socket = io('http://127.0.0.1:3000');

    socket.on('pedido_update', (data) => {
      setPedidosPendentes(data.pedidos);
      setPedidosEntregues(data.entregues);
    });

    return () => socket.disconnect();
  }, []);

  const marcarComoEntregue = (cliente) => {
    fetch('http://127.0.0.1:3000/api/webhook/pedido', {
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