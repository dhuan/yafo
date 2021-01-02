export const replaceNth = <T>(list: T[], index: number, newValue: T): T[] =>
    list.map((value: T, i: number) => i === index ? newValue : value);

export const allEqual = <T>(value: T, list: T[]): boolean => {
    const current = list[0];

    if (list.length === 0)
        return false;

    if (current !== value)
        return false;

    if (list.length === 1)
        return true;

    return allEqual(value, list.slice(1));
}

export const unzip = <A, B>(list: [ A, B ][], result: [ A[], B[] ] = [ [], [] ]): [ A[], B[] ] => {
    if (list.length === 0)
        return result;

    const [ a, b ] = list[0];

    const newResult = [ ( result[0] || [] ).concat(a) as A[], ( result[1] || [] ).concat(b) as B[] ];

    return unzip(list.slice(1), newResult as [ A[], B[] ]);
}

export const tupleToMap = <A, B>(tuples: [A, B][], map: Map<A, B>): Map<A, B> => {
    if (tuples.length === 0)
        return map;

    const [ a, b ] = tuples[0];

    map.set(a, b);

    return tupleToMap(tuples.slice(1), map);
}

export const toNumber = (value: string | number): number => {
    if (typeof value === "number")
        return value

    return parseInt(value, 10)
}

export const parseCheckboxFormValue = (value: string): number[] => {
    if (value === "")
        return []

    return value.split(",").map(toNumber)
}

export const removeNth = <T>(list: T[], iToRemove: number): T[]  =>
    list.filter((_, i) => i !== iToRemove)

export const serializeCheckboxValue = (checkboxValue: number[], i: number, checked: boolean): string => {
    const newValue = (() => {
        const position = checkboxValue.indexOf(i)
        const exists = position > -1

        if (!exists && checked)
            return checkboxValue.concat(i)

        if (exists && !checked)
            return removeNth(checkboxValue, position)

        return checkboxValue
    })()

    return newValue.join(",")
}

export const mapGetter = <Key, Value>(map: Map<Key, Value>, errorMessage: string) => (key: Key): Value => {
    if (!map.has(key))
        throw new Error(errorMessage)

    return map.get(key) as Value
}
