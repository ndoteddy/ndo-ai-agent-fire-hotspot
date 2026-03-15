jest.mock('../utils/apiClient');

describe('patternExplainerAgent', () => {
  test('patternExplainer.run returns explanation', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postTogether = jest.fn().mockResolvedValue({ choices: [{ message: { content: 'pattern-explain' } }] });
    const agent = require('../agents/patternExplainerAgent');
    const res = await agent.run('analysis');
    expect(res).toBe('pattern-explain');
  });

  test('patternExplainer.run handles errors gracefully', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.postTogether = jest.fn().mockRejectedValue(new Error('fail'));
    const agent = require('../agents/patternExplainerAgent');
    const res = await agent.run('analysis');
    expect(typeof res).toBe('string');
    expect(res).toMatch(/Failed to generate pattern explanation/);
  });
});
