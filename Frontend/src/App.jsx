import React, { useEffect, useRef, useState } from 'react';
import escudoUnamad from './assets/escudo-unamad.png';
import mascotaUnamad from './assets/mascota-unamad.png';
import unamadAdmin from './assets/unamad-admin.png';
import { api } from './services/api';

function Icon({ name }) {
  const paths = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    hash: <><path d="M5 9h14M4 15h14M10 3 8 21M16 3l-2 18" /></>,
    car: <><path d="m5 16 1.5-6h11L19 16" /><path d="M3.5 16h17v4h-17zM7 20v1M17 20v1M7 13h.01M17 13h.01" /></>,
    graduation: <><path d="m3 10 9-5 9 5-9 5-9-5Z" /><path d="M7 12.2v4.3c2.8 2.1 7.2 2.1 10 0v-4.3" /><path d="M21 10v5" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6l7-3Z" /><path d="M12 8v7M9 11h6" /></>,
    logout: <><path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" /><path d="m14 16 4-4-4-4M18 12H8" /></>,
    clipboard: <><rect x="7" y="4" width="10" height="17" rx="2" /><path d="M9 4.5h6v2H9zM10 10h4M10 14h4M10 18h3" /></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="3" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6" /><path d="m16 16 4 4" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  };

  return <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function UniversitySeal() {
  return (
    <div className="seal" aria-label="Emblema referencial de UNAMAD" role="img">
      <img src={escudoUnamad} alt="Escudo de la Universidad Nacional Amazónica de Madre de Dios" />
    </div>
  );
}

function Field({ icon, label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-control">
        <Icon name={icon} />
        {children}
      </div>
    </label>
  );
}

function LoginForm({ isAdmin, onSubmit, cargando }) {
  return (
    <form className="form" onSubmit={(event) => onSubmit(event, isAdmin ? 'admin' : 'login')}>
      {isAdmin ? (
        <>
          <p className="admin-notice">Panel de Administración · Acceso exclusivo autorizado.</p>
          <Field icon="shield" label="Código de administrador">
            <input name="codigoAdministrador" placeholder="Código de administrador" autoComplete="username" required />
          </Field>
          <Field icon="lock" label="Contraseña de superusuario">
            <input name="password" type="password" placeholder="Contraseña segura" autoComplete="current-password" minLength="12" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{12,}" title="Usa al menos 12 caracteres, una mayúscula, una minúscula y un número." required />
          </Field>
          <button className="primary-button" type="submit" disabled={cargando}>{cargando ? 'Verificando...' : 'Ingresar como Admin'}</button>
        </>
      ) : (
        <>
          <Field icon="mail" label="Correo institucional">
            <input name="correo" type="email" placeholder="Correo institucional" autoComplete="email" required />
          </Field>
          <Field icon="lock" label="Contraseña">
            <input name="password" type="password" placeholder="Contraseña" autoComplete="current-password" required />
          </Field>
          <button className="primary-button" type="submit" disabled={cargando}>{cargando ? 'Ingresando...' : 'Ingresar'}</button>
        </>
      )}
    </form>
  );
}

function RegisterForm({ onSubmit, cargando }) {
  return (
    <form className="form" onSubmit={(event) => onSubmit(event, 'register')}>
      <Field icon="user" label="Nombre completo">
        <input name="nombreCompleto" placeholder="Nombre completo" autoComplete="name" required />
      </Field>
      <Field icon="hash" label="Código de estudiante">
        <input name="matriculaAcademica" placeholder="Código de estudiante" autoComplete="username" required />
      </Field>
      <Field icon="car" label="Placa del vehículo">
        <input name="placa" placeholder="Placa del vehículo" autoCapitalize="characters" maxLength="10" required />
      </Field>
      <Field icon="graduation" label="Carrera">
        <select name="carrera" defaultValue="" required>
          <option value="" disabled>Selecciona tu carrera</option>
          <option value="Ingeniería de Sistemas e Informática">Ingeniería de Sistemas e Informática</option>
        </select>
      </Field>
      <Field icon="mail" label="Correo institucional">
        <input name="correo" type="email" placeholder="Correo institucional" autoComplete="email" required />
      </Field>
      <Field icon="lock" label="Contraseña">
        <input name="password" type="password" placeholder="Contraseña segura" autoComplete="new-password" minLength="12" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{12,}" title="Usa al menos 12 caracteres, una mayúscula, una minúscula y un número." required />
      </Field>
      <button className="primary-button" type="submit" disabled={cargando}>{cargando ? 'Creando cuenta...' : 'Crear cuenta'}</button>
    </form>
  );
}

const puntosAcceso = [
  ['Puerta 1 - Principal', 'Acceso principal', '🚪'],
  ['Puerta 2 - Secundaria', 'Acceso secundario', '▯'],
  ['Puerta 3 - Estacionamiento', 'Acceso vehicular', '▱'],
  ['Puerta 4 - Emergencia', 'Acceso restringido', '△'],
];

function PanelUsuario({ usuario, historial, onCerrarSesion }) {
  const [fotoPerfil, setFotoPerfil] = useState(mascotaUnamad);
  const [chatAbierto, setChatAbierto] = useState(false);
  const inputFoto = useRef(null);

  function cambiarFoto(event) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => setFotoPerfil(lector.result);
    lector.readAsDataURL(archivo);
  }

  const historialVista = historial.map((acceso) => ({
    tipo: acceso.fecha_hora_salida ? 'SALIDA' : 'INGRESO',
    puerta: acceso.puerta,
    fecha: new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(acceso.fecha_hora_salida || acceso.fecha_hora_entrada)),
    flecha: acceso.fecha_hora_salida ? '↗' : '↘',
  }));
  const vehiculoDentro = historial.some((acceso) => !acceso.fecha_hora_salida);

  return (
    <main className="app-shell">
      <section className="access-card dashboard-card" aria-labelledby="panel-title">
        <header className="panel-header">
          <span aria-hidden="true" />
          <h1 id="panel-title">Mi Panel</h1>
          <button className="logout-button" type="button" onClick={onCerrarSesion} aria-label="Cerrar sesión">
            <Icon name="logout" />
          </button>
        </header>

        <section className="profile-card" aria-label="Datos del usuario">
          <div className="profile-name-row">
            <button className="avatar profile-photo-button" type="button" onClick={() => inputFoto.current?.click()} aria-label="Cambiar foto de perfil">
              <img src={fotoPerfil} alt="Foto de perfil" />
              <span aria-hidden="true">✎</span>
            </button>
            <input ref={inputFoto} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={cambiarFoto} />
            <div>
              <h2>{usuario.nombre}</h2>
              <p>{usuario.correo}</p>
            </div>
          </div>
          <dl className="profile-data">
            <div><dt><Icon name="hash" /> Código</dt><dd>{usuario.matricula}</dd></div>
            <div><dt><Icon name="car" /> Placa</dt><dd>{usuario.placa}</dd></div>
            <div><dt><Icon name="graduation" /> Carrera</dt><dd>{usuario.carrera}</dd></div>
          </dl>
        </section>

        <section className="vehicle-status" aria-label="Estado del vehículo">
          <span className="status-badge">✦</span>
          <div><small>Estado del vehículo</small><strong>{vehiculoDentro ? 'DENTRO' : 'FUERA'}</strong></div>
        </section>

        <section className="panel-section" aria-labelledby="puntos-title">
          <h2 id="puntos-title">Puntos de acceso</h2>
          <div className="access-points">
            {puntosAcceso.map(([nombre, detalle, simbolo]) => (
              <button className="access-point" type="button" key={nombre}>
                <span className="point-symbol" aria-hidden="true">{simbolo}</span>
                <span><strong>{nombre}</strong><small>{detalle}</small></span>
                <span className="point-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section history-section" aria-labelledby="history-title">
          <div className="section-heading"><h2 id="history-title">Historial de accesos</h2><span>{historialVista.length} registros</span></div>
          <div className="history-list">
            {historialVista.map((acceso, indice) => (
              <article className={`history-item ${acceso.tipo.toLowerCase()}`} key={`${acceso.fecha}-${indice}`}>
                <span className="history-icon" aria-hidden="true">{acceso.flecha}</span>
                <div className="history-main"><strong>{acceso.tipo}</strong><small>{acceso.puerta}</small><em>♟ {usuario.nombre}</em></div>
                <div className="history-meta"><time>{acceso.fecha}</time><small>{usuario.placa}</small><b>AUTORIZADO</b></div>
              </article>
            ))}
            {historialVista.length === 0 && <p className="empty-state">Aún no hay accesos registrados.</p>}
          </div>
        </section>

        <button className="group-chat-trigger" type="button" onClick={() => setChatAbierto(!chatAbierto)} aria-expanded={chatAbierto}>
          <span>●</span> Chat grupal <small>12 conectados</small>
        </button>
        {chatAbierto && <ChatGrupal usuario={usuario} fotoPerfil={fotoPerfil} />}
      </section>
    </main>
  );
}

function ChatGrupal({ usuario, fotoPerfil }) {
  const [comentarios, setComentarios] = useState([
    { nombre: 'María Fernanda Ríos', texto: 'Buen día, la puerta principal está libre.', color: 'MF' },
    { nombre: 'José Luis Torres', texto: 'Ingreso registrado en estacionamiento.', color: 'JT' },
  ]);
  const [texto, setTexto] = useState('');

  function enviarComentario(event) {
    event.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje) return;
    setComentarios((actuales) => [...actuales, { nombre: usuario.nombre, texto: mensaje, foto: fotoPerfil }]);
    setTexto('');
  }

  return (
    <section className="group-chat" aria-labelledby="chat-title">
      <header><div><h2 id="chat-title">Comunidad UNAMAD</h2><span><i /> 12 usuarios conectados</span></div><span aria-hidden="true">◌</span></header>
      <div className="chat-messages" aria-live="polite">
        {comentarios.map((comentario, indice) => <article key={`${comentario.nombre}-${indice}`}><span className="chat-avatar">{comentario.foto ? <img src={comentario.foto} alt="" /> : comentario.color}</span><div><strong>{comentario.nombre}</strong><p>{comentario.texto}</p></div></article>)}
      </div>
      <form className="chat-composer" onSubmit={enviarComentario}><input value={texto} onChange={(event) => setTexto(event.target.value)} maxLength="280" placeholder="Escribe un comentario..." aria-label="Comentario para el grupo" /><button type="submit" aria-label="Enviar comentario">➤</button></form>
    </section>
  );
}

const puertasAdmin = [
  ['Puerta 1 - Principal', 'Principal · Monitoreada', '🚪'],
  ['Puerta 2 - Secundaria', 'Secundaria', '▯'],
  ['Puerta 3 - Estacionamiento', 'Secundaria', '▱'],
  ['Puerta 4 - Emergencia', 'Secundaria', '△'],
];

function AdminNavigation({ activeSection, onChange, onCamera }) {
  return (
    <nav className="admin-navigation" aria-label="Secciones del panel administrativo">
      <button className={activeSection === 'registros' ? 'active' : ''} type="button" onClick={() => onChange('registros')}><Icon name="clipboard" /><span>Registros</span></button>
      <button className={activeSection === 'puertas' ? 'active' : ''} type="button" onClick={() => onChange('puertas')}><span className="nav-door">▯</span><span>Puertas</span></button>
      <button type="button" onClick={onCamera}><Icon name="video" /><span>Cámara</span></button>
    </nav>
  );
}

function EstadisticasAdmin({ total }) {
  return (
    <section className="admin-stats" aria-label="Resumen de accesos">
      <article><span className="stat-icon blue">◌</span><strong>{total}</strong><small>Total accesos</small></article>
      <article><span className="stat-icon green">✦</span><strong>{total}</strong><small>Autorizados</small></article>
      <article><span className="stat-icon red">✿</span><strong>0</strong><small>Denegados</small></article>
    </section>
  );
}

function RegistrosAdmin({ registros }) {
  const [consulta, setConsulta] = useState('');
  const registrosFiltrados = registros.filter((registro) => registro.join(' ').toLocaleLowerCase().includes(consulta.toLocaleLowerCase()));

  return (
    <section className="admin-content" aria-labelledby="registros-title">
      <h2 id="registros-title">Todos los registros</h2>
      <label className="search-box"><Icon name="search" /><input value={consulta} onChange={(event) => setConsulta(event.target.value)} placeholder="Buscar placa, nombre, puerta..." aria-label="Buscar registros" /></label>
      <div className="admin-record-list">
        {registrosFiltrados.map(([nombre, placa, puerta, fecha]) => (
          <article className="admin-record" key={placa}>
            <span className="record-status" aria-hidden="true">●</span>
            <div><strong>{nombre}</strong><small>▱ &nbsp;{placa}</small><em>⌁ &nbsp;{puerta}</em></div>
            <div className="record-meta"><time>{fecha}</time><b>AUTORIZADO</b><small>● Luz verde</small></div>
          </article>
        ))}
        {registrosFiltrados.length === 0 && <p className="empty-state">No se encontraron registros.</p>}
      </div>
    </section>
  );
}

function PuertasAdmin({ onCamera }) {
  return (
    <section className="admin-content" aria-labelledby="puertas-title">
      <h2 id="puertas-title">Gestión de puertas</h2>
      <div className="admin-door-list">
        {puertasAdmin.map(([nombre, detalle, simbolo]) => (
          <article className="admin-door" key={nombre}>
            <span className="door-symbol" aria-hidden="true">{simbolo}</span>
            <div><strong>{nombre}</strong><small>{detalle}</small></div>
            <button type="button" onClick={() => onCamera(nombre)} aria-label={`Abrir cámara de ${nombre}`}><Icon name="video" /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

function CamaraSeguridad({ puertaInicial, onCerrar, registros }) {
  const [puerta, setPuerta] = useState(puertaInicial || puertasAdmin[0][0]);
  const registrosPuerta = registros.filter((registro) => registro[2] === puerta);

  return (
    <main className="app-shell admin-shell">
      <section className="camera-card" aria-labelledby="camera-title">
        <header className="camera-header"><button type="button" onClick={onCerrar}>Cerrar</button><h1 id="camera-title">Cámara de seguridad</h1></header>
        <div className="camera-tabs" role="tablist">
          {puertasAdmin.map(([nombre, , simbolo]) => <button className={puerta === nombre ? 'active' : ''} type="button" role="tab" aria-selected={puerta === nombre} key={nombre} onClick={() => setPuerta(nombre)}>{simbolo} &nbsp;{nombre.replace('Puerta ', 'P.')}</button>)}
        </div>
        <section className="camera-preview" aria-label={`Vista de ${puerta}`}>
          <div className="camera-preview-top"><span>◢ &nbsp;{puerta}</span><b><i /> EN VIVO</b></div>
          <div className="camera-off"><Icon name="video" /><strong>Transmisión en vivo</strong><p>Vincula una cámara IP / RTSP<br />para ver el acceso de {puerta}</p></div>
          <footer><button type="button">Ⅱ &nbsp; Pausar</button><span><button type="button" aria-label="Tomar captura"><Icon name="camera" /></button><button type="button" aria-label="Expandir vista">⌗</button></span></footer>
        </section>
        <section className="camera-info"><div><span>🚪 &nbsp; Puerta</span><strong>{puerta}</strong></div><div><span>◌ &nbsp; Estado</span><strong>Transmitiendo</strong></div><div><span>▰ &nbsp; Fuente</span><strong>Cámara IP - RTSP</strong></div><div><span>◷ &nbsp; Última actividad</span><strong>Hace 2 min</strong></div></section>
        <section className="camera-activity" aria-labelledby="camera-activity-title"><h2 id="camera-activity-title">Actividad reciente en esta puerta</h2>{registrosPuerta.map(([nombre, placa, , fecha]) => <article key={placa}><span>●</span><div><strong>{placa}</strong><small>{nombre}</small></div><time>{fecha.split(' at ')[1]}</time></article>)}</section>
      </section>
    </main>
  );
}

function PanelAdmin({ token, onCerrarSesion }) {
  const [seccion, setSeccion] = useState('registros');
  const [camara, setCamara] = useState(false);
  const [puertaCamara, setPuertaCamara] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState('');
  const abrirCamara = (puerta = null) => { setPuertaCamara(puerta); setCamara(true); };

  useEffect(() => {
    api.historial(token)
      .then((accesos) => setRegistros(accesos.map((acceso) => [
        `${acceso.nombres || ''} ${acceso.apellidos || ''}`.trim() || 'Vehículo registrado',
        acceso.vehiculo_placa,
        acceso.puerta,
        new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(acceso.fecha_hora_entrada)),
      ])))
      .catch((fallo) => setError(fallo.message));
  }, [token]);

  if (camara) return <CamaraSeguridad puertaInicial={puertaCamara} onCerrar={() => setCamara(false)} registros={registros} />;

  return (
    <main className="app-shell admin-shell">
      <section className="access-card dashboard-card admin-card" aria-labelledby="admin-title">
        <div className="admin-theme-mark" aria-hidden="true"><img src={unamadAdmin} alt="" /></div>
        <header className="panel-header"><span aria-hidden="true" /><h1 id="admin-title">Panel Admin</h1><button className="logout-button" type="button" onClick={onCerrarSesion} aria-label="Cerrar sesión"><Icon name="logout" /></button></header>
        <section className="admin-profile"><span className="admin-avatar"><Icon name="shield" /></span><div><h2>Superusuario</h2><p>admin@unamad.edu.pe</p></div><button type="button" onClick={() => abrirCamara()}><Icon name="camera" /><span>Escanear</span></button></section>
        <AdminNavigation activeSection={seccion} onChange={setSeccion} onCamera={() => abrirCamara()} />
        <EstadisticasAdmin total={registros.length} />
        {error && <p className="form-error" role="alert">{error}</p>}
        {seccion === 'registros' ? <RegistrosAdmin registros={registros} /> : <PuertasAdmin onCamera={abrirCamara} />}
      </section>
    </main>
  );
}

export default function App() {
  const [tab, setTab] = useState('login');
  const [adminMode, setAdminMode] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [token, setToken] = useState(null);
  const [adminAutenticado, setAdminAutenticado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function cargarPanelEstudiante(tokenActual, datosAlternos = {}) {
    const [perfil, vehiculos, accesos] = await Promise.all([
      api.miPerfil(tokenActual),
      api.vehiculos(tokenActual),
      api.historial(tokenActual),
    ]);
    const vehiculo = vehiculos[0];
    setUsuario({
      nombre: `${perfil.nombres} ${perfil.apellidos}`,
      correo: perfil.correo_institucional,
      matricula: perfil.matricula_academica,
      placa: vehiculo?.placa || datosAlternos.placa || 'Sin vehículo',
      carrera: perfil.carrera || datosAlternos.carrera || 'Sin carrera asignada',
    });
    setHistorial(accesos);
  }

  useEffect(() => {
    const tokenGuardado = sessionStorage.getItem('unamad_token');
    const rolGuardado = sessionStorage.getItem('unamad_rol');
    if (!tokenGuardado) return;

    setToken(tokenGuardado);
    if (rolGuardado === 'superadmin' || rolGuardado === 'operador') {
      setAdminAutenticado(true);
      return;
    }
    cargarPanelEstudiante(tokenGuardado).catch(() => {
      sessionStorage.removeItem('unamad_token');
      sessionStorage.removeItem('unamad_rol');
      setToken(null);
    });
  }, []);

  function changeTab(nextTab) {
    setAdminMode(false);
    setTab(nextTab);
    setError('');
  }

  async function handleSubmit(event, tipoAcceso) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    setCargando(true);
    setError('');
    try {
      const respuesta = tipoAcceso === 'register'
        ? await api.registro({
          nombre_completo: datos.get('nombreCompleto'),
          matricula_academica: datos.get('matriculaAcademica'),
          placa: datos.get('placa'),
          carrera: datos.get('carrera'),
          correo_institucional: datos.get('correo'),
          password: datos.get('password'),
        })
        : await api.login(
          tipoAcceso === 'admin' ? datos.get('codigoAdministrador') : datos.get('correo'),
          datos.get('password')
        );

      if (tipoAcceso === 'admin' && respuesta.usuario.rol !== 'superadmin') {
        throw new Error('Esta cuenta no tiene permisos de superusuario');
      }

      sessionStorage.setItem('unamad_token', respuesta.token);
      sessionStorage.setItem('unamad_rol', respuesta.usuario.rol);
      setToken(respuesta.token);

      if (respuesta.usuario.rol === 'superadmin' || respuesta.usuario.rol === 'operador') {
        setAdminAutenticado(true);
      } else {
        await cargarPanelEstudiante(respuesta.token, { placa: datos.get('placa'), carrera: datos.get('carrera') });
      }
    } catch (fallo) {
      sessionStorage.removeItem('unamad_token');
      sessionStorage.removeItem('unamad_rol');
      setToken(null);
      setError(fallo.message || 'No se pudo completar la solicitud');
    } finally {
      setCargando(false);
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('unamad_token');
    sessionStorage.removeItem('unamad_rol');
    setToken(null);
    setUsuario(null);
    setHistorial([]);
    setAdminAutenticado(false);
    setAdminMode(false);
    setError('');
  }

  if (usuario) return <PanelUsuario usuario={usuario} historial={historial} onCerrarSesion={cerrarSesion} />;
  if (adminAutenticado) return <PanelAdmin token={token} onCerrarSesion={cerrarSesion} />;

  return (
    <main className={`app-shell ${adminMode ? 'admin-shell' : ''}`}>
      <section className={`access-card ${adminMode ? 'admin-login-card' : ''}`} aria-labelledby="app-title">
        <header className="brand">
          <UniversitySeal />
          <h1 id="app-title">UNAMAD</h1>
          <p>Control de acceso vehicular</p>
          <small>Universidad Nacional Amazónica de Madre de Dios</small>
        </header>

        <section className="auth-panel" aria-label="Acceso al sistema">
          {!adminMode && (
            <div className="tabs" role="tablist" aria-label="Opciones de acceso">
              <button className={tab === 'login' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'login'} onClick={() => changeTab('login')}>Iniciar sesión</button>
              <button className={tab === 'register' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'register'} onClick={() => changeTab('register')}>Registrarse</button>
            </div>
          )}

          {adminMode ? (
            <LoginForm isAdmin onSubmit={handleSubmit} cargando={cargando} />
          ) : tab === 'login' ? (
            <LoginForm onSubmit={handleSubmit} cargando={cargando} />
          ) : (
            <RegisterForm onSubmit={handleSubmit} cargando={cargando} />
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
        </section>

        <div className="admin-divider"><span>ADMIN</span></div>
        <button className="admin-button" type="button" onClick={() => setAdminMode(!adminMode)}>
          <Icon name="shield" />
          {adminMode ? 'Volver al acceso principal' : 'Acceso Superusuario (ADMI)'}
        </button>
      </section>
    </main>
  );
}
