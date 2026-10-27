import { ConsultaForm } from "./ConsultaForm";

const services = [
  {
    code: "01",
    title: "Programas Internos de Protección Civil",
    description:
      "Programas completos y alineados con los lineamientos estatales y municipales aplicables.",
    tag: "Gestión normativa",
  },
  {
    code: "02",
    title: "Capacitación y formación de brigadas",
    description:
      "Cursos registrados y con validez ante la STPS para preparar brigadas capaces de responder con claridad.",
    tag: "Preparación operativa",
  },
  {
    code: "03",
    title: "Dictámenes técnicos",
    description:
      "Dictámenes eléctricos, estructurales y de verificación de instalaciones de gas.",
    tag: "Certeza técnica",
  },
  {
    code: "04",
    title: "Estudios de ingeniería",
    description:
      "Análisis que identifican condiciones y fenómenos capaces de afectar la operación industrial.",
    tag: "Análisis especializado",
  },
  {
    code: "05",
    title: "Gestión para el visto bueno",
    description:
      "Acompañamiento integral durante el ingreso, seguimiento y atención de requerimientos.",
    tag: "Acompañamiento",
  },
];

const method = [
  {
    number: "01",
    title: "Evaluamos",
    text: "Analizamos integralmente los riesgos, las condiciones del sitio y las obligaciones aplicables.",
  },
  {
    number: "02",
    title: "Diseñamos",
    text: "Definimos soluciones estratégicas, técnicas y normativas para la operación.",
  },
  {
    number: "03",
    title: "Implementamos",
    text: "Integramos documentos, estudios, evidencias y capacitación en un proceso coordinado.",
  },
  {
    number: "04",
    title: "Acompañamos",
    text: "Damos seguimiento hasta la gestión, aprobación o visto bueno correspondiente.",
  },
];

function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <a className={footer ? "brand brand-footer" : "brand"} href="#inicio" aria-label="SIGRI, ir al inicio">
      <img src="/logo-sigri.png" alt="SIGRI S.A. de C.V." />
    </a>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="shell header-inner">
          <Logo />
          <nav aria-label="Navegación principal">
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#metodo">Cómo trabajamos</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <a className="header-action" href="#consulta">
            Consulta tu carpeta
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid-pattern" aria-hidden="true" />
        <div className="hero-signal hero-signal-one" aria-hidden="true" />
        <div className="hero-signal hero-signal-two" aria-hidden="true" />

        <div className="shell hero-layout">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="live-dot" />
              Gestión del riesgo · Protección Civil · Ingeniería
            </div>
            <h1>
              Prevención que protege.
              <span>Ingeniería que da certeza.</span>
            </h1>
            <p>
              Diseñamos y gestionamos soluciones integrales para reducir riesgos,
              cumplir con la normativa y asegurar la continuidad de tu operación.
            </p>
            <div className="hero-actions">
              <a className="button button-orange" href="#consulta">
                Consultar mi carpeta <span aria-hidden="true">↗</span>
              </a>
              <a className="text-action" href="#servicios">
                Explorar servicios <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <div className="hero-system" aria-label="Sistema integral de gestión del riesgo">
            <div className="system-meta system-meta-top">
              <span>01</span>
              <p>Evaluación integral</p>
            </div>
            <div className="system-meta system-meta-right">
              <span>02</span>
              <p>Solución técnica</p>
            </div>
            <div className="system-meta system-meta-bottom">
              <span>03</span>
              <p>Continuidad operativa</p>
            </div>

            <div className="orbit orbit-outer" aria-hidden="true" />
            <div className="orbit orbit-middle" aria-hidden="true" />
            <div className="orbit orbit-inner" aria-hidden="true" />
            <div className="orbit-axis orbit-axis-x" aria-hidden="true" />
            <div className="orbit-axis orbit-axis-y" aria-hidden="true" />
            <div className="system-core">
              <small>Sistema</small>
              <strong>SIGRI</strong>
              <span>Control del riesgo</span>
            </div>
            <span className="orbit-point point-a" aria-hidden="true" />
            <span className="orbit-point point-b" aria-hidden="true" />
            <span className="orbit-point point-c" aria-hidden="true" />
          </div>
        </div>

        <div className="shell hero-footer">
          <span>Michoacán, México</span>
          <span>Especialistas acreditados</span>
          <span>Seguimiento de carpetas en línea</span>
        </div>
      </section>

      <section className="principles" aria-label="Principios de trabajo">
        <div className="shell principles-grid">
          <div className="principle-index">SIGRI / 01—04</div>
          <div className="principle">
            <span>01</span>
            <p><strong>Evaluación</strong>Analizamos los riesgos de forma integral.</p>
          </div>
          <div className="principle">
            <span>02</span>
            <p><strong>Soluciones</strong>Integramos estrategia, ingeniería y normativa.</p>
          </div>
          <div className="principle">
            <span>03</span>
            <p><strong>Cumplimiento</strong>Protegemos la continuidad del centro de trabajo.</p>
          </div>
        </div>
      </section>

      <section className="section services" id="servicios">
        <div className="shell">
          <div className="section-intro">
            <div>
              <p className="section-label"><span>01</span> Nuestros servicios</p>
              <h2>Soluciones integrales, un solo equipo.</h2>
            </div>
            <p className="section-summary">
              Abordamos la Protección Civil con una visión sistémica que une
              personas, infraestructura, normativa y continuidad operativa.
            </p>
          </div>

          <div className="services-list">
            {services.map((service) => (
              <article className="service-row" key={service.code}>
                <span className="service-code">{service.code}</span>
                <div>
                  <p className="service-tag">{service.tag}</p>
                  <h3>{service.title}</h3>
                </div>
                <p className="service-description">{service.description}</p>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about" id="nosotros">
        <div className="shell about-layout">
          <div className="about-visual" aria-hidden="true">
            <span className="about-index">02</span>
            <div className="about-scan" />
            <div className="about-cross cross-one" />
            <div className="about-cross cross-two" />
            <div className="about-ring ring-one" />
            <div className="about-ring ring-two" />
            <div className="about-core">
              <strong>RIESGO</strong>
              <span>identificar · analizar · controlar</span>
            </div>
          </div>

          <div className="about-copy">
            <p className="section-label section-label-light"><span>02</span> Quiénes somos</p>
            <h2>Del enfoque reactivo a una cultura de prevención.</h2>
            <p className="about-lede">
              Empoderamos a las organizaciones para identificar, analizar,
              evaluar, controlar y reducir las amenazas que pueden afectar a las
              personas, los bienes y la continuidad de sus operaciones.
            </p>
            <div className="about-values">
              <div>
                <span>A</span>
                <p><strong>Enfoque integral y técnico</strong>Integramos variables humanas, técnicas y naturales en una misma estrategia.</p>
              </div>
              <div>
                <span>B</span>
                <p><strong>Continuidad operacional</strong>Protegemos vidas y la capacidad de la empresa para operar sin interrupciones.</p>
              </div>
              <div>
                <span>C</span>
                <p><strong>Acompañamiento especializado</strong>Peritos, ingenieros y consultores participan durante todo el proceso.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section method" id="metodo">
        <div className="shell">
          <div className="section-intro method-intro">
            <div>
              <p className="section-label"><span>03</span> Cómo trabajamos</p>
              <h2>Una ruta clara de principio a fin.</h2>
            </div>
            <p className="section-summary">
              Cada proyecto avanza con etapas definidas, entregables concretos y
              seguimiento visible para el cliente.
            </p>
          </div>

          <div className="method-track">
            {method.map((step, index) => (
              <article className="method-step" key={step.number}>
                <div className="method-node">
                  <span>{step.number}</span>
                  {index < method.length - 1 && <i aria-hidden="true" />}
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section consultation" id="consulta">
        <div className="consultation-grid-pattern" aria-hidden="true" />
        <div className="shell consultation-layout">
          <div className="consultation-copy">
            <p className="section-label section-label-light"><span>04</span> Seguimiento en línea</p>
            <h2>Tu carpeta, siempre visible.</h2>
            <p>
              Consulta el estado del proceso con el folio proporcionado por
              SIGRI. Verás la etapa actual, la tarea activa y el porcentaje de
              avance disponible.
            </p>
            <div className="consultation-detail">
              <span className="consultation-check">✓</span>
              <p><strong>Información puntual</strong>La consulta muestra únicamente los datos necesarios para conocer el progreso.</p>
            </div>
          </div>
          <ConsultaForm />
        </div>
      </section>

      <section className="contact" id="contacto">
        <div className="shell contact-layout">
          <p className="section-label"><span>05</span> Inicia tu proyecto</p>
          <h2>Protege hoy la continuidad de tu empresa.</h2>
          <div className="contact-actions">
            <a className="button button-dark" href="mailto:contacto@sigri.net?subject=Cotización%20SIGRI">
              Solicitar una cotización <span aria-hidden="true">↗</span>
            </a>
            <div className="contact-data">
              <a href="tel:+524431467867">443 146 7867</a>
              <a href="mailto:contacto@sigri.net">contacto@sigri.net</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="shell footer-main">
          <Logo footer />
          <p>Soluciones Integrales de Gestión del Riesgo e Ingenierías.</p>
          <div className="footer-nav">
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#consulta">Consulta tu carpeta</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} SIGRI S.A. de C.V.</span>
          <span>Protección Civil · Gestión del riesgo · Ingeniería</span>
        </div>
      </footer>
    </main>
  );
}
