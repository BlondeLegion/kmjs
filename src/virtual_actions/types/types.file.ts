//FILE: src/virtual_actions/types/types.file.ts

/**
 * Supported file operations for file actions (canonical XML values).
 *
 * One-string operations:
 *   - Reveal
 *   - Duplicate
 *   - Trash
 *   - Delete
 *   - RecursiveDelete (DANGEROUS: Recursively deletes directory and all contents)
 *
 * Two-string operations:
 *   - CreateUnique
 *   - OnlyMove (Move only, no rename)
 *   - OnlyRename (Rename only, no move)
 *   - Move (Move and/or rename)
 *   - Copy
 *
 * WARNING: The "RecursiveDelete" operation is dangerous and will recursively delete all contents of the specified directory.
 * Use with extreme caution. Always validate paths and test with non-critical data first.
 */
export type FileOperation =
  | "Reveal"
  | "CreateUnique"
  | "OnlyMove"
  | "OnlyRename"
  | "Move"
  | "Copy"
  | "Duplicate"
  | "Trash"
  | "Delete"
  | "RecursiveDelete";
