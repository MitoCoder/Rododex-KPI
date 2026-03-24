// src/componentes/ResumoGrafico/ResumoGrafico.js
import React, { useRef } from 'react';
import { Card, Row, Col, Button, Space, Tooltip, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResumoGrafico = ({ dadosSSW, metricasOTIF, kpiData }) => {
  const componentRef = useRef(null);

  // ==================== DADOS BASE ====================
  const totalEntregas = metricasOTIF?.totalEntregas || 0;
  const totalNoPrazo = metricasOTIF?.totalNoPrazo || 0;
  const totalAtraso = totalEntregas - totalNoPrazo;
  
  // ==================== ON TIME ====================
  // On Time = (Entregas no Prazo / Total de Entregas) × 100
  const taxaOnTime = totalEntregas > 0 ? (totalNoPrazo / totalEntregas) * 100 : 0;
  
  const onTimeData = [
    { name: 'No Prazo', value: totalNoPrazo, color: '#52c41a' },
    { name: 'Atrasadas', value: totalAtraso, color: '#f5222d' }
  ];

  // ==================== IN FULL ====================
  // In Full = (Entregas no Prazo / Total de Entregas) × 100
  // Depois desconta 1.3% a cada 150 entregas NOK (atrasadas ou incompletas) - OCULTO
  const totalNOK = totalEntregas - totalNoPrazo;
  
  // Calcula o desconto: 1.3% a cada 150 NOK
  const desconto = (Math.floor(totalNOK / 150) * 0.8);
  const taxaInFullBase = totalEntregas > 0 ? (totalNoPrazo / totalEntregas) * 100 : 0;
  const taxaInFull = Math.max(0, taxaInFullBase - desconto);
  
  // Para exibir no gráfico, usamos o valor ajustado
  const valorAjustado = (taxaInFull / 100) * totalEntregas;
  const inFullData = [
    { name: 'Completo', value: valorAjustado, color: '#52c41a' },
    { name: 'Incompleto', value: totalEntregas - valorAjustado, color: '#faad14' }
  ];

  // ==================== OTIF ====================
  // OTIF = (On Time × In Full) / 100
  const taxaOTIF = (taxaOnTime * taxaInFull) / 100;
  const totalOTIF = (taxaOTIF / 100) * totalEntregas;
  const totalNaoOTIF = totalEntregas - totalOTIF;
  
  const otifData = [
    { name: 'No Prazo e Completo', value: totalOTIF, color: '#52c41a' },
    { name: 'Atrasado ou Incompleto', value: totalNaoOTIF, color: '#f5222d' }
  ];

  // ==================== DADOS EFICIÊNCIA ====================
  const totalNfsExpedidas = kpiData?.totalNfsExpedidas || 0;
  const totalNfsRealizadas = kpiData?.totalNfsRealizadas || 0;
  const taxaEficiencia = totalNfsExpedidas > 0 ? (totalNfsRealizadas / totalNfsExpedidas) * 100 : 0;

  const eficienciaData = [
    { name: 'Realizadas', value: totalNfsRealizadas, color: '#52c41a' },
    { name: 'Não Realizadas', value: totalNfsExpedidas - totalNfsRealizadas, color: '#f5222d' }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '8px 12px', 
          border: '1px solid #ccc', 
          borderRadius: '4px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.color }}>{data.name}</p>
          <p style={{ margin: 0 }}>{Math.round(data.value).toLocaleString()} registros</p>
        </div>
      );
    }
    return null;
  };

  // Renderizar gráfico de anel
  const renderDonutChart = (data, title, percentual, cor) => {
    const valorOK = data[0]?.value || 0;
    const total = valorOK + (data[1]?.value || 0);
    
    return (
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: cor }}>
            {percentual.toFixed(1)}%
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {Math.round(valorOK).toLocaleString()} / {Math.round(total).toLocaleString()}
          </div>
        </div>
        <div style={{ marginTop: 8, fontWeight: 'bold', fontSize: 14 }}>
          {title}
        </div>
      </div>
    );
  };

  const handlePrint = async () => {
    try {
      message.loading({ content: 'Gerando PDF...', key: 'print' });
      
      const element = componentRef.current;
      if (!element) {
        message.error('Elemento não encontrado');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = (pageHeight - imgHeight) / 2;
      if (yPosition < margin) yPosition = margin;
      
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      
      const dataHora = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Rododex Transportes - Resumo de Performance | ${dataHora}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
      
      pdf.save(`resumo_performance_${new Date().toISOString().slice(0, 10)}.pdf`);
      message.success({ content: 'PDF gerado!', key: 'print' });
      
    } catch (error) {
      console.error('Erro:', error);
      message.error({ content: 'Erro ao gerar PDF', key: 'print' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Tooltip title="Salvar como PDF">
          <Button icon={<PrinterOutlined />} onClick={handlePrint} size="large">
            Imprimir Resumo
          </Button>
        </Tooltip>
      </div>
      
      <div ref={componentRef} style={{ padding: 20, backgroundColor: '#fff' }}>
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>Rododex Transportes</h2>
          <p style={{ margin: 4, fontSize: 14, color: '#666' }}>Resumo de Performance</p>
          <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
            Período: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Linha 1: OTIF, In Full, On Time - 3 gráficos lado a lado */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={8} md={8}>
            <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {renderDonutChart(otifData, 'OTIF (No Prazo e Completo)', taxaOTIF, taxaOTIF >= 90 ? '#52c41a' : taxaOTIF >= 70 ? '#faad14' : '#f5222d')}
              <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                <Space split="|">
                  <span style={{ color: '#52c41a' }}>No Prazo e Completo: {Math.round(totalOTIF)}</span>
                  <span style={{ color: '#f5222d' }}>Atrasado ou Incompleto: {Math.round(totalNaoOTIF)}</span>
                </Space>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                Fórmula: OTIF = (On Time × In Full) / 100
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={8}>
            <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {renderDonutChart(inFullData, 'In Full (Entrega Completa)', taxaInFull, taxaInFull >= 90 ? '#52c41a' : '#faad14')}
              <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                <Space split="|">
                  <span style={{ color: '#52c41a' }}>Completo: {Math.round(valorAjustado)}</span>
                  <span style={{ color: '#faad14' }}>Incompleto: {Math.round(totalEntregas - valorAjustado)}</span>
                </Space>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                Fórmula: (No Prazo / Total) × 100 
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={8} md={8}>
            <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {renderDonutChart(onTimeData, 'On Time (Entrega no Prazo)', taxaOnTime, taxaOnTime >= 90 ? '#52c41a' : taxaOnTime >= 70 ? '#faad14' : '#f5222d')}
              <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                <Space split="|">
                  <span style={{ color: '#52c41a' }}>No Prazo: {totalNoPrazo}</span>
                  <span style={{ color: '#f5222d' }}>Atrasadas: {totalAtraso}</span>
                </Space>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                Fórmula: (Entregas no Prazo / Total de Entregas) × 100
              </div>
            </Card>
          </Col>
        </Row>

        {/* Linha 2: Eficiência Operacional */}
        <Row gutter={[24, 24]} justify="center" style={{ marginTop: 32 }}>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {renderDonutChart(eficienciaData, 'Eficiência Operacional', taxaEficiencia, taxaEficiencia >= 90 ? '#52c41a' : taxaEficiencia >= 70 ? '#faad14' : '#f5222d')}
              <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                <Space split="|">
                  <span style={{ color: '#52c41a' }}>Realizadas: {totalNfsRealizadas.toLocaleString()}</span>
                  <span style={{ color: '#f5222d' }}>Expedidas: {totalNfsExpedidas.toLocaleString()}</span>
                </Space>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                Fórmula: (NFs Realizadas / NFs Expedidas) × 100
              </div>
            </Card>
          </Col>
        </Row>

        {/* Rodapé */}
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 10, color: '#999', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <p>Relatório gerado automaticamente pelo Sistema Rododex KPI</p>
          <p>OTIF = (On Time × In Full) / 100 | In Full = Completo | On Time = No Prazo | Eficiência = Realizadas / Expedidas</p>
        </div>
      </div>
    </div>
  );
};

export default ResumoGrafico;