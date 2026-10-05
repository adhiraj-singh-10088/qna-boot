// server/scripts/migrate.js — idempotent schema setup for Inkspace features.
// Run: cd server && node scripts/migrate.js
// Safe to run repeatedly: checks information_schema before adding columns/tables.
import pool from '../utils/db.js';

async function columnExists(table, column) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column],
  );
  return rows[0].n > 0;
}

async function addColumn(table, column, ddl) {
  if (await columnExists(table, column)) {
    console.log(`  = ${table}.${column} (exists)`);
    return;
  }
  await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  console.log(`  + ${table}.${column}`);
}

const TABLES = {
  posts: `CREATE TABLE IF NOT EXISTS posts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500) NULL,
    content MEDIUMTEXT NOT NULL,
    category VARCHAR(50) NULL,
    tags JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    edited TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_posts_author (author_id),
    INDEX idx_posts_created (created_at)
  )`,
  likes: `CREATE TABLE IF NOT EXISTS likes (
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    INDEX idx_likes_user (user_id)
  )`,
  comments: `CREATE TABLE IF NOT EXISTS comments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comments_post (post_id),
    INDEX idx_comments_user (user_id)
  )`,
  bookmarks: `CREATE TABLE IF NOT EXISTS bookmarks (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    INDEX idx_bookmarks_post (post_id)
  )`,
  follows: `CREATE TABLE IF NOT EXISTS follows (
    follower_id INT NOT NULL,
    followee_id INT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'accepted',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    INDEX idx_follows_followee (followee_id),
    INDEX idx_follows_status (followee_id, status)
  )`,
  notifications: `CREATE TABLE IF NOT EXISTS notifications (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    actor_id INT NOT NULL,
    type VARCHAR(32) NOT NULL,
    post_id INT NULL,
    comment_id INT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user (user_id, is_read),
    INDEX idx_notifications_recent (user_id, created_at)
  )`,
};

async function main() {
  console.log('Migrating Inkspace schema…');
  console.log('users table columns:');
  await addColumn('users', 'full_name', 'VARCHAR(100) NULL');
  await addColumn('users', 'bio', 'VARCHAR(500) NULL');
  await addColumn('users', 'is_private', 'TINYINT(1) NOT NULL DEFAULT 0');
  console.log('tables:');
  for (const [name, ddl] of Object.entries(TABLES)) {
    await pool.query(ddl);
    console.log(`  ✓ ${name}`);
  }
  console.log('Migration complete.');
  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed:', e.code || '', e.message);
  process.exit(1);
});
