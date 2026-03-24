import React from 'react';
import { Table, Tag, Space, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EnvironmentOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import './TabelaDados.css';

function TabelaDados({ dados }) {
  const columns = [
    {
      title: 'CTRC',
      dataIndex: 'ctrc',
      key: 'ctrc',
      sorter: (a, b) => a.ctrc.localeCompare(b.ctrc),
      width: 120,
      fixed: 'left',
      render: (text) => React.createElement(Tooltip, { title: text }, React.createElement('span', { style: { fontWeight: 500 } }, text))
    },
    {
      title: 'CT-e',
      dataIndex: 'cte',
      key: 'cte',
      width: 120
    },
    {
      title: 'Data',
      dataIndex: 'dataAutorizacao',
      key: 'dataAutorizacao',
      sorter: (a, b) => new Date(a.dataAutorizacao) - new Date(b.dataAutorizacao),
      width: 110
    },
    {
      title: 'Remetente',
      dataIndex: 'clienteRemetente',
      key: 'clienteRemetente',
      width: 200,
      ellipsis: true,
      render: (text) => React.createElement(Tooltip, { title: text }, React.createElement('span', null, text))
    },
    {
      title: 'Destinatário',
      dataIndex: 'clienteDestinatario',
      key: 'clienteDestinatario',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => a.clienteDestinatario.localeCompare(b.clienteDestinatario),
      render: (text) => React.createElement(Tooltip, { title: text }, React.createElement('span', null, text))
    },
    {
      title: 'Cidade/UF',
      key: 'local',
      width: 130,
      render: (_, record) => React.createElement(Space, { size: 4 },
        React.createElement(EnvironmentOutlined, { style: { fontSize: 12 } }),
        React.createElement('span', null, record.cidadeEntrega),
        React.createElement(Tag, { size: 'small', color: 'geekblue' }, record.ufEntrega || '—')
      )
    },
    {
      title: 'Valor (R$)',
      dataIndex: 'valorMercadoria',
      key: 'valorMercadoria',
      render: (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      sorter: (a, b) => a.valorMercadoria - b.valorMercadoria,
      width: 120
    },
    {
      title: 'Frete (R$)',
      dataIndex: 'valorFrete',
      key: 'valorFrete',
      render: (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      width: 100
    },
    {
      title: 'ABC',
      dataIndex: 'abcPagador',
      key: 'abcPagador',
      render: (abc) => {
        let color = 'default';
        if (abc === 'A.' || abc === 'A') color = 'green';
        else if (abc === 'B.' || abc === 'B') color = 'orange';
        else if (abc === 'C.' || abc === 'C') color = 'red';
        return React.createElement(Tag, { color: color }, abc);
      },
      filters: [
        { text: 'A (ENTREGUE)', value: 'A.' },
        { text: 'B (PARCIAL)', value: 'B.' },
        { text: 'C (PENDENTE)', value: 'C.' },
      ],
      onFilter: (value, record) => record.abcPagador === value || record.abcPagador === value.replace('.', ''),
      width: 80
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'ENTREGUE') {
          return React.createElement(Tag, { icon: React.createElement(CheckCircleOutlined), color: 'success' }, 'ENTREGUE');
        }
        if (status === 'PARCIAL') {
          return React.createElement(Tag, { icon: React.createElement(CloseCircleOutlined), color: 'warning' }, 'PARCIAL');
        }
        return React.createElement(Tag, { icon: React.createElement(CloseCircleOutlined), color: 'error' }, status);
      },
      width: 100
    },
    {
      title: 'In-Full',
      dataIndex: 'inFull',
      key: 'inFull',
      render: (inFull) => {
        if (inFull) {
          return React.createElement(Tag, { icon: React.createElement(CheckCircleOutlined), color: 'success' }, 'Completo');
        }
        return React.createElement(Tag, { icon: React.createElement(CloseCircleOutlined), color: 'warning' }, 'Incompleto');
      },
      width: 100
    },
    {
      title: 'OTIF',
      dataIndex: 'otif',
      key: 'otif',
      render: (otif) => {
        if (otif) {
          return React.createElement(Tag, { icon: React.createElement(CheckCircleOutlined), color: 'processing' }, 'OTIF OK');
        }
        return React.createElement(Tag, { icon: React.createElement(CloseCircleOutlined), color: 'default' }, 'OTIF NOK');
      },
      width: 100
    }
  ];

  return React.createElement(Table, {
    columns: columns,
    dataSource: dados,
    rowKey: 'id',
    pagination: {
      pageSize: 15,
      showSizeChanger: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} CTRCs`,
      pageSizeOptions: ['15', '30', '50', '100']
    },
    scroll: { x: 1400 },
    bordered: true,
    size: 'middle',
    sticky: true
  });
}

export default TabelaDados;