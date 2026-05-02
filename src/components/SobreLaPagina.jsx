import React from 'react';

export default function SobreLaPagina() {
  return (
    <div className="container">
      <div className="card">
        <div className="card-title">ℹ️ Sobre esta aplicación</div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '1rem' }}>
          Calculadora de liquidación de sueldos para Argentina. Período fiscal 2026, valores oficiales ARCA.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>

          <div style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>💼 Módulo — Relación de dependencia</div>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: 1.8, margin: 0 }}>
              <li>Retención Impuesto a las Ganancias 4ª categoría — método acumulado <strong>RG 4003/2017</strong></li>
              <li>Valores ARCA H1 2026 — <strong>Ley 27.743</strong> (MNI, DED_ESP, escala Art.94)</li>
              <li>SAC auto-calculado por semestre (mejor sueldo ÷ 2)</li>
              <li>Vacaciones, deducciones Art.85, cargas de familia</li>
              <li>Convenios colectivos con pisos salariales y descuentos extra</li>
              <li>Conceptos remunerativos y no remunerativos adicionales</li>
            </ul>
          </div>

          <div style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>📋 Normativa aplicada</div>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: 1.8, margin: 0 }}>
              <li><strong>Ley 27.743 (2024)</strong> — Art.30 (MNI + DED_ESP + cargas), Art.85 (ded. adicionales), Art.94 (escala)</li>
              <li><strong>RG 4003/2017 AFIP/ARCA</strong> — método acumulado de retención mensual</li>
              <li><strong>RG 5531/2024</strong> — Deducción Especial Ap.2</li>
              <li><strong>LCT</strong> — Ley de Contrato de Trabajo (vacaciones, SAC, liquidación)</li>
              <li><strong>Ley 26.844</strong> — Régimen Especial Personal de Casas Particulares</li>
            </ul>
          </div>

          <div style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ Limitaciones</div>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: 1.8, margin: 0 }}>
              <li>Resultado <strong>orientativo</strong> — no reemplaza liquidación del empleador ni asesoría contable.</li>
              <li>Pisos salariales de convenios son referenciales — verificar con la última paritaria vigente.</li>
              <li>Los valores ARCA se actualizan en <strong>H2 2026</strong> (julio/agosto) con IPC enero–junio.</li>
              <li>No contempla situaciones especiales: contratos a tiempo parcial LCT, suspensiones, licencias pagas, etc.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
