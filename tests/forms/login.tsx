import React from "react"
import { FieldType, Field, Value, validate } from "../../src/yafo"

const formComponent = (form: any) => (
    <div>
        <h1>My Form</h1>

        <div id="field-user">
            { form.field(LoginForm.User) }
        </div>

        <div id="field-password">
            { form.field(LoginForm.Password) }
        </div>

        <div id="field-password-repeat">
            { form.field(LoginForm.PasswordRepeat) }
        </div>

        <input
            data-testid="submit"
            type="button"
            value="Login!"
            onClick={() => {
                form.showErrorMessages()
            }}
        />
    </div>
)

export enum LoginForm { User, Password, PasswordRepeat }

const formFields = (): Field<LoginForm>[] => [
    {
        id        : LoginForm.User,
        label     : "User",
        type      : FieldType.Text,
        valid     : validate.regex(/^[a-zA-Z_]{3,}$/, "Invalid user!"),
        initial   : "",
        disabled  : false,
    },
    {
        id        : LoginForm.Password,
        label     : "Password",
        type      : FieldType.Text,
        valid     : validate.regex(/^[a-zA-Z_]{3,}$/, "Invalid password!"),
        initial   : "",
        disabled  : false,
    },
    {
        id        : LoginForm.PasswordRepeat,
        label     : "Password Again",
        type      : FieldType.Text,
        valid     : validate.equalsField(LoginForm.Password, "Passwords must match!"),
        initial   : "",
        disabled  : false,
    },
]

export default { formComponent, formFields }
