// src/componentes/BotaoImprimir/BotaoImprimir.js
import React, { useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { PrinterOutlined, LoadingOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const BotaoImprimir = ({ elementRef, title, filename = 'grafico' }) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    if (loading) return;
    
    setLoading(true);
    message.loading({ content: 'Gerando PDF...', key: 'print' });
    
    try {
      const element = elementRef.current;
      if (!element) {
        message.error('Elemento não encontrado');
        setLoading(false);
        return;
      }

      // Capturar o elemento
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Formato paisagem
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensões
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Adicionar a imagem
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      
      // Salvar
      pdf.save(`${filename}.pdf`);
      message.success({ content: 'PDF gerado!', key: 'print' });
      
    } catch (error) {
      console.error('Erro:', error);
      message.error({ content: 'Erro ao gerar PDF', key: 'print' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Salvar como PDF">
      <Button
        icon={loading ? <LoadingOutlined /> : <PrinterOutlined />}
        onClick={handlePrint}
        size="small"
        disabled={loading}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
      >
        {loading ? '...' : 'PDF'}
      </Button>
    </Tooltip>
  );
};

export default BotaoImprimir;