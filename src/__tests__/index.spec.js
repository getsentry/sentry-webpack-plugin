/*eslint-disable*/

const newMock = jest.fn(() => Promise.resolve());
const uploadSourceMapsMock = jest.fn(() => Promise.resolve());
const finalizeMock = jest.fn(() => Promise.resolve());
const proposeVersionMock = jest.fn(() => Promise.resolve());
const SentryCliMock = jest.fn(configFile => ({
  releases: {
    new: newMock,
    uploadSourceMaps: uploadSourceMapsMock,
    finalize: finalizeMock,
    proposeVersion: proposeVersionMock,
  },
}));

const SentryCli = jest.mock('@sentry/cli', () => SentryCliMock);
const SentryCliPlugin = require('..');

afterEach(() => {
  jest.clearAllMocks();
});

describe('new SentryCliPlugin(options)', () => {
  test('when no options provided should use defaults', () => {
    const sentryCliPlugin = new SentryCliPlugin();

    expect(sentryCliPlugin.options).toEqual({
      rewrite: true,
    });
  });

  test('provided options should be merged with defaults', () => {
    const sentryCliPlugin = new SentryCliPlugin({
      foo: 42,
    });

    expect(sentryCliPlugin.options).toEqual({
      rewrite: true,
      foo: 42,
    });
  });

  test('`include` and `ignore` options should be wrapped in arrays when passed as strings', () => {
    const sentryCliPlugin = new SentryCliPlugin({
      include: 'foo',
      ignore: 'bar',
    });

    expect(sentryCliPlugin.options).toEqual({
      rewrite: true,
      include: ['foo'],
      ignore: ['bar'],
    });
  });

  test('`include` and `ignore` options should not be wrapped in arrays again when already passed as ones', () => {
    const sentryCliPlugin = new SentryCliPlugin({
      include: ['foo'],
      ignore: ['bar'],
    });

    expect(sentryCliPlugin.options).toEqual({
      rewrite: true,
      include: ['foo'],
      ignore: ['bar'],
    });
  });
});

describe('.apply', () => {
  let compiler;

  beforeEach(() => {
    compiler = {
      plugin: jest.fn(),
    };
  });

  test('should create exactly one instance of SentryCli with `configFile` if passed', () => {
    const sentryCliPlugin = new SentryCliPlugin({
      release: '42',
      include: 'src',
      configFile: './some/file',
    });
    sentryCliPlugin.apply(compiler);

    expect(SentryCliMock).toBeCalledWith('./some/file');
    expect(SentryCliMock.mock.instances.length).toBe(1);
  });

  test('should call `compiler.plugin()` with `after-emit` and callback function', () => {
    const sentryCliPlugin = new SentryCliPlugin();
    sentryCliPlugin.apply(compiler);

    expect(compiler.plugin).toHaveBeenCalled();
    expect(compiler.plugin.mock.calls[0][0]).toBe('after-emit');
    expect(typeof compiler.plugin.mock.calls[0][1]).toBe('function');
  });
});

describe('.apply callback function', () => {
  let compilation;
  let compilationDoneCallback;
  let compiler;

  beforeEach(() => {
    compilation = {
      errors: [],
      hash: 'someHash',
    };
    compilationDoneCallback = jest.fn();
    compiler = {
      plugin: jest.fn((event, callback) =>
        callback(compilation, compilationDoneCallback)
      ),
    };
  });

  test('should bail-out when no `include` option provided', () => {
    const sentryCliPlugin = new SentryCliPlugin({
      release: 42,
    });
    sentryCliPlugin.apply(compiler);

    expect(compilation.errors).toEqual([
      'Sentry CLI Plugin: `include` option is required',
    ]);
    expect(compilationDoneCallback).toBeCalled();
  });

  test('should evaluate `release` option with compilation hash if its passed as a function', done => {
    expect.assertions(2);
    const sentryCliPlugin = new SentryCliPlugin({
      release: 'someHashEvaluated',
      include: 'src',
    });
    sentryCliPlugin.apply(compiler);

    setImmediate(() => {
      expect(compilationDoneCallback).toBeCalled();
      expect(sentryCliPlugin.options.release).toBe('someHashEvaluated');
      done();
    });
  });

  describe('SentryCli calls flow', () => {
    let sentryCliPlugin;

    beforeEach(() => {
      sentryCliPlugin = new SentryCliPlugin({
        release: '42',
        include: 'src',
      });
    });

    test('should call all required SentryCli methods in sequence', done => {
      expect.assertions(4);
      sentryCliPlugin.apply(compiler);

      setImmediate(() => {
        expect(newMock).toBeCalledWith('42');
        expect(uploadSourceMapsMock).toBeCalledWith('42', {
          ignore: undefined,
          release: '42',
          include: ['src'],
          rewrite: true,
        });
        expect(finalizeMock).toBeCalledWith('42');
        expect(compilationDoneCallback).toBeCalled();
        done();
      });
    });

    test('when failed, should handle the error', done => {
      expect.assertions(2);
      SentryCliMock.mockImplementationOnce(configFile => ({
        releases: {
          new: jest.fn(() => Promise.reject(new Error('Pickle Rick'))),
        },
      }));

      sentryCliPlugin.apply(compiler);

      setImmediate(() => {
        expect(compilation.errors).toEqual(['Sentry CLI Plugin: Pickle Rick']);
        expect(compilationDoneCallback).toBeCalled();
        done();
      });
    });
  });
});
