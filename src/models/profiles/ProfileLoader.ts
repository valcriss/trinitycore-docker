import IProfile from "./IProfile";
import Profile1110 from "./Profile1110";
import Profile335 from "./Profile335";
import Profile442 from "./Profile442";

class ProfileLoader {
  public static loadProfile(): IProfile {
    const version: string | null = process.env.TRINITYCORE_VERSION || null;
    switch (version) {
      case '3.3.5':
        return new Profile335();
      case '4.4.2':
        return new Profile442();
      case '11.1.0':
        return new Profile1110();
      default:
        throw new Error(`Unsupported version: ${version}`);
    }
  }
}

export default ProfileLoader;