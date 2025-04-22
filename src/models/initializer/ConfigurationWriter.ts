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
    const inputFilePath = path.resolve(__dirname, '../../resources/' + this.profile.getSourceAuthConfigurationPath);
    const outputFilePath = this.profile.getAuthServerConfigurationPath();

    const replacements = {
      DATABASE_HOST: configuration.getDatabaseHost(),
      DATABASE_PORT: configuration.getDatabasePort(),
      DATABASE_USER: configuration.getDatabaseUser(),
      DATABASE_PASSWORD: configuration.getDatabasePassword()
    };

    return this.processConfiguration(inputFilePath, outputFilePath, replacements);
  }

  // Écrire la configuration pour WorldServer
  writeWorldServerConfiguration() {
    const inputFilePath = path.resolve(__dirname, '../../resources/' + this.profile.getSourceWorldConfigurationPath());
    const outputFilePath = this.profile.getWorldServerConfigurationPath();

    const replacements: Record<string, string | null> = {
      "DATABASE_HOST": configuration.getDatabaseHost(),
      "DATABASE_PORT": configuration.getDatabasePort(),
      "DATABASE_USER": configuration.getDatabaseUser(),
      "DATABASE_PASSWORD": configuration.getDatabasePassword(),
    };

    return this.processConfiguration(inputFilePath, outputFilePath, replacements);
  }

  private processConfiguration(inputFilePath: string, outputFilePath: string, replacements: Record<string, string | null>) {
    try {
      // Lire le contenu du fichier source
      let content = fs.readFileSync(inputFilePath, 'utf8');

      // Remplacer les placeholders par les valeurs fournies
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`<${placeholder}>`, 'g'), value || '');
      }

      // Créer le répertoire de destination s'il n'existe pas
      const outputDir = path.dirname(outputFilePath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Écrire le fichier modifié dans le chemin de destination
      fs.writeFileSync(outputFilePath, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default ConfigurationWriter;