import { Value, FieldValidator, FieldValidationResult } from "./types"

const regex = <T>(regex: RegExp, errorMessage: string): FieldValidator<T> => (value: Value): [ boolean, string ] => {
    if (typeof value === "string" && regex.test(value as string))
        return [ true, "" ]

    return [ false, errorMessage ]
}

const equalsField =
    <T>(fieldId: T, errorMessage: string): FieldValidator<T> => (value: Value, getFieldValue: (id: T) => Value): FieldValidationResult =>
{
    if (getFieldValue(fieldId) === value)
        return [ true, "" ]

    return [ false, errorMessage ]
}

const minLength =
    <T>(length: number, errorMessage: string): FieldValidator<T> => (value: Value, _: (id: T) => Value): FieldValidationResult =>
{
    const valid = typeof value === "string" && (value as string).length >= length

    return [ valid, valid ? "" : errorMessage ]
}

const validators = {
    regex,
    equalsField,
    minLength,
}

export { validators }
