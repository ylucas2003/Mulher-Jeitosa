// script.js - Frontend JavaScript

let contadorProdutos = 0;

// Configuração da API
const API_BASE_URL = '/api'; // Caminho relativo para funcionar em produção

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Definir data atual por padrão
    document.getElementById('dataVenda').valueAsDate = new Date();
    
    // Carregar vendas existentes
    carregarVendas();
});

function toggleOutroPagamento() {
    const formaPagamento = document.getElementById('formaPagamento').value;
    const outroPagamentoInput = document.getElementById('outroPagamento');
    
    if (formaPagamento === 'outro') {
        outroPagamentoInput.style.display = 'block';
        outroPagamentoInput.required = true;
    } else {
        outroPagamentoInput.style.display = 'none';
        outroPagamentoInput.required = false;
        outroPagamentoInput.value = '';
    }
}

function adicionarProduto() {
    const dataVenda = document.getElementById('dataVenda').value;
    const formaPagamento = document.getElementById('formaPagamento').value;
    const outroPagamento = document.getElementById('outroPagamento').value;

    if (!dataVenda || !formaPagamento) {
        alert('Por favor, preencha a data de venda e forma de pagamento antes de adicionar produtos.');
        return;
    }

    if (formaPagamento === 'outro' && !outroPagamento.trim()) {
        alert('Por favor, especifique a forma de pagamento.');
        return;
    }

    contadorProdutos++;
    const container = document.getElementById('produtos-container');
    
    const produtoDiv = document.createElement('div');
    produtoDiv.className = 'product-item';
    produtoDiv.id = `produto-${contadorProdutos}`;
    
    produtoDiv.innerHTML = `
        <div class="product-form">
            <div class="form-group">
                <label for="nome-${contadorProdutos}">Nome do Produto</label>
                <input type="text" id="nome-${contadorProdutos}" placeholder="Digite o nome do produto" required>
            </div>
            <div class="form-group">
                <label for="precoCompra-${contadorProdutos}">Preço de Compra</label>
                <input type="number" id="precoCompra-${contadorProdutos}" placeholder="0,00" step="0.01" min="0" required onchange="calcularTotal()">
            </div>
            <div class="form-group">
                <label for="precoVenda-${contadorProdutos}">Preço de Venda</label>
                <input type="number" id="precoVenda-${contadorProdutos}" placeholder="0,00" step="0.01" min="0" required onchange="calcularTotal()">
            </div>
            <button class="remove-button" onclick="removerProduto(${contadorProdutos})">Remover</button>
        </div>
    `;
    
    container.appendChild(produtoDiv);
    document.getElementById('resumo').style.display = 'block';
    calcularTotal();
}

function removerProduto(id) {
    const produto = document.getElementById(`produto-${id}`);
    produto.remove();
    calcularTotal();
    
    // Se não há mais produtos, esconder o resumo
    const produtosRestantes = document.querySelectorAll('.product-item');
    if (produtosRestantes.length === 0) {
        document.getElementById('resumo').style.display = 'none';
    }
}

function calcularTotal() {
    let totalCompra = 0;
    let totalVenda = 0;
    
    const produtosCompra = document.querySelectorAll('[id^="precoCompra-"]');
    const produtosVenda = document.querySelectorAll('[id^="precoVenda-"]');
    
    produtosCompra.forEach(input => {
        const valor = parseFloat(input.value) || 0;
        totalCompra += valor;
    });
    
    produtosVenda.forEach(input => {
        const valor = parseFloat(input.value) || 0;
        totalVenda += valor;
    });
    
    const lucro = totalVenda - totalCompra;
    
    document.getElementById('totalCompra').textContent = totalCompra.toFixed(2).replace('.', ',');
    document.getElementById('totalVenda').textContent = totalVenda.toFixed(2).replace('.', ',');
    document.getElementById('lucro').textContent = lucro.toFixed(2).replace('.', ',');
}

function coletarDadosVenda() {
    const dataVenda = document.getElementById('dataVenda').value;
    const formaPagamento = document.getElementById('formaPagamento').value;
    const outroPagamento = document.getElementById('outroPagamento').value;
    
    const produtos = [];
    const produtosItems = document.querySelectorAll('.product-item');
    
    produtosItems.forEach((item) => {
        const id = item.id.split('-')[1];
        const nome = document.getElementById(`nome-${id}`).value;
        const precoCompra = parseFloat(document.getElementById(`precoCompra-${id}`).value) || 0;
        const precoVenda = parseFloat(document.getElementById(`precoVenda-${id}`).value) || 0;
        
        if (nome.trim()) {
            produtos.push({
                nome: nome.trim(),
                precoCompra,
                precoVenda,
                lucro: precoVenda - precoCompra
            });
        }
    });
    
    const totalCompra = produtos.reduce((acc, produto) => acc + produto.precoCompra, 0);
    const totalVenda = produtos.reduce((acc, produto) => acc + produto.precoVenda, 0);
    const lucroTotal = totalVenda - totalCompra;
    
    return {
        dataVenda,
        formaPagamento: formaPagamento === 'outro' ? outroPagamento : formaPagamento,
        produtos,
        resumo: {
            totalCompra,
            totalVenda,
            lucroTotal,
            quantidadeProdutos: produtos.length
        },
        timestamp: new Date().toISOString()
    };
}

async function salvarVenda() {
    const dadosVenda = coletarDadosVenda();
    
    // Validação
    if (!dadosVenda.produtos.length) {
        alert('Adicione pelo menos um produto para salvar a venda.');
        return;
    }

    try {
        // Mostrar loading
        const botaoSalvar = event.target;
        const textoOriginal = botaoSalvar.innerHTML;
        botaoSalvar.innerHTML = '⏳ Salvando...';
        botaoSalvar.disabled = true;

        const response = await fetch(`${API_BASE_URL}/vendas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosVenda)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        
        alert('Venda salva com sucesso!');
        console.log('Venda salva:', resultado);
        
        // Limpar formulário
        limparFormulario();
        
        // Recarregar vendas
        await carregarVendas();

    } catch (error) {
        console.error('Erro ao salvar venda:', error);
        alert('Erro ao salvar venda. Verifique sua conexão e tente novamente.');
    } finally {
        // Restaurar botão
        const botaoSalvar = document.querySelector('.add-button[onclick="salvarVenda()"]');
        if (botaoSalvar) {
            botaoSalvar.innerHTML = '💾 Salvar Venda';
            botaoSalvar.disabled = false;
        }
    }
}

async function carregarVendas() {
    try {
        const response = await fetch(`${API_BASE_URL}/vendas`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const vendas = await response.json();
        console.log('Vendas carregadas:', vendas);
        
        // Aqui você pode implementar a exibição das vendas carregadas
        // Por exemplo, mostrar em uma tabela ou lista
        
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        // Em caso de erro, continuar normalmente (pode ser primeira execução)
    }
}

function limparFormulario() {
    // Limpar produtos
    document.getElementById('produtos-container').innerHTML = '';
    document.getElementById('resumo').style.display = 'none';
    
    // Resetar contador
    contadorProdutos = 0;
    
    // Limpar campos de pagamento
    document.getElementById('formaPagamento').value = '';
    document.getElementById('outroPagamento').style.display = 'none';
    document.getElementById('outroPagamento').value = '';
    
    // Manter a data atual
    document.getElementById('dataVenda').valueAsDate = new Date();
}

// Utilitários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}