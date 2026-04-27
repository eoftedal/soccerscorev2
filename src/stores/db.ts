import { toRaw } from "vue";

const DB_NAME = "soccerscore";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      for (const name of ["logos", "teams", "matches"]) {
        if (!database.objectStoreNames.contains(name)) {
          database.createObjectStore(name, { keyPath: "id" });
        }
      }
      if (!database.objectStoreNames.contains("meta")) {
        database.createObjectStore("meta");
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

export const dbReady = openDB();

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await dbReady;
  return promisify(
    db.transaction(storeName, "readonly").objectStore(storeName).getAll() as IDBRequest<T[]>,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function idbPut(storeName: string, value: any): Promise<void> {
  const db = await dbReady;
  // toRaw unwraps Vue reactive proxies, which the structured clone algorithm cannot serialize
  await promisify(db.transaction(storeName, "readwrite").objectStore(storeName).put(toRaw(value)));
}

export async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await dbReady;
  await promisify(db.transaction(storeName, "readwrite").objectStore(storeName).delete(key));
}

export async function idbGetMeta(key: string): Promise<string | undefined> {
  const db = await dbReady;
  return promisify(
    db.transaction("meta", "readonly").objectStore("meta").get(key) as IDBRequest<
      string | undefined
    >,
  );
}

export async function idbSetMeta(key: string, value: string): Promise<void> {
  const db = await dbReady;
  await promisify(db.transaction("meta", "readwrite").objectStore("meta").put(value, key));
}
