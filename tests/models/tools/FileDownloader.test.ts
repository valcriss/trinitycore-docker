import { describe, it, expect, vi } from "vitest";
type StreamHandlers = {
  end?: () => void;
  error?: () => void;
};

const createStream = () => {
  const handlers: StreamHandlers = {};
  const stream = {
    on: (event: keyof StreamHandlers, handler: () => void) => {
      handlers[event] = handler;
      return stream;
    },
    pipe: (dest: unknown) => dest,
  };
  return {
    stream,
    emitEnd: () => handlers.end?.(),
    emitError: () => handlers.error?.(),
  };
};

const setup = async (exists: boolean, stream: ReturnType<typeof createStream>["stream"]) => {
  vi.resetModules();

  const existsMock = vi.fn(() => exists);
  const mkdirMock = vi.fn().mockResolvedValue(undefined);
  const createWriteStreamMock = vi.fn(() => ({}));

  vi.doMock("fs", () => ({
    default: {
      existsSync: existsMock,
      promises: {
        mkdir: mkdirMock,
      },
      createWriteStream: createWriteStreamMock,
    },
    existsSync: existsMock,
    promises: {
      mkdir: mkdirMock,
    },
    createWriteStream: createWriteStreamMock,
  }));

  const getMock = vi.fn().mockResolvedValue({ data: stream });
  vi.doMock("axios", () => ({
    default: { get: getMock },
  }));

  const FileDownloader = (await import("../../../src/models/tools/FileDownloader")).default;
  return { FileDownloader, existsMock, mkdirMock, createWriteStreamMock, getMock };
};

describe("FileDownloader", () => {
  it("downloads a file and creates the directory when missing", async () => {
    const { stream, emitEnd } = createStream();
    const { FileDownloader, mkdirMock, createWriteStreamMock, getMock } = await setup(false, stream);

    const downloader = new FileDownloader();
    const promise = downloader.downloadFile("http://file", "/tmp", "file.zip");
    await new Promise((resolve) => setImmediate(resolve));
    emitEnd();
    await promise;

    expect(getMock).toHaveBeenCalled();
    expect(mkdirMock).toHaveBeenCalled();
    expect(createWriteStreamMock).toHaveBeenCalledWith("/tmp/file.zip");
  });

  it("rejects when the download stream fails", async () => {
    const { stream, emitError } = createStream();
    const { FileDownloader } = await setup(true, stream);

    const downloader = new FileDownloader();
    const promise = downloader.downloadFile("http://file", "/tmp", "file.zip");
    const rejection = promise.catch((err) => err);
    await new Promise((resolve) => setImmediate(resolve));
    emitError();

    const error = await rejection;
    expect(error).toBeUndefined();
  });
});
