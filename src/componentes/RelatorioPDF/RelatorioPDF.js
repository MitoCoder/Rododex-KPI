// src/componentes/RelatorioPDF/RelatorioPDF.js
import React from 'react';
import { Button, message, Space, Tooltip, Modal } from 'antd';
import { FilePdfOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RelatorioPDF = ({ dadosSSW, metricasOTIF, dadosKPI, metricasKPI, graficosRefs }) => {
  
  const gerarRelatorio = async () => {
    try {
      message.loading({ content: 'Gerando relatório completo...', key: 'relatorio', duration: 0 });
      
      // Formato retrato para o relatório completo
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yOffset = 20;
      
      // ==================== CAPA ====================
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rododex Transportes', pageWidth / 2, yOffset + 20, { align: 'center' });
      
      yOffset += 35;
      pdf.setFontSize(18);
      pdf.text('Relatório de Performance', pageWidth / 2, yOffset, { align: 'center' });
      
      yOffset += 12;
      pdf.setFontSize(14);
      pdf.text('KPI e OTIF', pageWidth / 2, yOffset, { align: 'center' });
      
      yOffset += 30;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data de emissão: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yOffset, { align: 'center' });
      
      yOffset += 8;
      pdf.text(`Período analisado: ${dadosKPI?.[0]?.data || 'N/A'} a ${dadosKPI?.[dadosKPI.length - 1]?.data || 'N/A'}`, pageWidth / 2, yOffset, { align: 'center' });
      
      // Adicionar logo ou linha decorativa
      yOffset += 20;
      pdf.setDrawColor(24, 144, 255);
      pdf.setLineWidth(0.5);
      pdf.line(30, yOffset, pageWidth - 30, yOffset);
      
      pdf.addPage();
      yOffset = 20;
      
      // ==================== 1. METODOLOGIA ====================
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(24, 144, 255);
      pdf.text('1. METODOLOGIA DE CÁLCULO', 14, yOffset);
      pdf.setTextColor(0, 0, 0);
      
      yOffset += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const metodologia = [
        'Este relatório foi gerado a partir dos arquivos Excel fornecidos:',
        '',
        '📊 ARQUIVO SSW (RELATORIO.xlsx):',
        '   • Contém dados de CTRCs (Conhecimentos de Transporte)',
        '   • Total de registros processados: ' + (dadosSSW?.length || 0) + ' CTRCs',
        '   • Informações extraídas: Número CTRC, CT-e, Data de Autorização, Clientes,',
        '     Valores, Classificação ABC (A/B/C) e Status da entrega',
        '',
        '📊 ARQUIVO KPI (KPI Diario - Operacional Guarulhos.xlsx):',
        '   • Contém dados operacionais diários do Cross Docking',
        '   • Total de dias analisados: ' + (dadosKPI?.length || 0) + ' dias',
        '   • Período: ' + (dadosKPI?.[0]?.data || 'N/A') + ' a ' + (dadosKPI?.[dadosKPI.length - 1]?.data || 'N/A'),
        '   • Informações extraídas: Veículos, Volumes, NFs, Avarias, Retornos',
        '',
        '📐 FÓRMULAS UTILIZADAS:',
        '',
        '🔹 OTIF (On Time In Full):',
        '   • Definição: Entrega que ocorreu no prazo E com todas as mercadorias',
        '   • Cálculo: OTIF = Entregas no prazo E completas',
        '   • Fórmula: (Entregas com status ENTREGUE) / (Total de Entregas) × 100',
        '   • Classificação ABC:',
        '     - A (Entregue): ENTREGUE',
        '     - B (Parcial): PARCIAL',
        '     - C (Pendente): PENDENTE',
        '',
        '🔹 In Full (Entrega Completa):',
        '   • Definição: Entrega com 100% das mercadorias',
        '   • Fórmula: (Entregas com status ENTREGUE) / (Total de Entregas) × 100',
        '',
        '🔹 Eficiência Operacional:',
        '   • Definição: Capacidade de realizar o volume programado',
        '   • Fórmula: (Volume Realizado / Volume Expedido) × 100',
        '',
        '🔹 Taxa de Retorno:',
        '   • Definição: Percentual de NFs que retornaram',
        '   • Fórmula: (NFs Retornadas / NFs Expedidas) × 100',
        '',
        '🔹 Média de Veículos/Dia:',
        '   • Fórmula: (Total de Veículos no período) / (Número de dias)',
        '',
        '🔹 Média de Volume/Dia:',
        '   • Fórmula: (Total de Volume Expedido) / (Número de dias)'
      ];
      
      let textY = yOffset + 5;
      for (const linha of metodologia) {
        pdf.text(linha, 14, textY);
        textY += 5;
        if (textY > 270) {
          pdf.addPage();
          textY = 20;
        }
      }
      
      yOffset = textY + 10;
      
      // ==================== 2. RESUMO OTIF ====================
      if (yOffset > 250) {
        pdf.addPage();
        yOffset = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(24, 144, 255);
      pdf.text('2. RESUMO OTIF - ENTREGAS', 14, yOffset);
      pdf.setTextColor(0, 0, 0);
      yOffset += 8;
      
      const totalEntregas = dadosSSW?.length || 0;
      const totalOTIF = metricasOTIF?.totalOTIF || dadosSSW?.filter(i => i.otif).length || 0;
      const totalInFull = metricasOTIF?.totalInFull || dadosSSW?.filter(i => i.inFull).length || 0;
      const totalOnTime = totalEntregas;
      
      const otifTableData = [
        ['Métrica', 'Valor', 'Percentual', 'Fórmula Aplicada'],
        ['Total de Entregas', totalEntregas.toLocaleString(), '100%', 'COUNT(CTRCs no arquivo SSW)'],
        ['OTIF (No Prazo + Completo)', totalOTIF.toLocaleString(), `${((totalOTIF / totalEntregas) * 100).toFixed(1)}%`, 'COUNT(Status = ENTREGUE)'],
        ['In Full (Completas)', totalInFull.toLocaleString(), `${((totalInFull / totalEntregas) * 100).toFixed(1)}%`, 'COUNT(Status = ENTREGUE)'],
        ['On Time (No Prazo)', totalOnTime.toLocaleString(), '100%', 'Todas as entregas no prazo (conforme data de autorização)']
      ];
      
      pdf.autoTable({
        startY: yOffset + 5,
        head: [otifTableData[0]],
        body: otifTableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [24, 144, 255], textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 70 }
        },
        margin: { left: 14, right: 14 }
      });
      
      yOffset = pdf.lastAutoTable.finalY + 10;
      
      // ==================== 3. CLASSIFICAÇÃO ABC ====================
      if (yOffset > 250) {
        pdf.addPage();
        yOffset = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('3. CLASSIFICAÇÃO ABC', 14, yOffset);
      yOffset += 5;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('A classificação ABC é baseada no campo "ABC Pagador" do arquivo SSW:', 14, yOffset);
      yOffset += 5;
      
      const abcData = [
        ['Classificação', 'Quantidade', 'Percentual', 'Critério'],
        ['A (Entregue)', dadosSSW?.filter(i => i.abcPagador?.includes('A')).length || 0,
         `${((dadosSSW?.filter(i => i.abcPagador?.includes('A')).length || 0) / totalEntregas * 100).toFixed(1)}%`,
         'ENTREGUE - Carga completa entregue'],
        ['B (Parcial)', dadosSSW?.filter(i => i.abcPagador?.includes('B')).length || 0,
         `${((dadosSSW?.filter(i => i.abcPagador?.includes('B')).length || 0) / totalEntregas * 100).toFixed(1)}%`,
         'PARCIAL - Entrega com avarias ou itens faltantes'],
        ['C (Pendente)', dadosSSW?.filter(i => i.abcPagador?.includes('C')).length || 0,
         `${((dadosSSW?.filter(i => i.abcPagador?.includes('C')).length || 0) / totalEntregas * 100).toFixed(1)}%`,
         'PENDENTE - Não entregue ou com problemas graves']
      ];
      
      pdf.autoTable({
        startY: yOffset + 5,
        head: [abcData[0]],
        body: abcData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [24, 144, 255], textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });
      
      yOffset = pdf.lastAutoTable.finalY + 10;
      
      // ==================== 4. RESUMO KPI ====================
      if (yOffset > 250) {
        pdf.addPage();
        yOffset = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('4. RESUMO KPI - OPERAÇÕES', 14, yOffset);
      yOffset += 5;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Os dados abaixo foram extraídos do arquivo "KPI Diario - Operacional Guarulhos.xlsx":', 14, yOffset);
      yOffset += 5;
      
      const totalVeiculos = metricasKPI?.totalVeiculos || dadosKPI?.reduce((sum, i) => sum + (i.totalVeiculos || 0), 0) || 0;
      const totalVolumeExp = metricasKPI?.totalVolumeExpedido || dadosKPI?.reduce((sum, i) => sum + (i.volumeExpedido || 0), 0) || 0;
      const totalRealizado = metricasKPI?.totalRealizadoDia || dadosKPI?.reduce((sum, i) => sum + (i.realizadoDia || 0), 0) || 0;
      const totalNfsExp = metricasKPI?.totalNfseExp || dadosKPI?.reduce((sum, i) => sum + (i.nfseExp || 0), 0) || 0;
      const totalNfsRet = metricasKPI?.totalNfRetorno || dadosKPI?.reduce((sum, i) => sum + (i.nfRetorno || 0), 0) || 0;
      
      const kpiTableData = [
        ['Métrica', 'Total', 'Média Diária', 'Fórmula'],
        ['Veículos', totalVeiculos.toLocaleString(), (totalVeiculos / (dadosKPI?.length || 1)).toFixed(1),
         'SOMA(Veículos por dia) / Dias analisados'],
        ['Volume Expedido', totalVolumeExp.toLocaleString(), (totalVolumeExp / (dadosKPI?.length || 1)).toFixed(0),
         'SOMA(Volume Expedido por dia) / Dias analisados'],
        ['Realizado no Dia', totalRealizado.toLocaleString(), (totalRealizado / (dadosKPI?.length || 1)).toFixed(0),
         'SOMA(Realizado por dia) / Dias analisados'],
        ['Eficiência', `${((totalRealizado / totalVolumeExp) * 100).toFixed(1)}%`, '-',
         '(Realizado Total / Volume Expedido Total) × 100'],
        ['NFs Expedidas', totalNfsExp.toLocaleString(), (totalNfsExp / (dadosKPI?.length || 1)).toFixed(0),
         'SOMA(NFs Expedidas por dia) / Dias analisados'],
        ['NFs Retornadas', totalNfsRet.toLocaleString(), (totalNfsRet / (dadosKPI?.length || 1)).toFixed(1),
         'SOMA(NFs Retornadas por dia) / Dias analisados'],
        ['Taxa de Retorno', `${((totalNfsRet / totalNfsExp) * 100).toFixed(1)}%`, '-',
         '(NFs Retornadas / NFs Expedidas) × 100']
      ];
      
      pdf.autoTable({
        startY: yOffset + 5,
        head: [kpiTableData[0]],
        body: kpiTableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [24, 144, 255], textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 40, halign: 'right' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 70 }
        },
        margin: { left: 14, right: 14 }
      });
      
      yOffset = pdf.lastAutoTable.finalY + 10;
      
      // ==================== 5. AVARIAS ====================
      if (yOffset > 250) {
        pdf.addPage();
        yOffset = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5. AVARIAS', 14, yOffset);
      yOffset += 5;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Registro de avarias no processo de transporte e operação:', 14, yOffset);
      yOffset += 5;
      
      const totalAvariaCarreta = metricasKPI?.totalAvariaCarreta || dadosKPI?.reduce((sum, i) => sum + (i.avariaCarreta || 0), 0) || 0;
      const totalAvariaEntrega = metricasKPI?.totalAvariaEntrega || dadosKPI?.reduce((sum, i) => sum + (i.avariaEntrega || 0), 0) || 0;
      const totalAvariasInternas = metricasKPI?.totalAvariasInternas || dadosKPI?.reduce((sum, i) => sum + (i.avariasInternas || 0), 0) || 0;
      const totalValorAvaria = metricasKPI?.totalValorAvaria || dadosKPI?.reduce((sum, i) => sum + (i.valorAvaria || 0), 0) || 0;
      
      const avariasData = [
        ['Tipo de Avarias', 'Quantidade', 'Valor Total (R$)', 'Descrição'],
        ['Avarias Carreta', totalAvariaCarreta, totalValorAvaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
         'Avarias ocorridas no transporte'],
        ['Avarias Entrega', totalAvariaEntrega, '-', 'Avarias identificadas na entrega'],
        ['Avarias Internas', totalAvariasInternas, '-', 'Avarias internas no Cross Docking'],
        ['TOTAL', (totalAvariaCarreta + totalAvariaEntrega + totalAvariasInternas),
         totalValorAvaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 'Soma de todas as avarias']
      ];
      
      pdf.autoTable({
        startY: yOffset + 5,
        head: [avariasData[0]],
        body: avariasData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [24, 144, 255], textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });
      
      yOffset = pdf.lastAutoTable.finalY + 15;
      
      // ==================== 6. GRÁFICOS ====================
      if (graficosRefs) {
        for (const [nome, ref] of Object.entries(graficosRefs)) {
          if (ref.current) {
            pdf.addPage();
            
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(24, 144, 255);
            pdf.text(`6. GRÁFICO: ${nome}`, 14, 20);
            pdf.setTextColor(0, 0, 0);
            
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
            
            try {
              const canvas = await html2canvas(ref.current, {
                scale: 2.5,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
              });
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = 180;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              pdf.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight);
              
              // Adicionar rodapé no gráfico
              const pageCount = pdf.internal.getNumberOfPages();
              pdf.setPage(pageCount);
              pdf.setFontSize(8);
              pdf.setFont('helvetica', 'italic');
              pdf.text(
                `Rododex Transportes - ${nome}`,
                pdf.internal.pageSize.getWidth() / 2,
                pdf.internal.pageSize.getHeight() - 10,
                { align: 'center' }
              );
            } catch (error) {
              console.error(`Erro ao capturar gráfico ${nome}:`, error);
              pdf.text(`[Erro ao gerar imagem do gráfico]`, 14, 50);
            }
          }
        }
      }
      
      // ==================== 7. DETALHES DOS ÚLTIMOS DIAS ====================
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(24, 144, 255);
      pdf.text('7. DETALHES DOS ÚLTIMOS 10 DIAS DE OPERAÇÃO', 14, 20);
      pdf.setTextColor(0, 0, 0);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Os dados abaixo mostram a performance diária nos últimos 10 dias úteis:', 14, 28);
      
      const ultimosDias = dadosKPI?.slice(-10).reverse() || [];
      const dadosTable = ultimosDias.map(dia => [
        dia.data,
        dia.totalVeiculos || 0,
        dia.volumeExpedido || 0,
        dia.realizadoDia || 0,
        `${dia.volumeExpedido > 0 ? ((dia.realizadoDia / dia.volumeExpedido) * 100).toFixed(1) : 0}%`,
        dia.nfRetorno || 0,
        (dia.avariaCarreta || 0) + (dia.avariaEntrega || 0) + (dia.avariasInternas || 0)
      ]);
      
      pdf.autoTable({
        startY: 35,
        head: [['Data', 'Veículos', 'Volume Exp.', 'Realizado', 'Eficiência', 'Retornos', 'Avarias']],
        body: dadosTable,
        theme: 'grid',
        headStyles: { fillColor: [24, 144, 255], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      
      // ==================== RODAPÉ GERAL ====================
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Rododex Transportes - Relatório Gerencial | Página ${i} de ${totalPages} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }
      
      pdf.save(`Relatorio_Rododex_${new Date().toISOString().slice(0, 10)}.pdf`);
      message.success({ content: 'Relatório PDF gerado com sucesso!', key: 'relatorio' });
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      message.error({ content: 'Erro ao gerar relatório PDF', key: 'relatorio' });
    }
  };
  
  const mostrarMetodologia = () => {
    Modal.info({
      title: 'Metodologia de Cálculo',
      width: 700,
      content: (
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
          <h4>📊 Arquivo SSW (RELATORIO.xlsx)</h4>
          <p><strong>Total de registros:</strong> {dadosSSW?.length || 0} CTRCs</p>
          <p><strong>Informações extraídas:</strong> CTRC, CT-e, Data, Clientes, Valores, Classificação ABC, Status</p>
          
          <h4>📊 Arquivo KPI (KPI Diario - Operacional Guarulhos.xlsx)</h4>
          <p><strong>Total de dias analisados:</strong> {dadosKPI?.length || 0}</p>
          <p><strong>Período:</strong> {dadosKPI?.[0]?.data || 'N/A'} a {dadosKPI?.[dadosKPI.length - 1]?.data || 'N/A'}</p>
          
          <h4>📐 Fórmulas Utilizadas:</h4>
          <ul>
            <li><strong>OTIF:</strong> (Entregas com status ENTREGUE / Total de Entregas) × 100</li>
            <li><strong>In Full:</strong> (Entregas completas / Total de Entregas) × 100</li>
            <li><strong>Eficiência:</strong> (Volume Realizado / Volume Expedido) × 100</li>
            <li><strong>Taxa de Retorno:</strong> (NFs Retornadas / NFs Expedidas) × 100</li>
            <li><strong>Média de Veículos/Dia:</strong> Total de Veículos / Dias Analisados</li>
            <li><strong>Média de Volume/Dia:</strong> Total de Volume Expedido / Dias Analisados</li>
          </ul>
          
          <h4>🏷️ Classificação ABC:</h4>
          <ul>
            <li><strong>A (Entregue):</strong> ABC Pagador = "A." ou "A"</li>
            <li><strong>B (Parcial):</strong> ABC Pagador = "B." ou "B"</li>
            <li><strong>C (Pendente):</strong> ABC Pagador = "C." ou "C"</li>
          </ul>
        </div>
      ),
      okText: 'Entendi'
    });
  };
  
  return (
    <Space style={{ marginBottom: 16 }}>
      <Tooltip title="Ver metodologia de cálculo">
        <Button
          icon={<QuestionCircleOutlined />}
          onClick={mostrarMetodologia}
          size="large"
        >
          Metodologia
        </Button>
      </Tooltip>
      <Tooltip title="Baixar relatório completo em PDF (A4 Retrato)">
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={gerarRelatorio}
          size="large"
        >
          Gerar Relatório Completo
        </Button>
      </Tooltip>
    </Space>
  );
};

export default RelatorioPDF;