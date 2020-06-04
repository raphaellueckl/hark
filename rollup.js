const babel = require("rollup-plugin-babel");
const copy = require("rollup-plugin-copy");

export default [
  {
    input: "src/index.js",
    output: {
      file: "./dist/index.js",
      format: "iife",
    },
    plugins: [
      babel(),
      copy({
        targets: [
          { src: "src/index.html", dest: "dist" },
          { src: "src/assets", dest: "dist" },
          { src: "src/service-worker.js", dest: "dist" },
        ],
      }),
    ],
  },
];
