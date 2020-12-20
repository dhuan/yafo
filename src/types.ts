import React from 'react';

export enum FormFieldType { TEXT, SELECT, RADIO, CHECKBOX }

export type FormFieldComponentProps = {
    inputId        : string
    label          : string
    value          : FormValue
    disabled       : boolean
    onChange       : OnChangeFormValueFunc
    errorMessage   : string
    options        : FormFieldOptions
}

export type FormFieldOption = string | boolean | number | string[]

export type FormFieldOptions = Record<string, FormFieldOption>

export type FieldValidationResult = [ boolean, string ]

export type FieldValidator = <T>(value: FormValue, formValue: (id: T) => FormValue) => FieldValidationResult

export type FormField<T> = {
    id         : T
    label      : string
    type       : FormFieldType
    valid      : FieldValidator
    initial    : FormValue
    options?   : FormFieldOptions
    disabled?  : boolean
}

export type OnChangeFormValueFunc = (newValue: FormValue) => void

export type FormValueFunc = <T>(id: T) => FormValue

export type ValidateFormFunc = () => boolean

export type FormValue = string | number

export type FormProps<T> =  {
    fieldComponents        : Map<T, React.ReactElement>
    dirty                  : boolean
    validate               : ValidateFormFunc
    valid                  : boolean
    value                  : FormValueFunc
    showErrorMessages      : () => void
    hideErrorMessages      : () => void
    disable                : VoidFunction
    enable                 : VoidFunction
    setValues              : (values: Map<T, FormValue>) => void
    setEnterHandler        : (window: Window, handler: VoidFunction) => void
    getInvalidFields       : () => T[]
}

export type FieldComponent = React.FunctionComponent<FormFieldComponentProps>

export type FieldCollection = Map<FormFieldType, FieldComponent>
