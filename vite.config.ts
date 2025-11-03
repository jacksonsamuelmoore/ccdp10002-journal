import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { resolve } from "node:path";
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tanstackStart(),
    nitroV2Plugin(/*
      // nitro config goes here, e.g.
      { preset: 'node-server' }
    */),
		viteReact(),
		tailwindcss(),
	],
	test: {
		globals: true,
		environment: "jsdom",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
	},
});
