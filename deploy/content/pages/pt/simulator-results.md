---
slug: simulator-results
nav: boardResults
title: Resultados públicos dos simuladores e o que revelam | Data Governance Journey
heading: O que os quadros dos simuladores revelam sobre o instinto de governança
deck: Três simuladores de cenários, um quadro público para cada um, e as lições que saem de ver as pessoas decidirem sob pressão de tempo, junto com uma explicação honesta do que um quadro público pode e não pode dizer.
description: Resultados públicos de três simuladores de governança de dados e as lições principais: como o instinto de governança falha sob pressão, por que a propriedade do dado acaba em TI, e o que um quadro não consegue medir.
kicker: Resultados dos quadros
schema: page
related_articles: building-a-data-governance-operating-model, why-data-governance-people-process-technology-data, data-literacy-is-a-business-capability
updated: 2026-09-05
---

Três simuladores deste site colocam você dentro de uma situação de governança e obrigam a escolher. Uma regra de qualidade está falhando e corrigi-la significa pedir a um diretor que mude um processo pelo qual ele é medido. Dois departamentos reivindicam o mesmo registro de cliente. A alfabetização de dados é baixa e não há orçamento de treinamento. Você decide, a decisão é pontuada pela sua consequência de governança e não contra uma resposta certa, e a sua partida entra num quadro público.

Esta página é o que sai do outro lado. Não o quadro em si, que está em cada simulador, mas a distribuição que existe por trás dele, e as lições que sobrevivem a serem olhadas com cuidado.

É também um exemplo daquilo que descreve. Um quadro é uma medição, uma medição tem um tamanho de amostra, e o tamanho da amostra decide quais frases você tem direito de escrever. Então os números abaixo chegam com o tamanho da amostra colado, e a redação muda quando a amostra é pequena demais para sustentar uma porcentagem.

## O que cada simulador realmente mede

Os três não são variações de um questionário. Cada um instrumenta uma falha diferente.

**Governança de Dados no Dia a Dia** pontua uma semana na vida de um responsável por governança em cinco eixos: eficiência, confiança, responsabilização, segurança e contexto. É pontuado sobre 100. O interessante é que os cinco eixos não são independentes: uma decisão que compra eficiência normalmente gasta responsabilização, e a pontuação reflete a troca, então é muito difícil ir bem apenas agradando.

**Conflito de Propriedade de Dados** são dez disputas, cada uma pertencente a um de três papéis: o Dono de Negócio, o Data Steward ou TI. É pontuado sobre 1000. Quatro das dez pertencem a TI, três ao Steward e três ao Dono de Negócio, uma distribuição que importa mais do que parece e que é o assunto da próxima seção.

**Alfabetização de Dados** são quinze pontos entre governança, analytics, IA e automação, consciência de viés e cultura de dados. É o único dos três que pergunta sobre cultura diretamente, e o único que produz um segundo número: o valor que estima que você desbloqueou dos seus ativos de dados.

Nenhum dos três vê os cinco pilares de [maturidade de dados](/pt/glossary/data-maturity/). Dia a Dia e Propriedade são cegos à [cultura de dados](/pt/glossary/data-culture/); Alfabetização é cega a metadados. Isso é uma propriedade de exercícios de dez perguntas, não um defeito a ser corrigido, e fixa a regra com que os quadros são lidos: uma dimensão não medida é reportada como não medida, nunca como fraca. Inferir um problema de cultura a partir de um exercício de RACI seria inventar um achado.

{{PUBLIC_BOARDS}}

## As lições

### A propriedade do dado não vai para quem deveria tê-la, vai para quem está mais perto da tecnologia

É o padrão mais confiável de todo o conjunto, e o simulador de propriedade foi construído para expô-lo. Dez disputas, pontuadas por papel, e a falha quase nunca é uniforme: as pessoas vão bem nos quatro cenários de TI e mal nos três que pertencem ao Dono de Negócio.

Leia isso com cuidado, porque a leitura útil não é "vão mal em propriedade do dado". É que quando uma pergunta soa técnica, a resposta vai por padrão para o time técnico, e quase qualquer pergunta de governança pode ser feita para soar técnica. Quem é dono da definição de cliente ativo? Tem uma consulta SQL por trás, então TI. Quem aprova compartilhar dados com um terceiro? Tem uma API envolvida, então TI. Quem assina o orçamento do data warehouse? Esse é TI de verdade, e é por isso que o instinto sobrevive.

A consequência é um programa de governança em que todos os [data owners](/pt/glossary/data-owner/) estão no time de dados, o que significa que ninguém com autoridade para mudar um processo de negócio é dono de nada. É o defeito estrutural que encontro com mais frequência em organizações reais, e um exercício de dez minutos o traz à superfície numa sala em cerca de quatro.

### A pontuação média não diz quase nada; a dispersão diz onde está a discussão

Uma sala que tem média 70 com todos entre 66 e 74 compartilha um modelo de como a governança funciona. Uma sala que tem média 70 combinando um 95 e um 45 tem dois modelos incompatíveis e não sabe. Essas duas salas precisam de trimestres completamente diferentes, e a média não as distingue.

É por isso que os números acima reportam a distância entre a melhor partida e a mediana, e por isso o relatório do facilitador de uma sessão privada abre com a discordância e não com o vencedor. Num workshop as discordâncias *são* a sessão: o quadro vai para a tela, e então as duas pessoas que escolheram coisas opostas se explicam uma à outra usando a própria organização como exemplo.

### Velocidade é confiança, e confiança não é acerto

Dois dos três quadros se cronometram. No quadro de Alfabetização de Dados, até agora, a partida publicada mais rápida é também a de menor pontuação (vinte e cinco segundos, cinco pontos de quinze), enquanto a de maior pontuação levou mais de seis minutos.

Três partidas não são um achado, e não vou fingir que são. Mas coincide com o que acontece nas salas de forma consistente o suficiente para valer dizer em voz alta: quem termina primeiro geralmente é quem não percebeu a troca. Uma pergunta de governança que pode ser respondida instantaneamente normalmente foi lida errado como uma pergunta técnica com resposta de consulta, que é a mesma falha de antes com outro chapéu.

### As pontuações de governança falham em responsabilização e contexto, não em segurança

Todo mundo sabe que dados precisam ser protegidos. Quase ninguém sabe dizer quem decide. Em sessões reais, os eixos que voltam mais fracos são responsabilização (quem tem autoridade para tomar esta decisão) e contexto, ou seja, se alguém a jusante consegue saber o que um número de fato conta. Segurança pontua comparativamente bem, porque segurança tem orçamento, um dono com nome e uma auditoria por trás.

Essa assimetria é o argumento a favor de um [modelo operacional](/pt/glossary/data-governance-operating-model/) em vez de mais política. Uma política diz às pessoas qual é a regra. As falhas acima são falhas de [direitos de decisão](/pt/glossary/decision-rights/): ninguém tinha dúvida sobre a regra, tinha dúvida sobre quem decide a exceção.

### Uma pontuação baixa de alfabetização normalmente é um problema de vocabulário fantasiado de problema de números

O simulador de alfabetização pergunta sobre viés, IA e cultura além de analytics, e o padrão nas respostas é que as pessoas não interpretam dados mal: elas não têm certeza do que as palavras da organização significam. Se "cliente" inclui contas que saíram. Se o número de receita é contratado ou reconhecido. Se os "usuários ativos" do painel são os mesmos "usuários ativos" que o comitê viu na semana passada.

Isso é um problema de [glossário de negócio](/pt/glossary/business-glossary/), e é a razão pela qual programas de [alfabetização de dados](/pt/glossary/data-literacy/) que ensinam estatística a quem precisa de definições não movem nada.

## O que um quadro público não pode dizer, e por quê

Tudo acima é ou uma propriedade de como os simuladores foram construídos ou um padrão de tê-los aplicado com grupos reais. O que nada disso faz é diagnosticar uma organização específica, e vale a pena ser preciso sobre o motivo, porque é uma decisão de governança de dados e não uma limitação do produto.

Uma partida pública guarda a sua pontuação, o idioma em que você jogou, quanto tempo levou e o nome que digitou. Não guarda o seu detalhamento por pergunta. Isso é deliberado: conservar o detalhe por dimensão da partida de um desconhecido significaria que este site guarda dados de comportamento sobre pessoas que vieram fazer um exercício de dez minutos, sem nenhum propósito que pudesse defender. Então não guarda.

A consequência é que os quadros públicos podem mostrar como a população de partidas publicadas se distribui e nada sobre *por que* nada daquilo aconteceu. Não há como dizer em qual eixo o quadro é mais fraco, porque o dado a nível de eixo não existe fora de um espaço privado. Esse é o limite honesto desta página.

## O mesmo instrumento, apontado para a sua organização

Dentro de um espaço privado o detalhamento é guardado, e isso muda o que o exercício é. Deixa de ser um quadro e passa a ser a medição de uma sala específica.

- **A dimensão mais fraca, em primeiro lugar.** Não "seu time tirou 68", mas "seu time é mais fraco em responsabilização, depois em contexto, e é forte em segurança", com os cinco pilares de [maturidade de dados](/pt/glossary/data-maturity-model/) recebendo cada um uma leitura ou marcados explicitamente como não medidos.
- **Onde a sala discordou de si mesma.** A distância entre a sua melhor e a sua pior partida, por exercício, que é o número que diz se você tem uma lacuna de conhecimento ou uma lacuna política.
- **Propriedade por papel.** Os quatro cenários de TI contra os três do Dono de Negócio, com a sua gente: o achado descrito acima, como um fato sobre a sua organização e não como um padrão geral.
- **Uma tentativa por pessoa.** Um espaço privado registra a primeira partida que alguém termina e recusa as demais, então uma média é uma média de primeiros instintos e não de quantas tentativas cada um quis publicar. É isso que faz uma dimensão fraca valer a ação.
- **Os seus cenários.** O enunciado reescrito em torno dos seus sistemas, dos seus departamentos e do seu vocabulário, para que a disputa de propriedade seja entre dois times que existem e discutem de verdade.
- **A sua marca, o seu quadro.** Seu nome, logo e cor de destaque, e um quadro com apenas os seus colegas dentro.

E o relatório fica com você. Ele ordena as dimensões em que o seu grupo foi mais fraco, com faixas de maturidade e tempos, mais uma exportação CSV, que é a diferença entre dizer a um patrocinador que o time gostou do workshop e mostrar a ele três áreas ordenadas em que a sua própria gente não sabia quem decide.

## Solicite um espaço privado

Duas portas de entrada, conforme o quanto você já sabe que quer.

**[Ver como funciona um workshop →](/pt/workshops/)**: o formato, o debrief, qual dos três cenários encaixa em cada sala, o que o relatório do facilitador contém e como as sessões são orçadas. Comece aqui se ainda está decidindo se isso encaixa.

**[Ir direto ao formulário de contato →](/pt/?offer=private-space#contact-form-start)**: chega com a solicitação de espaço privado já preenchida. Adicione suas datas, o número de participantes, a mistura de idiomas e quais sistemas e times os cenários devem nomear, e eu volto com uma recomendação de cenário e um orçamento.

Se o workshop é uma peça de algo maior, [os serviços de consultoria](/pt/consulting/) explicam como ele normalmente se encaixa, quase sempre como movimento de abertura do desenho de um modelo operacional: uma sala que acabou de discutir sobre propriedade do dado se engaja com uma matriz de direitos de decisão, e uma sala que não discutiu nunca se engaja.
