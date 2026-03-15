jest.mock('../utils/apiClient');

describe('insightAgent', () => {
  test('insight.run returns expert insight', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postTogether = jest.fn().mockResolvedValue({ choices: [{ message: { content: 'expert-insight' } }] });
    const insight = require('../agents/insightAgent');
    const res = await insight.run('analysis-report');
    expect(res).toBe('expert-insight');
  });

  test('insight.run handles errors gracefully', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postTogether = jest.fn().mockRejectedValue(new Error('fail'));
    const insight = require('../agents/insightAgent');
    const res = await insight.run('analysis-report');
    expect(typeof res).toBe('string');
    expect(res).toMatch(/Failed to get insight/);
  });
});
