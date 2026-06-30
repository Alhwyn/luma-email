const LUMA_SDK_REPO = "https://github.com/Alhwyn/luma.git";
const VENDOR_DIR = `${import.meta.dir}/../vendor/luma`;

async function setupLumaSdk(): Promise<void> {
  const vendorExists = await Bun.file(`${VENDOR_DIR}/src/index.ts`).exists();
  if (vendorExists) {
    console.log("@alhwyn/luma SDK already present in vendor/luma");
    return;
  }

  console.log("Cloning @alhwyn/luma SDK into vendor/luma...");
  const proc = Bun.spawn(["git", "clone", "--depth", "1", LUMA_SDK_REPO, VENDOR_DIR], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error("Failed to clone @alhwyn/luma SDK");
  }

  const packagePath = `${VENDOR_DIR}/package.json`;
  const pkg = await Bun.file(packagePath).json();
  delete pkg.dependencies;
  await Bun.write(packagePath, JSON.stringify(pkg, null, 2));

  console.log("Installed @alhwyn/luma SDK to vendor/luma");
}

await setupLumaSdk();
