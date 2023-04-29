import type { StorybookConfig } from "@storybook/react-webpack5";
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../app/components/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ['../public'],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions", {
      name: '@storybook/addon-styling',
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: true
      }
    }
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config, { configType }) => {
       config.resolve.plugins = [new TsconfigPathsPlugin()];
       return config;
  }
};

export default config;
