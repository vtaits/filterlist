await Bun.build({
	entrypoints: ["src/index.ts", "src/dataStores/string.ts"],
	outdir: "dist",
	sourcemap: "linked",
    packages: "external",
});

export {};
