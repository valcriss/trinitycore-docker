import fs from 'fs';
import axios from 'axios';

class FileDownloader {
  /**
   * @description Download a file using URL
   *
   * @param {String} url URL to download the file
   * @param {String} path Folder path to save the file
   * @param {String} name File name
   */

  async downloadFile(url:string, path:string, name:string) {
      const response = await axios.get(url, { responseType: 'stream' });

      const dir = fs.existsSync(path);

      if (!dir) {
          await fs.promises.mkdir(path, { recursive: true });
      }

      response.data.pipe(fs.createWriteStream(`${path}/${name}`));

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
