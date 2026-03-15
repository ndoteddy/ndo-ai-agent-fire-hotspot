const Agent = require('../core/agent');

describe('Agent core', () => {
  test('constructor requires name and handler', () => {
    expect(() => new Agent({})).toThrow();
  });

  test('run returns handler result on success', async () => {
    const a = new Agent({ name: 'a', handler: async () => 'ok' });
    const res = await a.run();
    expect(res).toBe('ok');
  });

  test('run returns error object when handler throws', async () => {
    const a = new Agent({ name: 'b', handler: async () => { throw new Error('boom'); } });
    const res = await a.run();
    expect(res).toBeTruthy();
    expect(res.error).toBe(true);
    expect(res.message).toMatch(/boom/);
  });
});
