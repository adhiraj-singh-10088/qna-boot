import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

function getDbConfig() {
  const dbConfig = {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '3qo6Ui3yNDZnDmb.root',
    password: 'QuMFy9zz0DJgpmHX',
    database: 'qna',
    port: 4000,
  };

  const rawUrl = process.env.DATABASE_URL ||
                 process.env.MYSQL_URL ||
                 process.env.TIDB_DATABASE_URL ||
                 process.env.TIDB_URL;

  if (rawUrl) {
    try {
      const u = new URL(rawUrl.replace(/^mysql2:\/\//, 'mysql://'));
      if (u.hostname) dbConfig.host = u.hostname;
      if (u.port) dbConfig.port = Number(u.port);
      if (u.username) dbConfig.user = decodeURIComponent(u.username);
      if (u.password) {
        const p = decodeURIComponent(u.password);
        if (p && !p.includes('<PASSWORD>') && !p.includes('YOUR_PASSWORD') && p !== 'your-db-password') {
          dbConfig.password = p;
        }
      }
      const db = u.pathname.replace(/^\//, '');
      if (db) dbConfig.database = db;
    } catch (e) {
      console.warn('Failed to parse database URL, falling back to individual variables:', e.message);
    }
  }

  if (process.env.DB_HOST) dbConfig.host = process.env.DB_HOST;
  if (process.env.DB_PORT) dbConfig.port = Number(process.env.DB_PORT);
  if (process.env.DB_USER) dbConfig.user = process.env.DB_USER;
  if (process.env.DB_PASSWORD) {
    const p = process.env.DB_PASSWORD;
    if (p && !p.includes('<PASSWORD>') && p !== 'YOUR_NEW_TIDB_PASSWORD' && p !== 'your-db-password') {
      dbConfig.password = p;
    }
  }
  if (process.env.DB_NAME) dbConfig.database = process.env.DB_NAME;

  return dbConfig;
}

const config = getDbConfig();

const pool = mysql.createPool({
  host:               config.host,
  user:               config.user,
  password:           config.password,
  database:           config.database,
  port:               config.port,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 10000,
  connectTimeout:     20000,
  timezone:           'Z', // interpret DATETIME/TIMESTAMP values as UTC
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }
});

export default pool;
