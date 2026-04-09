export function createSqlitePublicContentRepository() {
  throw new Error(
    "SQLite repository is not wired yet. Install a SQLite adapter and switch the repository factory in a later migration stage.",
  );
}
