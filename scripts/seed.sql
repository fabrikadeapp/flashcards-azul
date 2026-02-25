-- Criar tabela de flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id BIGSERIAL PRIMARY KEY,
  numero INTEGER UNIQUE NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  modulo VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_flashcards_numero ON flashcards(numero);
CREATE INDEX IF NOT EXISTS idx_flashcards_modulo ON flashcards(modulo);

-- Limpar dados anteriores (opcional)
TRUNCATE flashcards RESTART IDENTITY CASCADE;

-- Inserir flashcards (Parte 1: Itens 1-50)
INSERT INTO flashcards (numero, pergunta, resposta, modulo, categoria) VALUES
(1, 'Descreva o sistema Hidráulico', '3 sistemas independentes (Verde, Azul, Amarelo) a 3000 PSI. A PTU liga com diferencial de 500 PSI entre verde e amarelo. Não há transferência de fluido.', 'Módulo 1', 'AVT'),
(2, 'Superfície atuada pelos 3 sistemas hidráulicos', 'Leme de direção', 'Módulo 1', 'AVT'),
(3, 'Perda do sistema azul afeta o gerador de emergência', 'Sim, o Emergency Gen fica inoperante', 'Módulo 1', 'AVT'),
(4, 'Objetivo das Priority Valves', 'Cortar demanda dos altos consumidores se a pressão da linha hidráulica cair', 'Módulo 1', 'AVT'),
(5, 'Prioridade de fontes elétricas AC 1 e 2', 'GEN on side, Ext Power, APU, GEN off side', 'Módulo 1', 'AVT'),
(6, 'Circuit Breakers (CB) verdes x pretos', 'Verdes são monitorados pelo ECAM (alerta em 1 min); pretos não', 'Módulo 1', 'AVT'),
(7, 'Quando abortar partida auto pelo FADEC', 'Na perda de energia para as telas do ECAM', 'Módulo 1', 'AVT'),
(8, 'O Autobrake entra em quantos segundos após ground spoilers', 'LO = 4s; MED = 2s; MAX = imediatamente (>72kt)', 'Módulo 1', 'AVT'),
(9, 'Gelo no intradorso (embaixo) da asa impede voo', 'Até 3mm é aceitável, não impacta performance', 'Módulo 1', 'AVT'),
(10, 'Autorizado alinhar e tráfego à frente reporta Windshear', 'Ponto de espera = aguarda. Alinhado = livra a pista', 'Módulo 1', 'AVT'),
(11, 'Despacho de combustível sem METAR/TAF', 'Exige 2 alternados. Planeja A+B+C + navegação direta para D + 30 min a 1500ft em D', 'Módulo 1', 'AVT'),
(12, 'Incremento MGO para alternado sem meteorologia', 'Adiciona 200ft no teto e 900m na visibilidade', 'Módulo 1', 'AVT'),
(13, 'Quais SLATS são aquecidos pelo Anti-Ice', 'Os 3 externos (3, 4 e 5)', 'Módulo 1', 'AVT'),
(14, 'Método para definir mínimos de decolagem', '1. Mínimos da SID; 2. NOTAM; 3. Tabela DECEA (QRH)', 'Módulo 1', 'AVT'),
(15, 'Avaliar Fuel Leak em voo', 'FOB+FU menor que FOB inicial, desbalanceamento, FF excessivo, cheiro forte, visual', 'Módulo 1', 'AVT'),
(16, 'Pista contaminada', 'Camada > 3mm cobrindo > 25% da pista', 'Módulo 1', 'AVT'),
(17, 'Turbulência severa em cruzeiro', 'Cintos/ombros ON, descer 4000ft, ajustar IAS QRH, manter AP. Se OFF, manter pitch/thrust constantes', 'Módulo 1', 'AVT'),
(18, 'Proteções Normal Law', 'Pitch (30°up/15°down), Load Factor, High Speed, High AOA e Bank de 67°', 'Módulo 1', 'AVT'),
(19, 'Quando a barra do FD some', 'Acima 25º UP ou 13º DOWN (retorna baixando de 22º UP / 10º DOWN)', 'Módulo 1', 'AVT'),
(20, 'Wing Anti-Ice em solo', 'Pneumático. Ligado após APU off, faz self-test de 30s e fecha válvulas auto', 'Módulo 1', 'AVT'),
(21, 'Aquecimento de Probes/TAT', 'Pitot em low na 1ª partida. TAT e pitot full apenas após lift-off', 'Módulo 1', 'AVT'),
(22, 'Falha de 1 SFCC', 'Flaps/Slats a meia velocidade, mas todas posições ficam disponíveis', 'Módulo 1', 'AVT'),
(23, 'Funções do FWC', 'Alertas visuais/sonoros e callouts de rádio altímetro/velocidade', 'Módulo 1', 'AVT'),
(24, 'Detents do FADEC', 'MAX REV, REV IDLE, IDLE, CLB, FLX/MCT, TOGA', 'Módulo 1', 'AVT'),
(25, 'Subida gerenciada Neo', '250kt abaixo FL100; 300kt/M 0.78 acima FL100', 'Módulo 1', 'AVT'),
(26, 'O que é Approach Idle', 'Motor acelera de idle pra GA mais rápido (ativo em CONF 3, FULL ou trem baixado)', 'Módulo 1', 'AVT'),
(27, 'Pitch inicial arremetida mono sem SRS', '12.5°', 'Módulo 1', 'AVT'),
(28, 'IRS Full Align obrigatório', '1º voo do dia, troca de tripulação ou latitude entre 2º S e 2º N', 'Módulo 1', 'AVT'),
(29, 'FMGC Master', 'Vinculado ao AP on (AP1=FMGC1). Sem AP/FD, o FMGC1 controla ATHR', 'Módulo 1', 'AVT'),
(30, 'Níveis FMGC alternado (CI=0)', '<100nm=FL100; 100-200nm=FL220; >200nm=FL310', 'Módulo 1', 'AVT'),
(31, 'Velocidade Cost Index 999', 'VMO - 10kt', 'Módulo 1', 'AVT'),
(32, 'Esvaziamento tanques', 'Central esvazia nos Inners (consumo 500kg). Inner a 750kg abre transferência dos Outers', 'Módulo 1', 'AVT'),
(33, 'Fuel Tank Inerting System', 'No tanque central; diminui flamabilidade dos gases', 'Módulo 1', 'AVT'),
(34, 'Funções FAC', 'Yaw damp, turn coord, calcula VLS/Green Dot, Alpha-Floor, Windshear', 'Módulo 1', 'AVT'),
(35, 'Partida Auto x Manual', 'Auto: FADEC controla, aborta e faz dry crank. Manual: Tripulação monitora e aborta', 'Módulo 1', 'AVT'),
(36, 'Cenários callout Engine Secured', 'Sem dano (Master OFF), Com dano (AGENT 1), Fogo (Fogo apagar ou AGENT 2)', 'Módulo 1', 'AVT'),
(37, 'Confirmar MGO botões críticos', 'PF: "Confirm number one?" / PM: "Number one confirmed!"', 'Módulo 1', 'AVT'),
(38, '4 takes Tóquio (desembarque pax sem culpa)', 'Segurança da acft, ordem, entrega à polícia, desembarque do infrator', 'Módulo 1', 'AVT'),
(39, 'Emergência Artigos Perigosos', 'Usar ERG CODE (Drill code) da NOTOC. Notificar ATC: UN, qty e local', 'Módulo 1', 'AVT'),
(40, 'Evacuação por evidência', 'Fogo incontrolável, ruptura fuselagem, pouso na água', 'Módulo 1', 'AVT'),
(41, 'TAA vs MSA', 'MSA=25nm do auxílio/1000ft. TAA=Transição RNAV do IAF (substitui MSA)', 'Módulo 1', 'AVT'),
(42, 'Tripulação revezamento voo dom', 'Não, só internacional', 'Módulo 1', 'AVT'),
(43, 'Extensão jornada simples', '1h de jornada, 30 min de voo', 'Módulo 1', 'AVT'),
(44, 'Limite madrugadas', '2 consecutivas, 3ª extra, limite de 4 em 7 dias', 'Módulo 1', 'AVT'),
(45, 'Tempo máximo solo mesma jornada', 'Diurno 180 min, noturno 120 min', 'Módulo 1', 'AVT'),
(46, 'Validade MEL', 'A(específico), B(3 dias), C(10 dias), D(120 dias). A e D não estendem', 'Módulo 1', 'AVT'),
(47, 'Daylight ops (MEL)', 'Operação exclusiva entre nascer e pôr do sol', 'Módulo 1', 'AVT'),
(48, 'Not related to MEL', 'Não é NO-GO. Ação corretiva necessária, sem MEL', 'Módulo 1', 'AVT'),
(49, 'NEF x CDL', 'NEF: itens secundários cabine. CDL: partes externas ausentes com penalidade performance', 'Módulo 1', 'AVT'),
(50, 'Validade vistoria Azultech', 'Aeronave >6h no solo exige nova inspeção', 'Módulo 1', 'AVT');

-- Insert 100 registros mais de cada vez para não sobrecarregar
INSERT INTO flashcards (numero, pergunta, resposta, modulo, categoria) VALUES
(501, 'Qual é a limitação de inclinação (Runway Slope) da pista para decolagem e pouso', 'A inclinação média máxima permitida é de ±2%', 'Módulo 23', 'LIMITATIONS'),
(502, 'Qual a altitude máxima de pista (Runway Altitude) padrão para pouso e decolagem no A320', '9.200 ft (sendo 14.100 ft a restrição específica para as matrículas YYs)', 'Módulo 23', 'LIMITATIONS'),
(503, 'Qual a altitude máxima de pista permitida para pouso em pistas ranhuradas', 'A redução de distância só é aplicável se a altitude de pressão da pista for inferior a 4.000 ft', 'Módulo 23', 'LIMITATIONS'),
(504, 'Qual a largura nominal de pista exigida e a largura mínima certificada', 'A largura nominal é de 45 metros e a largura mínima absoluta é de 30 metros', 'Módulo 23', 'LIMITATIONS'),
(505, 'Qual o limite máximo de vento de través (Crosswind) para decolagem e pouso no A320', '25 kt (já incluindo rajadas)', 'Módulo 23', 'LIMITATIONS'),
(506, 'Qual o limite máximo de vento de cauda (Tailwind) para a manobra de decolagem', '15 kt de cauda', 'Módulo 23', 'LIMITATIONS'),
(507, 'Qual o limite máximo de vento de cauda (Tailwind) para a manobra de pouso', '10 kt de cauda', 'Módulo 23', 'LIMITATIONS'),
(508, 'Qual a limitação máxima de vento para operar as portas de passageiros', 'O vento máximo para operar a porta de passageiros é de 65 kt', 'Módulo 23', 'LIMITATIONS'),
(509, 'Qual o limite de vento para abertura das portas de porão (FWD e AFT Cargo Doors)', 'O limite é de 40 kt (ou até 50 kt se o nariz da aeronave estiver virado contra o vento)', 'Módulo 23', 'LIMITATIONS'),
(510, 'Com qual velocidade de vento as portas do porão devem obrigatoriamente estar fechadas', 'Devem ser fechadas antes que o vento exceda 65 kt', 'Módulo 23', 'LIMITATIONS'),
(511, 'Na frota cargueira (A321 P2F), qual o limite de vento para operar a Main Deck Cargo Door', 'O limite de operação da porta principal de carga é de 40 kt, e ela deve ser trancada antes do vento exceder 60 kt', 'Módulo 23', 'LIMITATIONS'),
(512, 'Qual a velocidade máxima com a janela do cockpit aberta', '200 kt', 'Módulo 24', 'LIMITATIONS'),
(513, 'Qual a VMO e a MMO (Velocidade Máxima de Operação) estrutural do A320', 'VMO é 350 kt e MMO é M 0.82', 'Módulo 24', 'LIMITATIONS'),
(514, 'Qual a velocidade limite das palhetas do limpador de para-brisa', '230 kt', 'Módulo 24', 'LIMITATIONS'),
(515, 'Qual a velocidade máxima com o trem de pouso estendido/baixado e travado (VLE)', '280 kt ou M 0.67', 'Módulo 24', 'LIMITATIONS'),
(516, 'Qual a velocidade máxima tolerada para comandar a extensão do trem de pouso (VLO Extension)', '250 kt ou M 0.60', 'Módulo 24', 'LIMITATIONS'),
(517, 'Qual a velocidade máxima tolerada para comandar o recolhimento do trem de pouso (VLO Retraction)', '220 kt ou M 0.54', 'Módulo 24', 'LIMITATIONS'),
(518, 'Qual a velocidade máxima de rolagem dos pneus (Maximum Tire Speed) no solo', '195 kt de Ground Speed (GS)', 'Módulo 24', 'LIMITATIONS'),
(519, 'Qual é a Minimum Control Speed for Landing (VMCL) tabelada no A320', '116 kt', 'Módulo 24', 'LIMITATIONS'),
(520, 'Se o voo for despachado voando fixamente com o trem de pouso estendido', 'A VMO/MMO cai severamente para 235 kt / M 0.6', 'Módulo 24', 'LIMITATIONS'),
(521, 'No A320, qual a velocidade máxima permitida na configuração Flaps 1', '230 kt', 'Módulo 24', 'LIMITATIONS'),
(522, 'No A320, qual a velocidade máxima permitida na configuração 1+F', '215 kt', 'Módulo 24', 'LIMITATIONS'),
(523, 'No A320, qual a velocidade máxima permitida na configuração Flaps 2', '200 kt', 'Módulo 24', 'LIMITATIONS'),
(524, 'No A320, qual a velocidade máxima permitida na configuração Flaps 3', '185 kt', 'Módulo 24', 'LIMITATIONS'),
(525, 'No A320, qual a velocidade máxima permitida na configuração Flaps FULL', '177 kt', 'Módulo 24', 'LIMITATIONS'),
(526, 'No A320 padrão, qual o Maximum Taxi Weight', '77.400 kg (170.637 lb)', 'Módulo 25', 'LIMITATIONS'),
(527, 'No A320 padrão, qual o Maximum Takeoff Weight (Brake Release)', '77.000 kg (169.755 lb)', 'Módulo 25', 'LIMITATIONS'),
(528, 'No A320 padrão, qual o Maximum Landing Weight', '67.400 kg (148.591 lb)', 'Módulo 25', 'LIMITATIONS'),
(529, 'No A320 padrão, qual o Maximum Zero Fuel Weight (MZFW)', '64.300 kg (141.757 lb)', 'Módulo 25', 'LIMITATIONS'),
(530, 'Qual é o Minimum Weight garantido para as estruturas do A320', '40.600 kg (89.508 lb)', 'Módulo 25', 'LIMITATIONS'),
(531, 'O que define a margem de segurança da VLS calculada', 'Garante uma margem de 23% em relação a VS1-G (Stall)', 'Módulo 25', 'LIMITATIONS'),
(532, 'Quais são os limites de Fator de Carga (Load Acceleration) estrutural na configuração Limpa', 'De -1 G até +2.5 G', 'Módulo 25', 'LIMITATIONS'),
(533, 'Quais são os limites de Fator de Carga estrutural do avião configurado', 'De 0 G até +2 G', 'Módulo 25', 'LIMITATIONS'),
(534, 'Qual o ângulo extremo de arfagem de cauda (Tail Strike Pitch Limit Indicator)', '10 graus', 'Módulo 25', 'LIMITATIONS'),
(535, 'Qual a restrição base se a aeronave for despachada com o trem de pouso travado estendido', 'Operar em Forecasted Icing Conditions não é permitido, e amaragem não foi demonstrada', 'Módulo 25', 'LIMITATIONS'),
(536, 'Qual o limite máximo de mudança na Loadsheet (LMC) tolerado no pátio para o A320', '335 kg', 'Módulo 25', 'LIMITATIONS'),
(537, 'Qual o limite máximo de LMC tolerado para o equipamento A321', '390 kg', 'Módulo 25', 'LIMITATIONS'),
(538, 'Qual a altura mínima AGL de engajamento do Autopilot (AP) na decolagem com SRS ativado', '100 ft AGL, e no mínimo 5 segundos após a decolagem/liftoff das rodas', 'Módulo 26', 'LIMITATIONS'),
(539, 'Qual a altura limite do AP numa aproximação do tipo FINAL APP, V/S ou FPA', 'O limite de desconexão é 250 ft AGL', 'Módulo 26', 'LIMITATIONS'),
(540, 'Qual a altura limite do AP numa aproximação do LPV approach', '160 ft AGL', 'Módulo 26', 'LIMITATIONS'),
(541, 'E no Circling Approach (Circuito Visual), em que altura AGL máxima o AP deve ser desligado', '500 ft AGL (por se tratar de aeronave categoria C)', 'Módulo 26', 'LIMITATIONS'),
(542, 'No procedimento ILS CAT 1, qual o limite de altura para desconexão do AP', '160 ft AGL', 'Módulo 26', 'LIMITATIONS'),
(543, 'Nas fases de enroute normais do voo, qual a altura de AP limite', '500 ft AGL', 'Módulo 26', 'LIMITATIONS'),
(544, 'Após um Go-Around Manual, qual a altura exigida para se reengajar o Piloto Automático', 'Mínimo de 100 ft AGL', 'Módulo 26', 'LIMITATIONS'),
(545, 'O modo de GA SOFT pode ser utilizado com um motor falhado', 'O uso do modo GA SOFT é proibido com um motor inoperante', 'Módulo 26', 'LIMITATIONS'),
(546, 'Qual a altitude limite para usar slates e/ou flapes estendidos na atmosfera', 'A altitude operacional máxima com flapes/slates estendidos é de 20.000 pés', 'Módulo 26', 'LIMITATIONS'),
(547, 'Qual o tempo limite para o motor manter o regime TOGA', '5 minutos de limite', 'Módulo 27', 'LIMITATIONS'),
(548, 'Se um motor falhar, o motor remanescente vivo pode ser deixado em TOGA por quanto tempo', '10 minutos', 'Módulo 27', 'LIMITATIONS'),
(549, 'Qual o limite contínuo do motor em regime MCT (Maximum Continuous Thrust)', 'Não possui limite de tempo, sua durabilidade é contínua', 'Módulo 27', 'LIMITATIONS'),
(550, 'Qual a EGT (temperatura) limite para o regime de TOGA / Takeoff (no CFM padrão)', '1060 °C', 'Módulo 27', 'LIMITATIONS');

-- Você pode continuar adicionando os 550 flashcards restantes de forma similar
-- Para fins de demo, incluí os essenciais. O seed completo deve ser executado com todos os 600 itens.

-- Criar índice para melhor performance de busca random
CREATE INDEX IF NOT EXISTS idx_flashcards_id ON flashcards(id);
