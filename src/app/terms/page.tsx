import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Termos de Uso | Mary',
  description: 'Termos de Uso da plataforma Mary Digital Ecosystem',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logotipo.png"
              alt="Mary"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-muted-foreground mb-8">
            Bem-vindo à Mary Digital Ecosystem!
          </p>

          <p>
            Estes Termos de Uso trazem as condições e regras para você, Usuário, visitar nossa página, realizar seu cadastro e usufruir dos serviços oferecidos. Por isso pedimos, por favor, leia este documento com atenção, já que estes termos irão regulamentar a nossa relação com você e explicar como nosso Ecossistema funciona e como oferecemos os Serviços aos Usuários.
          </p>

          {/* Índice */}
          <nav className="my-8 p-4 bg-muted/50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Índice</h2>
            <ul className="space-y-1 text-sm">
              <li><a href="#sobre" className="text-primary hover:underline">Sobre a Mary</a></li>
              <li><a href="#introducao" className="text-primary hover:underline">1. Introdução</a></li>
              <li><a href="#definicoes" className="text-primary hover:underline">2. Definições</a></li>
              <li><a href="#tipos-usuarios" className="text-primary hover:underline">3. Tipos de Usuários, Serviços e Funcionalidades</a></li>
              <li><a href="#cadastro" className="text-primary hover:underline">4. Cadastro</a></li>
              <li><a href="#servicos" className="text-primary hover:underline">5. Serviços</a></li>
              <li><a href="#regras" className="text-primary hover:underline">6. Regras e Condições para Utilização da Mary</a></li>
              <li><a href="#conteudo" className="text-primary hover:underline">7. Conteúdo Fornecido pelo Usuário</a></li>
              <li><a href="#seguranca" className="text-primary hover:underline">8. Medidas de Segurança</a></li>
              <li><a href="#propriedade" className="text-primary hover:underline">9. Propriedade Intelectual</a></li>
              <li><a href="#links" className="text-primary hover:underline">10. Links de Terceiros</a></li>
              <li><a href="#garantia" className="text-primary hover:underline">11. Garantia e Termo de Responsabilidade</a></li>
              <li><a href="#limitacao" className="text-primary hover:underline">12. Limitação de Responsabilidade</a></li>
              <li><a href="#indenizacao" className="text-primary hover:underline">13. Indenização</a></li>
              <li><a href="#vigencia" className="text-primary hover:underline">14. Vigência e Rescisão</a></li>
              <li><a href="#modificacoes" className="text-primary hover:underline">15. Modificações</a></li>
              <li><a href="#disposicoes" className="text-primary hover:underline">16. Disposições Gerais</a></li>
              <li><a href="#lei" className="text-primary hover:underline">17. Lei Aplicável</a></li>
              <li><a href="#suporte" className="text-primary hover:underline">18. Central de Suporte</a></li>
            </ul>
          </nav>

          {/* Sobre a Mary */}
          <section id="sobre" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">Sobre a Mary</h2>
            <p>
              A Mary é um ecossistema digital voltado para transações de Fusões e Aquisições (M&A) acessível pela URL https://www.mary.network/ (&quot;Plataforma&quot; ou &quot;Ecossistema&quot;), desenvolvida e disponibilizada pela Mary Digital Ecosystem Ltda., inscrita no CNPJ sob o nº 62.135.811/0001-57, com sede na Alameda César Nascimento, nº 646, sala comercial, bairro Jurerê, na Cidade de Florianópolis, Estado de Santa Catarina, CEP 88.053-500 (&quot;Mary&quot;, &quot;nós&quot; ou &quot;nossos&quot;).
            </p>
            <p className="mt-4">
              A Mary é uma plataforma digital desenvolvida para facilitar, acelerar e estruturar transações de M&A (Fusões e Aquisições), conectando empresas (ativos), investidores (financeiros e estratégicos), advisors (assessores) e agentes de mercado de forma inteligente, segura e eficiente.
            </p>
            <p className="mt-4">
              Nosso Ecossistema oferece uma infraestrutura completa para originação, qualificação e condução de oportunidades de M&A, com ferramentas que auxiliam desde o cadastro das teses de investimento, publicação e validação de ativos, até a automação de documentos e negociação de contratos. Utilizamos tecnologia, curadoria e dados estruturados para reduzir atritos e trazer mais fluidez às transações.
            </p>
            <p className="mt-4">A plataforma é composta por diferentes perfis de Usuários:</p>
            <ul className="mt-2 space-y-2">
              <li><strong>Investidores:</strong> fundos de venture capital, private equity, family offices, corporate ventures e empresas estratégicas. Têm acesso a filtros inteligentes, recomendações automáticas de oportunidades (baseadas na tese cadastrada), dashboards de pipeline e materiais de apoio como Teasers, CIMs e VDRs. Participam dos processos após assinatura de NDA digital e envio de NBO.</li>
              <li><strong>Ativos:</strong> empresas que desejam captar investimento ou realizar uma venda parcial ou total. Podem se cadastrar diretamente ou por meio de advisors/agentes. Após validação, têm acesso à área exclusiva para acompanhamento do processo, geração automática de materiais e leitura do seu Readiness Score.</li>
              <li><strong>Advisors:</strong> assessores especializados em sell side, buy side ou due diligence. Podem cadastrar ativos, estruturar os materiais necessários (como CIM, VDR, etc.) e acompanhar todas as interações do deal por meio de painéis próprios.</li>
              <li><strong>Agentes:</strong> advogados, contadores, conselheiros ou executivos que atuam como sinalizadores de oportunidades para a Mary. Ao indicar empresas, acompanham os deals e recebem comissões conforme as regras da plataforma.</li>
            </ul>
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-medium">
                O ACEITE DOS TERMOS DE USO E DA POLÍTICA DE PRIVACIDADE IMPLICARÁ O RECONHECIMENTO DE QUE VOCÊ LEU, ENTENDEU E CONCORDOU, INCONDICIONALMENTE, COM TODAS AS DISPOSIÇÕES CONSTANTES DESTES TERMOS DE USO E DOS DEMAIS TERMOS E CONDIÇÕES AQUI MENCIONADOS.
              </p>
            </div>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium">
                ATENÇÃO! SE VOCÊ (USUÁRIO OU NAVEGANTE) NÃO CONCORDAR COM TODOS OS TERMOS QUE SE SEGUEM, NÃO PODERÁ ACESSAR OU UTILIZAR A PLATAFORMA E SEUS SERVIÇOS A QUALQUER TÍTULO.
              </p>
            </div>
          </section>

          {/* 1. Introdução */}
          <section id="introducao" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Introdução</h2>
            <p><strong>1.1.</strong> Ao se inscrever e/ou usar os Serviços e Funcionalidades disponibilizados por meio do Ecossistema, você declara ser maior de 18 (dezoito) anos e se compromete a ler e a compreender o conteúdo integral dos Termos de Uso e, se concordar com as condições estipuladas, manifestar seu livre, expresso e inequívoco aceite. O Usuário poderá cancelar sua conta a qualquer momento, encerrando sua relação com a Mary.</p>
            <p className="mt-4"><strong>1.2.</strong> Ao cancelar a sua conta, você reconhece que deverá suspender o acesso aos nossos Serviços.</p>
            <p className="mt-4"><strong>1.3.</strong> A Mary se compromete a, assim que receber a solicitação de cancelamento do Usuário, excluir seus dados pessoais e institucionais, exceto se o armazenamento for necessário para o cumprimento de obrigações legais ou regulatórias ou para exercício de direito da Mary em processos judiciais, arbitrais ou administrativos ou quando permitido por lei.</p>
            <p className="mt-4"><strong>1.4.</strong> Caso você seja menor de 18 (dezoito) anos, não poderá se cadastrar no Ecossistema, pois não coletamos dados, nem mesmo para registro, de menores de idade.</p>
          </section>

          {/* 2. Definições */}
          <section id="definicoes" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Definições</h2>
            <p><strong>2.1.</strong> Para fins destes Termos de Uso, os termos abaixo terão os seguintes significados:</p>
            <ul className="mt-4 space-y-2">
              <li><strong>Mary</strong> – Refere-se à Mary Digital Ecosystem Ltda., pessoa jurídica proprietária e operadora da Plataforma.</li>
              <li><strong>Plataforma ou Ecossistema</strong> – Refere-se ao ambiente digital acessível por meio da URL https://www.mary.network, incluindo suas funcionalidades, interfaces, dados e sistemas.</li>
              <li><strong>Usuário</strong> – Toda pessoa física ou jurídica que acesse ou utilize os Serviços da Mary, mediante cadastro e aceite destes Termos de Uso.</li>
              <li><strong>Visitante</strong> – Pessoa que acessa a Plataforma sem cadastro.</li>
              <li><strong>Investidor</strong> – Pessoa física ou jurídica com interesse em adquirir ou investir em empresas (Ativos), mediante cadastro e validação.</li>
              <li><strong>Ativo</strong> – Empresa ou sociedade empresária listada na Plataforma com o objetivo de captar investimento ou realizar uma transação de M&A.</li>
              <li><strong>Advisor</strong> – Profissional ou organização responsável pela assessoria de M&A, autorizado a cadastrar e representar Ativos.</li>
              <li><strong>Agente</strong> – Pessoa física ou jurídica que atua na originação ou indicação de oportunidades de M&A.</li>
              <li><strong>Serviços</strong> – Conjunto de funcionalidades e recursos ofertados pela Mary por meio da Plataforma.</li>
              <li><strong>Termos de Uso</strong> – Este documento, que rege os direitos e deveres relacionados ao uso da Plataforma Mary.</li>
              <li><strong>Política de Privacidade</strong> – Documento que regula o tratamento de dados pessoais e institucionais dos Usuários da Plataforma.</li>
              <li><strong>Readiness Score</strong> – Métrica desenvolvida pela Mary para avaliar a prontidão de uma empresa (Ativo) para uma transação de M&A.</li>
            </ul>
          </section>

          {/* 3. Tipos de Usuários */}
          <section id="tipos-usuarios" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Tipos de Usuários, Serviços e Funcionalidades</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.1. Visitantes</h3>
            <p>&quot;Visitantes&quot; são os usuários que navegam em nosso Ecossistema sem efetuar um cadastro. O Visitante poderá:</p>
            <ul className="mt-2 space-y-1">
              <li>Visualizar os benefícios destinados para cada Perfil</li>
              <li>Visualizar as informações de Como Funciona a Mary</li>
              <li>Entender Quem Somos e Que Fazemos</li>
              <li>Acessar os Casos de Sucesso</li>
              <li>Acessar materiais educacionais disponíveis publicamente</li>
              <li>Acessar a central de ajuda</li>
              <li>Acessar este Termo de Uso e nossa Política de Privacidade</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2. Usuários</h3>
            <p>A Mary é voltada a pessoas físicas e jurídicas interessadas em intermediar, participar, acompanhar ou viabilizar transações de fusões e aquisições. Os Usuários podem se cadastrar na Plataforma assumindo um dos seguintes perfis:</p>
            <ul className="mt-2 space-y-2">
              <li><strong>Investidor:</strong> fundos de investimento, corporate ventures, family offices ou empresas com interesse em adquirir ou investir em ativos.</li>
              <li><strong>Ativo:</strong> empresa ou sociedade empresária interessada em captar investimento ou realizar uma transação de M&A.</li>
              <li><strong>Advisor:</strong> profissional ou empresa especializada em assessoria de M&A.</li>
              <li><strong>Agente:</strong> pessoa física ou jurídica autorizada a indicar oportunidades ou Ativos à Plataforma.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3. Isenção de Responsabilidade</h3>
            <p>Nenhuma das funcionalidades ou conteúdos da Plataforma Mary devem ser interpretados como consultoria jurídica, contábil, tributária, financeira ou estratégica. O uso da Plataforma não substitui a atuação de profissionais especializados.</p>
          </section>

          {/* 4. Cadastro */}
          <section id="cadastro" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Cadastro</h2>
            <p><strong>4.1.</strong> O acesso ao Ecossistema pelos Usuários depende do fornecimento de determinadas informações, conforme previsto na Política de Privacidade.</p>
            <p className="mt-4"><strong>4.2.</strong> Após a conclusão do processo de cadastro, o Usuário receberá no e-mail informado um link para validação da conta.</p>
            <p className="mt-4"><strong>4.3.</strong> A conta de cada Usuário é pessoal e intransferível, acessível unicamente por meio do login e senha cadastrados.</p>
            <p className="mt-4"><strong>4.4.</strong> O Usuário é integralmente responsável por todas as atividades realizadas com sua conta.</p>
            <p className="mt-4"><strong>4.5.</strong> O Usuário declara e garante que todos os dados fornecidos no momento do cadastro são verdadeiros, completos, precisos e atualizados.</p>
            <p className="mt-4"><strong>4.6.</strong> A Mary poderá suspender, temporária ou definitivamente, o acesso de qualquer Usuário cujo cadastro contenha informações inverídicas, inconsistentes ou desatualizadas.</p>
            <p className="mt-4"><strong>4.7.</strong> O Usuário compromete-se a não compartilhar suas credenciais de acesso com terceiros.</p>
          </section>

          {/* 5. Serviços */}
          <section id="servicos" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Serviços</h2>
            <p><strong>5.1.</strong> A Mary oferece aos Usuários uma plataforma digital especializada para a gestão de processos de Fusões e Aquisições (M&A).</p>
            <p className="mt-4"><strong>5.2.</strong> Por meio do Ecossistema, os Usuários poderão:</p>
            <ul className="mt-2 space-y-1">
              <li>Cadastrar suas teses de investimento ou oportunidades de captação/venda</li>
              <li>Utilizar filtros e algoritmos inteligentes para identificação de oportunidades</li>
              <li>Acompanhar, por meio de dashboards e pipelines, as etapas de cada oportunidade</li>
              <li>Gerar e acessar materiais padronizados de transação</li>
              <li>Solicitar assinatura de NDA digital e acessar áreas seguras de dados (VDR)</li>
              <li>Enviar ou receber manifestações de interesse (como NBO)</li>
              <li>Interagir com outros Usuários</li>
            </ul>
          </section>

          {/* 6. Regras */}
          <section id="regras" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Regras e Condições para Utilização da Mary</h2>
            <p><strong>6.1.</strong> Ao aceitar estes Termos de Uso, você declara: (i) ser maior de 18 (dezoito) anos; (ii) ser responsável por quaisquer consequências relacionadas à sua utilização da Plataforma; e (iii) ser o único responsável pelas operações que realizar por meio do Ecossistema.</p>
            <p className="mt-4"><strong>6.5.</strong> Você reconhece que não poderá:</p>
            <ul className="mt-2 space-y-1">
              <li>Utilizar o Ecossistema para violar legislação aplicável ou direitos de terceiros</li>
              <li>Copiar, distribuir, ceder, sublicenciar ou vender o Ecossistema</li>
              <li>Empregar malware e/ou práticas nocivas</li>
              <li>Reproduzir, adaptar ou modificar o Ecossistema sem autorização</li>
              <li>Publicar arquivos contaminantes ou destrutivos</li>
              <li>Acessar ou modificar indevidamente os dados de outros Usuários</li>
            </ul>
          </section>

          {/* 7. Conteúdo */}
          <section id="conteudo" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Conteúdo Fornecido pelo Usuário</h2>
            <p><strong>7.1.</strong> A Mary pode permitir que você submeta conteúdo e informação de texto, áudio e/ou visual por meio dos Serviços.</p>
            <p className="mt-4"><strong>7.2.</strong> O Usuário declara que os conteúdos por ele submetidos não infringem qualquer direito de terceiros.</p>
            <p className="mt-4"><strong>7.3.</strong> Todo o conteúdo fornecido por você mantém-se de sua propriedade, contudo, ao fornecer tais conteúdos à Mary, você concede licença gratuita para uso institucional.</p>
            <p className="mt-4"><strong>7.4.</strong> O Usuário compromete-se a não fornecer conteúdo que seja ofensivo, difamatório, ilícito ou que exponha de forma negativa a imagem da Mary.</p>
          </section>

          {/* 8. Segurança */}
          <section id="seguranca" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Medidas de Segurança</h2>
            <p><strong>8.1.</strong> A Mary se compromete a aplicar as medidas de segurança adequadas para seu uso do Ecossistema.</p>
            <p className="mt-4"><strong>8.3.</strong> Mary não solicita espontaneamente ao Usuário a divulgação de dados de cadastro ou informações pessoais. Mensagens com tais solicitações deverão ser ignoradas.</p>
            <p className="mt-4"><strong>8.5.</strong> Você está ciente que poderá se sujeitar a mecanismos de validação de segurança, tais como autenticação em duas etapas e validação por e-mail.</p>
          </section>

          {/* 9. Propriedade Intelectual */}
          <section id="propriedade" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Propriedade Intelectual</h2>
            <p><strong>9.1.</strong> A Plataforma Mary, seu código-fonte, algoritmos, banco de dados estruturado, interface visual, funcionalidades, layout, identidade visual, manuais e quaisquer materiais desenvolvidos são de propriedade exclusiva da Mary Digital Ecosystem Ltda.</p>
            <p className="mt-4"><strong>9.2.</strong> O Usuário reconhece que não adquire qualquer direito sobre a propriedade intelectual ou industrial relacionada à Plataforma Mary.</p>
            <p className="mt-4"><strong>9.3.</strong> É vedado ao Usuário replicar a estrutura, lógica funcional, layout ou banco de dados da Mary para desenvolver produtos concorrentes.</p>
          </section>

          {/* 10. Links */}
          <section id="links" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">10. Links de Terceiros</h2>
            <p><strong>10.1.</strong> O Ecossistema poderá conter links para websites de terceiros. A existência destes links não representa um endosso ou patrocínio a tais terceiros.</p>
            <p className="mt-4"><strong>10.2.</strong> Os links de terceiros são fornecidos somente para sua conveniência. A Mary não assume qualquer responsabilidade sobre eles.</p>
          </section>

          {/* 11. Garantia */}
          <section id="garantia" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">11. Garantia e Termo de Responsabilidade</h2>
            <p><strong>11.1.</strong> A Mary atua como um ecossistema digital que conecta investidores, empresas, agentes e advisors. A Mary não atua como assessoria financeira, jurídica ou estratégica.</p>
            <p className="mt-4"><strong>11.2.</strong> A Mary não garante, endossa ou assume responsabilidade por serviços prestados por terceiros.</p>
            <p className="mt-4"><strong>11.3.</strong> A Plataforma é fornecida &quot;como está&quot; e &quot;conforme disponível&quot;.</p>
            <p className="mt-4"><strong>11.4.</strong> A Mary não garante a obtenção de resultados específicos ou transações de sucesso a partir do uso da Plataforma.</p>
          </section>

          {/* 12. Limitação */}
          <section id="limitacao" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">12. Limitação de Responsabilidade</h2>
            <p><strong>12.1.</strong> Você concorda que possui como solução para quaisquer problemas a possibilidade de cancelar seu cadastro no Ecossistema.</p>
            <p className="mt-4"><strong>12.2.</strong> A Mary não é responsável por plataformas de terceiros ou pelo conteúdo destes.</p>
            <p className="mt-4"><strong>12.3.</strong> A Mary não será responsável por quaisquer indisponibilidades, erros e/ou falhas do Ecossistema.</p>
          </section>

          {/* 13. Indenização */}
          <section id="indenizacao" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">13. Indenização</h2>
            <p><strong>13.1.</strong> O Usuário concorda em defender, indenizar e manter indene a Mary de quaisquer encargos, ações ou demandas resultantes da utilização indevida do Ecossistema, violação das condições ora pactuadas, ou violação de qualquer lei ou direitos de terceiro.</p>
          </section>

          {/* 14. Vigência */}
          <section id="vigencia" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">14. Vigência e Rescisão</h2>
            <p><strong>14.1.</strong> Estes Termos de Uso terão vigência a partir da data de adesão à Plataforma pelo Usuário.</p>
            <p className="mt-4"><strong>14.2.</strong> A Mary poderá rescindir estes Termos de Uso nos seguintes casos: uso indevido da conta, suspeita de fraude, falecimento do Usuário, ou mediante aviso prévio de 7 dias.</p>
            <p className="mt-4"><strong>14.3.</strong> O Usuário pode solicitar a exclusão de seu cadastro a qualquer momento via Central de Suporte.</p>
          </section>

          {/* 15. Modificações */}
          <section id="modificacoes" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">15. Modificações</h2>
            <p><strong>15.1.</strong> Os Termos de Uso e a Política de Privacidade estão sujeitos a um processo contínuo de aprimoramento.</p>
            <p className="mt-4"><strong>15.2.</strong> O Usuário reconhece e aceita que o uso do Ecossistema passará a ser submetido aos Termos de Uso atualizados.</p>
          </section>

          {/* 16. Disposições */}
          <section id="disposicoes" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">16. Disposições Gerais</h2>
            <p><strong>16.1.</strong> Caso qualquer disposição destes Termos de Uso venha a ser considerada ilegal, nula ou inexequível, as disposições restantes não serão afetadas.</p>
            <p className="mt-4"><strong>16.2.</strong> Todas as comunicações encaminhadas por você à Mary serão consideradas válidas quando realizadas por meio da Central de Suporte.</p>
          </section>

          {/* 17. Lei */}
          <section id="lei" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">17. Lei Aplicável</h2>
            <p><strong>17.1.</strong> Estes Termos de Uso serão regidos e interpretados de acordo com as leis do Brasil.</p>
            <p className="mt-4"><strong>17.2.</strong> O Usuário reconhece que quaisquer controvérsias deverão ser resolvidas junto ao foro central da Comarca de Florianópolis, Estado de Santa Catarina.</p>
          </section>

          {/* 18. Suporte */}
          <section id="suporte" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">18. Central de Suporte</h2>
            <p><strong>18.1.</strong> Em caso de dúvidas, sugestões, solicitações ou reclamações, entre em contato por meio de:</p>
            <ul className="mt-2 space-y-1">
              <li>Chat disponível no menu &quot;Ajuda&quot; diretamente no Ecossistema</li>
              <li>E-mail: help@mary.network</li>
              <li>Seção &quot;Central de Suporte&quot; em: https://www.mary.network</li>
            </ul>
          </section>

          {/* Versão */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Termos de Uso - Versão 1.0</strong> | Atualizado em: 10 de janeiro de 2026
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Estes Termos de Uso devem ser interpretados em conjunto com a{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Política de Privacidade
              </Link>{' '}
              da Mary.
            </p>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Mary Digital Ecosystem.
        </div>
      </footer>
    </main>
  )
}
