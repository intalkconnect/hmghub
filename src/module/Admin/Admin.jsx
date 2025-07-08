import { Home, Bot, Users, Settings } from 'lucide-react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import Chatbot from './chatbot/Builder';
import Dashboard from './dashboard/Dashboard';
import UsersPage from './users/Users';

import './Admin.css';

export default function Admin() {
  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <h2 className="admin-logo">Painel Admin</h2>

        <nav className="admin-nav">
          <MenuItem to="" label="Início" icon={<Home size={18} />} />
          <MenuItem to="chatbot" label="Chatbot" icon={<Bot size={18} />} />
          <MenuItem to="users" label="Usuários" icon={<Users size={18} />} />
          <MenuItem to="configuracoes" label="Configurações" icon={<Settings size={18} />} />
        </nav>
      </header>

      <main className="admin-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="configuracoes" element={<div className="admin-page">Página de Configurações</div>} />
          <Route path="*" element={<Navigate to="" />} />
        </Routes>
      </main>
    </div>
  );
}

const MenuItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    end={to === ''}
    className={({ isActive }) =>
      isActive ? 'admin-menu-item active' : 'admin-menu-item'
    }
  >
    {icon}
    {label}
  </NavLink>
);
