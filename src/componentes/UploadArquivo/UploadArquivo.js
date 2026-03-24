// src/componentes/UploadArquivo/UploadArquivo.js
import React, { useState } from 'react';
import { Upload, Button, message, Card, Space, Alert, Spin, Row, Col, Statistic } from 'antd';
import { UploadOutlined, FileExcelOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useDados } from '../../contextos/DadosContext';
import { processarDadosSSW } from '../../servicos/leitorSSW';
import { processarDadosKPI } from '../../servicos/leitorKPI';
import './UploadArquivo.css';

const UploadArquivo = () => {
  const { 
    atualizarDadosSSW, 
    atualizarDadosKPI, 
    gerarDashboard,
    limparDados,
    isLoading, 
    setIsLoading,
    dadosSSW,
    dadosKPI,
    dashboardGerado
  } = useDados();
  
  const [uploadStatus, setUploadStatus] = useState({
    ssw: { status: 'pending', message: '', registros: 0, arquivo: null },
    kpi: { status: 'pending', message: '', registros: 0, arquivo: null }
  });

  const processarArquivoSSW = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const { dadosProcessados, metricasOTIF } = processarDadosSSW(workbook);
          
          if (dadosProcessados && dadosProcessados.length > 0) {
            atualizarDadosSSW(dadosProcessados, metricasOTIF);
            setUploadStatus(prev => ({
              ...prev,
              ssw: {
                status: 'success',
                message: `${dadosProcessados.length} registros processados`,
                registros: dadosProcessados.length,
                arquivo: file.name
              }
            }));
            message.success(`Arquivo SSW processado! ${dadosProcessados.length} registros.`);
            resolve({ success: true, registros: dadosProcessados.length });
          } else {
            setUploadStatus(prev => ({
              ...prev,
              ssw: {
                status: 'error',
                message: 'Nenhum registro válido encontrado',
                registros: 0,
                arquivo: null
              }
            }));
            message.warning('Nenhum registro válido encontrado no arquivo SSW.');
            resolve({ success: false, registros: 0 });
          }
        } catch (error) {
          console.error('Erro ao processar arquivo SSW:', error);
          setUploadStatus(prev => ({
            ...prev,
            ssw: {
              status: 'error',
              message: error.message,
              registros: 0,
              arquivo: null
            }
          }));
          message.error(`Erro ao processar arquivo SSW: ${error.message}`);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
        message.error('Erro ao ler o arquivo');
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const processarArquivoKPI = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const { dadosProcessados, metricas } = processarDadosKPI(workbook);
          
          if (dadosProcessados && dadosProcessados.length > 0) {
            atualizarDadosKPI(dadosProcessados, metricas);
            setUploadStatus(prev => ({
              ...prev,
              kpi: {
                status: 'success',
                message: `${dadosProcessados.length} dias processados`,
                registros: dadosProcessados.length,
                arquivo: file.name
              }
            }));
            message.success(`Arquivo KPI processado! ${dadosProcessados.length} dias.`);
            resolve({ success: true, registros: dadosProcessados.length });
          } else {
            setUploadStatus(prev => ({
              ...prev,
              kpi: {
                status: 'error',
                message: 'Nenhum dado válido encontrado',
                registros: 0,
                arquivo: null
              }
            }));
            message.warning('Nenhum dado válido encontrado no arquivo KPI.');
            resolve({ success: false, registros: 0 });
          }
        } catch (error) {
          console.error('Erro ao processar arquivo KPI:', error);
          setUploadStatus(prev => ({
            ...prev,
            kpi: {
              status: 'error',
              message: error.message,
              registros: 0,
              arquivo: null
            }
          }));
          message.error(`Erro ao processar arquivo KPI: ${error.message}`);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
        message.error('Erro ao ler o arquivo');
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUploadSSW = async (file) => {
    setIsLoading(true);
    try {
      await processarArquivoSSW(file);
    } catch (error) {
      console.error('Falha no upload SSW:', error);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const handleUploadKPI = async (file) => {
    setIsLoading(true);
    try {
      await processarArquivoKPI(file);
    } catch (error) {
      console.error('Falha no upload KPI:', error);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const handleGerarDashboard = () => {
    if (dadosSSW.length === 0 && dadosKPI.length === 0) {
      message.warning('Nenhum arquivo processado. Faça upload dos arquivos primeiro.');
      return;
    }
    gerarDashboard();
    message.success('Dashboard gerado com sucesso!');
  };

  const handleLimpar = () => {
    limparDados();
    setUploadStatus({
      ssw: { status: 'pending', message: '', registros: 0, arquivo: null },
      kpi: { status: 'pending', message: '', registros: 0, arquivo: null }
    });
    message.info('Dados limpos. Faça novo upload dos arquivos.');
  };

  const uploadPropsSSW = {
    name: 'file',
    accept: '.xlsx, .xls',
    showUploadList: false,
    beforeUpload: handleUploadSSW,
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess('ok');
      }, 0);
    }
  };

  const uploadPropsKPI = {
    name: 'file',
    accept: '.xlsx, .xls',
    showUploadList: false,
    beforeUpload: handleUploadKPI,
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess('ok');
      }, 0);
    }
  };

  const temDados = dadosSSW.length > 0 || dadosKPI.length > 0;

  return (
    <div className="upload-container">
      <Spin spinning={isLoading} tip="Processando arquivo...">
        <Card title="Upload de Arquivos" className="upload-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="upload-section">
                <h3>
                  <FileExcelOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  Arquivo SSW (RELATORIO.xlsx)
                </h3>
                <p>Arquivo com dados de CTRCs, entregas e classificação ABC</p>
                <Upload {...uploadPropsSSW}>
                  <Button icon={<UploadOutlined />} size="large" block>
                    Selecionar Arquivo SSW
                  </Button>
                </Upload>
                {uploadStatus.ssw.status !== 'pending' && (
                  <Alert
                    message={uploadStatus.ssw.status === 'success' ? '✓ Arquivo carregado!' : '✗ Erro!'}
                    description={
                      uploadStatus.ssw.status === 'success' 
                        ? `${uploadStatus.ssw.message} - ${uploadStatus.ssw.arquivo}`
                        : uploadStatus.ssw.message
                    }
                    type={uploadStatus.ssw.status === 'success' ? 'success' : 'error'}
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                )}
                {uploadStatus.ssw.status === 'success' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    <Statistic value={uploadStatus.ssw.registros} suffix="registros" size="small" />
                  </div>
                )}
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="upload-section">
                <h3>
                  <FileExcelOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  Arquivo KPI (KPI Diario - Operacional Guarulhos.xlsx)
                </h3>
                <p>Arquivo com dados operacionais diários, veículos, avarias e retornos</p>
                <Upload {...uploadPropsKPI}>
                  <Button icon={<UploadOutlined />} size="large" block>
                    Selecionar Arquivo KPI
                  </Button>
                </Upload>
                {uploadStatus.kpi.status !== 'pending' && (
                  <Alert
                    message={uploadStatus.kpi.status === 'success' ? '✓ Arquivo carregado!' : '✗ Erro!'}
                    description={
                      uploadStatus.kpi.status === 'success' 
                        ? `${uploadStatus.kpi.message} - ${uploadStatus.kpi.arquivo}`
                        : uploadStatus.kpi.message
                    }
                    type={uploadStatus.kpi.status === 'success' ? 'success' : 'error'}
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                )}
                {uploadStatus.kpi.status === 'success' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    <Statistic value={uploadStatus.kpi.registros} suffix="dias" size="small" />
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                icon={<BarChartOutlined />}
                onClick={handleGerarDashboard}
                disabled={!temDados}
              >
                Gerar Dashboard
              </Button>
              <Button 
                size="large" 
                icon={<ReloadOutlined />}
                onClick={handleLimpar}
                disabled={!temDados}
              >
                Limpar Dados
              </Button>
            </Space>
          </div>

          {temDados && !dashboardGerado && (
            <Alert
              message="Pronto para gerar!"
              description="Os arquivos foram processados. Clique em 'Gerar Dashboard' para visualizar os resultados."
              type="success"
              showIcon
              style={{ marginTop: 24 }}
            />
          )}

          {dashboardGerado && (
            <Alert
              message="Dashboard gerado com sucesso!"
              description="Role a página para baixo para visualizar os dashboards completos."
              type="info"
              showIcon
              style={{ marginTop: 24 }}
            />
          )}

          <Alert
            message="Instruções"
            description="1. Faça upload dos arquivos Excel nos formatos corretos. 2. Aguarde o processamento. 3. Clique em 'Gerar Dashboard' para visualizar os resultados."
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default UploadArquivo;