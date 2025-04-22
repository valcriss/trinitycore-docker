import fs from 'fs';
import axios from 'axios';
import { promisify } from 'util';

const existDir = promisify(fs.exists);
const createDir = promisify(fs.mkdir);

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

      const dir = await existDir(path);

      if (!dir) {
          await createDir(path);
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