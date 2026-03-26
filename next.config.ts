import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: currentDirectory
};

export default nextConfig;
