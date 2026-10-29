import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		babel(
			{
				presets: [reactCompilerPreset()],
			},
			VitePWA({
				registerType: "autoUpdate",
				injectRegister: "script-defer",
				manifest: {
					name: "My App",
					short_name: "App",
					description: "My App Description",
					theme_color: "#ffffff",
				},
			}),
		),
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
