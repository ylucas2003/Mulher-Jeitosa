# Balanço Mulher Jeitosa - Sistema de Vendas

Sistema completo para controle de vendas com frontend moderno e backend robusto.

## 📋 Estrutura do Projeto

```
sua-pasta/
├── data/
│   └── vendas.json
├── public/
│   └── index.html
├── script.js          # ✅ NA RAIZ
├── server.js          # ✅ NA RAIZ
├── package.json
└── README.md              # Este arquivo
```

## 🚀 Como Configurar e Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- NPM (vem com o Node.js)

### 1. Preparar o Ambiente

**Criar a estrutura de pastas:**
```bash
mkdir balanco-mulher-jeitosa
cd balanco-mulher-jeitosa
mkdir public data
```

### 2. Instalar Dependências

**Criar o arquivo package.json** (copie o conteúdo do arquivo `package.json` fornecido)

**Instalar as dependências:**
```bash
npm install
```

### 3. Configurar os Arquivos

**Copiar os arquivos para suas respectivas pastas:**
- `index.html` → `public/index.html` (arquivo HTML principal)
- `script.js` → `public/script.js` (JavaScript do frontend)
- `server.js` → `server.js` (servidor backend)

### 4. Executar o Sistema

**Para desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Para produção:**
```bash
npm start
```

### 5. Acessar o Sistema

Abra seu navegador e acesse:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api

## 📚 Documentação da API

### Endpoints Disponíveis

#### Vendas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vendas` | Listar todas as vendas |
| POST | `/api/vendas` | Criar nova venda |
| GET | `/api/vendas/:id` | Buscar venda específica |
| PUT | `/api/vendas/:id` | Atualizar venda |
| DELETE | `/api/vendas/:id` | Remover venda |

#### Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/relatorios` | Estatísticas e resumos |

### Exemplo de Uso da API

**Criar uma nova venda:**
```javascript
fetch('http://localhost:3000/api/vendas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    dataVenda: '2025-09-26',
    formaPagamento: 'PIX',
    produtos: [
      {
        nome: 'Produto Teste',
        precoCompra: 10.00,
        precoVenda: 15.00,
        lucro: 5.00
      }
    ],
    resumo: {
      totalCompra: 10.00,
      totalVenda: 15.00,
      lucroTotal: 5.00,
      quantidadeProdutos: 1
    }
  })
})
```

**Buscar todas as vendas:**
```javascript
fetch('http://localhost:3000/api/vendas')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🎯 Funcionalidades

### Frontend
- ✅ Interface clean e moderna
- ✅ Fundo rosa claro com gradiente
- ✅ Formulário para adicionar vendas
- ✅ Campos dinâmicos para produtos
- ✅ Cálculo automático de lucros
- ✅ Opção "Outro" para forma de pagamento
- ✅ Validações em tempo real
- ✅ Design responsivo

### Backend
- ✅ API REST completa
- ✅ Persistência em arquivo JSON
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ CORS configurado
- ✅ Relatórios e estatísticas
- ✅ Sistema de logs

## 🔧 Configurações Avançadas

### Alterar Porta do Servidor
```bash
PORT=4000 npm start
```

### Configurar CORS
Edite o arquivo `server.js` na seção de middlewares para configurar CORS específicos.

### Backup dos Dados
O arquivo `data/vendas.json` contém todos os dados. Faça backup regularmente.

## 🛠️ Desenvolvimento

### Instalar Nodemon (Desenvolvimento)
```bash
npm install -g nodemon
```

### Executar em Modo Desenvolvimento
```bash
npm run dev
```

### Estrutura de Dados

**Formato de uma venda:**
```json
{
  "id": "1695735600000",
  "dataVenda": "2025-09-26",
  "formaPagamento": "PIX",
  "produtos": [
    {
      "nome": "Produto Exemplo",
      "precoCompra": 10.00,
      "precoVenda": 15.00,
      "lucro": 5.00
    }
  ],
  "resumo": {
    "totalCompra": 10.00,
    "totalVenda": 15.00,
    "lucroTotal": 5.00,
    "quantidadeProdutos": 1
  },
  "timestamp": "2025-09-26T10:00:00.000Z",
  "status": "ativa"
}
```

## 🚨 Troubleshooting

### Erro: "Port already in use"
```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar o processo
kill -9 <PID>
```

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Dados não salvam
- Verifique se a pasta `data/` existe
- Verifique permissões de escrita
- Verifique logs do servidor

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor no terminal
2. Abra o DevTools do navegador (F12) para ver erros
3. Verifique se todos os arquivos estão nas pastas corretas

## 🔄 Próximos Passos

Funcionalidades que podem ser implementadas:
- [ ] Autenticação de usuários
- [ ] Banco de dados SQL
- [ ] Exportar relatórios PDF
- [ ] Dashboard com gráficos
- [ ] Backup automático
- [ ] Notificações push
- [ ] App mobile# Mulher-Jeitosa
