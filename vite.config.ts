"use strict";

import "adaptive-extender/node";
import { defineConfig } from "vite";
import { DefaultMirroringConfig } from "./build/configs/default-mirroring-config.js";

const root = new URL(".", import.meta.url);
const config = await DefaultMirroringConfig.construct(root);
export default defineConfig(config.build());
