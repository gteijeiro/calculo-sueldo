/**
 * Datos detallados por convenio colectivo.
 * descuentos_extra: descuentos adicionales al 17% estándar.
 *   pct     — % sobre remuneración bruta (sueldo + vac, sin SAC)
 *   base    — 'bruto' | 'sueldo' (sin vac)
 *   deducibleGanancias — si se deduce en el cálculo de Ganancias 4ª
 *   nota    — aclaración
 *
 * cargos: escala salarial de referencia H1 2026 (valores aproximados).
 *   Verificar la escala vigente actualizada con la última paritaria.
 */
export const CONVENIOS_DETALLE = {
  general: {
    nombre: 'Sin convenio / General',
    cct: null,
    descripcion: 'Sin convenio colectivo específico. Aplican únicamente los aportes obligatorios por ley (ANSES, obra social, PAMI).',
    descuentos_extra: [],
    beneficios: [
      'Aportes a SIPA (jubilación) 11%',
      'Obra social 3%',
      'PAMI / INSSJP 3%',
    ],
    cargos: [],
  },

  comercio: {
    nombre: 'Empleados de Comercio',
    cct: 'CCT 130/75',
    descripcion: 'El convenio más numeroso del país. Regula empleados de comercios, supermercados, farmacias, concesionarias y actividades de servicio.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical FAECYS',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Solo afiliados. No afiliados pueden pagar aporte solidario (~1%).',
      },
    ],
    beneficios: [
      'Obra social OSECAC',
      'Vacaciones: 14 días (< 5 años) hasta 35 días (> 20 años)',
      'Licencia por examen: 2 días por materia hasta 10 al año',
      'SAC semestral',
      'Indemnización por antigüedad + integración mes de despido',
      'Ropa de trabajo provista por empleador',
    ],
    cargos: [
      { cargo: 'Empleado/a Categoría A (ingresante)',      sueldo: 1_320_000 },
      { cargo: 'Empleado/a Categoría B',                   sueldo: 1_750_000 },
      { cargo: 'Empleado/a Categoría C',                   sueldo: 2_280_000 },
      { cargo: 'Empleado/a Categoría D',                   sueldo: 3_100_000 },
      { cargo: 'Empleado/a Categoría E',                   sueldo: 4_200_000 },
      { cargo: 'Jefe/a de sección / Supervisor/a',         sueldo: 6_500_000 },
      { cargo: 'Subgerente / Encargado/a de local',        sueldo: 9_800_000 },
      { cargo: 'Gerente de departamento',                  sueldo: 14_500_000 },
    ],
  },

  bancarios: {
    nombre: 'Bancarios',
    cct: 'CCT 18/75 (La Bancaria)',
    descripcion: 'Regula empleados de bancos públicos y privados, entidades financieras y compañías de seguros.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical La Bancaria',
        pct: 1.5,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados. La aportación puede variar según acuerdo paritario.',
      },
    ],
    beneficios: [
      'Obra social DOSUBA / La Bancaria Salud',
      'Jornada de 7 horas diarias (35 hs semanales)',
      'Adicional por antigüedad sobre salario básico',
      'Licencia anual: 21 a 35 días según antigüedad',
      'Día libre en cumpleaños',
      'Refrigerio / almuerzo en jornada continua',
      'Ropa de trabajo',
    ],
    cargos: [
      { cargo: 'Empleado/a ingresante (nivel A)',           sueldo: 2_100_000 },
      { cargo: 'Cajero/a / Operador/a (nivel B)',           sueldo: 3_400_000 },
      { cargo: 'Oficial (nivel C)',                         sueldo: 5_200_000 },
      { cargo: 'Oficial principal (nivel D)',               sueldo: 7_800_000 },
      { cargo: 'Analista / Técnico (nivel E)',              sueldo: 11_000_000 },
      { cargo: 'Analista Sr / Responsable (nivel F)',       sueldo: 15_500_000 },
      { cargo: 'Jefe/a de área (nivel G)',                  sueldo: 22_000_000 },
    ],
  },

  smata: {
    nombre: 'Mecánicos / Transporte automotor',
    cct: 'CCT 260/75 — SMATA',
    descripcion: 'Regula trabajadores de concesionarias, talleres mecánicos, transporte automotor, colectivos y logística.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical SMATA',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados.',
      },
    ],
    beneficios: [
      'Obra social OSSMATA',
      'Ropa de trabajo y elementos de seguridad',
      'Adicional por turno nocturno',
      'Licencias especiales por matrimonio, nacimiento y fallecimiento',
      'SAC semestral',
    ],
    cargos: [
      { cargo: 'Ayudante',                                  sueldo: 1_180_000 },
      { cargo: 'Medio oficial',                             sueldo: 1_620_000 },
      { cargo: 'Oficial',                                   sueldo: 2_100_000 },
      { cargo: 'Oficial especializado',                     sueldo: 2_900_000 },
      { cargo: 'Técnico / Electromecánico',                 sueldo: 4_500_000 },
      { cargo: 'Encargado/a de taller',                     sueldo: 7_200_000 },
      { cargo: 'Jefe/a de servicio técnico',                sueldo: 11_000_000 },
    ],
  },

  uom: {
    nombre: 'Metalúrgicos',
    cct: 'CCT 260/75 — UOM',
    descripcion: 'Regula trabajadores de la industria metalúrgica, autopartistas, siderurgia y manufactura de metales.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical UOM',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados.',
      },
    ],
    beneficios: [
      'Obra social OSME (Obra Social Metalúrgica)',
      'Ropa de trabajo y elementos de seguridad',
      'Adicional por turno nocturno y trabajo en altura/riesgo',
      'Prima por presentismo',
      'SAC semestral',
    ],
    cargos: [
      { cargo: 'Operario/a sin calificación',               sueldo: 1_100_000 },
      { cargo: 'Operario/a general (categoría 1)',           sueldo: 1_480_000 },
      { cargo: 'Operario/a calificado/a (categoría 2)',      sueldo: 1_950_000 },
      { cargo: 'Operario/a especializado/a (categoría 3)',   sueldo: 2_600_000 },
      { cargo: 'Técnico/a (categoría 4)',                    sueldo: 3_800_000 },
      { cargo: 'Supervisor/a de línea',                      sueldo: 6_000_000 },
      { cargo: 'Jefe/a de producción',                       sueldo: 10_500_000 },
    ],
  },

  uocra: {
    nombre: 'Construcción',
    cct: 'CCT 76/75 — UOCRA',
    descripcion: 'Regula trabajadores de la construcción: albañiles, electricistas, plomeros y oficios afines. Sistema especial: Fondo de Cese Laboral en lugar de indemnización.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical UOCRA',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados.',
      },
      {
        key: 'fondo_cese',
        label: 'Fondo de Cese Laboral (empleado)',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'El empleador aporta 12%. El empleado aporta 2%. Se acumula en cuenta individual.',
      },
    ],
    beneficios: [
      'Obra social OSCONARA',
      'Fondo de Cese Laboral (reemplaza indemnización)',
      'Seguro de vida obligatorio por obra',
      'Elementos de seguridad e higiene',
      'Adicional por categoría (oficial, medio oficial, ayudante)',
      'Viáticos por traslado a obra',
    ],
    cargos: [
      { cargo: 'Ayudante de obra',                          sueldo: 1_050_000 },
      { cargo: 'Medio oficial',                             sueldo: 1_420_000 },
      { cargo: 'Oficial (albañil, plomero, electricista)',   sueldo: 1_900_000 },
      { cargo: 'Oficial especializado',                     sueldo: 2_600_000 },
      { cargo: 'Encargado/a de obra',                       sueldo: 4_800_000 },
      { cargo: 'Capataz general',                           sueldo: 7_500_000 },
      { cargo: 'Maestro/a mayor de obras',                  sueldo: 12_000_000 },
    ],
  },

  uthgra: {
    nombre: 'Gastronomía y Hotelería',
    cct: 'CCT 389/04 — UTHGRA',
    descripcion: 'Regula empleados de restaurantes, hoteles, bares, confiterías y servicios de catering.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical UTHGRA',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados.',
      },
    ],
    beneficios: [
      'Obra social OSUTHGRA',
      'Refrigerio durante jornada laboral',
      'Ropa de trabajo provista por empleador',
      'Propinas (no remunerativas en algunos rubros)',
      'Adicional por trabajo nocturno y en días feriados',
      'Licencias especiales',
    ],
    cargos: [
      { cargo: 'Ayudante de cocina / Auxiliar',             sueldo: 1_050_000 },
      { cargo: 'Cocinero/a categoría C',                    sueldo: 1_380_000 },
      { cargo: 'Cocinero/a categoría B',                    sueldo: 1_750_000 },
      { cargo: 'Cocinero/a categoría A / Mozo/a',           sueldo: 2_200_000 },
      { cargo: 'Encargado/a de salón',                      sueldo: 3_600_000 },
      { cargo: 'Chef / Maitre',                             sueldo: 6_500_000 },
      { cargo: 'Gerente de gastronomía',                    sueldo: 11_000_000 },
    ],
  },

  sadop: {
    nombre: 'Docentes privados',
    cct: 'CCT 125/75 — SADOP',
    descripcion: 'Regula docentes y no docentes de establecimientos educativos de gestión privada.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical SADOP',
        pct: 1.5,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados.',
      },
    ],
    beneficios: [
      'Obra social OSDEP (Obra Social Docentes Privados)',
      'Estabilidad laboral especial',
      'Licencia por enfermedad extendida',
      'Compensación por material didáctico',
      'Adicional por título universitario',
      'Vacaciones alineadas con calendario escolar',
    ],
    cargos: [
      { cargo: 'Auxiliar docente / Preceptor/a',            sueldo: 1_200_000 },
      { cargo: 'Maestro/a primaria (jornada simple)',        sueldo: 1_950_000 },
      { cargo: 'Profesor/a secundaria (12 hs)',              sueldo: 2_400_000 },
      { cargo: 'Profesor/a secundaria (24 hs)',              sueldo: 4_200_000 },
      { cargo: 'Profesor/a universitario/a (semi-excl.)',    sueldo: 6_800_000 },
      { cargo: 'Regente / Director/a',                      sueldo: 9_500_000 },
      { cargo: 'Rector/a / Director/a de nivel',            sueldo: 13_000_000 },
    ],
  },

  docentes_pub: {
    nombre: 'Docentes públicos / Estatales educación',
    cct: 'Estatuto docente provincial / nacional',
    descripcion: 'Docentes de establecimientos públicos. Los aportes y beneficios varían por provincia. Muchos tienen caja provisional propia (no ANSES), lo que puede cambiar el % de jubilación.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical (CTERA / gremio provincial)',
        pct: 1.5,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Porcentaje referencial. Varía según provincia y gremio.',
      },
    ],
    beneficios: [
      'Obra social provincial o nacional (DOSEP, IOMA, OSDE, etc.)',
      'Estabilidad en el cargo',
      'Licencias especiales y por enfermedad',
      'Adicional por antigüedad (incentivo docente)',
      'Fondo Nacional de Incentivo Docente (FONID)',
      'Vacaciones alineadas con calendario escolar',
    ],
    cargos: [
      { cargo: 'Auxiliar docente / Celador/a',              sueldo: 1_100_000 },
      { cargo: 'Maestro/a primaria (jornada simple)',        sueldo: 1_800_000 },
      { cargo: 'Profesor/a secundaria (12 hs)',              sueldo: 2_200_000 },
      { cargo: 'Profesor/a secundaria (24 hs)',              sueldo: 3_900_000 },
      { cargo: 'Vice-director/a',                           sueldo: 6_500_000 },
      { cargo: 'Director/a de escuela',                     sueldo: 9_000_000 },
      { cargo: 'Supervisor/a de nivel',                     sueldo: 13_500_000 },
    ],
  },

  estatal_nac: {
    nombre: 'Administración Pública Nacional',
    cct: 'CCT 214/06 — ATE / UPCN',
    descripcion: 'Regula agentes de la Administración Pública Nacional (ministerios, organismos descentralizados, entes autárquicos).',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical (ATE o UPCN)',
        pct: 1,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Varía según sindicato de afiliación (ATE o UPCN).',
      },
    ],
    beneficios: [
      'Obra social DOSEP / OSSEG / UPCN Salud',
      'Estabilidad en el empleo público',
      'Carrera administrativa con ascenso por méritos',
      'Licencias especiales y por estudio',
      'Adicional por zona desfavorable',
      'Jubilación por antigüedad especial en algunos cargos',
    ],
    cargos: [
      { cargo: 'Auxiliar administrativo (nivel A)',          sueldo: 1_450_000 },
      { cargo: 'Administrativo/a (nivel B)',                 sueldo: 2_100_000 },
      { cargo: 'Técnico/a administrativo (nivel C)',         sueldo: 3_200_000 },
      { cargo: 'Profesional (nivel D)',                      sueldo: 5_500_000 },
      { cargo: 'Profesional principal (nivel E)',            sueldo: 8_800_000 },
      { cargo: 'Coordinador/a / Jefe/a de área',             sueldo: 13_000_000 },
      { cargo: 'Director/a nacional / subsecretario',        sueldo: 22_000_000 },
    ],
  },

  sanidad: {
    nombre: 'Sanidad',
    cct: 'CCT 108/75 — ATSA',
    descripcion: 'Regula empleados de clínicas, sanatorios, hospitales privados, laboratorios, consultorios y servicios de salud.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical ATSA',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados.',
      },
    ],
    beneficios: [
      'Obra social OSPATCA / ATSA Salud',
      'Adicional por riesgo biológico y trabajo con radiaciones',
      'Ropa de trabajo y elementos de bioseguridad',
      'Licencia por estudio de posgrado en salud',
      'Adicional por turno nocturno y guardias',
    ],
    cargos: [
      { cargo: 'Auxiliar de enfermería',                    sueldo: 1_350_000 },
      { cargo: 'Enfermero/a (título terciario)',             sueldo: 2_200_000 },
      { cargo: 'Técnico/a de laboratorio / Rad.',           sueldo: 2_900_000 },
      { cargo: 'Licenciado/a en enfermería',                sueldo: 4_500_000 },
      { cargo: 'Profesional de la salud (médico/a)',         sueldo: 8_000_000 },
      { cargo: 'Médico/a especialista (guardia 24hs)',       sueldo: 14_000_000 },
      { cargo: 'Jefe/a de servicio médico',                  sueldo: 22_000_000 },
    ],
  },

  camioneros: {
    nombre: 'Camioneros / Transporte de cargas',
    cct: 'CCT 40/89 — FCTA',
    descripcion: 'Regula conductores y trabajadores de transporte de carga por automotor, logística y distribución.',
    descuentos_extra: [
      {
        key: 'cuota_sind',
        label: 'Cuota sindical FCTA',
        pct: 2,
        base: 'bruto',
        deducibleGanancias: false,
        nota: 'Para afiliados.',
      },
    ],
    beneficios: [
      'Obra social OSTCA',
      'Viáticos por traslado largo recorrido',
      'Adicional por conducción nocturna',
      'Seguro de vida y accidentes en ruta',
      'Licencias especiales',
    ],
    cargos: [
      { cargo: 'Peón / Auxiliar de transporte',             sueldo: 1_150_000 },
      { cargo: 'Chofer categoría C (< 3.500 kg)',           sueldo: 1_900_000 },
      { cargo: 'Chofer categoría B (3.500–10.000 kg)',      sueldo: 2_600_000 },
      { cargo: 'Chofer categoría A (> 10.000 kg)',          sueldo: 3_500_000 },
      { cargo: 'Chofer de larga distancia',                 sueldo: 5_200_000 },
      { cargo: 'Supervissor/a de flota',                    sueldo: 8_500_000 },
      { cargo: 'Jefe/a de logística / transporte',          sueldo: 14_000_000 },
    ],
  },

  custom: {
    nombre: 'Personalizado',
    cct: null,
    descripcion: 'Configuración manual. Completá los porcentajes de aportes según tu situación particular.',
    descuentos_extra: [],
    beneficios: [],
    cargos: [],
  },
};
