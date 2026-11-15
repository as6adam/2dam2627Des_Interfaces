// Tipos mínimos para importar el verificador desde las pruebas (el script es JavaScript sin dependencias).
export function resolveRef(from: string, ref: string): string | null
export function checkDistFiles(files: Record<string, string | Uint8Array>, opts?: { base?: string }): { errors: string[]; checks: string[] }
