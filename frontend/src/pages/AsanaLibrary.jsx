/**
 * AsanaLibrary.jsx
 * Asana Knowledge & Practice Preparation Experience.
 * Features verified human reference photos, vector guides, bilingual preparation steps,
 * alignment criteria, common mistakes, and practice launcher.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ASANA_LIST } from '../engine/poseRules';

export default function AsanaLibrary() {
  const navigate = useNavigate();
  const { language, changeLanguage, setSelectedAsana } = useApp();
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [modalVisualMode, setModalVisualMode] = useState('photo'); // 'photo' | 'illustration'

  const handleLaunchPractice = (asana, mode) => {
    setSelectedAsana(asana);
    navigate(`/${mode}/${asana.id}`);
  };

  const isTe = language === 'te';

  return (
    <div style={{ background: 'var(--night)', minHeight: 'calc(100vh - 65px)', padding: '32px 16px', color: '#FFFFFF', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: 'var(--gold-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            {isTe ? '8-ఆసనాల సాధన గ్రంథాలయం' : 'Foundation 8-Asana Curriculum'}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, margin: '0 0 8px', color: '#FFFFFF' }}>
            🌿 {isTe ? 'ఆసన పరిజ్ఞానం & సాధన' : 'Asana Knowledge & Preparation'}
          </h1>
          <p style={{ fontSize: 'clamp(13.5px, 2.5vw, 15.5px)', color: '#9AA0C4', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
            {isTe
              ? 'నిజమైన మానవ భంగిమల ఫోటోలు, అలైన్‌మెంట్ సూచనలు మరియు తెలుగు/ఇంగ్లీష్ వాయిస్ కోచింగ్‌తో కూడిన ఆసనాలు.'
              : 'Explore verified postures with real-human reference photos, step-by-step preparation guides, and real-time voice coaching.'}
          </p>
        </div>

        {/* 8-Asana Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {ASANA_LIST.map((asana) => (
            <div
              key={asana.id}
              style={{
                background: '#161B32',
                borderRadius: 18,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onClick={() => {
                setSelectedDetail(asana);
                setModalVisualMode('photo');
              }}
            >
              {/* Human Reference Photo Preview */}
              <div style={{ height: 200, background: '#0B0E1C', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={asana.referencePhoto || asana.image}
                  alt={asana.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(18, 23, 43, 0.88)',
                    color: 'var(--gold-2)',
                    padding: '3px 8px',
                    borderRadius: 14,
                    fontSize: 11,
                    fontWeight: 700,
                    border: '1px solid rgba(232, 163, 61, 0.3)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  📷 {asana.cameraOrientation === 'front' ? 'Front Camera' : 'Side Camera'}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>{asana.name}</h3>
                    <span style={{ fontSize: 12.5, color: 'var(--gold-2)', fontWeight: 600 }}>{asana.sanskritName}</span>
                  </div>
                  <span
                    style={{
                      background: 'rgba(47, 109, 79, 0.25)',
                      color: '#86EFAC',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 10,
                      border: '1px solid rgba(47, 109, 79, 0.4)',
                    }}
                  >
                    {asana.difficulty || 'Beginner'}
                  </span>
                </div>

                <p style={{ fontSize: 12.5, color: '#9AA0C4', margin: '8px 0 14px', lineHeight: 1.4, flex: 1 }}>
                  {asana.description}
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchPractice(asana, 'live');
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 8px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--gold)',
                      color: '#12172B',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ▶ Live Coach
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchPractice(asana, 'photo');
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 8px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    📷 Photo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* ASANA DEDICATED PREPARATION & KNOWLEDGE MODAL                            */}
        {/* ========================================================================= */}
        {selectedDetail && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 200,
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setSelectedDetail(null)}
          >
            <div
              style={{
                background: '#161B32',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 22,
                maxWidth: 780,
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Visual Header with Reference Photo */}
              <div style={{ background: '#0B0E1C', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
                <button
                  onClick={() => setSelectedDetail(null)}
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 15,
                    zIndex: 10,
                  }}
                >
                  ✕
                </button>

                {/* Primary Photo vs Secondary Vector Switcher */}
                <div style={{ display: 'flex', gap: 6, background: 'rgba(255, 255, 255, 0.08)', padding: 3, borderRadius: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => setModalVisualMode('photo')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: modalVisualMode === 'photo' ? 'var(--gold)' : 'transparent',
                      color: modalVisualMode === 'photo' ? '#12172B' : '#EDEEF6',
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}
                  >
                    👤 Real Human Photo
                  </button>
                  <button
                    onClick={() => setModalVisualMode('illustration')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: modalVisualMode === 'illustration' ? 'var(--gold)' : 'transparent',
                      color: modalVisualMode === 'illustration' ? '#12172B' : '#EDEEF6',
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}
                  >
                    📐 Vector Guide
                  </button>
                </div>

                {/* Large Display Frame */}
                <div style={{ height: 240, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {modalVisualMode === 'photo' ? (
                    <img
                      src={selectedDetail.referencePhoto || selectedDetail.image}
                      alt={selectedDetail.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                    />
                  ) : (
                    <img
                      src={selectedDetail.referenceIllustration || selectedDetail.image}
                      alt={selectedDetail.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>

              {/* Modal Preparation Body */}
              <div style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22 }}>{selectedDetail.name}</h2>
                    <span style={{ color: 'var(--gold-2)', fontSize: 14, fontWeight: 700 }}>{selectedDetail.sanskritName}</span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#9AA0C4' }}>· {selectedDetail.category}</span>
                  </div>

                  {/* Language Toggle Inside Modal */}
                  <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', padding: 2, borderRadius: 6 }}>
                    <button
                      onClick={() => changeLanguage('en')}
                      style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: !isTe ? 'var(--gold)' : 'transparent', color: !isTe ? '#12172B' : '#EDEEF6', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage('te')}
                      style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: isTe ? 'var(--gold)' : 'transparent', color: isTe ? '#12172B' : '#EDEEF6', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-indic)' }}
                    >
                      తెలుగు
                    </button>
                  </div>
                </div>

                <p style={{ color: '#C7CBE0', fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }}>
                  {selectedDetail.description}
                </p>

                {/* 1. HOW TO PERFORM (4 Step-by-Step Points) */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, padding: 14, marginBottom: 14, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--gold-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📋 {isTe ? 'ఆసనం వేసే విధానం (How to Perform)' : 'How to Perform (Step-by-Step)'}
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 18, color: '#EDEEF6', fontSize: 13, lineHeight: 1.5 }}>
                    {((isTe ? selectedDetail.howToPerformTe : selectedDetail.howToPerform) || selectedDetail.howToPerform || []).map((step, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* 2-Column Preparation Grid (Responsive) */}
                <div className="asana-prep-two-col" style={{ marginBottom: 16 }}>
                  {/* Focus Points */}
                  <div style={{ background: 'rgba(47, 109, 79, 0.12)', borderRadius: 10, padding: 12, border: '1px solid rgba(47, 109, 79, 0.3)' }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 12, color: '#86EFAC', textTransform: 'uppercase' }}>
                      ✓ {isTe ? 'ముఖ్యమైన అంశాలు (Focus on)' : 'Focus On'}
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: 16, color: '#EDEEF6', fontSize: 12.5, lineHeight: 1.45 }}>
                      {((isTe ? selectedDetail.focusPointsTe : selectedDetail.focusPoints) || selectedDetail.focusPoints || []).map((pt, i) => (
                        <li key={i} style={{ marginBottom: 3 }}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Mistakes */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: 10, padding: 12, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 12, color: '#F87171', textTransform: 'uppercase' }}>
                      ⚠️ {isTe ? 'సాధారణ తప్పులు (Common Mistakes)' : 'Common Mistakes'}
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: 16, color: '#EDEEF6', fontSize: 12.5, lineHeight: 1.45 }}>
                      {((isTe ? selectedDetail.commonMistakesTe : selectedDetail.commonMistakes) || selectedDetail.commonMistakes || []).map((err, i) => (
                        <li key={i} style={{ marginBottom: 3 }}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Breathing Guidance */}
                <div style={{ background: 'rgba(232, 163, 61, 0.1)', borderRadius: 10, padding: 10, marginBottom: 20, border: '1px solid rgba(232, 163, 61, 0.25)', fontSize: 12.5, color: '#F4C878' }}>
                  <strong>🌬️ {isTe ? 'శ్వాస క్రియ (Breathing):' : 'Breathing:'}</strong>{' '}
                  {(isTe ? selectedDetail.breathingGuidanceTe : selectedDetail.breathingGuidance) || selectedDetail.breathingGuidance}
                </div>

                {/* Launch Practice CTAs */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleLaunchPractice(selectedDetail, 'live')}
                    style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: 'var(--gold)', color: '#12172B', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232, 163, 61, 0.35)' }}
                  >
                    ▶ Launch Live Coach
                  </button>
                  <button
                    onClick={() => handleLaunchPractice(selectedDetail, 'photo')}
                    style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.2)', background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}
                  >
                    📷 Photo Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
