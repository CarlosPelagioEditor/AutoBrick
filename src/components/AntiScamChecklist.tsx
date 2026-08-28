import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Smartphone,
  Gamepad2,
  Tv,
  Laptop,
  Car,
  Wrench,
  Lock,
  Eye,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ItemCategory } from '../types';

interface TestItem {
  id: string;
  category: ItemCategory;
  title: string;
  howToTest: string;
  criticalRisk: string;
}

const CATEGORY_CHECKLISTS: Record<ItemCategory, TestItem[]> = {
  smartphones: [
    {
      id: 'icloud_google',
      category: 'smartphones',
      title: 'Verificar Desvinculação de Conta (iCloud / Conta Google)',
      howToTest: 'No iPhone: Ajustes > Seu Nome (deve estar em branco). No Android: Configurações > Contas. Faça a restauração de fábrica na sua frente antes de pagar.',
      criticalRisk: 'Se a conta estiver presa, o aparelho vira peso de papel após o reset.',
    },
    {
      id: 'imei_anatel',
      category: 'smartphones',
      title: 'Consulta de IMEI na Anatel & Impedimentos',
      howToTest: 'Disque *#06# no teclado de chamada para ver o IMEI real. Consulte no site consultai-mei.com.br para verificar se não há queixa de furto ou impedimento.',
      criticalRisk: 'Aparelhos com queixa podem ser bloqueados pelas operadoras em poucos dias.',
    },
    {
      id: 'faceid_truetone',
      category: 'smartphones',
      title: 'Teste de Face ID / Biometria e True Tone',
      howToTest: 'Cadastre seu rosto/digital. No iPhone, abra a Central de Controle e segure o brilho para ver se o True Tone está ativo (se não estiver, a tela foi trocada).',
      criticalRisk: 'Telas paralelas sem True Tone e Face ID queimado reduzem o valor de revenda em até 40%.',
    },
    {
      id: 'battery_cameras',
      category: 'smartphones',
      title: 'Saúde da Bateria & Câmeras 0.5x, 1x e 3x',
      howToTest: 'Abra a câmera e teste todas as lentes (ultra-wide, zoom, foco e áudio no vídeo). Verifique a porcentagem de bateria nas configurações.',
      criticalRisk: 'Sensores de câmera com tremor/foco quebrado custam centenas de reais para reparar.',
    },
    {
      id: 'audio_mic',
      category: 'smartphones',
      title: 'Microfones, Alto-falantes e Entrada de Chip',
      howToTest: 'Grave um áudio no gravador de voz e faça uma ligação de teste com seu chip para testar o microfone inferior, superior e recepção de sinal 4G/5G.',
      criticalRisk: 'Placa com defeito de baseband não reconhece chip e o reparo é caríssimo.',
    },
  ],
  consoles_games: [
    {
      id: 'network_ban',
      category: 'consoles_games',
      title: 'Teste de Banimento Online (PSN / Xbox Live / Nintendo Network)',
      howToTest: 'Conecte o videogame no Wi-Fi ou roteador do celular e entre na PSN Store ou Xbox Network para checar se o console não foi banido permanentemente.',
      criticalRisk: 'Consoles banidos não jogam online e perdem mais de 50% do valor de mercado.',
    },
    {
      id: 'disc_drive',
      category: 'consoles_games',
      title: 'Leitor de Disco e Ejeção',
      howToTest: 'Leve um jogo físico em mídia Blu-Ray para testar a leitura rápida e a ejeção sem travar.',
      criticalRisk: 'Mecanismos de drive com defeito exigem troca de leitor ótico.',
    },
    {
      id: 'controller_drift',
      category: 'consoles_games',
      title: 'Teste de Drift nos Analógicos dos Controles',
      howToTest: 'Abra as configurações de calibração ou um jogo para testar se os analógicos não andam sozinhos.',
      criticalRisk: 'Controle com drift requer troca de potenciômetro ou analógico novo.',
    },
    {
      id: 'thermal_fan',
      category: 'consoles_games',
      title: 'Ruído do Cooler e Aquecimento (Pasta Térmica)',
      howToTest: 'Deixe o videogame rodando um jogo pesado por 10 minutos para ver se a ventoinha não dispara em modo turbina ou desliga por superaquecimento.',
      criticalRisk: 'Superaquecimento pode indicar curto na placa ou necessidade urgente de manutenção.',
    },
  ],
  tv_audio: [
    {
      id: 'dead_pixels',
      category: 'tv_audio',
      title: 'Inspeção de Dead Pixels e Listras Verticais',
      howToTest: 'Coloque uma imagem 100% branca ou vídeo de teste no YouTube para verificar se há linhas verticais/horizontais ou manchas pretas no display.',
      criticalRisk: 'Painéis com listras costumam queimar totalmente em pouco tempo e o conserto custa o valor de uma TV nova.',
    },
    {
      id: 'hdmi_arc',
      category: 'tv_audio',
      title: 'Todas as Portas HDMI e Saídas de Áudio',
      howToTest: 'Conecte um aparelho ou pendrive em cada uma das portas HDMI e USB.',
      criticalRisk: 'Raios e picos de energia queimam portas HDMI isoladas na placa principal.',
    },
    {
      id: 'smart_wifi',
      category: 'tv_audio',
      title: 'Módulo Wi-Fi Integrado e Sistema Smart',
      howToTest: 'Conecte na rede Wi-Fi e abra Netflix/YouTube para verificar se o módulo Wi-Fi não desconecta sozinho.',
      criticalRisk: 'Módulo Wi-Fi queimado exige cabo de rede ou troca da placa receptora.',
    },
  ],
  computers: [
    {
      id: 'battery_cycles',
      category: 'computers',
      title: 'Relatório de Bateria & Carregador Original',
      howToTest: 'No Windows: abra o CMD e digite `powercfg /batteryreport`. No Mac: Sobre este Mac > Relatório do Sistema > Energia.',
      criticalRisk: 'Baterias estufadas ou viciadas custam caro para reposição.',
    },
    {
      id: 'keyboard_keys',
      category: 'computers',
      title: 'Teste de Todas as Teclas e Touchpad',
      howToTest: 'Abra o site keyboard-test.space e pressione todas as teclas do teclado para detectar teclas falhando.',
      criticalRisk: 'Teclados rebitados na carcaça exigem substituição completa do topcase.',
    },
    {
      id: 'gpu_stress',
      category: 'computers',
      title: 'Teste de GPU / Placa de Vídeo e Temperaturas',
      howToTest: 'Execute um benchmark rápido ou jogo leve para verificar se não há artefatos na tela ou tela azul (BSOD).',
      criticalRisk: 'Placas de vídeo com solda BGA trincada apresentam artefatos e param de dar vídeo.',
    },
  ],
  vehicles: [
    {
      id: 'detran_debts',
      category: 'vehicles',
      title: 'Consulta de Multas, IPVA e Restrições Judiciais',
      howToTest: 'Consulte a placa e Renavam no portal do Detran e no aplicativo da Carteira Digital de Trânsito.',
      criticalRisk: 'Bloqueios judiciais (Renajud) impedem a transferência para o novo dono.',
    },
    {
      id: 'engine_oil',
      category: 'vehicles',
      title: 'Óleo, Tampa do Reservatório de Água (Junta de Cabeçote)',
      howToTest: 'Abra a tampa do óleo e da água (com motor frio) para checar se não há borra branca parecida com café com leite.',
      criticalRisk: 'Água misturada com óleo indica junta de cabeçote queimada.',
    },
  ],
  tools: [
    {
      id: 'motor_brushes',
      category: 'tools',
      title: 'Teste de Potência, Escovas de Carvão e Baterias',
      howToTest: 'Ligue a ferramenta na velocidade máxima e verifique se não há faíscas excessivas ou cheiro de queimado no motor.',
      criticalRisk: 'Induzido em curto invalida o uso da ferramenta.',
    },
  ],
  appliances: [
    {
      id: 'cooling_heating',
      category: 'appliances',
      title: 'Compressor, Gás Refrigerante e Termostato',
      howToTest: 'Ligue o equipamento na tomada e aguarde o compressor armar sem estalos contínuos.',
      criticalRisk: 'Compressor travado exige troca de motor e recarga de gás.',
    },
  ],
  furniture: [
    {
      id: 'structure_wood',
      category: 'furniture',
      title: 'Estrutura, Corrediças e Ausência de Cupim',
      howToTest: 'Abra e feche todas as gavetas e verifique a base do móvel.',
      criticalRisk: 'Móveis de MDF estufados por umidade não aceitam reforço.',
    },
  ],
  watches_jewelry: [
    {
      id: 'movement_auth',
      category: 'watches_jewelry',
      title: 'Autenticidade do Mecanismo e Número de Série',
      howToTest: 'Verifique a gravação do serial na caixa/pulseira e a fluidez do ponteiro de segundos.',
      criticalRisk: 'Réplicas e réplicas de primeira linha não possuem valor comercial de revenda.',
    },
  ],
  other: [
    {
      id: 'general_inspection',
      category: 'other',
      title: 'Teste Funcional Completo e Integridade Física',
      howToTest: 'Teste todas as funções primárias e secundárias do produto antes de concluir o pagamento.',
      criticalRisk: 'Defeitos não percebidos na hora da troca tornam-se prejuízo direto.',
    },
  ],
};

const COMMON_SCAMS = [
  {
    title: '1. O Golpe do Falso E-mail da OLX / Mercado Pago',
    badge: 'MUITO FREQUENTE',
    desc: 'O golpista envia um e-mail falso dizendo que a venda foi confirmada e que o dinheiro só será liberado após você entregar o produto ao motoboy. NUNCA confie em e-mails: confira SEMPRE o saldo dentro do aplicativo oficial!',
  },
  {
    title: '2. O Golpe do Intermediário ("Vou comprar pro meu primo/funcionário")',
    badge: 'GOLPE CLÁSSICO',
    desc: 'O golpista clona seu anúncio, cobra um valor mais baixo da vítima e manda a vítima buscar o produto com você dizendo: "não fale de valores com ele". A vítima transfere pro golpista e você fica sem o produto e sem o dinheiro.',
  },
  {
    title: '3. Falso Comprovante de PIX Agendado',
    badge: 'RISCO IMEDIATO',
    desc: 'O comprador mostra um print de PIX que na verdade foi AGENDADO para outra data (e que ele cancela logo em seguida). Só entregue o produto quando o dinheiro estiver efetivamente no extrato da sua conta bancária.',
  },
  {
    title: '4. Entrega por Uber / Motoboy sem Pagamento Confirmado',
    badge: 'ALERTA VERMELHO',
    desc: 'O comprador alega urgência e pede para mandar um Uber buscar o item antes de pagar. Assim que o motorista sai, ele bloqueia seu número. Só despache após confirmação de pagamento.',
  },
  {
    title: '5. Aparelho com Bloqueio de Operadora Após 30 Dias (Golpe do Seguro)',
    badge: 'PREVENÇÃO JURÍDICA',
    desc: 'O vendedor vende o celular, espera receber o dinheiro e depois de semanas liga para a seguradora dando queixa de roubo para receber a indenização, bloqueando o IMEI que você comprou. Use sempre o nosso Termo de Compra e Procedência com CPF!',
  },
];

export const AntiScamChecklist: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('smartphones');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const activeSteps = CATEGORY_CHECKLISTS[selectedCategory] || CATEGORY_CHECKLISTS.smartphones;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const resetChecklist = () => {
    setCheckedItems({});
  };

  const completedCount = activeSteps.filter((s) => checkedItems[s.id]).length;
  const progressPercent = Math.round((completedCount / activeSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 rounded-3xl p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          Segurança no BRICK & Checklist Anti-Golpe
        </div>
        <h1 className="text-2xl font-black text-white">
          Guia de Testes Presenciais & Dossiê Anti-Golpe
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl mt-1">
          Não caia em golpes no momento da compra ou troca. Siga o roteiro passo a passo de testes para cada categoria de produto e conheça os 5 golpes mais aplicados no Brasil.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('smartphones')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCategory === 'smartphones'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <Smartphone className="w-4 h-4" /> Celulares & iPhones
        </button>

        <button
          onClick={() => setSelectedCategory('consoles_games')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCategory === 'consoles_games'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> Videogames & Consoles
        </button>

        <button
          onClick={() => setSelectedCategory('tv_audio')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCategory === 'tv_audio'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <Tv className="w-4 h-4" /> TVs & Som
        </button>

        <button
          onClick={() => setSelectedCategory('computers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCategory === 'computers'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <Laptop className="w-4 h-4" /> Notebooks & PCs
        </button>

        <button
          onClick={() => setSelectedCategory('vehicles')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCategory === 'vehicles'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <Car className="w-4 h-4" /> Veículos & Motos
        </button>
      </div>

      {/* Main Grid: Interactive Checklist + Scam Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Interactive Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            
            {/* Checklist Header & Progress */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Roteiro de Testes Obrigatórios
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Marque cada item conforme você realizar o teste presencialmente.
                </p>
              </div>

              <button
                type="button"
                onClick={resetChecklist}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reiniciar
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Progresso do Teste:</span>
                <span className={progressPercent === 100 ? 'text-emerald-400 font-black' : 'text-amber-400'}>
                  {completedCount} de {activeSteps.length} itens testados ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent === 100 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {activeSteps.map((step) => {
                const isChecked = !!checkedItems[step.id];
                return (
                  <div
                    key={step.id}
                    onClick={() => toggleCheck(step.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{step.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <strong>Como testar:</strong> {step.howToTest}
                        </p>
                        <p className="text-[10px] text-rose-400 font-medium">
                          ⚠️ <strong>Risco Crítico:</strong> {step.criticalRisk}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {progressPercent === 100 && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-1">
                <div className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Produto 100% Validado!
                </div>
                <p className="text-xs text-emerald-200/90">
                  Todos os testes de segurança foram concluídos. Você pode fechar o negócio com segurança jurídica.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Right 5 cols: Scam Dossier */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Dossiê: Os 5 Maiores Golpes do BRICK
            </h2>
            <p className="text-xs text-slate-400">
              Conheça os truques mais usados pelos estelionatários em negociações presenciais e virtuais:
            </p>

            <div className="space-y-3">
              {COMMON_SCAMS.map((scam, i) => (
                <div
                  key={i}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white">{scam.title}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                      {scam.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{scam.desc}</p>
                </div>
              ))}
            </div>

            {/* Golden Rule */}
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4 rounded-2xl border border-amber-500/30 space-y-1 text-xs">
              <span className="font-black text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Regra de Ouro do BRICK:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Negocie sempre em local público e seguro (Shopping Center, Supermercado, posto de combustível com câmeras). Nunca entregue o produto antes do dinheiro estar 100% compensado no extrato do seu banco.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
