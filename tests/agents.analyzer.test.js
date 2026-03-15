jest.mock('../utils/apiClient');

describe('analyzerAgent', () => {
  test('analyzer.run returns analysis text', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postGemini = jest.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: 'analysis-text' }] } }] });
    const analyzer = require('../agents/analyzerAgent');
    const res = await analyzer.run('cleaned-csv');
    expect(res).toBe('analysis-text');
  });

  test('analyzer.run handles errors gracefully', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postGemini = jest.fn().mockRejectedValue(new Error('fail'));
    const analyzer = require('../agents/analyzerAgent');
    const res = await analyzer.run('cleaned-csv');
    expect(typeof res).toBe('string');
    expect(res).toMatch(/Analyzer failed/);
  });
});
