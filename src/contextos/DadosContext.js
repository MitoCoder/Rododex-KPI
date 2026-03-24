// src/contextos/DadosContext.js
import React, { createContext, useState, useContext } from 'react';

const DadosContext = createContext();

export const useDados = () => {
  const context = useContext(DadosContext);
  if (!context) {
    throw new Error('useDados must be used within a DadosProvider');
  }
  return context;
};

export const DadosProvider = ({ children }) => {
  const [dadosSSW, setDadosSSW] = useState([]);
  const [metricasOTIF, setMetricasOTIF] = useState(null);
  const [dadosKPI, setDadosKPI] = useState([]);
  const [metricasKPI, setMetricasKPI] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardGerado, setDashboardGerado] = useState(false);

  const atualizarDadosSSW = (dados, metricas) => {
    console.log('Atualizando dados SSW:', { totalRegistros: dados?.length, metricas });
    setDadosSSW(dados || []);
    setMetricasOTIF(metricas || null);
  };

  const atualizarDadosKPI = (dados, metricas) => {
    console.log('Atualizando dados KPI:', { totalDias: dados?.length, metricas });
    setDadosKPI(dados || []);
    setMetricasKPI(metricas || null);
  };

  const gerarDashboard = () => {
    console.log('Gerando dashboard...');
    setDashboardGerado(true);
  };

  const limparDados = () => {
    setDadosSSW([]);
    setMetricasOTIF(null);
    setDadosKPI([]);
    setMetricasKPI(null);
    setDashboardGerado(false);
  };

  const value = {
    dadosSSW,
    metricasOTIF,
    dadosKPI,
    metricasKPI,
    isLoading,
    dashboardGerado,
    setIsLoading,
    atualizarDadosSSW,
    atualizarDadosKPI,
    gerarDashboard,
    limparDados
  };

  return (
    <DadosContext.Provider value={value}>
      {children}
    </DadosContext.Provider>
  );
};