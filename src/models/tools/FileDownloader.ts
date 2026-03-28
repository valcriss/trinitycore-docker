import fs from 'fs';
import axios from 'axios';

type ProgressHandler = (progress: { receivedBytes: number; totalBytes: number | null; percent: number | null }) => void;

class FileDownloader {
  /**
   * @description Download a file using URL
   *
   * @param {String} url URL to download the file
   * @param {String} path Folder path to save the file
   * @param {String} name File name
   */

  async downloadFile(url:string, path:string, name:string, onProgress: ProgressHandler | null = null) {
      const response = await axios.get(url, { responseType: 'stream' });
      const totalBytesHeader = response.headers?.['content-length'];
      const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : null;
      let receivedBytes = 0;

      const dir = fs.existsSync(path);

      if (!dir) {
          await fs.promises.mkdir(path, { recursive: true });
      }

      response.data.pipe(fs.createWriteStream(`${path}/${name}`));

      response.data.on('data', (chunk: Buffer) => {
          receivedBytes += chunk.length;
          if (onProgress) {
              onProgress({
                  receivedBytes,
                  totalBytes,
                  percent: totalBytes ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : null,
              });
          }
      });

      return new Promise<void>((resolve, reject) => {
          response.data.on('end', () => {
              resolve();
          });

          response.data.on('error', () => {
              reject();
          });
      });
  }
}

export default FileDownloader;
