export function calcularMetricasOTIF(dados) {
  const totalEntregas = dados.length;
  const entregasNoPrazo = dados.filter(item => item.onTime).length;
  const entregasCompletas = dados.filter(item => item.inFull).length;
  const entregasOTIF = dados.filter(item => item.onTime && item.inFull).length;
  
  return {
    totalEntregas,
    entregasNoPrazo,
    entregasCompletas,
    entregasOTIF,
    taxaOnTime: totalEntregas > 0 ? (entregasNoPrazo / totalEntregas) * 100 : 0,
    taxaInFull: totalEntregas > 0 ? (entregasCompletas / totalEntregas) * 100 : 0,
    taxaOTIF: totalEntregas > 0 ? (entregasOTIF / totalEntregas) * 100 : 0,
    dataCalculo: new Date().toLocaleDateString('pt-BR')
  };
}

export function calcularTendencia(metricasAtuais, metricasAnteriores) {
  if (!metricasAnteriores) return { tendencia: 'neutro', variacao: 0 };
  
  const variacao = metricasAtuais.taxaOTIF - metricasAnteriores.taxaOTIF;
  const tendencia = variacao > 0 ? 'positiva' : variacao < 0 ? 'negativa' : 'neutra';
  
  return { tendencia, variacao: Math.abs(variacao).toFixed(2) };
}