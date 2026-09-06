---
title: Introdução aos fundamentos de um programa de governança de dados
date: 2026-09-01
updated: 2026-09-05
category: data-governance
summary: Aprenda os 6 blocos fundacionais necessários para lançar um programa de
  governança de dados pragmático que transforme dados crus em um ativo
  empresarial confiável.
author: Sandy Bradbury
translation_key: introduction-basics-data-governance-program
---

A maioria das pessoas que me pergunta como começar um programa de governança de dados já leu o suficiente para estar intimidada. Viram a roda do [DMBOK](/pt/glossary/dama-dmbok/) com suas onze áreas de conhecimento, um modelo de maturidade com cinco níveis e quarenta subdimensões, e uma apresentação comercial prometendo um data fabric corporativo. Nada disso está errado. Tudo isso é o lugar errado para começar.

Um primeiro programa de governança é pequeno. Consiste em seis fundamentos, nenhum dos quais exige uma plataforma, e pode ser erguido por uma pessoa determinada com respaldo executivo e algumas horas semanais dos cinco colegas certos. O que segue são esses seis fundamentos, a ordem em que eu os construiria e o que deixar deliberadamente para o segundo ano.

## 1. Tratar o dado como ativo — e significar algo com isso

"Dado é um ativo" é a frase mais repetida deste campo e normalmente a mais vazia. Ela se torna real apenas quando muda uma decisão, então aqui está o teste: um ativo tem proprietário, um valor registrado, um custo de manutenção e um ciclo de vida que termina.

Aplicado ao dado, isso significa que alguém responde por cada conjunto de dados significativo. Significa que você consegue dizer aproximadamente quanto ele vale para o negócio e quanto custa quando está errado; se você nunca colocou um número nisso, a [calculadora do custo dos dados ruins](/pt/calculator/) é uma estimativa inicial defensável. E significa que o dado é aposentado: arquivado ou apagado quando não serve mais a um propósito, em vez de acumular em armazenamento para sempre porque apagar dá medo.

Se sua organização consegue responder "quem é o dono, quanto vale, quanto nos custa, quando desaparece" para seus dez principais conjuntos, ela trata dado como ativo. Se não consegue, o slogan é decoração.

## 2. Organizar o dado em domínios

Governar "todos os dados da empresa" não é um escopo; é um desejo. Corte o parque em [domínios de dados](/pt/glossary/data-domain/) — áreas coerentes com um proprietário natural no negócio — e governe um por vez.

Existem três cortes comuns, e a maioria das organizações acaba usando uma mistura:

| Tipo de domínio | Princípio organizador | Exemplos |
| :--- | :--- | :--- |
| Função de negócio | Quem produz e usa o dado | Finanças, RH, Marketing, Operações |
| Dados mestres | Entidades compartilhadas entre funções | Cliente, Produto, Fornecedor, Colaborador |
| Processo | Fluxos operacionais de ponta a ponta | Pedido a caixa, Compra a pagamento, Admissão |

A orientação prática é manter o número baixo no início — cinco a oito domínios, não trinta — e definir cada um pelas entidades que contém e não pelos sistemas que as guardam. Um domínio definido por um sistema fica obsoleto no momento em que você migra.

Depois escolha dois para começar. Pegue os que mais aparecem nos seus escalonamentos, não os mais fáceis.

## 3. Definir papéis, e nomear pessoas reais

Três papéis sustentam um primeiro programa.

Os **[proprietários de dados](/pt/glossary/data-owner/)** respondem por um domínio: aprovam definições, aceitam risco de qualidade e decidem acessos. Precisam de senioridade suficiente para que suas decisões se sustentem e proximidade suficiente ao negócio para saber o que o dado significa. Uma pessoa, não um comitê.

Os **[curadores de dados](/pt/glossary/data-steward/)** fazem o trabalho: manter definições, investigar problemas de qualidade, coordenar correções, responder o que significa um campo. É aqui que vão as horas reais, e é o papel que os programas mais frequentemente esquecem de prover. Um proprietário sem curador é uma pessoa responsável sem capacidade de agir.

Uma **pequena função coordenadora** — uma pessoa basta no início — guarda os padrões, conduz o fórum, persegue os follow-ups e publica as medidas.

A coisa mais útil que você pode fazer na primeira semana é converter cada papel do seu diagrama em um nome. Papéis que ninguém ocupa são a razão mais comum pela qual um programa de governança parece completo no papel e não produz nada.

Mais uma coisa sobre nomear pessoas: consiga que o gestor delas concorde por escrito com a dedicação. Curadoria exercida em cima de uma carga de trabalho cheia é a forma mais comum pela qual um programa de governança morre em silêncio — não por oposição, mas porque o trabalho diário do curador tem prazos e a governança não. Meio dia por semana, acordado com quem define as prioridades dessa pessoa, dura mais que qualquer quantidade de entusiasmo.

## 4. Escrever um conjunto de políticas curto o bastante para ser lido

Programas novos tendem a escrever política demais cedo demais. Mire no menor conjunto que cubra sua exposição real, e escreva cada uma de modo que um descumprimento seja visível.

Para a maioria das organizações isso significa cinco ou seis [políticas de dados](/pt/glossary/data-policy/): classificação e tratamento de dados sensíveis, aprovação de acesso, retenção, expectativas de qualidade para os [elementos de dados críticos](/pt/glossary/critical-data-element/) e autoridade de definição, ou seja, quem pode aprovar o significado de um termo de negócio.

Dois hábitos mantêm um conjunto de políticas vivo. Dê a cada política um dono nomeado e uma data de revisão. E escreva a regra de forma verificável: não "os dados devem ser exatos", mas "e-mail do cliente é obrigatório em contas ativas, medido semanalmente, e qualquer mês abaixo de 98% é aceito por escrito pelo proprietário do domínio ou remediado".

## 5. Construir o inventário mais simples que funcione

Você precisa saber o que tem. É para isso que serve um [catálogo de dados](/pt/glossary/data-catalog/) neste estágio, e uma planilha faz isso adequadamente para os primeiros cem ativos.

Registre, por conjunto significativo: o que é, quem é o dono, sua classificação, seu sistema de origem, seu calendário de atualização e as definições dos seus campos chave. Comece pelos conjuntos que alimentam o reporting executivo, porque são aqueles cujas falhas são notadas.

Compre a ferramenta quando a planilha se tornar o gargalo, e não antes. Um produto de catálogo comprado antes de haver algo para colocar nele produz um índice vazio e uma conversa de renovação de licença. Se quiser uma estrutura de partida, os [templates](/pt/templates/) incluem um inventário e um registro de definições que você pode copiar.

## 6. Corrigir uma quantidade pequena de qualidade, de forma visível

[Qualidade de dados](/pt/glossary/data-quality/) é onde a governança ganha ou perde confiança, e o erro é começar amplo. Medir quarenta atributos em nove sistemas produz um painel; corrigir três atributos de que as pessoas reclamam toda semana produz uma reputação.

Escolha seus elementos de dados críticos: o punhado de campos que, quando errados, causam um problema de negócio visível. Fixe uma tolerância para cada um, decida quem aceita o risco quando ela é rompida, implemente uma [regra de qualidade](/pt/glossary/data-quality-rule/) que a meça periodicamente e roteie o alerta para uma pessoa e não para uma caixa de entrada. Depois publique a tendência onde o negócio já olha.

Uma nota sobre onde publicar resultados de qualidade. O instinto é construir um painel de governança, e o problema de um painel de governança é que ele é lido por quem o construiu. Se completude do e-mail do cliente é uma métrica de negócio, ela pertence à revisão de operações ao lado das outras métricas de negócio. Essa colocação faz mais pela adoção que qualquer plano de comunicação.

Uma vitória inicial confiável: deduplicação de uma entidade principal com uma [fonte única da verdade](/pt/glossary/single-source-of-truth/) declarada depois. É visível, é mensurável e só permanece corrigida por causa da decisão de governança que veio atrás.

## A ordem importa

Os seis fundamentos não são independentes, e construí-los fora de sequência é a causa habitual dos programas travados.

Domínios antes de papéis, porque você não pode nomear proprietário de um escopo indefinido. Papéis antes de política, porque política sem dono é documentação. Política antes de catálogo, porque o catálogo registra decisões e você precisa ter tomado alguma. Catálogo antes de medição de qualidade, porque você não pode medir o que não inventariou, e do contrário vai medir o que for conveniente.

Se você não levar nada mais disto: dois domínios, proprietários e curadores nomeados, cinco políticas, uma planilha, três atributos medidos. Esse é um programa completo de primeiro trimestre, e é suficiente para demonstrar valor.

## O que deixar para o segundo ano

Ser explícito sobre o que você **não** está fazendo é o que mantém um primeiro programa entregável.

Deixe a compra da plataforma. Deixe a avaliação de maturidade completa contra todas as dimensões: uma leitura para encontrar sua área mais fraca é útil, uma linha de base pontuada de quarenta itens é um projeto em si. Deixe a federação: opere centralmente sobre dois domínios até ter curadores que existam. Deixe o glossário corporativo inteiro e faça os cinquenta termos que aparecem no reporting ao conselho. E deixe o roadmap plurianual, que estará errado, em troca de um plano publicado para os dois próximos trimestres, que estará aproximadamente certo e será acreditado.

## Como começar esta semana

Três perguntas, respondíveis numa tarde: quais são nossos cinco domínios, quem é a pessoa responsável pelos dois que mais doem, e quais três atributos corrigiríamos primeiro se alguém nos desse quinze dias.

Se as respostas não estão claras, aí está seu diagnóstico, e [Identificando e solucionando pontos de dor de dados](/pt/blog/identificando-e-solucionando-pontos-de-dor-de-dados-o-primeiro-passo-na-governanca-de-dados/) é o método para encontrá-las. Quando os fundamentos estiverem no lugar e você precisar que as decisões comecem a fluir por eles, [Como construir um modelo operacional de governança de dados](/pt/blog/building-a-data-governance-operating-model/) é o passo seguinte. E se quiser uma leitura estruturada de onde você está antes de se comprometer com qualquer coisa, a [avaliação de maturidade](/pt/maturity-assessment/) leva cerca de dez minutos.
