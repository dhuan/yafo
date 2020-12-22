import React from 'react';

export enum FieldType { TEXT, SELECT, RADIO, CHECKBOX }

export type FieldCustomOptions = Record<string, any>

export type FieldComponentProps = {
    inputId        : string
    label          : string
    value          : Value
    disabled       : boolean
    onChange       : OnChangeValueFunc
    errorMessage   : string
    options        : string[]
    custom         : FieldCustomOptions
}

export type FieldOption = string | boolean | number | string[]

export type FieldValidationResult = [ boolean, string ]

export type FieldValidator = <T>(value: Value, formValue: (id: T) => Value) => FieldValidationResult

export type Field<T> = {
    id         : T
    label      : string
    type       : FieldType
    valid      : FieldValidator
    initial    : Value
    disabled?  : boolean
    options?   : string[]
    custom?    : FieldCustomOptions
}

export type OnChangeValueFunc = (newValue: Value) => void

export type ValueFunc = <T>(id: T) => Value

export type ValidateFormFunc = () => boolean

export type Value = string | number

export type Props<T> =  {
    fieldComponents        : Map<T, React.ReactElement>
    dirty                  : boolean
    validate               : ValidateFormFunc
    valid                  : boolean
    value                  : ValueFunc
    showErrorMessages      : () => void
    hideErrorMessages      : () => void
    disable                : VoidFunction
    enable                 : VoidFunction
    setValues              : (values: Map<T, Value>) => void
    setEnterHandler        : (window: Window, handler: VoidFunction) => void
    getInvalidFields       : () => T[]
}

export type FieldComponent = React.FunctionComponent<FieldComponentProps>

export type FieldCollection = Map<FieldType, FieldComponent>
