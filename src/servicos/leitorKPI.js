// src/servicos/leitorKPI.js
import * as XLSX from 'xlsx';

export function processarDadosKPI(workbook) {
  try {
    console.log('📊 Processando arquivo KPI...');
    
    if (!workbook || !workbook.SheetNames) {
      console.log('❌ Workbook inválido');
      return { dadosProcessados: [], metricas: {} };
    }
    
    // Procurar pela planilha "OPERAÇÃO - GRU"
    let sheetName = '';
    let worksheet = null;
    
    for (const name of workbook.SheetNames) {
      if (name === 'OPERAÇÃO - GRU') {
        sheetName = name;
        worksheet = workbook.Sheets[name];
        break;
      }
    }
    
    if (!worksheet && workbook.SheetNames.length > 0) {
      sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
    }
    
    if (!worksheet) {
      console.log('❌ Planilha não encontrada');
      return { dadosProcessados: [], metricas: {} };
    }
    
    console.log('📄 Nome da planilha:', sheetName);
    
    const dadosRaw = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '',
      blankrows: false 
    });
    
    console.log('📊 Total de linhas raw:', dadosRaw.length);
    
    if (dadosRaw.length === 0) {
      return { dadosProcessados: [], metricas: {} };
    }
    
    // Encontrar a linha de cabeçalho (onde tem "DATA")
    let headerIndex = -1;
    let headerRow = [];
    
    for (let i = 0; i < dadosRaw.length; i++) {
      const row = dadosRaw[i];
      if (!row) continue;
      
      // Verificar se a linha tem "DATA" na coluna 1 (índice 1)
      if (row[1] && String(row[1]).toUpperCase() === 'DATA') {
        headerIndex = i;
        headerRow = row;
        console.log(`✅ Cabeçalho encontrado na linha ${i}`);
        break;
      }
    }
    
    if (headerIndex === -1) {
      console.log('❌ Cabeçalho não encontrado');
      return { dadosProcessados: [], metricas: {} };
    }
    
    // MAPEAMENTO DAS COLUNAS BASEADO NO ARQUIVO
    const indices = {
      data: 1,                    // Coluna B - DATA
      totalVeiculos: 6,          // Coluna G - TOTAL DE VEICULO
      nfsAtrasadas: 7,           // Coluna H - NF's ATRASADAS
      nfseExp: 8,                // Coluna I - NF-e EXP.
      volumeExpedido: 10,        // Coluna K - VOLUME EXPEDIDO
      realizadoDia: 11,          // Coluna L - REALIZADO
      nfRetorno: 12,             // Coluna M - NF - RETORNO
      inicioRecebimento: 14,     // Coluna O - INICIO (recebimento)
      finalRecebimento: 15,      // Coluna P - FINAL (recebimento)
      totalRecebimento: 16,      // Coluna Q - TOTAL (recebimento)
      nfRecebimento: 17,         // Coluna R - NF - e
      volumeRecebimento: 18,     // Coluna S - VOLUME (recebimento)
      avariaCarreta: 20,         // Coluna U - AVARIA CARRETA
      avariaEntrega: 21,         // Coluna V - AVARIA ENTREGA
      avariasInternas: 22,       // Coluna W - AVARIAS INTERNAS
      nfAvaria: 23,              // Coluna X - NF
      valorAvaria: 24,           // Coluna Y - VALOR
      nfsRisso: 29,              // Coluna AD - NF'S RISSO
      volumesRisso: 30,          // Coluna AE - VOLUMES (Risso)
      nfsRao: 31,                // Coluna AF - NF'S RÃO
      volumesRao: 32,            // Coluna AG - VOLUMES (Rão)
      nfsLtn: 33,                // Coluna AH - NF'S LTN
      volumesLtn: 34             // Coluna AI - VOLUMES (LTN)
    };
    
    console.log('📋 Mapeamento de colunas:', indices);
    
    const dadosProcessados = [];
    let linhasProcessadas = 0;
    let linhasIgnoradas = 0;
    
    const converterData = (valor) => {
      if (!valor) return null;
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
    
    const getNumber = (row, index) => {
      if (index === -1) return 0;
      const val = row[index];
      if (val === undefined || val === null || val === '' || val === '-') return 0;
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };
    
    for (let i = headerIndex + 1; i < dadosRaw.length; i++) {
      const row = dadosRaw[i];
      if (!row || row.length === 0) {
        linhasIgnoradas++;
        continue;
      }
      
      // Extrair data
      let data = '';
      if (row[indices.data] !== undefined && row[indices.data] !== '') {
        const dataConvertida = converterData(row[indices.data]);
        if (dataConvertida) data = dataConvertida;
      }
      
      if (!data || data === '') {
        linhasIgnoradas++;
        continue;
      }
      
      // Verificar se é uma linha de dados válida
      const totalVeiculos = getNumber(row, indices.totalVeiculos);
      if (totalVeiculos === 0 && linhasProcessadas > 0 && dadosProcessados.length > 0) {
        // Pode ser linha de total, pular
        continue;
      }
      
      // Extrair todos os valores
      const nfseExp = getNumber(row, indices.nfseExp);
      const realizadoDia = getNumber(row, indices.realizadoDia);
      const nfRetorno = getNumber(row, indices.nfRetorno);
      const volumeExpedido = getNumber(row, indices.volumeExpedido);
      const volumeRecebimento = getNumber(row, indices.volumeRecebimento);
      const nfsAtrasadas = getNumber(row, indices.nfsAtrasadas);
      
      // Avarias
      let avariaCarreta = 0;
      let avariaEntrega = 0;
      let avariasInternas = 0;
      let valorAvaria = 0;
      
      if (indices.avariaCarreta !== -1 && row[indices.avariaCarreta] !== undefined) {
        const val = row[indices.avariaCarreta];
        if (typeof val === 'number') avariaCarreta = val;
        else if (typeof val === 'string' && val !== '-' && val !== '') {
          const match = val.match(/\d+/);
          if (match) avariaCarreta = parseInt(match[0], 10);
        }
      }
      
      if (indices.avariaEntrega !== -1 && row[indices.avariaEntrega] !== undefined) {
        const val = row[indices.avariaEntrega];
        if (typeof val === 'number') avariaEntrega = val;
        else if (typeof val === 'string' && val !== '-' && val !== '') {
          const match = val.match(/\d+/);
          if (match) avariaEntrega = parseInt(match[0], 10);
        }
      }
      
      if (indices.avariasInternas !== -1 && row[indices.avariasInternas] !== undefined) {
        const val = row[indices.avariasInternas];
        if (typeof val === 'number') avariasInternas = val;
        else if (typeof val === 'string' && val !== '-' && val !== '') {
          const match = val.match(/\d+/);
          if (match) avariasInternas = parseInt(match[0], 10);
        }
      }
      
      if (indices.valorAvaria !== -1 && row[indices.valorAvaria] !== undefined) {
        const val = row[indices.valorAvaria];
        if (typeof val === 'number') valorAvaria = val;
        else if (typeof val === 'string' && val !== '-' && val !== '') {
          valorAvaria = parseFloat(val) || 0;
        }
      }
      
      // NFs parceiros
      const nfsRisso = getNumber(row, indices.nfsRisso);
      const volumesRisso = getNumber(row, indices.volumesRisso);
      const nfsRao = getNumber(row, indices.nfsRao);
      const volumesRao = getNumber(row, indices.volumesRao);
      const nfsLtn = getNumber(row, indices.nfsLtn);
      const volumesLtn = getNumber(row, indices.volumesLtn);
      
      dadosProcessados.push({
        id: dadosProcessados.length + 1,
        data: data,
        totalVeiculos: totalVeiculos,
        nfsAtrasadas: nfsAtrasadas,
        nfseExp: nfseExp,
        volumeExpedido: volumeExpedido,
        realizadoDia: realizadoDia,
        nfRetorno: nfRetorno,
        volumeRecebimento: volumeRecebimento,
        avariaCarreta: avariaCarreta,
        avariaEntrega: avariaEntrega,
        avariasInternas: avariasInternas,
        valorAvaria: valorAvaria,
        nfsRisso: nfsRisso,
        volumesRisso: volumesRisso,
        nfsRao: nfsRao,
        volumesRao: volumesRao,
        nfsLtn: nfsLtn,
        volumesLtn: volumesLtn
      });
      
      linhasProcessadas++;
    }
    
    console.log(`✅ Processados ${dadosProcessados.length} dias de operação`);
    console.log(`📊 Linhas ignoradas: ${linhasIgnoradas}`);
    
    if (dadosProcessados.length > 0) {
      console.log('📝 Primeiro dia:', dadosProcessados[0]);
      console.log('📝 Último dia:', dadosProcessados[dadosProcessados.length - 1]);
    }
    
    // Calcular métricas
    const totalVeiculos = dadosProcessados.reduce((sum, item) => sum + item.totalVeiculos, 0);
    const totalNfsExpedidas = dadosProcessados.reduce((sum, item) => sum + item.nfseExp, 0);
    const totalNfsRealizadas = dadosProcessados.reduce((sum, item) => sum + item.realizadoDia, 0);
    const totalNfRetorno = dadosProcessados.reduce((sum, item) => sum + item.nfRetorno, 0);
    const totalAvariaCarreta = dadosProcessados.reduce((sum, item) => sum + item.avariaCarreta, 0);
    const totalAvariaEntrega = dadosProcessados.reduce((sum, item) => sum + item.avariaEntrega, 0);
    const totalAvariasInternas = dadosProcessados.reduce((sum, item) => sum + item.avariasInternas, 0);
    const totalValorAvaria = dadosProcessados.reduce((sum, item) => sum + item.valorAvaria, 0);
    
    const metricas = {
      totalVeiculos,
      totalNfsExpedidas,
      totalNfsRealizadas,
      totalNfRetorno,
      totalAvariaCarreta,
      totalAvariaEntrega,
      totalAvariasInternas,
      totalValorAvaria,
      taxaEficiencia: totalNfsExpedidas > 0 ? (totalNfsRealizadas / totalNfsExpedidas) * 100 : 0,
      taxaRetorno: totalNfsExpedidas > 0 ? (totalNfRetorno / totalNfsExpedidas) * 100 : 0,
      mediaVeiculosPorDia: dadosProcessados.length > 0 ? totalVeiculos / dadosProcessados.length : 0,
      mediaNfsExpedidasPorDia: dadosProcessados.length > 0 ? totalNfsExpedidas / dadosProcessados.length : 0,
      diasAnalisados: dadosProcessados.length
    };
    
    console.log('📊 Métricas calculadas:', metricas);
    
    return { dadosProcessados, metricas };
    
  } catch (error) {
    console.error('❌ Erro ao processar arquivo KPI:', error);
    console.error('Stack trace:', error.stack);
    return { dadosProcessados: [], metricas: {} };
  }
}