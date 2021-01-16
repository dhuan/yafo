import { Value, FieldValidator, FieldValidationResult } from "./types"
import { parseCheckboxFormValue, toNumber } from "./utils"

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

const equals =
    <T>(expectedValue: Value, errorMessage: string): FieldValidator<T> => (value: Value, getFieldValue: (id: T) => Value): FieldValidationResult =>
{
    const valid = expectedValue === value

    return [ valid, valid ? "" : errorMessage ]
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

const min =
    <T>(desiredMinimum: number, errorMessage: string): FieldValidator<T> => (value: Value, getValue: (id: T) => Value): FieldValidationResult =>
{
    if (typeof value !== "number")
        return min(desiredMinimum, errorMessage)(toNumber(value), getValue as any)

    const valid = (value as number) >= desiredMinimum

    return [ valid, valid ? "" : errorMessage ]
}

const max =
    <T>(desiredMax: number, errorMessage: string): FieldValidator<T> => (value: Value, getValue: (id: T) => Value): FieldValidationResult =>
{
    if (typeof value !== "number")
        return max(desiredMax, errorMessage)(toNumber(value), getValue as any)

    const valid = (value as number) <= desiredMax

    return [ valid, valid ? "" : errorMessage ]
}

const checkBoxMin = <T>(min: number, errorMessage: string): FieldValidator<T> => (chosenOptions: Value) => {
    const valid = parseCheckboxFormValue(chosenOptions as string).length >= min

    return [ valid, valid ? "" : errorMessage, ]
}

const all =
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

const any =
    <T>(validators: FieldValidator<T>[], errorMessage: string): FieldValidator<T> => (value: Value, formValue: (id: T) => Value): FieldValidationResult =>
{
    if (validators.length === 0)
        return [ false, errorMessage ]

    const validator = validators[0]

    const [ result ] = validator(value, formValue)

    if (result)
        return [ true, "" ]

    return any(validators.slice(1), errorMessage)(value, formValue as any)
}

const none = <T>(_value: Value, _formValue: (id: T) => Value): FieldValidationResult =>
    [ true, "" ]

const range = <T>(from: number, to: number, errorMessage: string): FieldValidator<T> => all([
    min(from, errorMessage),
    max(to, errorMessage),
])

const notEmpty = <T>(errorMessage: string) => (value: Value, _formValue: (id: T) => Value): FieldValidationResult => {
    if (typeof value !== "string")
        throw new Error("Tried to validate 'notEmpty' with a non-text form value.")

    const valid = (value as string).trim() !== ""

    return [ valid, valid ? "" : errorMessage ]
}

const validate = {
    none,
    all,
    any,
    regex,
    equalsField,
    equals,
    minLength,
    maxLength,
    min,
    max,
    range,
    notEmpty,
    checkbox: {
        min: checkBoxMin
    }
}

export { validate }
