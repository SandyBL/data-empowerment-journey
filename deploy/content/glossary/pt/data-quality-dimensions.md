---
term: Dimensões de qualidade de dados
short: Os eixos padrão pelos quais os dados podem falhar: completude, exatidão, consistência, oportunidade, validade e unicidade.
group: quality
also: Características de qualidade
related: data-quality, data-quality-rule, data-profiling, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

As dimensões existem para que "os dados estão ruins" se torne um diagnóstico. Completude é se o valor está lá. Validade é se ele obedece ao seu formato. Exatidão é se corresponde à realidade — a única dimensão que normalmente precisa de uma pessoa ou de uma referência externa para ser testada. Consistência é se o mesmo fato concorda entre sistemas. Oportunidade é se chegou em tempo de ser útil. Unicidade é se a entidade aparece uma única vez.

**Na prática.** A maioria dos problemas reais é de validade, completude e consistência, nessa ordem, porque são as três que um sistema pode gerar em silêncio. Nomear a dimensão diz onde a correção pertence: validade normalmente é um controle de entrada, consistência normalmente é uma integração, oportunidade normalmente é um agendamento.

**Onde dá errado.** A exatidão é medida com uma regra, e não pode ser. Um CEP que passa na validação de formato e pertence a outra cidade é válido e errado. Testar exatidão significa comparar contra algo autoritativo e, se essa fonte não existe, diga isso em vez de reportar 98%.
