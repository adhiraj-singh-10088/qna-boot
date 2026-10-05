import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  user: process.env.DB_USER || '3qo6Ui3yNDZnDmb.root',
  password: process.env.DB_PASSWORD || 'QuMFy9zz0DJgpmHX',
  database: process.env.DB_NAME || 'qna',
  port: process.env.DB_PORT || 4000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z', // interpret DATETIME/TIMESTAMP values as UTC (fixes the 5h30m relative-time offset)
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});


export default pool;
