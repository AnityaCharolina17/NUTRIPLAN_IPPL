// Shims for accidental imports that include a package version suffix (e.g. "lucide-react@0.487.0")
// This prevents TypeScript errors in the editor while we correct the real import paths.

declare module '*@*' {
  const anything: any;
  export default anything;
  export = anything;
}
