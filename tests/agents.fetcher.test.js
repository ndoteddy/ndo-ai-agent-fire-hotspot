jest.mock('../utils/apiClient');

describe('fetcherAgent', () => {
  test('fetcher.run returns fetched data', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    apiClient.getUrl = jest.fn().mockResolvedValue('csv-data');
    const fetcher = require('../agents/fetcherAgent');
    const res = await fetcher.run();
    expect(res).toBe('csv-data');
    expect(apiClient.getUrl).toHaveBeenCalled();
  });

  test('fetcher.run handles fetch errors gracefully', async () => {
    jest.resetModules();
    const apiClient = require('../utils/apiClient');
    const err = new Error('nope');
    apiClient.getUrl = jest.fn().mockRejectedValue(err);
    const fetcher = require('../agents/fetcherAgent');
    const res = await fetcher.run();
    expect(typeof res).toBe('string');
    expect(res).toMatch(/Failed to fetch/);
  });
});
