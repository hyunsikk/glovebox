import { buildMailtoUrl, feedbackSubject, feedbackBody } from '../lib/supportFormat';

describe('supportFormat', () => {
  test('mailto encodes subject and body', () => {
    const url = buildMailtoUrl({ email: 'owal@teamam.org', subject: 'A & B', body: 'line1\nline2' });
    expect(url.startsWith('mailto:owal@teamam.org?')).toBe(true);
    expect(url).toContain('subject=A%20%26%20B');
    expect(url).toContain('body=line1%0Aline2');
  });

  test('bug vs feedback subject', () => {
    expect(feedbackSubject('bug')).toMatch(/Bug/);
    expect(feedbackSubject('feedback')).toMatch(/Feedback/);
  });

  test('body includes version, build, and device diagnostics', () => {
    const body = feedbackBody({ version: '2.1.0', build: '6', os: 'iOS', osVersion: '17.4' });
    expect(body).toContain('Version: 2.1.0 (6)');
    expect(body).toContain('Device: iOS 17.4');
  });

  test('body degrades gracefully with missing diagnostics', () => {
    const body = feedbackBody({});
    expect(body).toContain('Version: unknown (unknown)');
    expect(body).toContain('Device: unknown');
  });
});
