jest.mock('axios');
const axios = require('axios');
const apiClient = require('../utils/apiClient');

describe('apiClient', () => {
  afterEach(() => jest.resetAllMocks());

  test('getUrl returns data when axios resolves', async () => {
    axios.get.mockResolvedValue({ data: 'payload' });
    const res = await apiClient.getUrl('http://example.test');
    expect(res).toBe('payload');
    expect(axios.get).toHaveBeenCalledWith('http://example.test', {});
  });

  test('getUrl marks error with isApiError and rethrows', async () => {
    const err = new Error('network');
    axios.get.mockRejectedValue(err);
    await expect(apiClient.getUrl('http://fail.test')).rejects.toMatchObject({ message: 'network', isApiError: true });
  });
});
