import React from 'react';
import { FormFieldComponentProps } from "./yafo"
import { FormFieldType } from "./types"
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

const text: React.StatelessComponent<FormFieldComponentProps> =
    ({ inputId, label, value, disabled, onChange, errorMessage, options }: FormFieldComponentProps) =>
{
    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <div>
                <input
                    id={inputId}
                    type={options.password ? "password" : "text"}
                    value={value}
                    onChange={(event: any) => onChange(event.target.value)}
                    disabled={disabled}
                />
            </div>

            { errorMessage !== "" && (
                <div style={styles.errorMessage}>
                    { errorMessage }
                </div>
            ) }
        </div>
    )
}

const select: React.StatelessComponent<FormFieldComponentProps> =
    ({ inputId, label, value, disabled, onChange, errorMessage, options }: FormFieldComponentProps) =>
{
    const selectProps = {
    }

    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <select
                id={inputId}
                onChange={(event: any) => {onChange(toNumber(event.target.value))}}
                value={value}
                disabled={disabled}
            >
                { (options.selectOptions as string[]).map((option, i) => (
                    <option
                        key={["select", label, i].join("-")}
                        value={i}
                    >
                        { option }
                    </option>
                )) }
            </select>

            { errorMessage !== "" && (
                <div style={styles.errorMessage}>
                    { errorMessage }
                </div>
            ) }
        </div>
    )
}

const radio: React.StatelessComponent<FormFieldComponentProps> =
    ({ inputId, label, value, disabled, onChange, errorMessage, options }: FormFieldComponentProps) =>
{
    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <div style={{opacity: disabled ? ".65" : "1"}}>
                { (options.radioOptions as string[]).map((option, i) => (
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

            { errorMessage !== "" && (
                <div style={styles.errorMessage}>
                    { errorMessage }
                </div>
            ) }
        </div>
    )
}

const checkbox: React.StatelessComponent<FormFieldComponentProps> =
    ({ inputId, label, value, disabled, onChange, errorMessage, options }: FormFieldComponentProps) =>
{
    return (
        <div style={styles.fieldWrapper}>
            <div>
                { label }
            </div>

            <div style={{opacity: disabled ? ".65" : "1"}}>
                { (options.checkboxOptions as string[]).map((option, i) => {
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

            { errorMessage !== "" && (
                <div style={styles.errorMessage}>
                    { errorMessage }
                </div>
            ) }
        </div>
    )
}

export const fieldCollection = new Map([
    [ FormFieldType.TEXT, text ],
    [ FormFieldType.SELECT, select ],
    [ FormFieldType.RADIO, radio ],
    [ FormFieldType.CHECKBOX, checkbox ],
])
