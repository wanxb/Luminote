export function createSqliteAdminContentRepository() {
  throw new Error(
    "SQLite admin repository is not wired yet. Install a SQLite adapter and switch the repository factory in a later migration stage.",
  );
}
