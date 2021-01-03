import React, { useState, useEffect } from 'react';
import { replaceNth, allEqual, unzip, mapGetter } from './utils';

import {
    FieldValidationResult,
    FieldValidator,
    Field,
    FieldCollection,
    FieldsDefinition,
    ValueFunc,
    Value,
    Props,
    FieldComponent,
} from './types';

export {
    FieldType,
    FieldComponentProps,
    FieldOption,
    FieldValidationResult,
    FieldValidator,
    Field,
    OnChangeValueFunc,
    FieldCollection,
    FieldsDefinition,
    ValueFunc,
    Value,
    Props,
    FieldComponent,
} from './types';

export { validators } from './validators';

export { fieldCollection } from './field_collection';
export { parseCheckboxFormValue } from './utils';

const changeStateValue = <T extends unknown>(field: Field<T>, state: State, formValue: ValueFunc) => (index: number) => (newValue: Value): void => {
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

const getFieldComponent = <T_FieldType extends unknown, T_TargetComponentProps extends unknown>(
    formName            : string,
    field               : Field<T_FieldType>,
    value               : Value,
    changeValue         : (index: number) => (newValue: Value) => void,
    fieldValid          : boolean,
    errorMessageBase    : string,
    index               : number,
    fieldCollection     : FieldCollection,
    formActive          : boolean,
    options             : Options<T_FieldType, T_TargetComponentProps>,
    inputIds            : string[],
): React.ReactElement => {
    const fieldOptions = field.options || []

    const fieldCustomOptions = field.custom || {}

    const errorMessage =
        !fieldValid && options.errorMessagesVisible ? errorMessageBase : "";

    const disabled = !formActive || field.disabled

    const inputId = inputIds[index]

    const Component: FieldComponent = fieldCollection.get(field.type) as FieldComponent

    if (!Component)
        throw new Error(`Could not get form field component for ${field.type}`);

    return (
        <Component
            inputId={inputId}
            label={field.label}
            value={value}
            disabled={disabled || false}
            onChange={changeValue(index)}
            errorMessage={errorMessage}
            options={fieldOptions}
            custom={fieldCustomOptions}
        />
    )
}

const toFieldComponents = <T_FieldType extends unknown, T_TargetComponentProps extends unknown>(
    formName        : string,
    fields          : Field<T_FieldType>[],
    state           : State,
    map             : Map<T_FieldType, React.ReactElement>,
    fieldCollection : FieldCollection,
    options         : Options<T_FieldType, T_TargetComponentProps>,
    formValue       : ValueFunc,
    formActive      : boolean,
    inputIds        : string[],
    index = 0,
): Map<T_FieldType, React.ReactElement> =>
{
    if (index > (fields.length - 1))
        return map;

    const { values, validation, errorMessage } = state;

    const field = fields[index];

    const value = typeof values[index] === "undefined" ? "" : values[index];

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

type State = {
    values            : Value[]
    validation        : boolean[],
    dirty             : boolean,
    setValues         : (newValues: Value[]) => void,
    setValidation     : (newValidation: boolean[]) => void,
    setDirty          : (newDirty: boolean) => void,
    errorMessage      : string[],
    setErrorMessage   : (newErrorMessage: string[]) => void,
}

const getFormValidation = <T extends unknown>(fields: Field<T>[], state: State, formValue: (id: T) => Value, index = 0): [ boolean, string ][] => {
    if (fields.length === 0)
        return [];

    const [ valid, errorMessage ] = fields[0].valid(state.values[index], formValue);

    return [ [ valid, errorMessage ] as [ boolean, string ] ].concat(getFormValidation(fields.slice(1), state, formValue, index + 1));
}

const validateForm = <T extends unknown>(fields: Field<T>[], state: State, formValue: (id: T) => Value) => (): boolean => {
    const validationResults = getFormValidation(fields, state, formValue);

    const [ newValidation, newErrorMessage ] = unzip(validationResults);

    state.setValidation(newValidation);

    state.setErrorMessage(newErrorMessage);

    return allEqual<boolean>(true, newValidation);
}

const formValue = <T extends unknown>(values: Value[], fieldIds: T[]) => (id: T): Value => {
    const index = fieldIds.indexOf(id)

    if (index === -1 || typeof values[index] === "undefined")
        throw new Error(`Could not find form value with id ${id}`);

    return values[index];
}

export type PropsToInitialValuesFunc<T_TargetComponentProps, T_FieldType> = (props: T_TargetComponentProps) => Map<T_FieldType, Value>

export type Options<T_FieldType, T_TargetComponentProps> = {
    errorMessagesVisible    : boolean;
    propsToInitialValues?   : PropsToInitialValuesFunc<T_TargetComponentProps, T_FieldType>
}

const showFormErrorMessages = <T_FieldType, T_TargetComponentProps>(
    options       : Options<T_FieldType, T_TargetComponentProps>,
    setOptions    : (options: Options<T_FieldType, T_TargetComponentProps>) => void,
    visible       : boolean,
) => (): void => {
    setOptions({ ...options, errorMessagesVisible: visible });
}

const disableForm = (setFormActive: (active: boolean) => void) => () => 
    setFormActive(false)

const enableForm = (setFormActive: (active: boolean) => void) => () => 
    setFormActive(true)

const initialValuesForForm = <T_FieldType extends unknown, T_TargetComponentProps extends unknown>(
    fields         : Field<T_FieldType>[],
    formOptions    : Options<T_FieldType, T_TargetComponentProps>,
    props          : T_TargetComponentProps
) => (): Value[] => {
    if (!formOptions.propsToInitialValues)
        return fields.map(getFieldInitial(""))

    const initialValuesMap = formOptions.propsToInitialValues(props)

    return fields.map(
        (field: Field<T_FieldType>) => initialValuesMap.get(field.id)
    ) as any
}

const setFormValues = <T extends unknown>(
    fields       : Field<T>[],
    state        : State,
    setTime      : (time: Date) => void,
) => (values: Map<T, Value>): void => {
    const newValues =
        fields.map((field: Field<T>, i: number) => values.get(field.id) || state.values[i])

    state.setValues(newValues)

    setTime(new Date())
}

const isFormFocused = (window: Window, inputIds: string[]): boolean => {
    if (!window.document.activeElement)
        return false

    return inputIds.indexOf(window.document.activeElement.id) > -1
}

const setEnterHandler = (inputIds: string[]) => (window: Window, handler: VoidFunction) => {
    const handlerWrapped = (event: KeyboardEvent) => {
        if (event.key === "Enter" && isFormFocused(window, inputIds)) {
            handler();
        }
    }

    window.addEventListener("keydown", handlerWrapped, true)

    return () => window.removeEventListener("keydown", handlerWrapped, true)
}

const buildInputIds = (formName: string, length: number, index = 0): string[] => {
    if (length === index - 1)
        return []

    return [ [ formName, "field", index ].join("_") ].concat(buildInputIds(formName, length, index + 1))
}

const getInvalidFields = <T extends unknown>(fields: Field<T>[], validation: boolean[], i = 0) => (): T[] => {
    if (i > fields.length - 1)
        return []

    const valid = validation[i]

    const field = fields[i]

    return [ ...(valid ? [] : [ field.id ]) ].concat(getInvalidFields(fields, validation, i + 1)())
}

const getFieldId = <T extends unknown>({ id }: Field<T>): T => id

const getFieldInitial = <T extends unknown>(defaultValue: Value) => ({ initial }: Field<T>): Value =>
    typeof initial === "undefined" ? defaultValue : initial

type FormBase<T> = React.ComponentClass<T> | React.FunctionComponent<T>

export const withForm = <T extends unknown, TargetComponentProps extends unknown>(
    formName          : string,
    fieldCollection   : FieldCollection,
    buildFields       : FieldsDefinition<T, TargetComponentProps>,
    TargetComponent   : FormBase<TargetComponentProps>,
    optionsBase?      : Options<T, TargetComponentProps>,
): React.FunctionComponent<TargetComponentProps> => {
    const defaultFormOptions: Options<T, TargetComponentProps> = {
        errorMessagesVisible    : true,
    }

    return (props: TargetComponentProps): React.ReactElement => {
        const formOptions = optionsBase || defaultFormOptions

        const [ fields ] = useState(() => buildFields(props))
        const [ values, setValues ] = useState<Value[]>(initialValuesForForm(fields, formOptions, props));
        const [ fieldIds ] = useState<T[]>(() => fields.map(getFieldId));
        const [ validation, setValidation ] = useState<boolean[]>(() => fields.map(() => true));
        const [ dirty, setDirty ] = useState(false);
        const [ errorMessage, setErrorMessage ] = useState<string[]>(() => fields.map(() => ""));
        const [ options, setOptions ] = useState<Options<T, TargetComponentProps>>(formOptions);
        const [ formActive, setFormActive ] = useState(true);
        const [ inputIds ] = useState(() => buildInputIds(formName, fields.length));
        const [ valueSetManuallyTime, setValueSetManuallyTime ] = useState(() => new Date());

        useEffect(() => {
            validateForm(fields, state, formValue(values, fieldIds))();
        }, [ valueSetManuallyTime ])

        const state: State =
            { values, validation, dirty, setValues, setValidation, setDirty, errorMessage, setErrorMessage };

        const getFormValue = formValue<T>(values, fieldIds) as ValueFunc

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

        const formProps: Props<T> = {
            field                  : mapGetter<T, React.ReactElement>(fieldComponents, "Could not find field component."),
            dirty,
            validate               : validateForm(fields, state, getFormValue),
            valid                  : allEqual<boolean>(true, validation),
            value                  : getFormValue,
            showErrorMessages      : showFormErrorMessages(options, setOptions, true),
            hideErrorMessages      : showFormErrorMessages(options, setOptions, false),
            disable                : disableForm(setFormActive),
            enable                 : enableForm(setFormActive),
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
    }
};

export const rangeValidator = (from: number, to: number, errorMessage: string) => (value: Value): [ boolean, string ] => {
    const valueType = typeof value

    if (valueType === "boolean")
        return [ false, errorMessage ]

    const num = valueType === "number" ? value : parseInt(value as string, 10)

    const inRange = !(num < from || num > to)

    return [ inRange, errorMessage ]
}

export const validateAll =
    <T extends unknown>(validators: FieldValidator<T>[]) => (value: Value, formValue: (id: T) => Value): FieldValidationResult =>
{
    if (validators.length === 0)
        return [ true, "" ]

    const validator = validators[0]

    const [ result, errorMessage ] = validator(value, formValue)

    if (!result)
        return [ false, errorMessage ]

    return validateAll(validators.slice(1))(value, formValue as any)
}
