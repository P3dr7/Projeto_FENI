import React from 'react';

const Header = () => {
  return (
    <div className="header">
      <div className="status-indicator">
        <div className="status-dot"></div>
        <span>N8N Conectado</span>
      </div>
      <h1> CRM FENI</h1>
      <p>Sistema integrado com WhatsApp via N8N</p>
    </div>
  );
};

export default Header;