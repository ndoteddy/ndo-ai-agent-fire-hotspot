jest.mock('../utils/apiClient');

describe('cleanerAgent', () => {
  test('cleaner.run returns cleaned text', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postGemini = jest.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: 'cleaned-csv' }] } }] });
    const cleaner = require('../agents/cleanerAgent');
    const res = await cleaner.run('raw-csv');
    expect(res).toBe('cleaned-csv');
  });

  test('cleaner.run handles errors gracefully', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postGemini = jest.fn().mockRejectedValue(new Error('fail'));
    const cleaner = require('../agents/cleanerAgent');
    const res = await cleaner.run('raw-csv');
    expect(typeof res).toBe('string');
    expect(res).toMatch(/Cleaner failed/);
  });
});
