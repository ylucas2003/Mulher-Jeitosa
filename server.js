// server.js - Backend Node.js com Express
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const VENDAS_FILE = path.join(__dirname, 'data', 'vendas.json');

// Banco de dados
const { createClient } = require('@supabase/supabase-js');
const keys = require('./db/keys.json');
const supabase = createClient(keys.SUPABASE_URL, keys.SUPABASE_KEY);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para servir arquivos estáticos

// Garantir que o diretório de dados existe
async function inicializarDados() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        
        // Verificar se arquivo de vendas existe, se não, criar um vazio
        try {
            await fs.access(VENDAS_FILE);
        } catch {
            await fs.writeFile(VENDAS_FILE, JSON.stringify([], null, 2));
        }
    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
    }
}

// Função para ler vendas do arquivo
async function lerVendas() {
    try {
        const data = await fs.readFile(VENDAS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler vendas:', error);
        return [];
    }
}

// Função para salvar vendas no arquivo
async function salvarVendas(vendas) {
    try {
        await fs.writeFile(VENDAS_FILE, JSON.stringify(vendas, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar vendas:', error);
        return false;
    }
}

async function salvarVendasSupabase(venda) {
    try {
        // Para cada produto, insere uma linha na tabela 'vendas'
        const produtosParaInserir = venda.produtos.map(produto => ({
            name: produto.nome,
            sale_price: produto.precoVenda,
            purchase_price: produto.precoCompra,
            created_at: venda.dataVenda,
            id: venda.id // opcional, se quiser usar o mesmo id para todos
        }));

        const { error } = await supabase
            .from('vendas')
            .insert(produtosParaInserir);

        if (error) {
            console.error('Erro ao salvar venda no Supabase:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erro ao salvar venda no Supabase:', error);
        return false;
    }
}

// ROTAS DA API

// GET /api/vendas - Listar todas as vendas
app.get('/api/vendas', async (req, res) => {
    try {
        const vendas = await lerVendas();
        
        // Filtros opcionais
        const { data, formaPagamento, limite } = req.query;
        let vendasFiltradas = vendas;
        
        if (data) {
            vendasFiltradas = vendasFiltradas.filter(venda => 
                venda.dataVenda === data
            );
        }
        
        if (formaPagamento) {
            vendasFiltradas = vendasFiltradas.filter(venda => 
                venda.formaPagamento.toLowerCase().includes(formaPagamento.toLowerCase())
            );
        }
        
        if (limite) {
            vendasFiltradas = vendasFiltradas.slice(0, parseInt(limite));
        }
        
        res.json({
            success: true,
            data: vendasFiltradas,
            total: vendasFiltradas.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar vendas',
            error: error.message
        });
    }
});

// POST /api/vendas - Criar nova venda
app.post('/api/vendas', async (req, res) => {
    try {
        const { dataVenda, formaPagamento, produtos, resumo } = req.body;
        
        // Validação básica
        if (!dataVenda || !formaPagamento || !produtos || produtos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dados incompletos. Data, forma de pagamento e produtos são obrigatórios.'
            });
        }
        
        // Validar produtos
        for (const produto of produtos) {
            if (!produto.nome || produto.precoCompra === undefined || produto.precoVenda === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os produtos devem ter nome, preço de compra e preço de venda.'
                });
            }
        }
        
        const vendas = await lerVendas();
        
        // Criar nova venda
        const novaVenda = {
            id: Date.now().toString(), // ID simples baseado em timestamp
            dataVenda,
            formaPagamento,
            produtos,
            resumo,
            timestamp: new Date().toISOString(),
            status: 'ativa'
        };
        
        vendas.push(novaVenda);
        
        const salvou = await salvarVendas(vendas);
        const salvouSupabase = await salvarVendasSupabase(novaVenda);
        
        if (salvou && salvouSupabase) {
            res.status(201).json({
                success: true,
                message: 'Venda criada com sucesso',
                data: novaVenda
            });
        } else {
            throw new Error('Falha ao salvar no arquivo ou no Supabase');
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar venda',
            error: error.message
        });
    }
});

// GET /api/vendas/:id - Buscar venda por ID
app.get('/api/vendas/:id', async (req, res) => {
    try {
        const vendas = await lerVendas();
        const venda = vendas.find(v => v.id === req.params.id);
        
        if (!venda) {
            return res.status(404).json({
                success: false,
                message: 'Venda não encontrada'
            });
        }
        
        res.json({
            success: true,
            data: venda
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar venda',
            error: error.message
        });
    }
});

// PUT /api/vendas/:id - Atualizar venda
app.put('/api/vendas/:id', async (req, res) => {
    try {
        const vendas = await lerVendas();
        const indiceVenda = vendas.findIndex(v => v.id === req.params.id);
        
        if (indiceVenda === -1) {
            return res.status(404).json({
                success: false,
                message: 'Venda não encontrada'
            });
        }
        
        // Atualizar venda mantendo ID e timestamp original
        const vendaAtualizada = {
            ...vendas[indiceVenda],
            ...req.body,
            id: vendas[indiceVenda].id, // Manter ID original
            updatedAt: new Date().toISOString()
        };
        
        vendas[indiceVenda] = vendaAtualizada;
        
        const salvou = await salvarVendas(vendas);
        
        if (salvou) {
            res.json({
                success: true,
                message: 'Venda atualizada com sucesso',
                data: vendaAtualizada
            });
        } else {
            throw new Error('Falha ao salvar no arquivo');
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar venda',
            error: error.message
        });
    }
});

// DELETE /api/vendas/:id - Deletar venda
app.delete('/api/vendas/:id', async (req, res) => {
    try {
        const vendas = await lerVendas();
        const indiceVenda = vendas.findIndex(v => v.id === req.params.id);
        
        if (indiceVenda === -1) {
            return res.status(404).json({
                success: false,
                message: 'Venda não encontrada'
            });
        }
        
        const vendaRemovida = vendas.splice(indiceVenda, 1)[0];
        
        const salvou = await salvarVendas(vendas);
        
        if (salvou) {
            res.json({
                success: true,
                message: 'Venda removida com sucesso',
                data: vendaRemovida
            });
        } else {
            throw new Error('Falha ao salvar no arquivo');
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao remover venda',
            error: error.message
        });
    }
});

// GET /api/relatorios - Relatórios e estatísticas
app.get('/api/relatorios', async (req, res) => {
    try {
        const vendas = await lerVendas();
        
        // Calcular estatísticas
        const totalVendas = vendas.length;
        const vendasAtivas = vendas.filter(v => v.status === 'ativa');
        
        const estatisticas = vendasAtivas.reduce((acc, venda) => {
            acc.totalCompra += venda.resumo.totalCompra || 0;
            acc.totalVenda += venda.resumo.totalVenda || 0;
            acc.lucroTotal += venda.resumo.lucroTotal || 0;
            acc.totalProdutos += venda.resumo.quantidadeProdutos || 0;
            return acc;
        }, {
            totalCompra: 0,
            totalVenda: 0,
            lucroTotal: 0,
            totalProdutos: 0
        });
        
        // Vendas por forma de pagamento
        const vendasPorPagamento = vendasAtivas.reduce((acc, venda) => {
            const forma = venda.formaPagamento;
            acc[forma] = (acc[forma] || 0) + 1;
            return acc;
        }, {});
        
        // Vendas por data (últimos 30 dias)
        const hoje = new Date();
        const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const vendasRecentes = vendasAtivas.filter(venda => 
            new Date(venda.dataVenda) >= trintaDiasAtras
        );
        
        res.json({
            success: true,
            data: {
                resumo: {
                    totalVendas,
                    vendasAtivas: vendasAtivas.length,
                    ...estatisticas
                },
                vendasPorPagamento,
                vendasRecentes: vendasRecentes.length,
                periodo: {
                    inicio: trintaDiasAtras.toISOString().split('T')[0],
                    fim: hoje.toISOString().split('T')[0]
                }
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao gerar relatório',
            error: error.message
        });
    }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado'
    });
});

// Inicializar servidor
async function iniciarServidor() {
    await inicializarDados();
    
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
        console.log(`🌐 Frontend disponível em: http://localhost:${PORT}`);
        console.log(`\n📋 Endpoints disponíveis:`);
        console.log(`   GET    /api/vendas - Listar vendas`);
        console.log(`   POST   /api/vendas - Criar venda`);
        console.log(`   GET    /api/vendas/:id - Buscar venda`);
        console.log(`   PUT    /api/vendas/:id - Atualizar venda`);
        console.log(`   DELETE /api/vendas/:id - Remover venda`);
        console.log(`   GET    /api/relatorios - Estatísticas`);
    });
}

// Tratamento de sinais para encerramento gracioso
process.on('SIGTERM', () => {
    console.log('🛑 Encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    process.exit(0);
});

// Iniciar servidor
iniciarServidor().catch(console.error);