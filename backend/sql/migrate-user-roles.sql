USE reserve_me;

SELECT COUNT(*)
INTO @role_column_exists
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'users'
  AND column_name = 'role';

SET @role_migration = IF(
  @role_column_exists = 0,
  'ALTER TABLE users ADD COLUMN role ENUM(''student'', ''teacher'', ''admin'') NULL',
  'SELECT 1'
);

PREPARE role_migration_statement FROM @role_migration;
EXECUTE role_migration_statement;
DEALLOCATE PREPARE role_migration_statement;

UPDATE users
SET role = 'teacher'
WHERE role IS NULL;

ALTER TABLE users
  MODIFY COLUMN role ENUM('student', 'teacher', 'admin') NOT NULL;
