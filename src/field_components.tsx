import React from 'react';
import { FieldComponentProps } from "./yafo"
import { FieldType, FieldComponent, FieldComponents } from "./types"
import { toNumber, parseCheckboxFormValue, serializeCheckboxValue } from "./utils"

const styles = {
    fieldWrapper: {
        paddingBottom: 14,
    },
    errorMessage: {
        paddingTop: 8,
        color: "red",
    }
}

const idForErrorMessageComponent = (inputId: string): string => `error_message_${inputId}`

const errorMessageComponent = (errorMessage: string, inputId: string): React.ReactElement | null => {
    if (errorMessage === "")
        return null

    return (
        <div id={idForErrorMessageComponent(inputId)} style={styles.errorMessage}>
            { errorMessage }
        </div>
    )
}

const text: FieldComponent =
    ({ inputId, label, value, disabled, onChange, errorMessage, custom }: FieldComponentProps) =>
{
    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <div>
                <input
                    id={inputId}
                    type={custom.password ? "password" : "text"}
                    value={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
                    disabled={disabled}
                />
            </div>

            { errorMessageComponent(errorMessage, inputId) }
        </div>
    )
}

const select: FieldComponent =
    ({ inputId, label, value, disabled, onChange, errorMessage, options }: FieldComponentProps) =>
{
    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <select
                id={inputId}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {onChange(toNumber(event.target.value))}}
                value={value}
                disabled={disabled}
            >
                { options.map((option, i) => (
                    <option
                        key={["select", label, i].join("-")}
                        value={i}
                    >
                        { option }
                    </option>
                )) }
            </select>

            { errorMessageComponent(errorMessage, inputId) }
        </div>
    )
}

const radio: FieldComponent =
    ({ inputId, label, value, disabled, onChange, errorMessage, options }: FieldComponentProps) =>
{
    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <div style={{opacity: disabled ? ".65" : "1"}}>
                { options.map((option, i) => (
                    <div
                        key={["radio", label, i].join("-")}
                        onClick={() => !disabled && onChange(i)}
                    >
                        <input
                            name={inputId}
                            type="radio"
                            value={i}
                            checked={i === value}
                            readOnly={true}
                        />
                        { option }
                    </div>
                )) }
            </div>

            { errorMessageComponent(errorMessage, inputId) }
        </div>
    )
}

const checkbox: FieldComponent =
    ({ inputId, label, value, disabled, onChange, errorMessage, options }: FieldComponentProps) =>
{
    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <div style={{opacity: disabled ? ".65" : "1"}}>
                { options.map((option, i) => {
                    const parsedCheckboxValue = parseCheckboxFormValue(value as string)
                    const checked = parsedCheckboxValue.indexOf(toNumber(i)) > -1

                    return (
                        <div
                            key={["checkbox", label, i].join("-")}
                            onClick={() => !disabled && onChange(serializeCheckboxValue(parsedCheckboxValue, i, !checked))}
                        >
                            <input
                                name={inputId}
                                type="checkbox"
                                value={i}
                                checked={checked}
                                readOnly={true}
                            />
                            { option }
                        </div>
                    )
                } ) }
            </div>

            { errorMessageComponent(errorMessage, inputId) }
        </div>
    )
}

export const fieldComponents: FieldComponents = new Map([
    [ FieldType.Text, text ],
    [ FieldType.Select, select ],
    [ FieldType.Radio, radio ],
    [ FieldType.Checkbox, checkbox ],
])
