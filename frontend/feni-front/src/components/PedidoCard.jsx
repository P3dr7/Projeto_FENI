import React from 'react';

const PedidoCard = ({ pedido, onMarcarComoEntregue }) => {
  return (
    <div className="pedido-card">
      <div className="pedido-header">
        <div className="cliente-nome">👤 {pedido.cliente}</div>
      </div>
      
      <div className="pedido-info">
        <div className="info-item">
          <div className="info-label">Pedido</div>
          <div className="info-value">🍞 {pedido.pedido}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Entrega</div>
          <div className="info-value">🚚 {pedido.entrega}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Recebido</div>
          <div className="info-value">⏰ {new Date(pedido.timestamp).toLocaleString('pt-BR')}</div>
        </div>
      </div>
      
      <button 
        className="btn-entregue" 
        onClick={() => onMarcarComoEntregue(pedido.cliente)}
      >
        ✅ Marcar como Entregue
      </button>
    </div>
  );
};

export default PedidoCard;