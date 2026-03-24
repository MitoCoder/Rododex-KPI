// src/componentes/GraficoKPI/GraficoKPI.js
import React from 'react';
import { Card, Row, Col } from 'antd';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDados } from '../../contextos/DadosContext';
import BotaoImprimir from '../BotaoImprimir/BotaoImprimir';

// Função para formatar data
const formatarData = (dataStr) => {
  if (!dataStr) return '-';
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

const GraficoKPI = ({ graficosRefs }) => {
  const { dadosKPI, metricasKPI } = useDados();

  if (!dadosKPI || dadosKPI.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
          Nenhum dado KPI disponível para gráficos
        </div>
      </Card>
    );
  }

  // CORREÇÃO: Eficiência = (NFs Realizadas / NFs Expedidas) × 100
  const chartData = dadosKPI.map(item => ({
    data: formatarData(item.data),
    dataOriginal: item.data,
    veiculos: item.totalVeiculos,
    nfsExpedidas: item.nfseExp,
    nfsRealizadas: item.realizadoDia,
    eficiencia: item.nfseExp > 0 ? (item.realizadoDia / item.nfseExp) * 100 : 0,
    retornos: item.nfRetorno
  })).reverse();

  const avariasData = [
    { name: 'Carreta', value: metricasKPI?.totalAvariaCarreta || 0, color: '#faad14' },
    { name: 'Entrega', value: metricasKPI?.totalAvariaEntrega || 0, color: '#f5222d' },
    { name: 'Internas', value: metricasKPI?.totalAvariasInternas || 0, color: '#1890ff' }
  ];

  const totalNfsExpedidas = chartData.reduce((sum, item) => sum + item.nfsExpedidas, 0);
  const totalNfsRealizadas = chartData.reduce((sum, item) => sum + item.nfsRealizadas, 0);
  const eficienciaMedia = totalNfsExpedidas > 0 ? (totalNfsRealizadas / totalNfsExpedidas) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ margin: 0, color: p.color }}>
              {p.name}: {p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['NFs Expedidas vs Realizadas']}>
            <BotaoImprimir elementRef={graficosRefs?.['NFs Expedidas vs Realizadas']} title="NFs Expedidas vs Realizadas" filename="nfs_vs_realizadas" />
            <Card title="NFs Expedidas vs Realizadas" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="nfsExpedidas" fill="#1890ff" name="NFs Expedidas" />
                  <Bar dataKey="nfsRealizadas" fill="#52c41a" name="NFs Realizadas" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['Eficiência Diária']}>
            <BotaoImprimir elementRef={graficosRefs?.['Eficiência Diária']} title="Eficiência Diária (%)" filename="eficiencia" />
            <Card title="Eficiência Diária (%)" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                  <Line type="monotone" dataKey="eficiencia" stroke="#faad14" name="Eficiência (%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 14, color: '#666' }}>
                Eficiência Média: <strong style={{ color: '#faad14', fontSize: 18 }}>{eficienciaMedia.toFixed(1)}%</strong>
              </span>
              <div style={{ fontSize: 12, color: '#999' }}>
                (NFs Realizadas / NFs Expedidas) × 100
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['Retornos Diários']}>
            <BotaoImprimir elementRef={graficosRefs?.['Retornos Diários']} title="Retornos Diários" filename="retornos" />
            <Card title="Retornos Diários" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="retornos" fill="#f5222d" name="NFs Retornadas" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['Avarias por Tipo']}>
            <BotaoImprimir elementRef={graficosRefs?.['Avarias por Tipo']} title="Avarias por Tipo" filename="avarias" />
            <Card title="Avarias por Tipo" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avariasData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="value" fill="#faad14" name="Quantidade">
                    {avariasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['Veículos por Dia']}>
            <BotaoImprimir elementRef={graficosRefs?.['Veículos por Dia']} title="Veículos por Dia" filename="veiculos" />
            <Card title="Veículos por Dia" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="veiculos" fill="#1890ff" name="Veículos" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GraficoKPI;