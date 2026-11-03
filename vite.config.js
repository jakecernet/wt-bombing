import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		babel({
			presets: [reactCompilerPreset()],
		}),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: "script-defer",
			manifest: {
				name: "WT bombing chart",
				short_name: "WT bombing",
				description:
					"How many bases can your War Thunder plane destroy?",
				theme_color: "#090b10",
				background_color: "#090b10",
			},
		}),
	],
	server: {
		port: 3000,
		open: true,
	},
	base: "./",
	build: {
		outDir: "dist",
		sourcemap: true,
		emptyOutDir: true,
	},
});
