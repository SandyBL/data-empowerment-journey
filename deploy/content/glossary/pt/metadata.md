---
term: Metadados
short: A camada descritiva em torno de um ativo de dados: o que significa, de onde veio, quem é o dono e como pode ser usado.
group: metadata
also: Dados sobre os dados
related: data-catalog, business-glossary, data-lineage, data-standard
article: introduction-basics-data-governance-program
updated: 2026-09-05
---

Metadados costumam ser divididos em três. Metadados de negócio são significado: a definição de "cliente ativo", o dono, a classificação de sensibilidade. Metadados técnicos são estrutura: tabela, coluna, tipo, nulidade, o processo que a alimenta. Metadados operacionais são comportamento: quando a última carga rodou, quantas linhas chegaram, quantas falharam na validação. Um programa de governança precisa dos três, mas só tem orçamento para começar por um.

**Na prática.** Comece pelos metadados de negócio dos dados que já aparecem em decisões, porque é ali que a ausência dói: um analista que não consegue distinguir qual de duas colunas de receita é a reportada perde uma hora por semana com algo que uma frase resolveria.

**Onde dá errado.** Metadados são coletados em massa porque uma ferramenta consegue fazê-lo automaticamente, e o resultado é um catálogo com 40.000 entradas técnicas sem significado associado. A coleta automática é a metade barata. A metade cara é uma pessoa decidir o que cada coisa significa, e nenhuma ferramenta nunca fez essa parte.
