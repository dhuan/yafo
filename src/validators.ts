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

const validators = {
    regex,
    equalsField,
}

export { validators }
