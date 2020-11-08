import React, { useState, useEffect } from 'react';
import { replaceNth, allEqual, unzip } from './utils';
import { fieldCollection } from './field_collection';
import { FORM_FIELD_TYPE } from './types';

export { FORM_FIELD_TYPE } from './types';
export { fieldCollection } from './field_collection';

export type FormFieldOption = string | boolean | number | string[]

export type FormFieldOptions = Record<string, FormFieldOption>

export type FieldValidationResult = [ boolean, string ]

export type FieldValidator = <T>(value: FormValue, formValue: (id: T) => FormValue) => FieldValidationResult

export type FormField<T> = {
    id         : T
    label      : string
    type       : FORM_FIELD_TYPE
    valid      : FieldValidator
    initial    : FormValue
    options?   : FormFieldOptions
    disabled?  : boolean
}

export type OnChangeFormValueFunc = (newValue: FormValue) => void

export type FormFieldComponentProps = {
    inputId        : string
    label          : string
    value          : FormValue
    disabled       : boolean
    onChange       : OnChangeFormValueFunc
    errorMessage   : string
    options        : FormFieldOptions
}

export type FieldCollection = Map<FORM_FIELD_TYPE, React.StatelessComponent<FormFieldComponentProps>>

export type FormValueFunc = <T>(id: T) => FormValue

export type ValidateFormFunc = () => boolean

export type FormValue = string | number

export type FormProps<T> =  {
    fieldComponents        : Map<T, React.ReactElement>
    dirty                  : boolean
    validateForm           : () => boolean
    formIsValid            : boolean
    formValue              : FormValueFunc
    showFormErrorMessages  : (visible: boolean) => void
    disableForm            : VoidFunction
    enableForm             : VoidFunction
    setValues              : (values: Map<T, FormValue>) => void
    setEnterHandler        : (window: any, handler: VoidFunction) => void
    getInvalidFields       : () => T[]
}

const changeStateValue = <T extends unknown>(field: FormField<T>, state: FormState, formValue: FormValueFunc) => (index: number) => (newValue: FormValue): void => {
    const { values, setValues, validation, setValidation, dirty, setDirty, errorMessage, setErrorMessage } = state

    const currentValue = values[index]

    const newValues = replaceNth(values, index, newValue)

    const [ valid, fieldErrorMessage ] = field.valid(newValue, formValue)

    const newValidation = replaceNth(validation, index, valid)

    const newErrorMessage = replaceNth(errorMessage, index, fieldErrorMessage)

    const valuesAreEqual = newValue === currentValue

    setValues(newValues)

    setValidation(newValidation)

    setErrorMessage(newErrorMessage)

    if (!dirty && !valuesAreEqual)
        setDirty(true);
}

const getFieldComponent = <T_FormFieldType extends unknown, T_TargetComponentProps extends unknown>(
    formName            : string,
    field               : FormField<T_FormFieldType>,
    value               : FormValue,
    changeValue         : (index: number) => (newValue: FormValue) => void,
    fieldValid          : boolean,
    errorMessageBase    : string,
    index               : number,
    fieldCollection     : FieldCollection,
    formActive          : boolean,
    options             : FormOptions<T_FormFieldType, T_TargetComponentProps>,
    inputIds            : string[],
): React.ReactElement => {
    const fieldOptions = field.options || {};

    const errorMessage =
        !fieldValid && options.errorMessagesVisible ? errorMessageBase : "";

    const disabled = !formActive || field.disabled

    const inputId = inputIds[index]

    if (field.type === FORM_FIELD_TYPE.TEXT) {
        const TextComponent: any = fieldCollection.get(FORM_FIELD_TYPE.TEXT)

        return (
            <TextComponent
                inputId={inputId}
                label={field.label}
                value={value || ""}
                disabled={disabled}
                onChange={changeValue(index)}
                errorMessage={errorMessage}
                options={fieldOptions}
            />
        );
    }

    if (field.type === FORM_FIELD_TYPE.SELECT) {
        const SelectComponent: any = fieldCollection.get(FORM_FIELD_TYPE.SELECT)

        return (
            <SelectComponent
                inputId={inputId}
                label={field.label}
                value={value || ""}
                disabled={disabled}
                onChange={changeValue(index)}
                errorMessage={errorMessage}
                options={fieldOptions}
            />
        );
    }

    throw new Error(`Could not get form field component for ${field.type}`);
}

const toFieldComponents = <T_FormFieldType extends unknown, T_TargetComponentProps extends unknown>(
    formName        : string,
    fields          : FormField<T_FormFieldType>[],
    state           : FormState,
    map             : Map<T_FormFieldType, React.ReactElement>,
    fieldCollection : FieldCollection,
    options         : FormOptions<T_FormFieldType, T_TargetComponentProps>,
    formValue       : FormValueFunc,
    formActive      : boolean,
    inputIds        : string[],
    index = 0,
): Map<T_FormFieldType, React.ReactElement> =>
{
    if (index > (fields.length - 1))
        return map;

    const { values, validation, errorMessage } = state;

    const field = fields[index];

    const value = values[index];

    const fieldValid = validation[index]

    const fieldErrorMessage = fieldValid ? "" : errorMessage[index];

    const FieldComponent = getFieldComponent(
        formName,
        field,
        value,
        changeStateValue(field, state, formValue),
        fieldValid,
        fieldErrorMessage,
        index,
        fieldCollection,
        formActive,
        options,
        inputIds,
    );

    map.set(field.id, FieldComponent);

    return toFieldComponents(formName, fields, state, map, fieldCollection, options, formValue, formActive, inputIds, index + 1);
}

type FormState = {
    values            : FormValue[]
    validation        : boolean[],
    dirty             : boolean,
    setValues         : (newValues: FormValue[]) => void,
    setValidation     : (newValidation: boolean[]) => void,
    setDirty          : (newDirty: boolean) => void,
    errorMessage      : string[],
    setErrorMessage   : (newErrorMessage: string[]) => void,
}

const getFormValidation = <T extends unknown>(fields: FormField<T>[], state: FormState, formValue: (id: T) => FormValue, index = 0): [ boolean, string ][] => {
    if (fields.length === 0)
        return [];

    const [ valid, errorMessage ] = fields[0].valid(state.values[index], formValue);

    return [ [ valid, errorMessage ] as [ boolean, string ] ].concat(getFormValidation(fields.slice(1), state, formValue, index + 1));
}

const validateForm = <T extends unknown>(fields: FormField<T>[], state: FormState, formValue: (id: T) => FormValue) => (): boolean => {
    const validationResults = getFormValidation(fields, state, formValue);

    const [ newValidation, newErrorMessage ] = unzip(validationResults);

    state.setValidation(newValidation);

    state.setErrorMessage(newErrorMessage);

    return allEqual<boolean>(true, newValidation);
}

const formValue = <T extends unknown>(values: FormValue[], fieldIds: T[]) => (id: T): FormValue => {
    const index = fieldIds.indexOf(id)

    if (index === -1 || typeof values[index] === "undefined")
        throw new Error(`Could not find form value with id ${id}`);

    return values[index];
}

export type PropsToInitialValuesFunc<T_TargetComponentProps, T_FormFieldType> = (props: T_TargetComponentProps) => Map<T_FormFieldType, FormValue>

export type FormOptions<T_FormFieldType, T_TargetComponentProps> = {
    errorMessagesVisible    : boolean;
    propsToInitialValues?   : PropsToInitialValuesFunc<T_TargetComponentProps, T_FormFieldType>
}

const showFormErrorMessages = <T_FormFieldType, T_TargetComponentProps>(
    options       : FormOptions<T_FormFieldType, T_TargetComponentProps>,
    setOptions    : (options: FormOptions<T_FormFieldType, T_TargetComponentProps>) => void
) => (errorMessagesVisible: boolean): void => {
    setOptions({ ...options, errorMessagesVisible });
}

const disableForm = (setFormActive: (active: boolean) => void) => () => 
    setFormActive(false)

const enableForm = (setFormActive: (active: boolean) => void) => () => 
    setFormActive(true)

const initialValuesForForm = <T_FormFieldType extends unknown, T_TargetComponentProps extends unknown>(
    fields         : FormField<T_FormFieldType>[],
    formOptions    : FormOptions<T_FormFieldType, T_TargetComponentProps>,
    props          : T_TargetComponentProps
) => (): FormValue[] => {
    if (!formOptions.propsToInitialValues)
        return fields.map(getFieldInitial)

    const initialValuesMap = formOptions.propsToInitialValues(props)

    return fields.map(
        (field: FormField<T_FormFieldType>) => initialValuesMap.get(field.id)
    ) as any
}

const setFormValues = <T extends unknown>(
    fields       : FormField<T>[],
    state        : FormState,
    setTime      : (time: Date) => void,
) => (values: Map<T, FormValue>): void => {
    const newValues =
        fields.map((field: FormField<T>, i: number) => values.get(field.id) || state.values[i])

    state.setValues(newValues)

    setTime(new Date())
}

const isFormFocused = (window: any, inputIds: string[]): boolean =>
    inputIds.indexOf(window.document.activeElement.id) > -1

const setEnterHandler = (inputIds: string[]) => (window: any, handler: any) => {
    const handlerWrapped = (event: any) => {
        if (event.key === "Enter" && isFormFocused(window, inputIds)) {
            handler();
        }
    }

    window.addEventListener("keydown", handlerWrapped, true)

    return () => window.removeEventListener("keydown", handlerWrapped, true)
}

const buildInputIds = (formName: string, length: number, index = 0): any => {
    if (length === index - 1)
        return []

    return [ [ formName, index ].join("-") ].concat(buildInputIds(formName, length, index + 1))
}

const getInvalidFields = <T extends unknown>(fields: FormField<T>[], validation: boolean[], i = 0) => (): T[] => {
    if (i > fields.length - 1)
        return []

    const valid = validation[i]

    const field = fields[i]

    return [ ...(valid ? [] : [ field.id ]) ].concat(getInvalidFields(fields, validation, i + 1)())
}

const getFieldId = <T extends unknown>({ id }: FormField<T>): T => id

const getFieldInitial = <T extends unknown>({ initial }: FormField<T>): FormValue => initial

export const withForm = <T extends unknown, TargetComponentProps extends unknown>(
    formName          : string,
    fieldCollection   : FieldCollection,
    buildFields       : (props: TargetComponentProps) => FormField<T>[],
    TargetComponent   : React.ComponentClass<TargetComponentProps> | any,
    optionsBase?      : FormOptions<T, TargetComponentProps>,
) => {
    const defaultFormOptions: FormOptions<T, TargetComponentProps> = {
        errorMessagesVisible    : true,
    }

    return (props: TargetComponentProps): React.ReactElement => {
        const formOptions = optionsBase || defaultFormOptions

        const [ fields ] = useState(() => buildFields(props))
        const [ values, setValues ] = useState<FormValue[]>(initialValuesForForm(fields, formOptions, props));
        const [ fieldIds ] = useState<T[]>(() => fields.map(getFieldId));
        const [ validation, setValidation ] = useState<boolean[]>(() => fields.map(() => true));
        const [ dirty, setDirty ] = useState(false);
        const [ errorMessage, setErrorMessage ] = useState<string[]>(() => fields.map(() => ""));
        const [ options, setOptions ] = useState<FormOptions<T, TargetComponentProps>>(formOptions);
        const [ formActive, setFormActive ] = useState(true);
        const [ inputIds ] = useState(() => buildInputIds(formName, fields.length));
        const [ valueSetManuallyTime, setValueSetManuallyTime ] = useState(() => new Date());

        useEffect(() => {
            validateForm(fields, state, formValue(values, fieldIds))();
        }, [ valueSetManuallyTime ])

        const state: FormState =
            { values, validation, dirty, setValues, setValidation, setDirty, errorMessage, setErrorMessage };

        const getFormValue = formValue<T>(values, fieldIds) as FormValueFunc

        const fieldComponents = toFieldComponents(
            formName,
            fields,
            state,
            new Map(),
            fieldCollection,
            options,
            getFormValue,
            formActive,
            inputIds,
        );

        const formProps: FormProps<T> = {
            fieldComponents        : fieldComponents,
            dirty,
            validateForm           : validateForm(fields, state, getFormValue),
            formIsValid            : allEqual<boolean>(true, validation),
            formValue              : getFormValue,
            showFormErrorMessages  : showFormErrorMessages(options, setOptions),
            disableForm            : disableForm(setFormActive),
            enableForm             : enableForm(setFormActive),
            setValues              : setFormValues<T>(fields, state, setValueSetManuallyTime),
            setEnterHandler        : setEnterHandler(inputIds),
            getInvalidFields       : getInvalidFields<T>(fields, validation)
        }

        return (
            <TargetComponent
                form={formProps}
                { ...props }
            />
        );
    };
};

export const regexValidator = (regex: RegExp, errorMessage: string) => (value: FormValue): [ boolean, string ] => {
    if (typeof value === "string" && regex.test(value as string))
        return [ true, "" ]

    return [ false, errorMessage ]
}

export const rangeValidator = (from: number, to: number, errorMessage: string) => (value: FormValue): [ boolean, string ] => {
    const valueType = typeof value

    if (valueType === "boolean")
        return [ false, errorMessage ]

    const num = valueType === "number" ? value : parseInt(value as string, 10)

    const inRange = !(num < from || num > to)

    return [ inRange, errorMessage ]
}

export const validateAll =
    <T extends unknown>(validators: FieldValidator[]) => (value: FormValue, formValue: (id: T) => FormValue): FieldValidationResult =>
{
    if (validators.length === 0)
        return [ true, "" ]

    const validator = validators[0]

    const [ result, errorMessage ] = validator(value, formValue)

    if (!result)
        return [ false, errorMessage ]

    return validateAll(validators.slice(1))(value, formValue as any)
}
