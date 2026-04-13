import { defineConfig } from "vite";
import vinext from "vinext";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  plugins: [
    vinext(),
    command === "build" ? nitro({ preset: "aws-lambda" }) : undefined
  ],
}));
