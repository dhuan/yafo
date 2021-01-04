import { Value, FieldValidator, FieldValidationResult } from "./types"
import { parseCheckboxFormValue } from "./utils"

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

const maxLength =
    <T>(length: number, errorMessage: string): FieldValidator<T> => (value: Value, _: (id: T) => Value): FieldValidationResult =>
{
    const valid = typeof value === "string" && (value as string).length <= length

    return [ valid, valid ? "" : errorMessage ]
}

const checkBoxMin = <T>(min: number, errorMessage: string): FieldValidator<T> => (chosenOptions: Value) => {
    const valid = parseCheckboxFormValue(chosenOptions as string).length >= min

    return [ valid, valid ? "" : errorMessage, ]
}

export const all =
    <T>(validators: FieldValidator<T>[]): FieldValidator<T> => (value: Value, formValue: (id: T) => Value): FieldValidationResult =>
{
    if (validators.length === 0)
        return [ true, "" ]

    const validator = validators[0]

    const [ result, errorMessage ] = validator(value, formValue)

    if (!result)
        return [ false, errorMessage ]

    return all(validators.slice(1))(value, formValue as any)
}

const validate = {
    all,
    regex,
    equalsField,
    minLength,
    maxLength,
    checkbox: {
        min: checkBoxMin
    }
}

export { validate }
