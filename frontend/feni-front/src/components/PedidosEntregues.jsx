import React from 'react';

const PedidosEntregues = ({ pedidos }) => {
  return (
    <div className="entregues-section">
      <div className="section-title">
        ✅ Entregues
      </div>
      <div id="entregues-container">
        {pedidos.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem' }}>📦</div>
            <p>Pedidos entregues aparecerão aqui</p>
          </div>
        ) : (
          pedidos.slice(0, 10).map((pedido, index) => (
            <div key={pedido.cliente + index} className="pedido-entregue">
              <div className="cliente-nome">✅ {pedido.cliente}</div>
              <div style={{ margin: '10px 0', color: '#3f3f3fff' }}>
                <strong>Pedido:</strong> {pedido.pedido}
              </div>
              <div className="timestamp" style={{ color: '#3f3f3fff'}}>
                Entregue em: {new Date(pedido.dataEntrega).toLocaleString('pt-BR')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PedidosEntregues;