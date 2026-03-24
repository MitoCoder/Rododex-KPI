// src/componentes/Dashboard/Dashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Tabs, Progress, Tag, Space, Alert, Spin, Input, Select, DatePicker, Button } from 'antd';
import { 
  TruckOutlined, 
  FileOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useDados } from '../../contextos/DadosContext';
import GraficoOTIF from '../GraficoOTIF/GraficoOTIF';
import GraficoKPI from '../GraficoKPI/GraficoKPI';
import ResumoGrafico from '../ResumoGrafico/ResumoGrafico';
import RelatorioPDF from '../RelatorioPDF/RelatorioPDF';
import './Dashboard.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Função para formatar data para DD/MM/YYYY
const formatarData = (dataStr) => {
  if (!dataStr) return '-';
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

const Dashboard = () => {
  const { 
    dadosSSW, 
    metricasOTIF, 
    dadosKPI, 
    metricasKPI, 
    isLoading,
    dashboardGerado 
  } = useDados();
  const [activeTab, setActiveTab] = useState('resumo');
  
  const [filtrosOTIF, setFiltrosOTIF] = useState({
    ctrc: '',
    status: '',
    abc: '',
    dataInicio: null,
    dataFim: null,
    onTime: '',
    otif: ''
  });
  
  const [filtrosKPI, setFiltrosKPI] = useState({
    dataInicio: null,
    dataFim: null,
    veiculosMin: null,
    veiculosMax: null,
    eficienciaMin: null,
    eficienciaMax: null
  });
  
  const [dadosFiltradosOTIF, setDadosFiltradosOTIF] = useState([]);
  const [dadosFiltradosKPI, setDadosFiltradosKPI] = useState([]);

  const graficosRefs = {
    'OTIF - Pizza': useRef(null),
    'In Full - Pizza': useRef(null),
    'Status das Entregas': useRef(null),
    'Classificação ABC': useRef(null),
    'NFs Expedidas vs Realizadas': useRef(null),
    'Eficiência Diária': useRef(null),
    'Retornos Diários': useRef(null),
    'Avarias por Tipo': useRef(null),
    'Veículos por Dia': useRef(null)
  };

  useEffect(() => {
    if (!dadosSSW || dadosSSW.length === 0) {
      setDadosFiltradosOTIF([]);
      return;
    }
    
    let filtrados = [...dadosSSW];
    
    if (filtrosOTIF.ctrc) {
      filtrados = filtrados.filter(item => 
        item.ctrc && item.ctrc.toLowerCase().includes(filtrosOTIF.ctrc.toLowerCase())
      );
    }
    
    if (filtrosOTIF.status) {
      filtrados = filtrados.filter(item => item.status === filtrosOTIF.status);
    }
    
    if (filtrosOTIF.abc) {
      filtrados = filtrados.filter(item => {
        const abc = item.abcPagador?.charAt(0) || '';
        return abc === filtrosOTIF.abc;
      });
    }
    
    if (filtrosOTIF.onTime) {
      const isOnTime = filtrosOTIF.onTime === 'sim';
      filtrados = filtrados.filter(item => item.onTime === isOnTime);
    }
    
    if (filtrosOTIF.otif) {
      const isOtif = filtrosOTIF.otif === 'sim';
      filtrados = filtrados.filter(item => item.otif === isOtif);
    }
    
    if (filtrosOTIF.dataInicio) {
      filtrados = filtrados.filter(item => 
        item.dataEntrega && item.dataEntrega >= filtrosOTIF.dataInicio
      );
    }
    if (filtrosOTIF.dataFim) {
      filtrados = filtrados.filter(item => 
        item.dataEntrega && item.dataEntrega <= filtrosOTIF.dataFim
      );
    }
    
    setDadosFiltradosOTIF(filtrados);
  }, [dadosSSW, filtrosOTIF]);

  useEffect(() => {
    if (!dadosKPI || dadosKPI.length === 0) {
      setDadosFiltradosKPI([]);
      return;
    }
    
    let filtrados = [...dadosKPI];
    
    if (filtrosKPI.dataInicio) {
      filtrados = filtrados.filter(item => item.data >= filtrosKPI.dataInicio);
    }
    if (filtrosKPI.dataFim) {
      filtrados = filtrados.filter(item => item.data <= filtrosKPI.dataFim);
    }
    
    if (filtrosKPI.veiculosMin !== null && filtrosKPI.veiculosMin !== '') {
      filtrados = filtrados.filter(item => item.totalVeiculos >= filtrosKPI.veiculosMin);
    }
    if (filtrosKPI.veiculosMax !== null && filtrosKPI.veiculosMax !== '') {
      filtrados = filtrados.filter(item => item.totalVeiculos <= filtrosKPI.veiculosMax);
    }
    
    if (filtrosKPI.eficienciaMin !== null && filtrosKPI.eficienciaMin !== '') {
      filtrados = filtrados.filter(item => {
        const eficiencia = item.nfseExp > 0 
          ? (item.realizadoDia / item.nfseExp) * 100 
          : 0;
        return eficiencia >= filtrosKPI.eficienciaMin;
      });
    }
    if (filtrosKPI.eficienciaMax !== null && filtrosKPI.eficienciaMax !== '') {
      filtrados = filtrados.filter(item => {
        const eficiencia = item.nfseExp > 0 
          ? (item.realizadoDia / item.nfseExp) * 100 
          : 0;
        return eficiencia <= filtrosKPI.eficienciaMax;
      });
    }
    
    setDadosFiltradosKPI(filtrados);
  }, [dadosKPI, filtrosKPI]);

  const limparFiltrosOTIF = () => {
    setFiltrosOTIF({
      ctrc: '',
      status: '',
      abc: '',
      dataInicio: null,
      dataFim: null,
      onTime: '',
      otif: ''
    });
  };

  const limparFiltrosKPI = () => {
    setFiltrosKPI({
      dataInicio: null,
      dataFim: null,
      veiculosMin: null,
      veiculosMax: null,
      eficienciaMin: null,
      eficienciaMax: null
    });
  };

  if (!dashboardGerado) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: 50 }}>
        <Card>
          <BarChartOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <h3>Dashboard não gerado</h3>
          <p>Faça upload dos arquivos na página de upload e clique em "Gerar Dashboard".</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" tip="Carregando dashboard..." />
      </div>
    );
  }

  const hasSSWData = dadosSSW && dadosSSW.length > 0;
  const hasKPIData = dadosKPI && dadosKPI.length > 0;

  if (!hasSSWData && !hasKPIData) {
    return (
      <div className="dashboard-container">
        <Alert
          message="Nenhum dado disponível"
          description={`SSW: ${dadosSSW?.length || 0} registros, KPI: ${dadosKPI?.length || 0} registros.`}
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // ==================== CÁLCULOS OTIF ====================
  // Usando a mesma lógica do ResumoGrafico para manter consistência
  const totalEntregas = dadosSSW?.length || 0;
  const totalNoPrazo = dadosSSW?.filter(item => item.onTime === true).length || 0;
  const totalAtraso = totalEntregas - totalNoPrazo;
  
  // On Time = (Entregas no Prazo / Total de Entregas) × 100
  const taxaOnTime = totalEntregas > 0 ? (totalNoPrazo / totalEntregas) * 100 : 0;
  
  // In Full = (Entregas no Prazo / Total de Entregas) × 100 - desconto (1.3% a cada 150 NOK)
  const totalNOK = totalEntregas - totalNoPrazo;
  const desconto = (Math.floor(totalNOK / 150) * 0.8);
  const taxaInFullBase = totalEntregas > 0 ? (totalNoPrazo / totalEntregas) * 100 : 0;
  const taxaInFull = Math.max(0, taxaInFullBase - desconto);
  
  // OTIF = (On Time × In Full) / 100
  const taxaOTIF = (taxaOnTime * taxaInFull) / 100;
  const totalOTIF = (taxaOTIF / 100) * totalEntregas;
  
  // Valores para o card de In Full
  const valorAjustado = (taxaInFull / 100) * totalEntregas;
  
  // Atraso médio
  let atrasoMedio = 0;
  const entregasComAtrasoList = dadosSSW?.filter(item => item.diasAtraso && Number(item.diasAtraso) > 0) || [];
  if (entregasComAtrasoList.length > 0) {
    const somaAtraso = entregasComAtrasoList.reduce((sum, item) => sum + (Number(item.diasAtraso) || 0), 0);
    atrasoMedio = somaAtraso / entregasComAtrasoList.length;
  }
  
  const otifData = {
    totalEntregas,
    totalNoPrazo,
    totalAtraso,
    atrasoMedio,
    taxaOnTime,
    taxaInFull,
    taxaOTIF,
    totalOTIF: Math.round(totalOTIF),
    totalNaoOTIF: Math.round(totalEntregas - totalOTIF),
    totalInFullOK: Math.round(valorAjustado),
    totalInFullNOK: Math.round(totalEntregas - valorAjustado)
  };

  // ==================== CÁLCULOS KPI ====================
  const calcularMetricasKPI = () => {
    if (metricasKPI && metricasKPI.totalVeiculos > 0) {
      return metricasKPI;
    }
    
    if (dadosKPI && dadosKPI.length > 0) {
      const totalVeiculos = dadosKPI.reduce((sum, item) => sum + (item.totalVeiculos || 0), 0);
      const totalNfsExpedidas = dadosKPI.reduce((sum, item) => sum + (item.nfseExp || 0), 0);
      const totalNfsRealizadas = dadosKPI.reduce((sum, item) => sum + (item.realizadoDia || 0), 0);
      const totalNfRetorno = dadosKPI.reduce((sum, item) => sum + (item.nfRetorno || 0), 0);
      const totalAvariaCarreta = dadosKPI.reduce((sum, item) => sum + (item.avariaCarreta || 0), 0);
      const totalAvariaEntrega = dadosKPI.reduce((sum, item) => sum + (item.avariaEntrega || 0), 0);
      const totalAvariasInternas = dadosKPI.reduce((sum, item) => sum + (item.avariasInternas || 0), 0);
      const totalValorAvaria = dadosKPI.reduce((sum, item) => sum + (item.valorAvaria || 0), 0);
      
      return {
        totalVeiculos: totalVeiculos || 0,
        totalNfsExpedidas: totalNfsExpedidas || 0,
        totalNfsRealizadas: totalNfsRealizadas || 0,
        totalNfRetorno: totalNfRetorno || 0,
        totalAvariaCarreta: totalAvariaCarreta || 0,
        totalAvariaEntrega: totalAvariaEntrega || 0,
        totalAvariasInternas: totalAvariasInternas || 0,
        totalValorAvaria: totalValorAvaria || 0,
        taxaEficiencia: totalNfsExpedidas > 0 ? (totalNfsRealizadas / totalNfsExpedidas) * 100 : 0,
        taxaRetorno: totalNfsExpedidas > 0 ? (totalNfRetorno / totalNfsExpedidas) * 100 : 0,
        mediaVeiculosPorDia: totalVeiculos / dadosKPI.length,
        mediaNfsExpedidasPorDia: totalNfsExpedidas / dadosKPI.length,
        diasAnalisados: dadosKPI.length
      };
    }
    
    return {
      totalVeiculos: 0,
      totalNfsExpedidas: 0,
      totalNfsRealizadas: 0,
      totalNfRetorno: 0,
      totalAvariaCarreta: 0,
      totalAvariaEntrega: 0,
      totalAvariasInternas: 0,
      totalValorAvaria: 0,
      taxaEficiencia: 0,
      taxaRetorno: 0,
      mediaVeiculosPorDia: 0,
      mediaNfsExpedidasPorDia: 0,
      diasAnalisados: 0
    };
  };
  
  const kpiData = calcularMetricasKPI();

  // ==================== COLUNAS DAS TABELAS ====================
  
  const columnsEntregas = [
    {
      title: 'Data Prevista',
      dataIndex: 'dataPrevisao',
      key: 'dataPrevisao',
      width: 110,
      render: (text) => formatarData(text)
    },
    {
      title: 'Data Entrega',
      dataIndex: 'dataEntrega',
      key: 'dataEntrega',
      width: 110,
      render: (text) => formatarData(text)
    },
    {
      title: 'Dias Atraso',
      dataIndex: 'diasAtraso',
      key: 'diasAtraso',
      width: 90,
      align: 'right',
      render: (value) => {
        const numValue = Number(value);
        if (isNaN(numValue)) return '-';
        if (numValue <= 0) return <Tag color="green">0</Tag>;
        return <Tag color="red">{numValue}</Tag>;
      },
      sorter: (a, b) => (Number(a.diasAtraso) || 0) - (Number(b.diasAtraso) || 0)
    },
    {
      title: 'Remetente',
      dataIndex: 'clienteRemetente',
      key: 'clienteRemetente',
      width: 220,
      ellipsis: true,
      render: (text) => text?.substring(0, 45) || '-'
    },
    {
      title: 'Cidade',
      dataIndex: 'cidadeEntrega',
      key: 'cidadeEntrega',
      width: 150
    },
    {
      title: 'UF',
      dataIndex: 'ufEntrega',
      key: 'ufEntrega',
      width: 60
    },
    {
      title: 'NFs',
      dataIndex: 'qtdNFs',
      key: 'qtdNFs',
      width: 80,
      align: 'right',
      render: (value) => value?.toLocaleString() || '-'
    },
    {
      title: 'Volumes',
      dataIndex: 'volumes',
      key: 'volumes',
      width: 80,
      align: 'right',
      render: (value) => value?.toLocaleString() || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        if (status === 'ENTREGUE') return <Tag color="success">ENTREGUE</Tag>;
        if (status === 'PARCIAL') return <Tag color="warning">PARCIAL</Tag>;
        return <Tag color="error">PENDENTE</Tag>;
      },
      filters: [
        { text: 'ENTREGUE', value: 'ENTREGUE' },
        { text: 'PARCIAL', value: 'PARCIAL' },
        { text: 'PENDENTE', value: 'PENDENTE' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'No Prazo',
      key: 'onTime',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Tag color={record.onTime ? 'green' : 'red'}>
          {record.onTime ? 'SIM' : 'NÃO'}
        </Tag>
      ),
      filters: [
        { text: 'SIM', value: true },
        { text: 'NÃO', value: false }
      ],
      onFilter: (value, record) => record.onTime === value
    }
  ];

  const columnsKPI = [
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      width: 110,
      fixed: 'left',
      render: (text) => formatarData(text),
      sorter: (a, b) => a.data.localeCompare(b.data)
    },
    {
      title: 'Veículos',
      dataIndex: 'totalVeiculos',
      key: 'totalVeiculos',
      width: 80,
      align: 'right',
      sorter: (a, b) => a.totalVeiculos - b.totalVeiculos
    },
    {
      title: 'NFs Exp.',
      dataIndex: 'nfseExp',
      key: 'nfseExp',
      width: 80,
      align: 'right',
      sorter: (a, b) => a.nfseExp - b.nfseExp
    },
    {
      title: 'NFs Real.',
      dataIndex: 'realizadoDia',
      key: 'realizadoDia',
      width: 80,
      align: 'right',
      sorter: (a, b) => a.realizadoDia - b.realizadoDia
    },
    {
      title: 'Eficiência',
      key: 'eficiencia',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const nfsExp = record.nfseExp || 0;
        const nfsReal = record.realizadoDia || 0;
        const eficiencia = nfsExp > 0 ? (nfsReal / nfsExp) * 100 : 0;
        return `${eficiencia.toFixed(1)}%`;
      },
      sorter: (a, b) => {
        const effA = (a.nfseExp || 0) > 0 ? ((a.realizadoDia || 0) / (a.nfseExp || 0)) * 100 : 0;
        const effB = (b.nfseExp || 0) > 0 ? ((b.realizadoDia || 0) / (b.nfseExp || 0)) * 100 : 0;
        return effA - effB;
      }
    },
    {
      title: 'Retornos',
      dataIndex: 'nfRetorno',
      key: 'nfRetorno',
      width: 80,
      align: 'right',
      sorter: (a, b) => a.nfRetorno - b.nfRetorno
    },
    {
      title: 'Avarias',
      key: 'avarias',
      width: 80,
      align: 'right',
      render: (_, record) => (record.avariaCarreta || 0) + (record.avariaEntrega || 0) + (record.avariasInternas || 0)
    },
    {
      title: 'Valor Avarias (R$)',
      dataIndex: 'valorAvaria',
      key: 'valorAvaria',
      width: 120,
      align: 'right',
      render: (value) => (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  ];

  // ==================== FILTROS ====================
  
  const renderFiltrosEntregas = () => (
    <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Buscar por CTRC"
            prefix={<SearchOutlined />}
            value={filtrosOTIF.ctrc}
            onChange={(e) => setFiltrosOTIF({ ...filtrosOTIF, ctrc: e.target.value })}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Status"
            style={{ width: '100%' }}
            value={filtrosOTIF.status || undefined}
            onChange={(value) => setFiltrosOTIF({ ...filtrosOTIF, status: value })}
            allowClear
          >
            <Option value="ENTREGUE">ENTREGUE</Option>
            <Option value="PARCIAL">PARCIAL</Option>
            <Option value="PENDENTE">PENDENTE</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="No Prazo"
            style={{ width: '100%' }}
            value={filtrosOTIF.onTime || undefined}
            onChange={(value) => setFiltrosOTIF({ ...filtrosOTIF, onTime: value })}
            allowClear
          >
            <Option value="sim">SIM (Entregue no prazo)</Option>
            <Option value="nao">NÃO (Atrasado)</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Space>
            <span>Período de Entrega:</span>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setFiltrosOTIF({
                    ...filtrosOTIF,
                    dataInicio: dates[0].format('YYYY-MM-DD'),
                    dataFim: dates[1].format('YYYY-MM-DD')
                  });
                } else {
                  setFiltrosOTIF({ ...filtrosOTIF, dataInicio: null, dataFim: null });
                }
              }}
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button icon={<ReloadOutlined />} onClick={limparFiltrosOTIF}>
            Limpar Filtros
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderFiltrosKPI = () => (
    <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Space>
            <span>Período:</span>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setFiltrosKPI({
                    ...filtrosKPI,
                    dataInicio: dates[0].format('YYYY-MM-DD'),
                    dataFim: dates[1].format('YYYY-MM-DD')
                  });
                } else {
                  setFiltrosKPI({ ...filtrosKPI, dataInicio: null, dataFim: null });
                }
              }}
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Input
            type="number"
            placeholder="Veículos min"
            value={filtrosKPI.veiculosMin || ''}
            onChange={(e) => setFiltrosKPI({ ...filtrosKPI, veiculosMin: e.target.value ? Number(e.target.value) : null })}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Input
            type="number"
            placeholder="Veículos max"
            value={filtrosKPI.veiculosMax || ''}
            onChange={(e) => setFiltrosKPI({ ...filtrosKPI, veiculosMax: e.target.value ? Number(e.target.value) : null })}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Input
            type="number"
            placeholder="Eficiência min (%)"
            value={filtrosKPI.eficienciaMin || ''}
            onChange={(e) => setFiltrosKPI({ ...filtrosKPI, eficienciaMin: e.target.value ? Number(e.target.value) : null })}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Input
            type="number"
            placeholder="Eficiência max (%)"
            value={filtrosKPI.eficienciaMax || ''}
            onChange={(e) => setFiltrosKPI({ ...filtrosKPI, eficienciaMax: e.target.value ? Number(e.target.value) : null })}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Button icon={<ReloadOutlined />} onClick={limparFiltrosKPI}>
            Limpar
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // ==================== RESUMOS ====================
  
  const renderResumoEntregas = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Total de Entregas"
            value={otifData.totalEntregas}
            prefix={<FileOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="OTIF (No Prazo e Completo)"
            value={otifData.taxaOTIF.toFixed(1)}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: otifData.taxaOTIF >= 90 ? '#52c41a' : otifData.taxaOTIF >= 70 ? '#faad14' : '#f5222d' }}
          />
          <Progress 
            percent={otifData.taxaOTIF} 
            strokeColor={otifData.taxaOTIF >= 90 ? '#52c41a' : otifData.taxaOTIF >= 70 ? '#faad14' : '#f5222d'}
            showInfo={false}
            size="small"
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            <Space split="|">
              <span><CheckCircleOutlined /> No Prazo e Completo: {otifData.totalOTIF}</span>
              <span><CloseCircleOutlined /> Atrasado ou Incompleto: {otifData.totalNaoOTIF}</span>
            </Space>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
            Fórmula: (On Time × In Full) / 100
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="In Full (Entrega Completa)"
            value={otifData.taxaInFull.toFixed(1)}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: otifData.taxaInFull >= 90 ? '#52c41a' : '#faad14' }}
          />
          <Progress 
            percent={otifData.taxaInFull} 
            strokeColor={otifData.taxaInFull >= 90 ? '#52c41a' : '#faad14'}
            showInfo={false}
            size="small"
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            <Space split="|">
              <span style={{ color: '#52c41a' }}>Completo: {otifData.totalInFullOK}</span>
              <span style={{ color: '#faad14' }}>Incompleto: {otifData.totalInFullNOK}</span>
            </Space>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
            Fórmula: (No Prazo / Total) × 100 - desconto
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="On Time (Entrega no Prazo)"
            value={otifData.taxaOnTime.toFixed(1)}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: otifData.taxaOnTime >= 90 ? '#52c41a' : otifData.taxaOnTime >= 70 ? '#faad14' : '#f5222d' }}
          />
          <Progress 
            percent={otifData.taxaOnTime} 
            strokeColor={otifData.taxaOnTime >= 90 ? '#52c41a' : otifData.taxaOnTime >= 70 ? '#faad14' : '#f5222d'}
            showInfo={false}
            size="small"
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            <Space split="|">
              <span><CheckCircleOutlined /> No Prazo: {otifData.totalNoPrazo}</span>
              <span><CloseCircleOutlined /> Atrasadas: {otifData.totalAtraso}</span>
            </Space>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
            Fórmula: (Entregas no Prazo / Total de Entregas) × 100
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Entregas com Atraso"
            value={otifData.totalAtraso}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Média de atraso: {otifData.atrasoMedio.toFixed(1)} dias
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderResumoKPI = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Veículos"
            value={kpiData.totalVeiculos}
            prefix={<TruckOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Média: {(kpiData.mediaVeiculosPorDia || 0).toFixed(1)}/dia
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="NFs Expedidas"
            value={kpiData.totalNfsExpedidas}
            valueStyle={{ color: '#1890ff' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Média: {(kpiData.mediaNfsExpedidasPorDia || 0).toFixed(0)}/dia
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Eficiência Operacional"
            value={(kpiData.taxaEficiencia || 0).toFixed(1)}
            suffix="%"
            prefix={kpiData.taxaEficiencia >= 90 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{ color: kpiData.taxaEficiencia >= 90 ? '#52c41a' : kpiData.taxaEficiencia >= 70 ? '#faad14' : '#f5222d' }}
          />
          <Progress 
            percent={kpiData.taxaEficiencia || 0} 
            strokeColor={kpiData.taxaEficiencia >= 90 ? '#52c41a' : kpiData.taxaEficiencia >= 70 ? '#faad14' : '#f5222d'}
            showInfo={false}
            size="small"
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Realizadas: {kpiData.totalNfsRealizadas} / {kpiData.totalNfsExpedidas} NFs
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
            Fórmula: (NFs Realizadas / NFs Expedidas) × 100
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Taxa de Retorno"
            value={(kpiData.taxaRetorno || 0).toFixed(1)}
            suffix="%"
            prefix={<WarningOutlined />}
            valueStyle={{ color: kpiData.taxaRetorno > 5 ? '#f5222d' : '#52c41a' }}
          />
          <Progress 
            percent={kpiData.taxaRetorno || 0} 
            strokeColor={kpiData.taxaRetorno > 5 ? '#f5222d' : '#52c41a'}
            showInfo={false}
            size="small"
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            {kpiData.totalNfRetorno} retornos / {kpiData.totalNfsExpedidas} NFs
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
            Fórmula: (NFs Retornadas / NFs Expedidas) × 100
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderResumoAvarias = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Avarias Carreta"
            value={kpiData.totalAvariaCarreta}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Avarias Entrega"
            value={kpiData.totalAvariaEntrega}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Avarias Internas"
            value={kpiData.totalAvariasInternas}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="stat-card">
          <Statistic
            title="Total de Avarias"
            value={kpiData.totalAvariaCarreta + kpiData.totalAvariaEntrega + kpiData.totalAvariasInternas}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Valor: R$ {(kpiData.totalValorAvaria || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </Card>
      </Col>
    </Row>
  );

  // ==================== TABS ====================
  
  const tabItems = [
    {
      key: 'resumo',
      label: 'Resumo Geral',
      children: (
        <div>
          <ResumoGrafico 
            dadosSSW={dadosSSW}
            metricasOTIF={otifData}
            kpiData={kpiData}
          />
          
          {hasSSWData && (
            <>
              <h3 style={{ marginTop: 32, marginBottom: 16 }}>📦 Detalhamento de Entregas</h3>
              {renderResumoEntregas()}
              <div style={{ marginTop: 24 }}>
                <GraficoOTIF graficosRefs={graficosRefs} metricasOTIF={otifData}/>
              </div>
            </>
          )}
          
          {hasKPIData && (
            <>
              <h3 style={{ marginTop: 32, marginBottom: 16 }}>🚚 KPI - Operações</h3>
              {renderResumoKPI()}
              <div style={{ marginTop: 24 }}>
                <GraficoKPI graficosRefs={graficosRefs} />
              </div>
            </>
          )}
          
          {hasKPIData && (
            <>
              <h3 style={{ marginTop: 32, marginBottom: 16 }}>⚠️ Avarias</h3>
              {renderResumoAvarias()}
            </>
          )}
        </div>
      )
    },
    {
      key: 'entregas',
      label: `Entregas (${dadosFiltradosOTIF.length} registros)`,
      children: hasSSWData ? (
        <>
          {renderFiltrosEntregas()}
          <Table
            columns={columnsEntregas}
            dataSource={dadosFiltradosOTIF}
            rowKey="id"
            scroll={{ x: 1300 }}
            pagination={{ 
              pageSize: 20, 
              showSizeChanger: true, 
              showTotal: (total) => `Total ${total} registros`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            size="middle"
            bordered
          />
        </>
      ) : (
        <Alert
          message="Nenhum dado de entregas carregado"
          description="Faça upload do arquivo SSW (RELATORIO.xlsx) para visualizar os dados de entregas."
          type="info"
          showIcon
        />
      )
    },
    {
      key: 'kpi',
      label: `KPI (${dadosFiltradosKPI.length} dias)`,
      children: hasKPIData ? (
        <>
          {renderFiltrosKPI()}
          <Table
            columns={columnsKPI}
            dataSource={dadosFiltradosKPI}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{ 
              pageSize: 20, 
              showSizeChanger: true, 
              showTotal: (total) => `Total ${total} dias`,
              pageSizeOptions: ['10', '20', '50']
            }}
            size="middle"
            bordered
          />
        </>
      ) : (
        <Alert
          message="Nenhum dado KPI carregado"
          description="Faça upload do arquivo KPI Diário (KPI Diario - Operacional Guarulhos.xlsx) para visualizar os dados operacionais."
          type="info"
          showIcon
        />
      )
    }
  ];

  return (
    <div className="dashboard-container">
      <Card className="dashboard-card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16, 
          flexWrap: 'wrap', 
          gap: 16,
          padding: '0 8px'
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            📊 Dashboard de Performance
          </h2>
          <RelatorioPDF 
            dadosSSW={dadosSSW}
            metricasOTIF={otifData}
            dadosKPI={dadosKPI}
            metricasKPI={kpiData}
            graficosRefs={graficosRefs}
          />
        </div>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="large"
        />
      </Card>
    </div>
  );
};

export default Dashboard;