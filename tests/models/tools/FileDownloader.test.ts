import { describe, it, expect, vi } from "vitest";
type StreamHandlers = {
  data?: (chunk: Buffer) => void;
  end?: () => void;
  error?: () => void;
};

const createStream = () => {
  const handlers: StreamHandlers = {};
  const stream = {
    on: (event: keyof StreamHandlers, handler: ((chunk: Buffer) => void) | (() => void)) => {
      handlers[event] = handler as StreamHandlers[keyof StreamHandlers];
      return stream;
    },
    pipe: (dest: unknown) => dest,
  };
  return {
    stream,
    emitData: (chunk: Buffer) => handlers.data?.(chunk),
    emitEnd: () => handlers.end?.(),
    emitError: () => handlers.error?.(),
  };
};

const setup = async (
  exists: boolean,
  stream: ReturnType<typeof createStream>["stream"],
  headers: Record<string, string> = { "content-length": "10" }
) => {
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

  const getMock = vi.fn().mockResolvedValue({ data: stream, headers });
  vi.doMock("axios", () => ({
    default: { get: getMock },
  }));

  const FileDownloader = (await import("../../../src/models/tools/FileDownloader")).default;
  return { FileDownloader, existsMock, mkdirMock, createWriteStreamMock, getMock };
};

describe("FileDownloader", () => {
  it("downloads a file and creates the directory when missing", async () => {
    const { stream, emitData, emitEnd } = createStream();
    const { FileDownloader, mkdirMock, createWriteStreamMock, getMock } = await setup(false, stream);

    const downloader = new FileDownloader();
    const onProgress = vi.fn();
    const promise = downloader.downloadFile("http://file", "/tmp", "file.zip", onProgress);
    await new Promise((resolve) => setImmediate(resolve));
    emitData(Buffer.from("12345"));
    emitEnd();
    await promise;

    expect(getMock).toHaveBeenCalled();
    expect(mkdirMock).toHaveBeenCalled();
    expect(createWriteStreamMock).toHaveBeenCalledWith("/tmp/file.zip");
    expect(onProgress).toHaveBeenCalledWith({
      receivedBytes: 5,
      totalBytes: 10,
      percent: 50,
    });
  });

  it("rejects when the download stream fails", async () => {
    const { stream, emitData, emitError } = createStream();
    const { FileDownloader } = await setup(true, stream, {});

    const downloader = new FileDownloader();
    const onProgress = vi.fn();
    const promise = downloader.downloadFile("http://file", "/tmp", "file.zip", onProgress);
    const rejection = promise.catch((err) => err);
    await new Promise((resolve) => setImmediate(resolve));
    emitData(Buffer.from("12345"));
    emitError();

    const error = await rejection;
    expect(error).toBeUndefined();
    expect(onProgress).toHaveBeenCalledWith({
      receivedBytes: 5,
      totalBytes: null,
      percent: null,
    });
  });
});
