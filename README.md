# 3D Print Pricing

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-TypeScript-blue)
![Vite](https://img.shields.io/badge/Vite-ready-purple)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema web para calcular custos reais e preços sugeridos de peças impressas em 3D usando FDM.

O projeto nasceu da necessidade de precificar impressões 3D de forma mais confiável, considerando não apenas o custo direto do filamento, mas também desperdício, tempo de máquina, energia, acabamento, margem de lucro e histórico de cálculos.

---

## Objetivo

O objetivo do projeto é criar um MVP funcional para uso pessoal e evolução contínua, permitindo:

* calcular o custo real de peças impressas em 3D;
* evitar precificação incorreta;
* entender desperdícios de material;
* manter catálogo de materiais;
* acompanhar a quantidade restante de filamento;
* manter cadastro de impressoras;
* cadastrar produtos recorrentes;
* salvar diferentes impressões para o mesmo produto;
* calcular preço sugerido com base em margem real;
* manter histórico local dos cálculos realizados.

---

## Status do projeto

Este projeto está em desenvolvimento.

A primeira versão do MVP será focada exclusivamente em impressão FDM. Suporte a resina, clientes, backend, PDF e controle de estoque estão fora do escopo inicial.

---

## Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* Context API
* Vitest
* localStorage

---

## Conceitos principais

### Material

Representa um filamento específico.

Exemplos:

* PLA Basic Preto
* PLA Matte Branco
* PETG Transparente
* TPU Preto

Um material pode ter:

* tipo;
* marca;
* nome da cor;
* código HEX/RGB opcional;
* código do fornecedor;
* preço por kg;
* peso nominal do rolo;
* peso restante;
* limite para alerta de estoque baixo;
* observações.

O controle de estoque de material será leve na v1.1: o objetivo é saber se há filamento suficiente e destacar materiais em baixa, sem implementar um sistema completo de movimentações.

---

### Impressora

Representa uma impressora FDM usada no cálculo.

Uma impressora pode ter:

* nome;
* modelo;
* consumo em watts;
* valor de compra;
* vida útil estimada;
* custo de manutenção por hora;
* taxa de falha padrão.

Campos como depreciação e manutenção são opcionais para não bloquear o uso inicial do sistema.

---

### Produto

Representa um item do catálogo.

Exemplos:

* Chaveiro personalizado
* Suporte de controle
* Base para figure
* Miniatura decorativa

Um produto não guarda informações de impressão, peso, material ou tempo de slicer diretamente.

---

### Impressão

Na interface, a entidade será chamada de **Impressão**.

No código, ela será representada como `PrintProfile`.

Uma impressão representa uma forma específica de fabricar um produto.

Exemplo:

* Gengar - PLA roxo - 0.2mm - 15% infill
* Gengar - PLA preto - 0.16mm - 3 paredes
* Base figure - PLA cinza - protótipo rápido

Isso permite que o mesmo produto tenha múltiplas variações de impressão, materiais, cores e configurações.

---

### Cálculo de custo

Um cálculo de custo representa um snapshot dos dados usados naquele momento.

Isso é importante porque o preço do material, energia ou margem pode mudar no futuro, mas o histórico antigo precisa continuar fiel ao momento em que foi calculado.

---

## Fórmula de cálculo

O sistema separa o cálculo em partes:

### Custo de impressão

Considera:

* peso do modelo;
* peso de suporte;
* peso de purga;
* outros desperdícios;
* preço do material;
* tempo de impressão;
* consumo da impressora;
* custo de energia;
* depreciação opcional;
* manutenção opcional.

### Custo de acabamento

Considera tarefas opcionais como:

* remoção de suporte;
* lixamento;
* pintura;
* verniz;
* montagem.

Cada tarefa pode ter:

* tempo em horas;
* valor por hora;
* custo extra de material.

### Reserva de falha

O sistema permite configurar uma taxa de falha para adicionar uma reserva ao custo final.

### Preço sugerido

O preço sugerido usa margem real sobre o preço final:

```txt
preço sugerido = custo total / (1 - margem)
```

Exemplo:

```txt
custo total = R$ 60,00
margem = 40%

preço sugerido = 60 / 0.6
preço sugerido = R$ 100,00
```

Assim, o lucro estimado seria R$ 40,00 e a margem real seria 40%.

---

## Funcionalidades do MVP

### Incluído na primeira versão

* Cadastro de materiais
* Controle leve de estoque de materiais
* Cadastro de impressoras
* Cadastro de produtos
* Cadastro de impressões
* Cálculo baseado em impressão salva
* Fila de impressão
* Acabamento opcional
* Resultado detalhado de custos
* Preço sugerido
* Histórico local
* Persistência em localStorage
* Arquitetura preparada para troca futura de storage
* Testes unitários das regras de cálculo

### Fora do MVP inicial

* Suporte a impressão em resina
* Cadastro de clientes
* Geração de PDF
* Backend
* Login
* Controle completo de estoque com movimentações
* Gráficos
* Orçamentos formais para envio
* Integração com slicers

---

## Telas planejadas

* Dashboard
* Fila
* Produtos
* Impressões
* Materiais
* Impressoras
* Histórico
* Configurações

---

## Arquitetura planejada

O projeto seguirá uma estrutura baseada em features:

```txt
src/
  app/
  components/
  features/
    dashboard/
    calculations/
    materials/
    printers/
    products/
    print-profiles/
    history/
    settings/
  shared/
    storage/
    utils/
    types/
```

A lógica de cálculo deve ficar isolada dos componentes React.

Componentes não devem acessar `localStorage` diretamente. O acesso aos dados deve passar por uma camada de repositórios, facilitando uma futura troca para Firebase, Supabase ou API própria.

---

## Persistência

No MVP, os dados serão salvos localmente usando `localStorage`.

A persistência será abstraída para permitir troca futura por:

* Firebase;
* Supabase;
* API própria;
* outro banco de dados.

---

## Instalação

Clone o repositório:

```bash
git clone git@github.com:SEU_USUARIO/3d-print-pricing.git
```

Acesse a pasta:

```bash
cd 3d-print-pricing
```

Instale as dependências:

```bash
npm install
```

Rode o projeto:

```bash
npm run dev
```

---

## Scripts

```bash
npm run dev
```

Executa o projeto em ambiente de desenvolvimento.

```bash
npm run build
```

Gera a versão de produção.

```bash
npm run preview
```

Executa localmente a build de produção.

```bash
npm run test
```

Executa os testes automatizados.

```bash
npm run lint
```

Executa a análise estática do código.

---

## Roadmap

### MVP v1

* [ ] Configuração inicial do projeto
* [ ] Configuração de Tailwind CSS
* [ ] Configuração de shadcn/ui
* [ ] Modelagem de domínio
* [ ] Serviço de cálculo de custo
* [ ] Testes unitários das fórmulas
* [ ] Camada de storage local
* [ ] CRUD de materiais
* [ ] Controle leve de estoque de materiais
* [ ] CRUD de impressoras
* [ ] CRUD de produtos
* [ ] CRUD de impressões
* [ ] Fila de impressão
* [ ] Histórico de cálculos
* [ ] Dashboard inicial
* [ ] Polimento visual

### Futuro

* [ ] Backend com Firebase ou Supabase
* [ ] Autenticação
* [ ] Exportação de orçamento
* [ ] Geração de PDF
* [ ] Suporte a impressão em resina
* [ ] Controle de estoque
* [ ] Baixa automática de filamento com confirmação
* [ ] Alertas avançados de estoque
* [ ] Cadastro de clientes
* [ ] Relatórios e gráficos
* [ ] Comparação entre materiais
* [ ] Importação de dados do slicer

---

## Decisões de produto

* O MVP será focado apenas em FDM.
* Produto e Impressão são entidades separadas.
* A interface usa o termo "Impressões".
* O código usa o termo `PrintProfile`.
* O sistema deve mostrar o máximo possível de detalhes de custo.
* Acabamento é opcional.
* Cor HEX/RGB do material é opcional.
* Estoque de material é opcional e medido em gramas.
* Salvar um cálculo não reduz estoque automaticamente na v1.1.
* Histórico deve salvar snapshots.
* Preço sugerido usa margem real sobre o preço final.
* A aplicação começa local, mas preparada para backend futuro.

---

## Objetivo técnico

Além de resolver um problema real de precificação, este projeto também serve como estudo prático de:

* modelagem de domínio;
* arquitetura front-end;
* separação de regras de negócio;
* formulários com validação;
* persistência local;
* testes unitários;
* construção incremental de MVP;
* uso de agentes de desenvolvimento assistido por IA.

---

## Licença

Este projeto está sob a licença MIT.

---

## Autor

Desenvolvido por Douglas Lima.
