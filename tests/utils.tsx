import '@testing-library/jest-dom'
import React from "react"
import { withForm, FieldType, Props, standardFieldComponents,
         Field, Value, parseCheckboxFormValue, FieldsDefinition,
         FieldValidator, FieldValidationResult, validate
       } from "../src/yafo"
import {render, fireEvent} from '@testing-library/react'

export enum TestForm { FirstName, LastName, Country, Gender, Hobbies, Unused }

export type CustomTest<FormType, TargetComponentProps> = {
    formComponent   : any,
    formFields      : FieldsDefinition<FormType, TargetComponentProps>
}

const TestComponent = <FormType, TargetComponentProps>(customTest?: CustomTest<FormType, TargetComponentProps>) => ({ form, callback, getForm }: { form: Props<TestForm>, callback: any, getForm?: any }) => {
    if (getForm)
        getForm(form)

    if (customTest)
        return customTest.formComponent(form)

    return (
        <div>
            <h1>My Form</h1>

            <div id="field-first-name">
                { form.field(TestForm.FirstName) }
            </div>

            <div id="field-last-name">
                { form.field(TestForm.LastName) }
            </div>

            <div id="field-country">
                { form.field(TestForm.Country) }
            </div>

            <div id="field-gender">
                { form.field(TestForm.Gender) }
            </div>

            <div id="field-hobbies">
                { form.field(TestForm.Hobbies) }
            </div>

            <input
                data-testid="submit"
                type="button"
                value="Click me"
                onClick={() => callback({
                    firstName: form.value(TestForm.FirstName),
                    lastName: form.value(TestForm.LastName),
                    country: form.value(TestForm.Country),
                    gender: form.value(TestForm.Gender),
                    hobbies: form.value(TestForm.Hobbies),
                })}
            />
        </div>
    );
}

const formFields = (): Field<TestForm>[] => [
    {
        id        : TestForm.FirstName,
        label     : "First name",
        type      : FieldType.Text,
        valid     : (text: Value) => [ /^[a-zA-Z\s]{3,20}$/.test(text as string), "Wrong first name, pal!" ],
        initial   : "",
        disabled  : false,
    },
    {
        id        : TestForm.LastName,
        label     : "First name",
        type      : FieldType.Text,
        valid     : (text: Value) => [ /^[a-zA-Z\s]{3,20}$/.test(text as string), "Wrong first name, pal!" ],
        initial   : "",
        disabled  : false,
    },
    {
        id        : TestForm.Country,
        label     : "Country",
        type      : FieldType.Select,
        valid     : (chosenCountry: Value) => [ chosenCountry > 0, "Choose a country!" ],
        initial   : 0,
        disabled  : false,
        options   : ["Choose a country", "Brazil", "Germany"],
    },
    {
        id        : TestForm.Gender,
        label     : "Gender",
        type      : FieldType.Radio,
        valid     : (chosenGender: Value) => [ chosenGender > -1, "Choose a gender!" ],
        initial   : -1,
        disabled  : false,
        options   : ["Male", "Female"],
    },
    {
        id        : TestForm.Hobbies,
        label     : "Hobbies",
        type      : FieldType.Checkbox,
        valid     : validate.checkbox.min(2, "Please choose at least two hobbies."),
        initial   : "",
        disabled  : false,
        options   : ["Soccer", "Movies", "Music", "Books"],
    },
]

const change = (container: any) => (selector: string, value: string) =>
    fireEvent.change(container.querySelector(selector), {
        target: { value }
    });

const click = (container: any) => (selector: string) =>
    fireEvent.click(container.querySelector(selector));

const clickNth = (container: any) => (selector: string, nth: number) =>
    fireEvent.click(container.querySelectorAll(selector)[nth]);

export const getTestComponent = <FormType, TargetComponentProps>(customTest?: CustomTest<FormType, TargetComponentProps>) =>
    withForm(
        "test_form",
        standardFieldComponents,
        customTest ? customTest.formFields : formFields as any,
        TestComponent(customTest),
        { errorMessagesVisible: false }
    )

const fillFormWithValidFields = (change: any, click: any, clickNth: any) => () => {
    change("#field-first-name input[type=text]", "My first name");

    change("#field-last-name input[type=text]", "My last name");

    change("#field-country select", "2");

    clickNth("#field-gender input[type=radio]", 1);

    clickNth("#field-hobbies input[type=checkbox]", 1);

    clickNth("#field-hobbies input[type=checkbox]", 2);

    click("[data-testid=submit]")
}

export const renderTestForm = <FormType, TargetComponentProps>(customTest?: CustomTest<FormType, TargetComponentProps>) => {
    const Component = getTestComponent(customTest) as any

    let form: any = null

    const getForm = (formProps: any) => {
        form = formProps
    }

    const spy = jest.fn()

    const { container } = render(<Component callback={spy} getForm={getForm} />)

    return {
        container,
        form: () => form,
        change: change(container),
        click: click(container),
        clickNth: clickNth(container),
        spy: () => spy,
        fillFormWithValidFields: fillFormWithValidFields(
            change(container),
            click(container),
            clickNth(container),
        ),
    }
}

export const callValidator = <T extends unknown>(validator: FieldValidator<T>) => (value: Value): FieldValidationResult =>
    validator(value, () => "")
