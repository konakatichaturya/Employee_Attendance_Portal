import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import type { AttendanceRecord } from '../../types';

let dbPromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('attendance.db');
  }
  return dbPromise;
}

export async function initDb(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      checkInTime TEXT,
      checkOutTime TEXT,
      checkInLat REAL,
      checkInLng REAL,
      checkOutLat REAL,
      checkOutLng REAL,
      status TEXT NOT NULL,
      workingHours REAL
    );
  `);
}

function rowToRecord(row: any): AttendanceRecord {
  return {
    id: row.id,
    date: row.date,
    checkInTime: row.checkInTime,
    checkOutTime: row.checkOutTime,
    checkInLocation:
      row.checkInLat != null && row.checkInLng != null
        ? { latitude: row.checkInLat, longitude: row.checkInLng }
        : null,
    checkOutLocation:
      row.checkOutLat != null && row.checkOutLng != null
        ? { latitude: row.checkOutLat, longitude: row.checkOutLng }
        : null,
    status: row.status,
    workingHours: row.workingHours,
  };
}

export async function upsertAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const r of records) {
      await db.runAsync(
        `INSERT OR REPLACE INTO attendance
          (id, date, checkInTime, checkOutTime, checkInLat, checkInLng, checkOutLat, checkOutLng, status, workingHours)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.date,
          r.checkInTime,
          r.checkOutTime,
          r.checkInLocation?.latitude ?? null,
          r.checkInLocation?.longitude ?? null,
          r.checkOutLocation?.latitude ?? null,
          r.checkOutLocation?.longitude ?? null,
          r.status,
          r.workingHours,
        ],
      );
    }
  });
}

export async function getCachedAttendance(fromDate?: string): Promise<AttendanceRecord[]> {
  if (Platform.OS === 'web') {
    return [];
  }
  const db = await getDb();
  const rows = fromDate
    ? await db.getAllAsync(`SELECT * FROM attendance WHERE date >= ? ORDER BY date DESC`, [fromDate])
    : await db.getAllAsync(`SELECT * FROM attendance ORDER BY date DESC`);
  return rows.map(rowToRecord);
}
