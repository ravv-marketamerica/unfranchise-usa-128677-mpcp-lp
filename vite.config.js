// vite.config.js
import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import path from "path";

import handlebars from "vite-plugin-handlebars";
import { loadLocaleData } from "./scripts/locale-loader.js";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteSingleFile } from "vite-plugin-singlefile";
import viteCssMediaQueryExtractor from "./plugins/vite-plugin-css-media-query-extractor";
import viteCssMediaQueryOptimizer from "./plugins/vite-plugin-css-media-query-optimizer";
import viteHtmlRenamer from "./plugins/vite-plugin-html-renamer";
import viteCssAtSupportExtractor from "./plugins/vite-plugin-css-@support-extractor";
import viteHtmlCleanup from "./plugins/vite-plugin-html-cleanup";
import viteCssPictureTransformer from "./plugins/vite-plugin-html-picture-transformer";
import viteCssAtSupportInjector from "./plugins/vite-plugin-css-@support-injector";
import viteCssAtSupportOptimizer from "./plugins/vite-plugin-css-@support-optimizer";
import viteCssMediaQueryInjector from "./plugins/vite-plugin-css-media-query-injector";
import viteCopyHtmlToDeliverables from "./plugins/vite-plugin-copy-html-to-deliverables";
import viteCleanDist from "./plugins/vite-plugin-clean-dist";
import viteHtmlPrettier from "./plugins/vite-plugin-html-prettier";

export default defineConfig(async ({ command, mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), "");

  // Load locale data based on environment language
  const currentLang = env.VITE_LANG || "en";
  const localeData = await loadLocaleData(currentLang);

  return {
    // vite start serves this file
    server: {
      open: env.VITE_OUTPUT_FILE_NAME,
    },
    // Copies public assets to dist
    build: {
      copyPublicDir: false,
    },
    // Sets base assets url in dist
    base: "/public/",
    css: {
      preprocessorOptions: {
        // removes scss deprecation warnings from console
        scss: {
          silenceDeprecations: ["import"],
          // passes data to scss
          additionalData: `
          $env-image-base-url: "${env.VITE_IMAGE_BASE_URL}";
          $env-jira-id: "${env.VITE_JIRA_ID}";
          $env-lang: "${env.VITE_LANG}";
          `,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      handlebars({
        partialDirectory: resolve(__dirname, "src/sections"),
        context: {
          image_base_url: env.VITE_IMAGE_BASE_URL,
          ...localeData,
        },
      }),
      createHtmlPlugin({
        minify: false,
      }),
      viteSingleFile(),
      viteCssMediaQueryExtractor(),
      viteCssMediaQueryOptimizer(),
      viteCssMediaQueryInjector(),
      viteCssAtSupportExtractor(),
      viteCssAtSupportOptimizer(),
      viteCssAtSupportInjector(),
      viteCssPictureTransformer(),
      // viteHtmlPrettier({
      //   htmlFile: "index.html",
      //   prettierOptions: {
      //     printWidth: 120,
      //   },
      // }),
      viteHtmlRenamer({
        newName: env.VITE_OUTPUT_FILE_NAME,
      }),
      viteHtmlCleanup(),
      viteCopyHtmlToDeliverables(),
      viteCleanDist(),
    ],
  };
});
