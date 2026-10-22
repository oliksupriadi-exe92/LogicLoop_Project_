/**
 * Ambient type declarations for external dependencies
 * Memastikan TypeScript Language Server dapat memvalidasi modul tanpa error TS2307
 */

declare module "clsx" {
  export type ClassValue =
    | ClassArray
    | ClassDictionary
    | string
    | number
    | null
    | boolean
    | undefined;

  export interface ClassDictionary {
    [id: string]: boolean | number | string | null | undefined;
  }

  export type ClassArray = ClassValue[];

  export function clsx(...inputs: ClassValue[]): string;
  export default clsx;
}

declare module "tailwind-merge" {
  export function twMerge(...classLists: (string | undefined | null | false)[]): string;
}
