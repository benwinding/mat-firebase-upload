export function TrimSlashes(inputPath: string): string {
  return inputPath.replace(/^\/+|\/+$/g, '');
}
