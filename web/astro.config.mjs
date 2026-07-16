// @ts-check
import { defineConfig } from 'astro/config';

// Czysta statyka: `astro build` generuje gotowy HTML/CSS/JS.
// outDir konfigurowalny przez ASTRO_OUT_DIR — builder kieruje wynik do
// katalogu wewnątrz kontenera (szybki fs), zamiast na bind-mount z Windows
// (na mount z Windows czyszczenie starego dist/ potrafi się wieszać).
export default defineConfig({
  output: 'static',
  outDir: process.env.ASTRO_OUT_DIR || './dist',
});
