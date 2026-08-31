import { describe, it, expect } from 'vitest';
import {
  CORRECTION_REGISTRY,
  CORRECTION_KEY_ALIASES,
  getCorrectionEntry,
  getCorrectionAudioPath,
  getCorrectionText,
  getCorrectionReportText,
} from '../../src/services/correctionRegistry';

describe('Correction Registry (8-Asana Curriculum + Structured Layers)', () => {
  it('contains all 28 canonical correction IDs with live and report layers', () => {
    const requiredIds = [
      'lower_shoulders',
      'relax_shoulders',
      'raise_arms',
      'extend_arms',
      'extend_left_arm',
      'extend_right_arm',
      'bend_front_knee',
      'align_front_knee',
      'straighten_knees',
      'straighten_back_leg',
      'lift_bent_knee',
      'keep_torso_upright',
      'lengthen_spine',
      'lift_chest',
      'soften_elbows',
      'lift_hips_higher',
      'press_hips_back',
      'align_hips_shoulders',
      'ground_feet',
      'move_back',
      'move_forward',
      'move_left',
      'move_right',
      'hold_position',
      'good_job',
      'excellent',
      'try_again',
      'keep_breathing',
    ];

    expect(Object.keys(CORRECTION_REGISTRY).length).toBe(28);

    requiredIds.forEach((id) => {
      const entry = CORRECTION_REGISTRY[id];
      expect(entry).toBeDefined();
      expect(entry.id).toBe(id);
      expect(typeof entry.live.en).toBe('string');
      expect(typeof entry.live.te).toBe('string');
      expect(typeof entry.report.en).toBe('string');
      expect(typeof entry.report.te).toBe('string');
      expect(typeof entry.audio.te).toBe('string');
    });
  });

  it('correctly maps legacy / rule alias keys to canonical IDs', () => {
    expect(CORRECTION_KEY_ALIASES['front_knee_too_straight']).toBe('bend_front_knee');
    expect(CORRECTION_KEY_ALIASES['left_arm_bent']).toBe('extend_left_arm');
    expect(CORRECTION_KEY_ALIASES['right_arm_bent']).toBe('extend_right_arm');
    expect(CORRECTION_KEY_ALIASES['torso_leaning_forward']).toBe('keep_torso_upright');
    expect(CORRECTION_KEY_ALIASES['rear_leg_bent']).toBe('straighten_back_leg');
    expect(CORRECTION_KEY_ALIASES['reposition_camera']).toBe('move_back');
  });

  it('resolves approved conversational Telugu live cues', () => {
    expect(getCorrectionText('bend_front_knee', 'te', 'live')).toBe('ముందు మోకాలిని ఇంకొంచెం వంచండి.');
    expect(getCorrectionText('lower_shoulders', 'te', 'live')).toBe('మీ భుజాలను కొద్దిగా వదులుగా ఉంచండి.');
    expect(getCorrectionText('keep_torso_upright', 'te', 'live')).toBe('శరీరాన్ని నిటారుగా ఉంచండి.');
    expect(getCorrectionText('straighten_knees', 'te', 'live')).toBe('మోకాళ్లను సూటిగా ఉంచండి.');
  });

  it('resolves detailed report explanations in Telugu and English', () => {
    const teReport = getCorrectionReportText('bend_front_knee', 'te');
    expect(teReport).toContain('90 డిగ్రీల కోణంలో');

    const enReport = getCorrectionReportText('bend_front_knee', 'en');
    expect(enReport).toContain('90-degree');
  });

  it('resolves local audio asset path correctly for Telugu', () => {
    const path = getCorrectionAudioPath('lower_shoulders', 'te');
    expect(path).toBe('/audio/te/virabhadrasanaII/lower_shoulders.mp3');

    // Via alias
    const aliasPath = getCorrectionAudioPath('left_arm_bent', 'te');
    expect(aliasPath).toBe('/audio/te/virabhadrasanaII/extend_left_arm.mp3');
  });

  it('handles non-existent or null keys gracefully', () => {
    expect(getCorrectionEntry(null)).toBeNull();
    expect(getCorrectionEntry('')).toBeNull();
    expect(getCorrectionEntry('unknown_rule_xyz')).toBeNull();
    expect(getCorrectionAudioPath('unknown_rule_xyz')).toBeNull();
    expect(getCorrectionText('unknown_rule_xyz')).toBeNull();
    expect(getCorrectionReportText('unknown_rule_xyz')).toBeNull();
  });
});
