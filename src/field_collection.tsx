import React from 'react';
import { FormFieldComponentProps } from "./yafo"
import { FORM_FIELD_TYPE } from "./types"
import { toNumber } from "./utils"

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

export const fieldCollection = new Map([
    [ FORM_FIELD_TYPE.TEXT, text ],
    [ FORM_FIELD_TYPE.SELECT, select ],
])
