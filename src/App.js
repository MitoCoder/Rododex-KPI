// src/App.js
import React from 'react';
import { Layout, Typography, ConfigProvider, theme } from 'antd';
import { DadosProvider } from './contextos/DadosContext';
import UploadArquivo from './componentes/UploadArquivo/UploadArquivo';
import Dashboard from './componentes/Dashboard/Dashboard';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return React.createElement(
    ConfigProvider,
    {
      theme: {
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      },
    },
    React.createElement(
      DadosProvider,
      null,
      React.createElement(
        Layout,
        { className: 'app-layout' },
        React.createElement(
          Header,
          { className: 'app-header' },
          React.createElement(Title, { level: 2, style: { color: 'white', margin: '16px 0' } }, 
            'Rododex Transportes KPI - Sistema OTIF'
          )
        ),
        React.createElement(
          Content,
          { className: 'app-content' },
          React.createElement(UploadArquivo, null),
          React.createElement(Dashboard, null)
        )
      )
    )
  );
}

export default App;