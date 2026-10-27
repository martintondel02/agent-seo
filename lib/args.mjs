export function parseArgs(argv) {
  const positional = [];
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      positional.push(...argv.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const without = arg.slice(2);
      const eq = without.indexOf("=");
      if (eq !== -1) {
        flags[without.slice(0, eq)] = without.slice(eq + 1);
      } else if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
        flags[without] = argv[++i];
      } else {
        flags[without] = true;
      }
      continue;
    }
    positional.push(arg);
  }

  return { positional, flags };
}

export function numberFlag(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function boolFlag(value) {
  return value === true || value === "true" || value === "1" || value === "yes";
}
