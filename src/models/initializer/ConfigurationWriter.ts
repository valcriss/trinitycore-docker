import path from "path";
import fs from "fs";
import configuration from "../configuration/AppConfiguration";
import IProfile from "../profiles/IProfile";

class ConfigurationWriter {

  private profile: IProfile;

  constructor(profile: IProfile) {
    this.profile = profile;
  }

  public writeAuthServerConfiguration() {
    const inputFilePath = path.resolve(__dirname, '../../resources/', this.profile.getSourceAuthConfigurationPath());
    const outputFilePath = this.profile.getAuthServerConfigurationPath();

    const replacements = {
      DATABASE_HOST: configuration.getDatabaseHost(),
      DATABASE_PORT: configuration.getDatabasePort(),
      DATABASE_USER: configuration.getDatabaseUser(),
      DATABASE_PASSWORD: configuration.getDatabasePassword(),
      EXTERNAL_IP_ADDRESS: configuration.getPublicIpAddress(),
    };

    const overrides = this.getEnvironmentOverrides('TC_AUTH__');
    return this.processConfiguration(inputFilePath, outputFilePath, replacements, overrides);
  }

  // Écrire la configuration pour WorldServer
  writeWorldServerConfiguration() {
    const inputFilePath = path.resolve(__dirname, '../../resources/', this.profile.getSourceWorldConfigurationPath());
    const outputFilePath = this.profile.getWorldServerConfigurationPath();

    const replacements = {
      DATABASE_HOST: configuration.getDatabaseHost(),
      DATABASE_PORT: configuration.getDatabasePort(),
      DATABASE_USER: configuration.getDatabaseUser(),
      DATABASE_PASSWORD: configuration.getDatabasePassword()
    };

    const overrides = this.getEnvironmentOverrides('TC_WORLD__');
    return this.processConfiguration(inputFilePath, outputFilePath, replacements, overrides);
  }

  private processConfiguration(
    inputFilePath: string,
    outputFilePath: string,
    replacements: Record<string, string | null>,
    overrides: Record<string, string> = {}
  ) {
    try {
      // Lire le contenu du fichier source
      let content = fs.readFileSync(inputFilePath, 'utf8');

      // Remplacer les placeholders par les valeurs fournies
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`<${placeholder}>`, 'g'), value || '');
      }

      content = this.applyOverrides(content, overrides);

      // Créer le répertoire de destination s'il n'existe pas
      const outputDir = path.dirname(outputFilePath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Écrire le fichier modifié dans le chemin de destination
      fs.writeFileSync(outputFilePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error(`Error processing configuration file: ${error}`);
      return false;
    }
  }

  private getEnvironmentOverrides(prefix: string): Record<string, string> {
    const overrides: Record<string, string> = {};

    for (const [envKey, value] of Object.entries(process.env)) {
      if (!envKey.startsWith(prefix) || value === undefined) {
        continue;
      }

      const rawConfigKey = envKey.slice(prefix.length);
      if (!rawConfigKey) {
        continue;
      }

      const configKey = rawConfigKey.replace(/__/g, '.');
      overrides[configKey] = value;
    }

    return overrides;
  }

  private applyOverrides(content: string, overrides: Record<string, string>): string {
    let updatedContent = content;

    for (const [configKey, value] of Object.entries(overrides)) {
      const escapedKey = configKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const linePattern = new RegExp(`^(\\s*${escapedKey}\\s*=\\s*).*$`, 'm');

      if (linePattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(linePattern, `$1${value}`);
      } else {
        const separator = updatedContent.endsWith('\n') ? '' : '\n';
        updatedContent = `${updatedContent}${separator}${configKey} = ${value}\n`;
      }
    }

    return updatedContent;
  }
}

export default ConfigurationWriter;