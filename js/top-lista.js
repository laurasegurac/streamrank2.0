/* ===================================================
   TOP-LISTA.JS
   Lee ?categoria=netflix&tipo=plataforma de la URL,
   carga los datos correspondientes, renderiza las
   tarjetas y activa los filtros.
=================================================== */

(function () {
  'use strict';

  /* ── BADGE POR PLATAFORMA ─────────────────────── */
  const PLATFORM_BADGE = {
    'netflix':       { label: 'NETFLIX',   cls: 'platform-badge--netflix' },
    'amazon-prime':  { label: 'PRIME',     cls: 'platform-badge--prime'   },
    'disney-plus':   { label: 'DISNEY+',   cls: 'platform-badge--disney'  },
    'hbo-max':       { label: 'HBO MAX',   cls: 'platform-badge--hbo'     },
    'apple-tv':      { label: 'APPLE TV+', cls: 'platform-badge--apple'   },
    // estudios y sagas usan un badge genérico
  };

  function getBadge(categoria) {
    return PLATFORM_BADGE[categoria] || { label: 'TOP 10', cls: 'platform-badge--netflix' };
  }

  /* ── NOMBRES LEGIBLES ─────────────────────────── */
  const NOMBRES = {
    'netflix':        'Netflix',
    'amazon-prime':   'Amazon Prime',
    'disney-plus':    'Disney+',
    'hbo-max':        'HBO Max',
    'apple-tv':       'Apple TV+',
    'warner':         'Warner Bros',
    'pixar':          'Pixar',
    'disney':         'Disney',
    'studio-ghibli':  'Studio Ghibli',
    'star-wars':      'Star Wars',
    'harry-potter':   'Harry Potter',
    'lotr':           'Lord of the Rings',
    'mcu':            'Marvel Cinematic Universe',
  };

  /* ── DATOS POR CATEGORÍA ──────────────────────── */
  const CATALOGO = {

    /* ════ PLATAFORMAS ════ */

    netflix: [
      { id: 'breaking-bad',    title: 'Breaking Bad',    type: 'series', genres: ['crime','drama'],          duration: 47,  rating: 9.5, pts: 9900, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Un profesor de química diagnosticado con cáncer decide fabricar metanfetamina para asegurar el futuro de su familia.' },
      { id: 'stranger-things', title: 'Stranger Things', type: 'series', genres: ['scifi','mystery'],        duration: 51,  rating: 9.0, pts: 9300, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Un grupo de amigos descubre fuerzas sobrenaturales y experimentos secretos del gobierno en su pequeño pueblo.' },
      { id: 'dark',            title: 'Dark',            type: 'series', genres: ['scifi','mystery'],        duration: 60,  rating: 8.2, pts: 7900, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Una saga familiar que conecta cuatro familias de un pueblo alemán a través del tiempo.' },
      { id: 'ozark',           title: 'Ozark',           type: 'series', genres: ['crime','thriller'],       duration: 60,  rating: 8.4, pts: 8200, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Un asesor financiero traslada a su familia a los Ozarks para lavar dinero para un cártel mexicano.' },
      { id: 'squid-game',      title: 'Squid Game',      type: 'series', genres: ['thriller','drama'],       duration: 55,  rating: 8.0, pts: 9100, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'Cientos de personas endeudadas compiten en juegos infantiles mortales por un enorme premio en efectivo.' },
      { id: 'the-crown',       title: 'The Crown',       type: 'series', genres: ['drama'],                  duration: 58,  rating: 8.6, pts: 8000, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80', desc: 'La historia de la familia real británica desde la posguerra hasta el presente.' },
      { id: 'bird-box',        title: 'Bird Box',        type: 'movie',  genres: ['thriller','scifi'],       duration: 124, rating: 6.6, pts: 7200, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Una madre conduce a sus hijos a ciegas a través de un bosque para escapar de una entidad misteriosa.' },
      { id: 'roma',            title: 'Roma',            type: 'movie',  genres: ['drama'],                  duration: 135, rating: 7.7, pts: 6800, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'La vida de una trabajadora doméstica en la Ciudad de México en los años 70.' },
      { id: 'el-camino',       title: 'El Camino',       type: 'movie',  genres: ['crime','thriller'],       duration: 122, rating: 7.3, pts: 7500, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Jesse Pinkman huye de su pasado tras los eventos de Breaking Bad.' },
      { id: 'marriage-story',  title: 'Marriage Story',  type: 'movie',  genres: ['drama'],                  duration: 136, rating: 7.9, pts: 6500, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'La historia de un divorcio y el amor que persiste entre dos personas que se separan.' },
    ],

    'amazon-prime': [
      { id: 'the-boys',        title: 'The Boys',        type: 'series', genres: ['action','comedy'],        duration: 60,  rating: 8.4, pts: 8400, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Un grupo de vigilantes busca derrocar a un equipo de superhéroes corruptos.' },
      { id: 'invincible',      title: 'Invincible',      type: 'series', genres: ['animation','action'],     duration: 45,  rating: 8.3, pts: 8100, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'Un adolescente descubre que heredó los poderes de su padre, el superhéroe más poderoso del planeta.' },
      { id: 'reacher',         title: 'Reacher',         type: 'series', genres: ['action','thriller'],      duration: 60,  rating: 8.0, pts: 7800, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Un ex policía militar investiga un asesinato en un pequeño pueblo de Georgia.' },
      { id: 'the-terminal-list', title: 'The Terminal List', type: 'series', genres: ['action','thriller'], duration: 60,  rating: 7.4, pts: 7200, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Un Navy SEAL descubre que todo lo que sabe sobre su última misión podría ser una mentira.' },
      { id: 'fleabag',         title: 'Fleabag',         type: 'series', genres: ['comedy','drama'],         duration: 30,  rating: 8.7, pts: 8300, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Una mujer londinense enfrenta el duelo y las relaciones con honestidad brutal y humor negro.' },
      { id: 'good-omens',      title: 'Good Omens',      type: 'series', genres: ['fantasy','comedy'],       duration: 54,  rating: 8.0, pts: 7600, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Un ángel y un demonio se unen para evitar el apocalipsis.' },
      { id: 'midsommar',       title: 'Midsommar',       type: 'movie',  genres: ['thriller'],               duration: 148, rating: 7.1, pts: 6900, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Una pareja viaja a Suecia para un festival de verano que resulta ser aterrador.' },
      { id: 'hereditary',      title: 'Hereditary',      type: 'movie',  genres: ['thriller'],               duration: 127, rating: 7.3, pts: 7100, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Una familia descubre secretos perturbadores tras la muerte de su abuela.' },
      { id: 'manchester',      title: 'Manchester by the Sea', type: 'movie', genres: ['drama'],             duration: 137, rating: 7.8, pts: 6700, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'Un hombre regresa a su pueblo natal para cuidar a su sobrino tras la muerte de su hermano.' },
      { id: 'sound-of-metal',  title: 'Sound of Metal', type: 'movie',  genres: ['drama'],                  duration: 120, rating: 7.8, pts: 6800, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Un baterista pierde la audición y debe adaptarse a su nueva realidad.' },
    ],

    'disney-plus': [
      { id: 'mandalorian',     title: 'The Mandalorian', type: 'series', genres: ['action','scifi'],         duration: 40,  rating: 8.7, pts: 9100, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Un cazarrecompensas mandaloriano protege a un misterioso niño de las fuerzas del Imperio.' },
      { id: 'andor',           title: 'Andor',           type: 'series', genres: ['action','scifi'],         duration: 40,  rating: 8.4, pts: 8200, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Los orígenes del espía rebelde Cassian Andor y el nacimiento de la Rebelión.' },
      { id: 'wandavision',     title: 'WandaVision',     type: 'series', genres: ['scifi','fantasy'],        duration: 30,  rating: 7.9, pts: 8000, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Wanda y Vision viven una vida suburbana perfecta que esconde una realidad perturbadora.' },
      { id: 'loki',            title: 'Loki',            type: 'series', genres: ['action','fantasy'],       duration: 47,  rating: 7.9, pts: 7800, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Loki es reclutado por una misteriosa organización para reparar anomalías en el tiempo.' },
      { id: 'moon-knight',     title: 'Moon Knight',     type: 'series', genres: ['action','mystery'],       duration: 48,  rating: 7.4, pts: 7300, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Un hombre con trastorno disociativo se convierte en el avatar del dios lunar egipcio.' },
      { id: 'obi-wan',         title: 'Obi-Wan Kenobi',  type: 'series', genres: ['action','scifi'],         duration: 45,  rating: 7.1, pts: 7000, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Obi-Wan Kenobi vive en el exilio mientras protege al joven Luke Skywalker.' },
      { id: 'black-panther',   title: 'Black Panther',   type: 'movie',  genres: ['action'],                 duration: 134, rating: 7.3, pts: 8200, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'T\'Challa regresa a Wakanda para asumir el trono y enfrentar a un poderoso enemigo.' },
      { id: 'endgame',         title: 'Avengers: Endgame', type: 'movie', genres: ['action','scifi'],        duration: 181, rating: 8.4, pts: 9200, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Los Vengadores se unen por última vez para revertir el chasquido de Thanos.' },
      { id: 'soul',            title: 'Soul',            type: 'movie',  genres: ['animation','drama'],      duration: 100, rating: 8.0, pts: 7900, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Un músico descubre el origen de las pasiones y la chispa que da sentido a la vida.' },
      { id: 'encanto',         title: 'Encanto',         type: 'movie',  genres: ['animation','fantasy'],    duration: 99,  rating: 7.2, pts: 7400, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'Una niña colombiana de una familia mágica intenta descubrir por qué perdió sus poderes.' },
    ],

    'hbo-max': [
      { id: 'game-of-thrones', title: 'Game of Thrones', type: 'series', genres: ['fantasy','drama'],        duration: 57,  rating: 9.3, pts: 9600, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'Familias nobles luchan por el control del Trono de Hierro en un mundo de dragones.' },
      { id: 'the-wire',        title: 'The Wire',        type: 'series', genres: ['crime','drama'],          duration: 57,  rating: 9.3, pts: 9200, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'La compleja relación entre policías y traficantes en las calles de Baltimore.' },
      { id: 'sopranos',        title: 'The Sopranos',    type: 'series', genres: ['crime','drama'],          duration: 55,  rating: 9.2, pts: 9100, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Un mafioso de Nueva Jersey equilibra su vida familiar con el crimen organizado.' },
      { id: 'hbo-succession',  title: 'Succession',      type: 'series', genres: ['drama'],                  duration: 60,  rating: 8.9, pts: 8700, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Los hijos de un magnate de los medios luchan por el control de su imperio familiar.' },
      { id: 'euphoria',        title: 'Euphoria',        type: 'series', genres: ['drama'],                  duration: 55,  rating: 8.4, pts: 8500, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Un grupo de adolescentes navega el amor, la identidad y las adicciones.' },
      { id: 'white-lotus',     title: 'The White Lotus', type: 'series', genres: ['comedy','thriller'],      duration: 55,  rating: 7.9, pts: 7800, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Las dinámicas de poder entre los huéspedes y empleados de un resort de lujo.' },
      { id: 'interstellar',    title: 'Interstellar',    type: 'movie',  genres: ['action','scifi'],         duration: 169, rating: 9.2, pts: 9800, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Un equipo viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.' },
      { id: 'the-dark-knight', title: 'The Dark Knight', type: 'movie',  genres: ['action','thriller'],      duration: 152, rating: 8.9, pts: 9100, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Batman enfrenta al Joker, que desata el caos en Gotham City.' },
      { id: 'dune',            title: 'Dune: Parte Uno', type: 'movie',  genres: ['scifi','adventure'],      duration: 155, rating: 8.5, pts: 8600, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Un joven noble hereda el control del planeta desértico más valioso de la galaxia.' },
      { id: 'dunkirk',         title: 'Dunkirk',         type: 'movie',  genres: ['action','drama'],         duration: 106, rating: 7.8, pts: 7200, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'La evacuación de soldados aliados de las playas de Dunkerque en la Segunda Guerra Mundial.' },
    ],

    'apple-tv': [
      { id: 'severance',       title: 'Severance',       type: 'series', genres: ['scifi','thriller'],       duration: 52,  rating: 8.7, pts: 8800, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Empleados se someten a un procedimiento que separa sus recuerdos laborales de los personales.' },
      { id: 'ted-lasso',       title: 'Ted Lasso',       type: 'series', genres: ['comedy','drama'],         duration: 35,  rating: 8.8, pts: 8600, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Un entrenador de fútbol americano dirige un equipo de fútbol inglés con optimismo desbordante.' },
      { id: 'silo',            title: 'Silo',            type: 'series', genres: ['scifi','mystery'],        duration: 55,  rating: 8.0, pts: 7900, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Los últimos supervivientes de la humanidad viven en un silo subterráneo y se preguntan qué hay fuera.' },
      { id: 'slow-horses',     title: 'Slow Horses',     type: 'series', genres: ['thriller','drama'],       duration: 45,  rating: 7.7, pts: 7400, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Agentes del MI5 degradados trabajan en casos que el servicio secreto prefiere ignorar.' },
      { id: 'for-all-mankind',  title: 'For All Mankind', type: 'series', genres: ['scifi','drama'],         duration: 60,  rating: 7.9, pts: 7600, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Una historia alternativa donde la Unión Soviética ganó la carrera espacial.' },
      { id: 'foundation',      title: 'Foundation',      type: 'series', genres: ['scifi','adventure'],      duration: 60,  rating: 7.4, pts: 7200, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Un matemático predice la caída de un Imperio galáctico e intenta preservar el conocimiento.' },
      { id: 'coda',            title: 'CODA',            type: 'movie',  genres: ['drama'],                  duration: 111, rating: 7.3, pts: 7000, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'La hija oyente de una familia sorda lucha entre el amor a la música y la lealtad familiar.' },
      { id: 'finch',           title: 'Finch',           type: 'movie',  genres: ['scifi','drama'],          duration: 115, rating: 7.0, pts: 6800, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'Un ingeniero construye un robot para cuidar a su perro en un mundo post-apocalíptico.' },
      { id: 'killers-flower-moon', title: 'Killers of the Flower Moon', type: 'movie', genres: ['crime','drama'], duration: 206, rating: 7.7, pts: 7500, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'El asesinato sistemático de miembros de la nación Osage en los años 20 en Oklahoma.' },
      { id: 'napoleon',        title: 'Napoleon',        type: 'movie',  genres: ['action','drama'],         duration: 158, rating: 6.9, pts: 6500, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'El ascenso y caída del emperador francés Napoleón Bonaparte.' },
    ],

    /* ════ ESTUDIOS ════ */

    warner: [
      { id: 'the-dark-knight', title: 'The Dark Knight', type: 'movie',  genres: ['action','thriller'],      duration: 152, rating: 8.9, pts: 9100, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Batman enfrenta al Joker, que desata el caos en Gotham City.' },
      { id: 'interstellar',    title: 'Interstellar',    type: 'movie',  genres: ['action','scifi'],         duration: 169, rating: 9.2, pts: 9800, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Un equipo viaja a través de un agujero de gusano en busca de un nuevo hogar.' },
      { id: 'inception',       title: 'Inception',       type: 'movie',  genres: ['action','scifi'],         duration: 148, rating: 8.8, pts: 9400, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Un ladrón que roba secretos de los sueños recibe la misión de plantar una idea.' },
      { id: 'dunkirk',         title: 'Dunkirk',         type: 'movie',  genres: ['action','drama'],         duration: 106, rating: 7.8, pts: 7200, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'La evacuación de soldados aliados de las playas de Dunkerque.' },
      { id: 'dune',            title: 'Dune: Parte Uno', type: 'movie',  genres: ['scifi','adventure'],      duration: 155, rating: 8.5, pts: 8600, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Un joven noble hereda el control del planeta desértico más valioso de la galaxia.' },
      { id: 'prestige',        title: 'The Prestige',    type: 'movie',  genres: ['thriller','mystery'],     duration: 130, rating: 8.5, pts: 8300, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Dos magos rivales se obsesionan peligrosamente el uno con el otro.' },
      { id: 'game-of-thrones', title: 'Game of Thrones', type: 'series', genres: ['fantasy','drama'],        duration: 57,  rating: 9.3, pts: 9600, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'Familias nobles luchan por el control del Trono de Hierro.' },
      { id: 'hbo-succession',  title: 'Succession',      type: 'series', genres: ['drama'],                  duration: 60,  rating: 8.9, pts: 8700, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Los hijos de un magnate de los medios luchan por el control de su imperio.' },
      { id: 'euphoria',        title: 'Euphoria',        type: 'series', genres: ['drama'],                  duration: 55,  rating: 8.4, pts: 8500, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Un grupo de adolescentes navega el amor, la identidad y las adicciones.' },
      { id: 'sopranos',        title: 'The Sopranos',    type: 'series', genres: ['crime','drama'],          duration: 55,  rating: 9.2, pts: 9100, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Un mafioso de Nueva Jersey equilibra su vida familiar con el crimen organizado.' },
    ],

    pixar: [
      { id: 'soul',       title: 'Soul',        type: 'movie', genres: ['animation','drama'],   duration: 100, rating: 8.0, pts: 7900, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Un músico descubre el origen de las pasiones y la chispa que da sentido a la vida.' },
      { id: 'up',         title: 'Up',          type: 'movie', genres: ['animation','adventure'], duration: 96, rating: 8.2, pts: 8100, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Un anciano viudo y un niño explorador vuelan a Sudamérica atados a miles de globos.' },
      { id: 'wall-e',     title: 'WALL-E',      type: 'movie', genres: ['animation','scifi'],   duration: 98,  rating: 8.4, pts: 8300, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'Un robot de limpieza solitario se enamora de una sonda enviada a la Tierra.' },
      { id: 'inside-out', title: 'Inside Out',  type: 'movie', genres: ['animation'],           duration: 95,  rating: 8.1, pts: 8000, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Las emociones de una niña cobran vida cuando su familia se muda a San Francisco.' },
      { id: 'coco',       title: 'Coco',        type: 'movie', genres: ['animation','fantasy'],  duration: 105, rating: 8.4, pts: 8200, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Un niño viaja accidentalmente a la Tierra de los Muertos en el Día de Muertos.' },
      { id: 'ratatouille', title: 'Ratatouille', type: 'movie', genres: ['animation','comedy'],  duration: 111, rating: 8.0, pts: 7800, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Una rata con talento culinario sueña con convertirse en chef en París.' },
      { id: 'finding-nemo', title: 'Finding Nemo', type: 'movie', genres: ['animation','adventure'], duration: 100, rating: 8.1, pts: 8000, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'Un pez payaso cruza el océano para encontrar a su hijo capturado.' },
      { id: 'toy-story',  title: 'Toy Story',   type: 'movie', genres: ['animation','comedy'],  duration: 81,  rating: 8.3, pts: 8100, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Los juguetes de un niño cobran vida cuando no hay nadie mirando.' },
      { id: 'monsters-inc', title: 'Monsters, Inc.', type: 'movie', genres: ['animation','comedy'], duration: 92, rating: 8.0, pts: 7900, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Los monstruos que asustan a los niños trabajan en una fábrica que convierte los gritos en energía.' },
      { id: 'incredibles', title: 'The Incredibles', type: 'movie', genres: ['animation','action'], duration: 115, rating: 8.0, pts: 8000, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Una familia de superhéroes retirados debe volver a la acción para salvar el mundo.' },
    ],

    /* ════ SAGAS ════ */

    'star-wars': [
      { id: 'empire-strikes-back', title: 'The Empire Strikes Back', type: 'movie', genres: ['action','scifi'], duration: 124, rating: 8.7, pts: 9000, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Luke Skywalker entrena con Yoda mientras Han Solo y la Princesa Leia son perseguidos.' },
      { id: 'a-new-hope',     title: 'A New Hope',         type: 'movie',  genres: ['action','scifi'],       duration: 121, rating: 8.6, pts: 8800, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Un granjero se une a la Rebelión para destruir la Estrella de la Muerte del Imperio.' },
      { id: 'return-jedi',    title: 'Return of the Jedi', type: 'movie',  genres: ['action','scifi'],       duration: 131, rating: 8.3, pts: 8400, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Los héroes de la Rebelión buscan salvar a Han Solo y destruir la segunda Estrella de la Muerte.' },
      { id: 'mandalorian',    title: 'The Mandalorian',    type: 'series', genres: ['action','scifi'],       duration: 40,  rating: 8.7, pts: 9100, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'Un cazarrecompensas mandaloriano protege a un misterioso niño.' },
      { id: 'andor',          title: 'Andor',              type: 'series', genres: ['action','scifi'],       duration: 40,  rating: 8.4, pts: 8200, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Los orígenes del espía rebelde Cassian Andor.' },
      { id: 'rogue-one',      title: 'Rogue One',          type: 'movie',  genres: ['action','scifi'],       duration: 133, rating: 7.8, pts: 7800, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Un grupo de rebeldes roba los planos de la Estrella de la Muerte.' },
      { id: 'force-awakens',  title: 'The Force Awakens',  type: 'movie',  genres: ['action','scifi'],       duration: 138, rating: 7.8, pts: 7900, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Treinta años después de la caída del Imperio, surge una nueva amenaza.' },
      { id: 'revenge-sith',   title: 'Revenge of the Sith', type: 'movie', genres: ['action','scifi'],      duration: 140, rating: 7.5, pts: 7600, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Anakin Skywalker cae al lado oscuro y se convierte en Darth Vader.' },
      { id: 'obi-wan',        title: 'Obi-Wan Kenobi',     type: 'series', genres: ['action','scifi'],       duration: 45,  rating: 7.1, pts: 7000, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Obi-Wan Kenobi vive en el exilio mientras protege al joven Luke.' },
      { id: 'clone-wars',     title: 'The Clone Wars',     type: 'series', genres: ['action','animation'],   duration: 23,  rating: 8.4, pts: 8300, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'Las aventuras de Anakin Skywalker y Ahsoka Tano durante las Guerras Clon.' },
    ],

    mcu: [
      { id: 'endgame',         title: 'Avengers: Endgame',    type: 'movie',  genres: ['action','scifi'],   duration: 181, rating: 8.4, pts: 9200, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', desc: 'Los Vengadores viajan en el tiempo para revertir el chasquido de Thanos.' },
      { id: 'infinity-war',    title: 'Avengers: Infinity War', type: 'movie', genres: ['action','scifi'],  duration: 149, rating: 8.4, pts: 9100, img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80', desc: 'Thanos reúne las Gemas del Infinito para borrar la mitad de la vida en el universo.' },
      { id: 'iron-man',        title: 'Iron Man',             type: 'movie',  genres: ['action'],          duration: 126, rating: 7.9, pts: 8200, img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&q=80', desc: 'Un genio millonario construye una armadura para escapar del cautiverio y convertirse en héroe.' },
      { id: 'wandavision',     title: 'WandaVision',          type: 'series', genres: ['scifi','fantasy'],  duration: 30,  rating: 7.9, pts: 8000, img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', desc: 'Wanda y Vision viven en una realidad de comedia televisiva que esconde algo oscuro.' },
      { id: 'loki',            title: 'Loki',                 type: 'series', genres: ['action','fantasy'], duration: 47,  rating: 7.9, pts: 7800, img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', desc: 'Loki es reclutado por la AVT para reparar la línea temporal.' },
      { id: 'black-panther',   title: 'Black Panther',        type: 'movie',  genres: ['action'],          duration: 134, rating: 7.3, pts: 8200, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', desc: 'T\'Challa regresa a Wakanda para asumir el trono y enfrentar a Erik Killmonger.' },
      { id: 'guardians',       title: 'Guardians of the Galaxy', type: 'movie', genres: ['action','comedy'], duration: 121, rating: 8.0, pts: 8400, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', desc: 'Un grupo de forajidos intergalácticos se une para salvar el universo.' },
      { id: 'captain-america', title: 'Captain America: Civil War', type: 'movie', genres: ['action'],     duration: 147, rating: 7.8, pts: 8100, img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80', desc: 'Los Vengadores se dividen en dos bandos por una nueva ley de supervisión.' },
      { id: 'thor-ragnarok',   title: 'Thor: Ragnarok',       type: 'movie',  genres: ['action','comedy'],  duration: 130, rating: 7.9, pts: 8000, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Thor debe salvar a Asgard del apocalipsis con la ayuda de Hulk.' },
      { id: 'spider-man-nwh',  title: 'Spider-Man: No Way Home', type: 'movie', genres: ['action','scifi'], duration: 148, rating: 8.2, pts: 8800, img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80', desc: 'Peter Parker pide a Doctor Strange que el mundo olvide que es Spider-Man.' },
    ],
  };

  /* Añadir categorías que faltan apuntando a las mismas data */
  CATALOGO['disney']       = CATALOGO['disney-plus'];
  CATALOGO['studio-ghibli'] = CATALOGO['pixar'];   /* placeholder */
  CATALOGO['harry-potter']  = CATALOGO['star-wars']; /* placeholder */
  CATALOGO['lotr']          = CATALOGO['star-wars']; /* placeholder */

  /* ── LEER PARÁMETROS DE LA URL ─────────────────── */
  const params    = new URLSearchParams(window.location.search);
  const categoria = params.get('categoria') || 'netflix';

  /* Nombre visible */
  const nombre = NOMBRES[categoria] || categoria;
  document.title = `StreamRank — Top 10: ${nombre}`;
  document.getElementById('listaNombre').textContent = nombre;

  /* Badge a usar en las tarjetas */
  const badge = getBadge(categoria);

  /* Datos de esta categoría */
  const ITEMS = CATALOGO[categoria] || CATALOGO['netflix'];

  /* ── ESTADO DE FILTROS ─────────────────────────── */
  const state = {
    type:     'all',
    genre:    '',
    duration: '',
    sort:     'rating',
  };

  /* ── REFERENCIAS DOM ───────────────────────────── */
  const list        = document.getElementById('rankingList');
  const tabBtns     = document.querySelectorAll('.filter-tab');
  const genreSelect = document.getElementById('filter-genre');
  const durSelect   = document.getElementById('filter-duration');
  const sortBtns    = document.querySelectorAll('.sort-btn');

  /* ── HELPERS ───────────────────────────────────── */
  function durationBucket(mins) {
    if (mins < 90)   return 'short';
    if (mins <= 120) return 'medium';
    return 'long';
  }

  function matches(item) {
    if (state.type !== 'all' && item.type !== state.type) return false;
    if (state.genre && !item.genres.includes(state.genre))  return false;
    if (state.duration && durationBucket(item.duration) !== state.duration) return false;
    return true;
  }

  /* ── CREAR HTML DE UNA TARJETA ─────────────────── */
  function cardHTML(item, rank) {
    return `
      <li data-item-id="${item.id}">
        <article class="card" aria-label="Puesto ${rank}: ${item.title}">
          <span class="card__rank" aria-label="Puesto ${rank}">${rank}</span>
          <div class="card__thumb">
            <img src="${item.img}" alt="Póster de ${item.title}" loading="lazy" />
          </div>
          <div class="card__body">
            <div class="card__type-row">
              <span class="card__type">${item.type === 'series' ? 'Serie' : 'Película'}</span>
              <span class="card__genres">${item.genres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}</span>
            </div>
            <h2 class="card__title">${item.title}</h2>
            <p class="card__desc">${item.desc}</p>
            <div class="card__stats">
              <span class="card__rating" aria-label="Rating ${item.rating}">
                <img src="assets/icons/Estrella.svg" alt="" class="card-rating-icon" />
                ${item.rating}
              </span>
              <span class="card__pts" aria-label="${item.pts} puntos">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                  <path d="M2 10l3-4 3 2 4-6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${item.pts.toLocaleString('es')} pts
              </span>
            </div>
          </div>
          <div class="card__side">
            <span class="platform-badge ${badge.cls}">${badge.label}</span>
            <button class="btn-save" aria-label="Guardar ${item.title} en mi lista" aria-pressed="false">
              <img src="assets/icons/agregar.svg" alt="" class="save-icon" />
            </button>
          </div>
        </article>
      </li>`;
  }

  /* ── RENDER ────────────────────────────────────── */
  function render() {
    const visible = ITEMS.filter(matches);

    visible.sort((a, b) =>
      state.sort === 'rating' ? b.rating - a.rating : b.pts - a.pts
    );

    if (visible.length === 0) {
      list.innerHTML = `
        <li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);">
          No hay resultados para estos filtros.
        </p></li>`;
      return;
    }

    list.innerHTML = visible.map((item, i) => cardHTML(item, i + 1)).join('');
  }

  /* ── EVENTOS ───────────────────────────────────── */
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected','true');
      state.type = btn.dataset.filter;
      render();
    });
  });

  genreSelect.addEventListener('change', () => { state.genre = genreSelect.value; render(); });
  durSelect.addEventListener('change',   () => { state.duration = durSelect.value; render(); });

  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed','true');
      state.sort = btn.dataset.sort;
      render();
    });
  });

  /* Render inicial */
  render();

})();