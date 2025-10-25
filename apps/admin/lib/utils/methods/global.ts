export async function retryQuery<R>(
  fn: () => Promise<R>,
  retries = 3,
  delayMs = 1000
): Promise<R> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      attempt += 1;
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

export const omitExtraAttributes = <T extends object>(
  obj: Partial<T>,
  schema: T
): T => {
  const validKeys = Object.keys(schema) as Array<keyof T>;
  const filteredObj = {} as T;

  validKeys.forEach((key) => {
    if (key in obj) {
      filteredObj[key] = obj[key] as T[keyof T];
    }
  });

  return filteredObj;
};