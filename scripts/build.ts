import { $ } from "bun";

await $`bun --filter='@vtaits/filterlist' run build`;
await Promise.all([
  await $`bun --filter='@vtaits/qwik-filterlist' run build`,
  await $`bun --filter='@vtaits/react-filterlist' run build`,
]);
await Promise.all([
  await $`bun --filter='@vtaits/react-filterlist-router' run build`,
  await $`bun --filter='@vtaits/react-filterlist-router-5' run build`,
]);

