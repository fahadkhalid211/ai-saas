import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { I18nProvider } from '@/lib/i18n/context';
import { CalendarLinksPanel } from '@/components/crm/CalendarLinksPanel';

const render = (props: { assistantId?: string }) => renderToString(React.createElement(I18nProvider, null, React.createElement(CalendarLinksPanel, props)));

describe('CalendarLinksPanel', () => {
  it('asks to save a new (unsaved) assistant first instead of loading for ever', () => {
    const html = render({});
    expect(html).toContain('Calendars that block my slots');
    expect(html).toContain('Save the assistant first to add calendars.');
    expect(html).not.toContain('aria-busy');
  });

  it('starts loading for a saved assistant', () => {
    expect(render({ assistantId: 'ast_1' })).toContain('aria-busy');
  });
});
