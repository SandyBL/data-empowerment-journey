---
term: Dados confidenciais
short: Dados cuja exposição prejudica a organização: preços, margens, salários, pipeline comercial, código-fonte, carteira de clientes.
group: ai
also: Dados restritos, dados de uso interno restrito, dados comercialmente sensíveis
related: sensitive-data, data-classification, role-based-access-control, data-policy
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

Confidencial é o nível em que quem corre risco é a empresa. Se vaza, um concorrente precifica contra você, uma negociação desanda, um valuation se move ou o seu próprio pessoal descobre quanto os colegas ganham. É um dano real e merece controles reais — mas é um dano comercial, e por isso corre por uma trilha diferente da dos dados pessoais sensíveis, onde o exposto é uma pessoa.

**Na prática.** A etiqueta sozinha não vale nada; o que a torna útil são as regras de manuseio grampeadas nela. Quem aprova o acesso e por quanto tempo. Onde o dado pode viver: qual plataforma, qual região, qual tenant. Se pode sair da empresa e sob qual acordo. Quanto tempo é retido e o que acontece no fim. E se pode ser colado numa ferramenta de IA externa, que hoje é a pergunta que esta classificação recebe com mais frequência. Um nível sem regras associadas é decoração.

**Onde dá errado.** Tudo acaba confidencial. Um critério de "restringe, por segurança" produz um warehouse em que 90% das tabelas carregam a etiqueta mais alta, então as pessoas desviam dos controles para conseguir trabalhar e a etiqueta deixa de informar qualquer coisa. Uma classificação que funciona é deliberadamente desigual: a maior parte do dado é interna, uma fatia é confidencial, um conjunto pequeno é restrito, e alguém sênior está disposto a defender onde as linhas foram traçadas.
