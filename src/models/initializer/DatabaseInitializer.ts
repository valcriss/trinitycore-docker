import Database from "../database/Database";
import configuration from '../configuration/AppConfiguration';
import path from "path";
import fs from 'fs';
import https from 'https';
import IProfile from "../profiles/IProfile";
import FileDownloader from "../tools/FileDownloader";
import CommandExecuter from "../tools/CommandExecuter";

class DatabaseInitializer {
  private database: Database;
  private profile: IProfile;

  constructor(database: Database, profile: IProfile) {
    this.database = database;
    this.profile = profile;
  }

  async initialize() {
    try {
      const inputFilePath = path.resolve(__dirname, '../../resources/' + this.profile.getInitializeDatabasePath());
      const replacements = {
        DATABASE_USER: configuration.getDatabaseUser(),
        DATABASE_PASSWORD: configuration.getDatabasePassword(),
      };
      let content = fs.readFileSync(inputFilePath, 'utf8');
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`<${placeholder}>`, 'g'), value || '');
      }

      const sqlStatements = content.split(';').filter(statement => statement.trim() !== '');
      for (const sql of sqlStatements) {
        await this.database.execute('root', sql);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async downloadInitialData() {
    try {
      const searchPattern = this.profile.getInitialDatabaseNamePattern();
      const commandExecuter = new CommandExecuter();
      const releases: Array<GithubRelease> = await this.fetchTrinityCoreReleases();
      const latestRelease = releases.find(release => release.assets[0]?.name.startsWith(searchPattern));
      if (!latestRelease) {
        throw new Error("No release found with a name starting with '" + searchPattern + "'");
      }
      const downloadUrl = latestRelease.assets[0].browser_download_url;
      const filename = latestRelease.assets[0].name;

      let fileDownloader = new FileDownloader();
      await fileDownloader.downloadFile(downloadUrl, '/app/server/bin', filename);

      const extractPath = '/app/server/bin/';

      let result = await commandExecuter.execute(`/usr/bin/7z`, [`x`, `/app/server/bin/${filename}`, `-o${extractPath}`, `-y`], '/app/server/bin');
      if (!result) {
        return false;
      }

      fs.unlinkSync('/app/server/bin/' + filename);

      return true;
    } catch (error) {
      return false;
    }
  }

  public async updateApplicationDatabase() {
    const commandExecuter = new CommandExecuter();
    return await commandExecuter.execute(`/app/server/bin/worldserver`, [`-u`], '/app/server/bin');
  }

  public async updateRealmInformations() {
    try {
      const sql = `UPDATE realmlist SET name = ?, address = ? WHERE id = ?`;
      const params = [
        configuration.getRealmName() || 'TrinityCore',
        configuration.getPublicIpAddress() || '127.0.0.1',
        1
      ];
      await this.database.execute('auth', sql, params);
      return true;
    }
    catch (error) {
      console.error('Error updating realm informations:', error);
      return false;
    }
  }

  private async fetchTrinityCoreReleases(): Promise<Array<GithubRelease>> {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/TrinityCore/TrinityCore/releases',
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Node.js'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (error) {
            reject(new Error('Erreur lors du parsing JSON'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error('Erreur lors de la requête HTTPS'));
      });

      req.end();
    });
  }
}

export default DatabaseInitializer;