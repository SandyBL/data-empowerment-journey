---
term: Regra de qualidade de dados
short: Um teste executável sobre os dados, com um limite definido e uma pessoa responsável que age quando ele falha.
group: quality
also: Verificação de qualidade, regra de validação
related: data-quality, data-standard, data-quality-dimensions, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

Uma regra tem quatro partes: os dados a que se aplica, a condição que afirma, o limite a partir do qual o resultado conta como falha e a pessoa que faz algo a respeito. Sem o limite, cada regra fica sempre verde ou sempre vermelha. Sem responsável, uma regra que falha é uma notificação que ninguém concordou em receber, o que em um mês é uma pasta de e-mail filtrada.

**Na prática.** As regras que vale a pena escrever vêm de incidentes. Algo deu errado, alguém investigou, a causa foi uma condição dos dados: codifique essa condição como regra para que a próxima ocorrência seja pega antes da consequência. Um backlog de regras derivadas de incidentes reais tem uma credibilidade que um conjunto gerado nunca tem.

**Onde dá errado.** Regras são geradas automaticamente a partir do profiling e ligadas em bloco. O resultado são milhares de alertas, a maioria descrevendo condições perfeitamente normais naquele negócio, e o time para de ler todos. Fadiga de alerta não é um problema de ajuste, é uma decisão de projeto tomada cedo demais.
