import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { resolve } from "node:path";
import { nitro } from "nitro/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tanstackStart(),
		nitro(
			/*
      // nitro config goes here, e.g.
      { config: { preset: 'node-server' } }
    */
		),
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
