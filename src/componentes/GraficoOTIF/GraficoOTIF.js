// src/componentes/GraficoOTIF/GraficoOTIF.js
import React from 'react';
import { Card, Row, Col } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDados } from '../../contextos/DadosContext';
import BotaoImprimir from '../BotaoImprimir/BotaoImprimir';

const GraficoOTIF = ({ graficosRefs, metricasOTIF }) => {  // 👈 RECEBE metricasOTIF como prop
  const { dadosSSW } = useDados();

  if (!dadosSSW || dadosSSW.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
          Nenhum dado OTIF disponível para gráficos
        </div>
      </Card>
    );
  }

  const totalEntregas = dadosSSW.length;
  
  // ==================== DADOS DIRETAMENTE DO RESUMOGRAFICO (via prop) ====================
  const totalOTIF = metricasOTIF?.totalOTIF || 0;
  const totalNaoOTIF = totalEntregas - totalOTIF;
  
  const totalInFull = metricasOTIF?.totalInFullOK || 0;
  const totalInFullNOK = totalEntregas - totalInFull;
  
  const totalNoPrazo = metricasOTIF?.totalNoPrazo || 0;
  const totalAtraso = totalEntregas - totalNoPrazo;

  // Dados para gráfico de pizza OTIF
  const otifData = [
    { name: 'No Prazo e Completo', value: totalOTIF, color: '#52c41a' },
    { name: 'Atrasado ou Incompleto', value: totalNaoOTIF, color: '#f5222d' }
  ];

  // Dados para gráfico de pizza In Full
  const inFullData = [
    { name: 'Completo', value: totalInFull, color: '#52c41a' },
    { name: 'Incompleto', value: totalInFullNOK, color: '#faad14' }
  ];

  // Dados para gráfico de pizza On Time
  const onTimeData = [
    { name: 'No Prazo', value: totalNoPrazo, color: '#52c41a' },
    { name: 'Atrasadas', value: totalAtraso, color: '#f5222d' }
  ];

  // Dados para gráfico de barras por status
  const statusData = [
    { name: 'ENTREGUE', value: dadosSSW.filter(item => item.status === 'ENTREGUE').length, color: '#52c41a' },
    { name: 'PARCIAL', value: dadosSSW.filter(item => item.status === 'PARCIAL').length, color: '#faad14' },
    { name: 'PENDENTE', value: dadosSSW.filter(item => item.status === 'PENDENTE').length, color: '#f5222d' }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentual = (data.value / totalEntregas) * 100;
      return (
        <div style={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.color }}>{data.name}</p>
          <p style={{ margin: 0 }}>{Math.round(data.value).toLocaleString()} entregas ({percentual.toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['OTIF - Pizza']}>
            <BotaoImprimir elementRef={graficosRefs?.['OTIF - Pizza']} title="OTIF - Entregas no Prazo e Completas" filename="otif_pizza" />
            <Card title="OTIF - Entregas no Prazo e Completas" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={otifData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {otifData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['In Full - Pizza']}>
            <BotaoImprimir elementRef={graficosRefs?.['In Full - Pizza']} title="In Full - Entregas Completas" filename="infull_pizza" />
            <Card title="In Full - Entregas Completas" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inFullData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {inFullData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['On Time - Pizza']}>
            <BotaoImprimir elementRef={graficosRefs?.['On Time - Pizza']} title="On Time - Entregas no Prazo" filename="ontime_pizza" />
            <Card title="On Time - Entregas no Prazo" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={onTimeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {onTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <div style={{ position: 'relative' }} ref={graficosRefs?.['Status das Entregas']}>
            <BotaoImprimir elementRef={graficosRefs?.['Status das Entregas']} title="Status das Entregas" filename="status_barras" />
            <Card title="Status das Entregas" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} entregas`} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="value" fill="#8884d8">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GraficoOTIF;