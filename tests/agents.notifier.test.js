jest.mock('../utils/apiClient');

describe('notifierAgent', () => {
  test('notifier.run returns public summary', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postGemini = jest.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: 'public-summary' }] } }] });
    const notifier = require('../agents/notifierAgent');
    const res = await notifier.run('analysis');
    expect(res).toBe('public-summary');
  });

  test('notifier.run handles errors gracefully', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postGemini = jest.fn().mockRejectedValue(new Error('fail'));
    const notifier = require('../agents/notifierAgent');
    const res = await notifier.run('analysis');
    expect(typeof res).toBe('string');
    expect(res).toMatch(/Notifier failed/);
  });
});
