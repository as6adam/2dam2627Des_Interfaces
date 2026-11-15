// Declaración mínima (el proyecto no depende de @types/node): solo la usan las pruebas para leer la hoja de estilos.
declare module 'node:fs' {
  export function readFileSync(path: URL, encoding: 'utf8'): string
}
