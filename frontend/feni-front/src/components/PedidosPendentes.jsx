import React from 'react';
import PedidoCard from './PedidoCard';

const PedidosPendentes = ({ pedidos, pedidosEntreguesCount, onMarcarComoEntregue }) => {
  return (
    <div className="pedidos-section">
      <div className="section-title">
        📋 Pedidos Pendentes
      </div>
      <div className="stats">
        <div className="stat-item">
          <div className="stat-number">{pedidos.length}</div>
          <div className="stat-label">Pedidos Ativos</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{pedidosEntreguesCount}</div>
          <div className="stat-label">Entregues Hoje</div>
        </div>
      </div>
      <div id="pedidos-container">
        {pedidos.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem' }}>📱</div>
            <h3>Aguardando mensagens do WhatsApp</h3>
            <p>Os pedidos aparecerão aqui automaticamente quando chegarem via N8N</p>
          </div>
        ) : (
          pedidos.map((pedido, index) => (
            <PedidoCard 
              key={pedido.cliente + index} 
              pedido={pedido} 
              onMarcarComoEntregue={onMarcarComoEntregue} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PedidosPendentes;