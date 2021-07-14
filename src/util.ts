
/**
 * From: https://dev.to/jorik/country-code-to-flag-emoji-a21
 */
export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * From: https://stackoverflow.com/a/37826698
 */
export function chunkedArray<T>(inputArray: T[], perChunk: number): T[][] {
  // var perChunk = 2 // items per chunk    
  // var inputArray = ['a','b','c','d','e']

  var result = inputArray.reduce<T[][]>((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/perChunk)

    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  return result;
}


/**
 * Extract the value from an object by a key (or nested keys), and return a default value if that value is missing
 */
export function extract(obj: {[key: string]: any}, key: string | string[], defaultValue: any): any {
  if(Array.isArray(key)) {
    if(key.length === 0) {
      throw `This shouldn't happen`;
    }
    if(key.length === 1) {
      // Extract this only key left
      return extract(obj, key[0], defaultValue);
    }
    else if(key.length > 1) {
      // If current key doesn't exist, return defaultValue
      if(obj[key[0]] === undefined) {
        return defaultValue;
      }
      else {
        // Otherwise, recurse to next key
        return extract(obj[key[0]], key.slice(1), defaultValue)
      }
    }
  }
  else {
    // If value is nullish, return defaultValue instead
    return (obj[key] === undefined || obj[key] === null) ? defaultValue : obj[key];
  }
}

export function existsInside<T>(array: T[], predicate: (value: T, index: number, obj: T[]) => unknown) {
  return array.findIndex(predicate) >= 0;
}

export async function translate(endpoint: string, text: string[], from: string, to: string, siteName: string): Promise<string[]> {
  const res = await fetch(`${endpoint}?from=${from}&to=${to}&siteName=${siteName}`, {
    method: 'POST',
    body: JSON.stringify(text),
    headers: {
      'Content-Type': 'application/json'
    },
  });
  const data = await res.json();
  // check types
  if(Array.isArray(data) && data.every(e => typeof e === 'string')) {
    return data
  }
  else {
    throw `Data returned from endpoint was not of type string[] (Endpoint: ${endpoint}), data: ${JSON.stringify(data)}`
  }
}