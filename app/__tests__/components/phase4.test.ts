import {describe, it, expect} from 'vitest';
import {
  VIDEOMANCER_SIGNAL_FLOW,
  CHROMAGNON_SIGNAL_FLOW,
  MODULE_SIGNAL_FLOW,
  getSignalFlowForProduct,
} from '~/components/SignalFlowDiagram';
import {
  QUICK_START_STEPS,
} from '~/components/QuickStartPreview';
import {
  renderReleaseMarkdown,
} from '~/components/ReleaseNotes';
import {
  VIDEOMANCER_TROUBLESHOOTING,
  GENERIC_MODULE_TROUBLESHOOTING,
  getTroubleshootingTree,
} from '~/components/TroubleshootingFlow';

// -------------------------------------------------------------------
// SignalFlowDiagram
// -------------------------------------------------------------------
describe('SignalFlowDiagram configs', () => {
  it('VIDEOMANCER_SIGNAL_FLOW has valid structure', () => {
    expect(VIDEOMANCER_SIGNAL_FLOW.nodes.length).toBeGreaterThanOrEqual(3);
    expect(VIDEOMANCER_SIGNAL_FLOW.edges.length).toBeGreaterThanOrEqual(2);
    // All edge endpoints refer to existing nodes
    const ids = new Set(VIDEOMANCER_SIGNAL_FLOW.nodes.map((n) => n.id));
    for (const edge of VIDEOMANCER_SIGNAL_FLOW.edges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
    }
  });

  it('CHROMAGNON_SIGNAL_FLOW has valid structure', () => {
    expect(CHROMAGNON_SIGNAL_FLOW.nodes.length).toBeGreaterThanOrEqual(3);
    const ids = new Set(CHROMAGNON_SIGNAL_FLOW.nodes.map((n) => n.id));
    for (const edge of CHROMAGNON_SIGNAL_FLOW.edges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
    }
  });

  it('MODULE_SIGNAL_FLOW has valid structure', () => {
    expect(MODULE_SIGNAL_FLOW.nodes.length).toBe(3);
    expect(MODULE_SIGNAL_FLOW.edges.length).toBe(2);
  });

  it('getSignalFlowForProduct returns correct configs', () => {
    expect(getSignalFlowForProduct('videomancer')).toBe(
      VIDEOMANCER_SIGNAL_FLOW,
    );
    expect(getSignalFlowForProduct('chromagnon')).toBe(
      CHROMAGNON_SIGNAL_FLOW,
    );
    expect(getSignalFlowForProduct('esg3')).toBeNull();
    expect(getSignalFlowForProduct('unknown')).toBeNull();
  });
});

// -------------------------------------------------------------------
// QuickStartPreview
// -------------------------------------------------------------------
describe('QuickStartPreview data', () => {
  it('videomancer has 3 quick-start steps', () => {
    expect(QUICK_START_STEPS.videomancer).toBeDefined();
    expect(QUICK_START_STEPS.videomancer!.length).toBe(3);
  });

  it('chromagnon has 3 quick-start steps', () => {
    expect(QUICK_START_STEPS.chromagnon).toBeDefined();
    expect(QUICK_START_STEPS.chromagnon!.length).toBe(3);
  });

  it('each step has title and description', () => {
    for (const [slug, steps] of Object.entries(QUICK_START_STEPS)) {
      for (const step of steps) {
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
      }
    }
  });
});

// -------------------------------------------------------------------
// ReleaseNotes markdown renderer
// -------------------------------------------------------------------
describe('renderReleaseMarkdown', () => {
  it('converts headings', () => {
    const html = renderReleaseMarkdown('## Features\n### Bug Fixes');
    expect(html).toContain('<h3');
    expect(html).toContain('Features');
    expect(html).toContain('<h4');
    expect(html).toContain('Bug Fixes');
  });

  it('converts list items', () => {
    const html = renderReleaseMarkdown('- Fixed crash\n* Added feature');
    expect(html).toContain('<li');
    expect(html).toContain('Fixed crash');
    expect(html).toContain('Added feature');
  });

  it('converts bold text', () => {
    const html = renderReleaseMarkdown('This is **important** text');
    expect(html).toContain('<strong>important</strong>');
  });

  it('converts inline code', () => {
    const html = renderReleaseMarkdown('Use `getLatestRelease()` function');
    expect(html).toContain('<code');
    expect(html).toContain('getLatestRelease()');
  });

  it('converts links', () => {
    const html = renderReleaseMarkdown(
      'See [docs](https://example.com) for details',
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('>docs</a>');
  });

  it('escapes HTML in input', () => {
    const html = renderReleaseMarkdown('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles empty input', () => {
    const html = renderReleaseMarkdown('');
    expect(html).toBe('');
  });
});

// -------------------------------------------------------------------
// TroubleshootingFlow
// -------------------------------------------------------------------
describe('TroubleshootingFlow data', () => {
  it('VIDEOMANCER_TROUBLESHOOTING starts with "start" node', () => {
    expect(VIDEOMANCER_TROUBLESHOOTING[0]!.id).toBe('start');
  });

  it('all nextId references point to existing nodes', () => {
    const ids = new Set(VIDEOMANCER_TROUBLESHOOTING.map((n) => n.id));
    for (const node of VIDEOMANCER_TROUBLESHOOTING) {
      for (const option of node.options) {
        if (option.nextId !== null) {
          expect(ids.has(option.nextId)).toBe(true);
        }
      }
    }
  });

  it('leaf options have resolutions', () => {
    for (const node of VIDEOMANCER_TROUBLESHOOTING) {
      for (const option of node.options) {
        if (option.nextId === null) {
          expect(option.resolution).toBeTruthy();
        }
      }
    }
  });

  it('GENERIC_MODULE_TROUBLESHOOTING has valid structure', () => {
    expect(GENERIC_MODULE_TROUBLESHOOTING[0]!.id).toBe('start');
    const ids = new Set(GENERIC_MODULE_TROUBLESHOOTING.map((n) => n.id));
    for (const node of GENERIC_MODULE_TROUBLESHOOTING) {
      for (const option of node.options) {
        if (option.nextId !== null) {
          expect(ids.has(option.nextId)).toBe(true);
        }
      }
    }
  });

  it('getTroubleshootingTree returns Videomancer tree', () => {
    expect(getTroubleshootingTree('videomancer')).toBe(
      VIDEOMANCER_TROUBLESHOOTING,
    );
  });

  it('getTroubleshootingTree returns null for unknown slug', () => {
    expect(getTroubleshootingTree('esg3')).toBeNull();
  });
});
