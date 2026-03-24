// src/servicos/leitorSSW.js
import * as XLSX from 'xlsx';

export function processarDadosSSW(workbook) {
  try {
    console.log('📊 Processando arquivo SSW...');
    console.log('Workbook:', workbook?.SheetNames);
    
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      console.log('❌ Workbook inválido');
      return { dadosProcessados: [], metricasOTIF: {} };
    }
    
    const primeiraPlanilha = workbook.SheetNames[0];
    console.log('📄 Nome da planilha:', primeiraPlanilha);
    const worksheet = workbook.Sheets[primeiraPlanilha];
    
    const dadosRaw = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false
    });
    
    console.log('📊 Total de linhas raw:', dadosRaw.length);
    if (dadosRaw.length === 0) return { dadosProcessados: [], metricasOTIF: {} };
    
    // Mostrar primeiras linhas para debug
    console.log('Primeiras 10 linhas (completas):');
    for (let i = 0; i < Math.min(10, dadosRaw.length); i++) {
      const linha = dadosRaw[i];
      const amostra = linha.slice(0, Math.min(20, linha.length));
      console.log(`Linha ${i}:`, amostra);
    }
    
    // Encontrar cabeçalho "Serie/Numero CTRC"
    let headerIndex = -1;
    let headerRow = [];
    
    for (let i = 0; i < dadosRaw.length; i++) {
      const row = dadosRaw[i];
      if (!row) continue;
      for (let j = 0; j < row.length; j++) {
        const valor = row[j];
        if (valor && typeof valor === 'string') {
          const valorTrim = valor.trim();
          if (valorTrim === 'Serie/Numero CTRC' || (valorTrim.includes('CTRC') && valorTrim.includes('Serie'))) {
            headerIndex = i;
            headerRow = row;
            console.log(`✅ Cabeçalho encontrado na linha ${i}, coluna ${j}:`, headerRow.slice(0, 25));
            break;
          }
        }
      }
      if (headerIndex !== -1) break;
    }
    
    if (headerIndex === -1) {
      console.log('❌ Cabeçalho não encontrado, tentando linha 2');
      if (dadosRaw[2]) {
        headerIndex = 2;
        headerRow = dadosRaw[2];
      } else {
        return { dadosProcessados: [], metricasOTIF: {} };
      }
    }
    
    // Mapeamento das colunas (baseado no relatório)
    const indices = {
      ctrc: -1, cte: -1, dataAutorizacao: -1, clienteRemetente: -1,
      clienteDestinatario: -1, cidadeEntrega: -1, ufEntrega: -1,
      unidadeReceptora: -1, valorMercadoria: -1, valorFrete: -1,
      abcPagador: -1, previsaoEntrega: -1, dataEntregaRealizada: -1,
      diasAtraso: -1, statusUltimaOcorrencia: -1, volumes: -1, notasFiscais: -1
    };
    
    for (let j = 0; j < headerRow.length; j++) {
      const col = headerRow[j];
      if (!col) continue;
      const colStr = String(col).toLowerCase().trim();
      if (colStr.includes('ctrc') && colStr.includes('serie')) indices.ctrc = j;
      else if (colStr.includes('ct-e') || colStr.includes('cte')) indices.cte = j;
      else if (colStr.includes('data') && colStr.includes('autorizacao')) indices.dataAutorizacao = j;
      else if (colStr.includes('cliente') && colStr.includes('remetente')) indices.clienteRemetente = j;
      else if (colStr.includes('cliente') && colStr.includes('destinatario')) indices.clienteDestinatario = j;
      else if (colStr.includes('cidade') && colStr.includes('entrega')) indices.cidadeEntrega = j;
      else if (colStr.includes('uf') && colStr.includes('entrega')) indices.ufEntrega = j;
      else if (colStr.includes('unidade') && colStr.includes('receptora')) indices.unidadeReceptora = j;
      else if (colStr.includes('valor') && colStr.includes('mercadoria')) indices.valorMercadoria = j;
      else if (colStr.includes('valor') && colStr.includes('frete')) indices.valorFrete = j;
      else if (colStr.includes('abc') && colStr.includes('pagador')) indices.abcPagador = j;
      else if (colStr.includes('previsao') && colStr.includes('entrega')) indices.previsaoEntrega = j;
      else if (colStr.includes('data') && colStr.includes('entrega') && colStr.includes('realizada')) indices.dataEntregaRealizada = j;
      else if (colStr.includes('quantidade') && colStr.includes('dias') && colStr.includes('atraso')) indices.diasAtraso = j;
      else if (colStr.includes('descricao') && colStr.includes('ultima') && colStr.includes('ocorrencia')) indices.statusUltimaOcorrencia = j;
      else if (colStr === 'volumes') indices.volumes = j;
      else if (colStr.includes('notas') && colStr.includes('fiscais')) indices.notasFiscais = j;
    }
    
    // Fallback posições fixas
    if (indices.ctrc === -1) indices.ctrc = 0;
    if (indices.cte === -1) indices.cte = 1;
    if (indices.dataAutorizacao === -1) indices.dataAutorizacao = 3;
    if (indices.clienteRemetente === -1) indices.clienteRemetente = 5;
    if (indices.clienteDestinatario === -1) indices.clienteDestinatario = 11;
    if (indices.cidadeEntrega === -1) indices.cidadeEntrega = 12;
    if (indices.ufEntrega === -1) indices.ufEntrega = 13;
    if (indices.unidadeReceptora === -1) indices.unidadeReceptora = 14;
    if (indices.valorMercadoria === -1) indices.valorMercadoria = 15;
    if (indices.valorFrete === -1) indices.valorFrete = 16;
    if (indices.abcPagador === -1) indices.abcPagador = 21;
    if (indices.previsaoEntrega === -1) indices.previsaoEntrega = 29;
    if (indices.dataEntregaRealizada === -1) indices.dataEntregaRealizada = 31;
    if (indices.diasAtraso === -1) indices.diasAtraso = 32;
    if (indices.statusUltimaOcorrencia === -1) indices.statusUltimaOcorrencia = 27;
    if (indices.volumes === -1) indices.volumes = 38;
    if (indices.notasFiscais === -1) indices.notasFiscais = 36;
    
    console.log('📋 Mapeamento de colunas final:', indices);
    
    const converterData = (valor) => {
      if (!valor || valor === '') return null;
      if (typeof valor === 'number') {
        const data = new Date((valor - 25569) * 86400 * 1000);
        return data.toISOString().split('T')[0];
      }
      if (typeof valor === 'string') {
        if (valor.includes(' ')) return valor.split(' ')[0];
        return valor;
      }
      return null;
    };
    
    const contarNFs = (notasStr) => {
      if (!notasStr || notasStr === '') return 0;
      const notas = String(notasStr).split(/[,\s]+/).filter(n => n.trim() !== '');
      return notas.length;
    };
    
    const dadosProcessados = [];
    let linhasIgnoradas = 0;
    
    for (let i = headerIndex + 1; i < dadosRaw.length; i++) {
      const row = dadosRaw[i];
      if (!row || row.length === 0) { linhasIgnoradas++; continue; }
      
      const ctrc = row[indices.ctrc] ? String(row[indices.ctrc]).trim() : '';
      if (!ctrc || ctrc === '' || ctrc === 'undefined') { linhasIgnoradas++; continue; }
      if (ctrc.includes('TOTAL') || ctrc.includes('Sum') || ctrc.includes('Total')) { linhasIgnoradas++; continue; }
      if (ctrc.includes('LEMES E SENA') || ctrc.includes('CTRCs EXPEDIDOS')) { linhasIgnoradas++; continue; }
      
      const cte = row[indices.cte] ? String(row[indices.cte]).trim() : '';
      const dataPrevisao = converterData(row[indices.previsaoEntrega]);
      const dataEntrega = converterData(row[indices.dataEntregaRealizada]);
      const diasAtraso = row[indices.diasAtraso] ? parseFloat(row[indices.diasAtraso]) : null;
      const clienteRemetente = row[indices.clienteRemetente] ? String(row[indices.clienteRemetente]).trim() : '';
      const clienteDestinatario = row[indices.clienteDestinatario] ? String(row[indices.clienteDestinatario]).trim() : '';
      const cidadeEntrega = row[indices.cidadeEntrega] ? String(row[indices.cidadeEntrega]).trim() : '';
      const ufEntrega = row[indices.ufEntrega] ? String(row[indices.ufEntrega]).trim() : '';
      const unidadeReceptora = row[indices.unidadeReceptora] ? String(row[indices.unidadeReceptora]).trim() : '';
      const volumes = parseFloat(row[indices.volumes]) || 0;
      let qtdNFs = 0;
      if (indices.notasFiscais !== -1 && row[indices.notasFiscais]) {
        qtdNFs = contarNFs(row[indices.notasFiscais]);
      }
      if (qtdNFs === 0 && volumes > 0) qtdNFs = volumes;
      
      let valorMercadoria = 0, valorFrete = 0;
      const mercadoriaRaw = row[indices.valorMercadoria];
      if (mercadoriaRaw !== undefined && mercadoriaRaw !== '') {
        valorMercadoria = parseFloat(mercadoriaRaw);
        if (isNaN(valorMercadoria)) valorMercadoria = 0;
      }
      const freteRaw = row[indices.valorFrete];
      if (freteRaw !== undefined && freteRaw !== '') {
        valorFrete = parseFloat(freteRaw);
        if (isNaN(valorFrete)) valorFrete = 0;
      }
      
      let abcPagador = '';
      if (indices.abcPagador !== -1 && row[indices.abcPagador]) {
        abcPagador = String(row[indices.abcPagador]).trim();
      }
      
      // Status apenas para referência
      let status = 'PENDENTE';
      const abcUpper = abcPagador.toUpperCase();
      if (abcUpper === 'A.' || abcUpper === 'A') status = 'ENTREGUE';
      else if (abcUpper === 'B.' || abcUpper === 'B') status = 'PARCIAL';
      else if (abcUpper === 'C.' || abcUpper === 'C' || abcUpper === '.') status = 'PENDENTE';
      
      // On Time
      let onTime = false;
      if (dataEntrega && dataPrevisao) {
        if (dataEntrega <= dataPrevisao) onTime = true;
      } else if (dataEntrega && !dataPrevisao) {
        onTime = true; // entregue sem previsão cadastrada, consideramos no prazo
      }
      
      dadosProcessados.push({
        id: dadosProcessados.length + 1,
        ctrc, cte,
        dataPrevisao, dataEntrega, diasAtraso,
        valorMercadoria, valorFrete,
        clienteRemetente, clienteDestinatario,
        cidadeEntrega, ufEntrega, unidadeReceptora,
        abcPagador, status,
        volumes, qtdNFs,
        onTime
      });
    }
    
    console.log(`✅ Processados: ${dadosProcessados.length} CTRCs`);
    console.log(`📊 Linhas ignoradas: ${linhasIgnoradas}`);
    
    // Métricas
    const totalEntregas = dadosProcessados.length;
    const totalRealizadas = dadosProcessados.filter(item => item.dataEntrega).length;
    const totalNoPrazo = dadosProcessados.filter(item => item.onTime).length;
    const totalAtraso = dadosProcessados.filter(item => item.diasAtraso > 0).length;
    const atrasoMedio = totalAtraso > 0 
      ? dadosProcessados.filter(item => item.diasAtraso > 0).reduce((s, i) => s + (i.diasAtraso || 0), 0) / totalAtraso
      : 0;
    
    const metricasOTIF = {
      totalEntregas,
      totalRealizadas,
      totalNoPrazo,
      totalAtraso,
      atrasoMedio: atrasoMedio.toFixed(1),
      taxaOnTime: totalEntregas > 0 ? (totalNoPrazo / totalEntregas) * 100 : 0,
      taxaInFull: totalRealizadas > 0 ? (totalNoPrazo / totalRealizadas) * 100 : 0
    };
    
    console.log('📊 Métricas OTIF:', metricasOTIF);
    return { dadosProcessados, metricasOTIF };
    
  } catch (error) {
    console.error('❌ Erro ao processar arquivo SSW:', error);
    return { dadosProcessados: [], metricasOTIF: {} };
  }
}