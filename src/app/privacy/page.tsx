import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Mary',
  description: 'Política de Privacidade da plataforma Mary Digital Ecosystem',
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground mb-8">
            Bem-vindo à Mary Digital Ecosystem!
          </p>

          <p>
            A Mary preza pela excelência no atendimento de seus clientes e preocupa-se com a sua privacidade e com a proteção de seus dados pessoais. Durante sua navegação em nossas plataformas e para que possamos oferecer nossos serviços é necessário que tenhamos acesso a determinadas informações sobre você ou associadas a você, por esta razão, é muito importante para nós que você saiba como tratamos seus dados pessoais (&quot;Dados Pessoais&quot;).
          </p>

          {/* Sobre a Mary */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Sobre a Mary</h2>
            <p>
              A Mary é um ecossistema digital voltado para transações de Fusões e Aquisições (M&A) acessível pela URL https://www.mary.network/ (&quot;Plataforma&quot; ou &quot;Ecossistema&quot;), desenvolvida e disponibilizada pela Mary Digital Ecosystem Ltda., inscrita no CNPJ sob o nº 62.135.811/0001-57, com sede na Alameda César Nascimento, nº 646, sala comercial, bairro Jurerê, na Cidade de Florianópolis, Estado de Santa Catarina, CEP 88.053-500 (&quot;Mary&quot;, &quot;nós&quot; ou &quot;nossos&quot;).
            </p>
            <p className="mt-4">
              Esta Política de Privacidade (&quot;Política&quot;) explica, de maneira simples, objetiva e transparente, quais Dados Pessoais são coletados, usados e de outras formas tratados pela Mary e para quais finalidades, além de indicar com quem eles podem ser compartilhados e como os Usuários podem gerenciar seus Dados Pessoais.
            </p>
          </section>

          {/* Índice */}
          <nav className="my-8 p-4 bg-muted/50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Índice</h2>
            <ul className="space-y-1 text-sm">
              <li><a href="#informacoes-gerais" className="text-primary hover:underline">1. Informações Gerais</a></li>
              <li><a href="#menores" className="text-primary hover:underline">2. Dados Pessoais de menores de 18 anos</a></li>
              <li><a href="#dados-coletados" className="text-primary hover:underline">3. Quais Dados Pessoais coletamos e tratamos?</a></li>
              <li><a href="#cookies" className="text-primary hover:underline">4. Uso de cookies e outras tecnologias</a></li>
              <li><a href="#finalidades" className="text-primary hover:underline">5. Para que utilizamos seus Dados Pessoais?</a></li>
              <li><a href="#exclusao" className="text-primary hover:underline">6. Quando excluímos os Dados Pessoais?</a></li>
              <li><a href="#compartilhamento" className="text-primary hover:underline">7. Com quem compartilhamos os Dados Pessoais?</a></li>
              <li><a href="#direitos" className="text-primary hover:underline">8. Quais os seus direitos?</a></li>
              <li><a href="#armazenamento" className="text-primary hover:underline">9. Como armazenamos e protegemos os seus Dados?</a></li>
              <li><a href="#exclusao-conta" className="text-primary hover:underline">10. Exclusão de Conta</a></li>
              <li><a href="#senha" className="text-primary hover:underline">11. Sobre sua conta e senha de acesso</a></li>
              <li><a href="#seguranca-internet" className="text-primary hover:underline">12. Segurança da Internet</a></li>
              <li><a href="#responsabilidade" className="text-primary hover:underline">13. Sua responsabilidade sobre seus Dados</a></li>
              <li><a href="#consentimento" className="text-primary hover:underline">14. Quando precisamos do seu consentimento?</a></li>
              <li><a href="#atualizacoes" className="text-primary hover:underline">15. Atualizações nesta Política</a></li>
              <li><a href="#reclamacao" className="text-primary hover:underline">16. Como fazer uma reclamação</a></li>
              <li><a href="#tratamento-dados" className="text-primary hover:underline">Tratamento de Dados (LGPD)</a></li>
            </ul>
          </nav>

          {/* 1. Informações Gerais */}
          <section id="informacoes-gerais" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Informações Gerais</h2>
            <p><strong>1.1.</strong> Os Dados Pessoais que coletamos por meio de seu cadastro na Plataforma permitirão que você tenha acesso aos Serviços e determinadas funcionalidades da Plataforma, conforme descritas em nossos Termos de Uso.</p>
            <p className="mt-4"><strong>1.2.</strong> Por meio desta Política, queremos dar a você transparência de quais Dados Pessoais coletamos e utilizamos a seu respeito. Alguns dos seus Dados Pessoais poderão ser compartilhados com parceiros e prestadores de serviço contratados pela Mary, sempre com a finalidade exclusiva de viabilizar a operação técnica da Plataforma.</p>
            <p className="mt-4"><strong>1.3.</strong> A Mary não comercializa seus dados pessoais com terceiros, nem os compartilha para fins publicitários ou alheios à operação da Plataforma.</p>
            <p className="mt-4"><strong>1.4.</strong> Os Dados Pessoais são utilizados para:</p>
            <ul className="mt-2 space-y-1">
              <li>Efetuar seu cadastro na Plataforma</li>
              <li>Realizar a autenticação de sua identidade</li>
              <li>Disponibilizar e prestar os Serviços</li>
              <li>Comunicar-nos com você sempre que necessário</li>
              <li>Disponibilizar e aprimorar as funcionalidades da Plataforma</li>
            </ul>
            <p className="mt-4"><strong>1.5.</strong> Para dúvidas sobre Dados Pessoais, entre em contato:</p>
            <ul className="mt-2">
              <li><strong>Encarregado:</strong> Leonardo Grisotto</li>
              <li><strong>E-mail:</strong> help@mary.network</li>
            </ul>
          </section>

          {/* 2. Menores */}
          <section id="menores" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Dados Pessoais de menores de 18 anos</h2>
            <p><strong>2.1. Proibição de cadastro</strong></p>
            <p>O uso da Plataforma é restrito a pessoas maiores de 18 (dezoito) anos. Usuários menores de idade não devem tentar se registrar, utilizar os Serviços ou fornecer quaisquer Dados Pessoais por meio da Plataforma.</p>
            <p className="mt-4">Caso a Mary identifique que um menor de idade realizou cadastro indevido, a conta será imediatamente cancelada, e os dados eventualmente coletados serão excluídos de forma segura, em conformidade com a LGPD.</p>
          </section>

          {/* 3. Dados Coletados */}
          <section id="dados-coletados" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Quais Dados Pessoais coletamos e tratamos?</h2>
            <p><strong>3.1.</strong> A Mary atuará como Controladora de Dados Pessoais de seus Usuários.</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">(A) Dados de cadastro</h3>
            <p>São as informações fornecidas diretamente pelo Usuário ao se cadastrar:</p>
            <ul className="mt-2 space-y-1">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Senha</li>
              <li>CPF</li>
              <li>Data de nascimento</li>
              <li>Telefone celular</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">(B) Dados de Pagamento</h3>
            <p>Para execução dos repasses financeiros previstos contratualmente:</p>
            <ul className="mt-2 space-y-1">
              <li>Nome completo ou razão social do beneficiário</li>
              <li>CPF ou CNPJ</li>
              <li>Dados bancários (banco, agência, conta)</li>
              <li>Chave Pix</li>
              <li>Dados de identificação fiscal</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">(C) Dados de atividade</h3>
            <p>Informações relacionadas ao uso da Plataforma:</p>
            <ul className="mt-2 space-y-1">
              <li>Tipo e versão de navegador</li>
              <li>Páginas visitadas na Plataforma</li>
              <li>Endereço IP / IPv6</li>
              <li>Geolocalização</li>
              <li>Tipo de dispositivo de acesso</li>
              <li>Cookies</li>
              <li>Histórico de consultas e relatórios</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">(D) Dados de consultas</h3>
            <p>Informações obtidas de bases públicas e oficiais, incluindo:</p>
            <ul className="mt-2 space-y-1">
              <li>Informações cadastrais e fiscais</li>
              <li>Dados funcionais e eleitorais</li>
              <li>Registros de sanções e penalidades</li>
              <li>Dados biométricos para validações de identidade</li>
            </ul>
          </section>

          {/* 4. Cookies */}
          <section id="cookies" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Uso de cookies e outras tecnologias de monitoramento</h2>
            <p><strong>4.1.</strong> Podemos utilizar certas tecnologias de monitoramento das atividades realizadas na Plataforma. As tecnologias utilizadas incluem: Cookies, Google Analytics, Twitter Ads, Facebook Analytics, Linkedin e MailChimp.</p>
            <p className="mt-4"><strong>4.2.</strong> Um cookie é um arquivo texto colocado no disco rígido por um servidor web, sem capacidade de executar programas nem infectar seu computador com vírus. Utilizamos cookies para personalizar sua experiência online.</p>
            <p className="mt-4">Os cookies utilizados não coletam informações pessoais sensíveis ou bancárias, e os dados coletados são tratados de forma anonimizada.</p>
            <p className="mt-4">É possível desativar a utilização de cookies na configuração de seu navegador, entretanto, algumas funcionalidades da Plataforma podem deixar de funcionar corretamente.</p>
          </section>

          {/* 5. Finalidades */}
          <section id="finalidades" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Para que utilizamos seus Dados Pessoais?</h2>
            <p><strong>5.1.</strong> A Mary trata seus Dados Pessoais com seriedade, sempre com base em finalidades legítimas:</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Dados de cadastro:</h3>
            <ul className="space-y-1">
              <li>Realizar e validar o cadastro e identificação dos Usuários</li>
              <li>Possibilitar o acesso do Usuário à Plataforma</li>
              <li>Prestação de Serviços da Mary</li>
              <li>Esclarecer dúvidas e reclamações</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Realizar verificação antifraude</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Dados de pagamento:</h3>
            <ul className="space-y-1">
              <li>Executar os repasses financeiros previstos em contrato</li>
              <li>Processar transações conforme os termos do SPA/CCV</li>
              <li>Emissão de documentos fiscais</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Dados de atividades:</h3>
            <ul className="space-y-1">
              <li>Personalização da Plataforma</li>
              <li>Aprimorar as funcionalidades</li>
              <li>Garantir a segurança dos processos internos</li>
            </ul>
          </section>

          {/* 6. Exclusão */}
          <section id="exclusao" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Quando excluímos os Dados Pessoais?</h2>
            <p><strong>6.1.</strong> Seus Dados Pessoais são mantidos apenas pelo tempo necessário para cumprir com as finalidades descritas nesta Política, respeitando os prazos legais e contratuais aplicáveis.</p>
            <p className="mt-4"><strong>6.2.</strong> Podemos manter seus Dados Pessoais mesmo após o encerramento da relação com a Mary, quando necessário para cumprimento de obrigações legais ou exercício regular de direitos.</p>
            <p className="mt-4"><strong>6.3.</strong> Sempre que possível, a Mary poderá converter dados em dados anonimizados para uso estatístico ou analítico.</p>
          </section>

          {/* 7. Compartilhamento */}
          <section id="compartilhamento" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Com quem compartilhamos os Dados Pessoais?</h2>
            <p><strong>7.1.</strong> A Mary poderá compartilhar seus Dados Pessoais com terceiros estritamente necessários à operação da Plataforma:</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">(A) Dados de Atividade e Navegação</h3>
            <p>Ferramentas: Google Analytics, Meta Ads, LinkedIn Ads, Hotjar, MailChimp</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">(B) Dados de Pagamento</h3>
            <p>Prestadores: PagSeguro, Pagar.me e outras soluções de pagamento</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">(C) Dados de Cadastro e de Consultas</h3>
            <p>Destinatários: Autoridades públicas, órgãos reguladores e prestadores especializados</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">(F) Reestruturações societárias</h3>
            <p>Em caso de fusão, aquisição ou venda de ativos, os Dados Pessoais poderão ser transferidos como parte dos ativos da Mary.</p>
          </section>

          {/* 8. Direitos */}
          <section id="direitos" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Quais os seus direitos com relação aos seus Dados Pessoais?</h2>
            <p><strong>8.1.</strong> Conforme previsto na LGPD, você possui os direitos de solicitar:</p>
            <ul className="mt-2 space-y-2">
              <li>A confirmação de que realizamos o tratamento dos seus Dados Pessoais</li>
              <li>O acesso aos seus Dados Pessoais</li>
              <li>A correção de Dados Pessoais incompletos, inexatos ou desatualizados</li>
              <li>A anonimização, bloqueio ou eliminação de Dados desnecessários</li>
              <li>A portabilidade dos seus Dados Pessoais a outro fornecedor</li>
              <li>A eliminação dos Dados Pessoais tratados com base no seu consentimento</li>
              <li>Informação sobre com quem compartilhamos os seus Dados</li>
              <li>Revogação do seu consentimento</li>
              <li>Revisão de decisões tomadas com base em tratamento automatizado</li>
            </ul>
            <p className="mt-4">Você pode exercer seus direitos enviando um e-mail para: <strong>help@mary.network</strong></p>
          </section>

          {/* 9. Armazenamento */}
          <section id="armazenamento" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Como armazenamos e protegemos os seus Dados Pessoais</h2>
            <p><strong>9.1.</strong> Os seus Dados Pessoais são armazenados em ambientes de servidores contratados por prestadores de serviço especializados, que operam em conformidade com padrões reconhecidos de segurança da informação.</p>
            <p className="mt-4"><strong>9.2.</strong> A Mary adota práticas técnicas e administrativas adequadas para proteger os Dados Pessoais contra acessos não autorizados, destruição, perda, alteração ou qualquer forma de tratamento inadequado.</p>
            <p className="mt-4"><strong>9.4.</strong> Se você tiver qualquer preocupação sobre segurança, entre em contato: <strong>help@mary.network</strong></p>
          </section>

          {/* 10. Exclusão de Conta */}
          <section id="exclusao-conta" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">10. Exclusão de Conta</h2>
            <p><strong>10.1.</strong> Caso deseje excluir sua conta, envie um e-mail para <strong>help@mary.network</strong> com o título &quot;Exclusão de Conta&quot;, contendo:</p>
            <ul className="mt-2 space-y-1">
              <li>Nome completo</li>
              <li>CPF</li>
              <li>E-mail cadastrado na Plataforma</li>
              <li>CNPJ da instituição vinculada (se aplicável)</li>
              <li>Motivo da exclusão (opcional)</li>
            </ul>
            <p className="mt-4">A solicitação deve ser feita pelo e-mail cadastrado, garantindo que não se trate de um pedido fraudulento.</p>
          </section>

          {/* 11. Senha */}
          <section id="senha" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">11. O que você precisa saber sobre sua conta e senha de acesso?</h2>
            <p><strong>11.1.</strong> Sua senha de acesso à Plataforma é pessoal, intransferível e confidencial.</p>
            <p className="mt-4"><strong>11.2.</strong> Você é o único responsável pela guarda e sigilo de suas credenciais. Recomenda-se:</p>
            <ul className="mt-2 space-y-1">
              <li>Utilizar senhas fortes (alfa-numéricas e com caracteres especiais)</li>
              <li>Evitar senhas óbvias (como datas de nascimento ou nomes)</li>
              <li>Alterar a senha periodicamente</li>
              <li>Atualizar a senha imediatamente em caso de suspeita de acesso indevido</li>
            </ul>
            <p className="mt-4"><strong>11.3.</strong> A Mary não solicita suas credenciais por e-mail, telefone ou qualquer outro canal externo.</p>
          </section>

          {/* 12. Segurança da Internet */}
          <section id="seguranca-internet" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">12. Segurança da Internet</h2>
            <p><strong>12.1.</strong> A Mary adota medidas técnicas e organizacionais compatíveis com o estado da arte para proteger os Dados Pessoais, utilizando criptografia, autenticação segura, firewalls e controle de acessos.</p>
            <p className="mt-4"><strong>12.2.</strong> Apesar desses esforços, nenhum ambiente digital é totalmente livre de riscos.</p>
            <p className="mt-4"><strong>12.4.</strong> Recomendamos:</p>
            <ul className="mt-2 space-y-1">
              <li>Usar senhas fortes e exclusivas</li>
              <li>Evitar redes públicas sem proteção adequada</li>
              <li>Atualizar o navegador e sistemas operacionais</li>
              <li>Manter antivírus e firewalls ativados</li>
            </ul>
          </section>

          {/* 13. Responsabilidade */}
          <section id="responsabilidade" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">13. Qual é a sua responsabilidade sobre seus Dados Pessoais?</h2>
            <p><strong>13.1.</strong> Você é responsável por garantir a veracidade, precisão e atualização dos Dados Pessoais fornecidos à Mary.</p>
            <p className="mt-4"><strong>13.5.</strong> É vedado o repasse, compartilhamento, redistribuição ou revenda das informações obtidas por meio da Plataforma.</p>
            <p className="mt-4"><strong>13.6.</strong> Você será o único responsável por qualquer uso indevido das informações acessadas na Plataforma.</p>
          </section>

          {/* 14. Consentimento */}
          <section id="consentimento" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">14. Quando precisamos do seu consentimento?</h2>
            <p><strong>14.1.</strong> Nem sempre precisamos do seu consentimento para tratar seus Dados Pessoais. A LGPD permite o uso de dados com base em diferentes fundamentos legais.</p>
            <p className="mt-4"><strong>14.2.</strong> Seus dados podem ser tratados para:</p>
            <ul className="mt-2 space-y-1">
              <li>Viabilizar o acesso e uso da Plataforma (execução de contrato)</li>
              <li>Cumprir obrigações legais ou regulatórias</li>
              <li>Prevenir fraudes e garantir a segurança das operações</li>
              <li>Exercer direitos da Mary em processos judiciais</li>
              <li>Proteger o crédito e validar informações</li>
              <li>Atender a interesses legítimos da Mary ou de terceiros</li>
            </ul>
            <p className="mt-4"><strong>14.3.</strong> Sempre que a LGPD exigir seu consentimento expresso, solicitaremos de forma clara e destacada.</p>
          </section>

          {/* 15. Atualizações */}
          <section id="atualizacoes" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">15. Atualizações nesta Política</h2>
            <p><strong>15.1.</strong> Esta Política de Privacidade poderá passar por atualizações para refletir melhorias na Plataforma, mudanças legais ou ajustes em nossos serviços.</p>
            <p className="mt-4"><strong>15.2.</strong> Alterações relevantes serão comunicadas por:</p>
            <ul className="mt-2 space-y-1">
              <li>Publicação da nova versão em nossa Plataforma</li>
              <li>Envio de aviso por e-mail</li>
              <li>Exibição de comunicado direto dentro da Plataforma</li>
            </ul>
          </section>

          {/* 16. Reclamação */}
          <section id="reclamacao" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">16. Como fazer uma reclamação</h2>
            <p><strong>16.1.</strong> Para dúvidas, sugestões ou reclamações, entre em contato:</p>
            <ul className="mt-2 space-y-1">
              <li><strong>E-mail:</strong> help@mary.network</li>
              <li><strong>Central de Suporte:</strong> https://www.mary.network</li>
            </ul>
            <p className="mt-4"><strong>16.3.</strong> Para registrar reclamação com a Autoridade Nacional de Proteção de Dados (ANPD):</p>
            <p className="mt-2">
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://www.gov.br/anpd
              </a>
            </p>
          </section>

          {/* Tratamento de Dados - LGPD */}
          <section id="tratamento-dados" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mt-8 mb-4">Tratamento de Dados (LGPD)</h2>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p>
                A Mary Digital Ecosystem Ltda. atua em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), garantindo transparência e segurança no tratamento dos dados pessoais de seus usuários.
              </p>
              <p className="mt-4">
                <strong>Controlador de Dados:</strong> Mary Digital Ecosystem Ltda.<br />
                <strong>CNPJ:</strong> 62.135.811/0001-57<br />
                <strong>Encarregado (DPO):</strong> Leonardo Grisotto<br />
                <strong>Contato:</strong> help@mary.network
              </p>
              <p className="mt-4">
                Ao utilizar nossa Plataforma, você autoriza o tratamento de seus dados conforme descrito nesta Política de Privacidade, para as finalidades legítimas aqui estabelecidas.
              </p>
            </div>
          </section>

          {/* Glossário */}
          <section className="scroll-mt-20 mt-8">
            <h2 className="text-2xl font-bold mb-4">Glossário</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Termo</th>
                    <th className="text-left py-2 font-semibold">Definição</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="py-2 pr-4 font-medium">Dados Pessoais</td><td className="py-2">Informações que identificam ou podem identificar uma pessoa natural.</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">Usuário</td><td className="py-2">Pessoa física ou jurídica que acessa ou utiliza os serviços da Plataforma Mary.</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">LGPD</td><td className="py-2">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">Controladora de Dados</td><td className="py-2">Pessoa jurídica responsável pelas decisões relacionadas ao tratamento dos Dados Pessoais.</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">Tratamento de Dados</td><td className="py-2">Toda operação realizada com Dados Pessoais, como coleta, uso, compartilhamento ou exclusão.</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">Consentimento</td><td className="py-2">Autorização expressa dada pelo titular dos dados para que seus Dados Pessoais sejam tratados.</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">Cookies</td><td className="py-2">Arquivos de texto armazenados no navegador que registram preferências de navegação.</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">Encarregado (DPO)</td><td className="py-2">Pessoa indicada pela Mary para atuar como canal de comunicação com titulares e a ANPD.</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">ANPD</td><td className="py-2">Autoridade Nacional de Proteção de Dados, órgão responsável por fiscalizar a LGPD.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Versão */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Política de Privacidade - Versão 1.0</strong> | Atualizada em: 10 de janeiro de 2026
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta Política de Privacidade deve ser interpretada em conjunto com os{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Termos de Uso
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
