import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "OldCrux",
  version: packageJson.version,
  copyright: `© ${currentYear}, OldCrux`,
  meta: {
    title: "OldCrux",
    description:
      "OldCrux",
  },
};
