import '@testing-library/jest-dom'
import React from "react"
import { withForm, FormFieldType, FormProps, fieldCollection, FormField, FormValue, parseCheckboxFormValue } from "../src/yafo"
import {render, fireEvent} from '@testing-library/react'

export enum TestForm { FirstName, LastName, Country, Gender, Hobbies }

const TestComponent = ({ form, callback, getForm }: { form: FormProps<TestForm>, callback: VoidFunction, getForm?: VoidFunction }) => {
    if (getForm)
        getForm(form)

    return (
        <div>
            <h1>My Form</h1>

            <div id="field-first-name">
                { form.fieldComponents.get(TestForm.FirstName) }
            </div>

            <div id="field-last-name">
                { form.fieldComponents.get(TestForm.LastName) }
            </div>

            <div id="field-country">
                { form.fieldComponents.get(TestForm.Country) }
            </div>

            <div id="field-gender">
                { form.fieldComponents.get(TestForm.Gender) }
            </div>

            <div id="field-hobbies">
                { form.fieldComponents.get(TestForm.Hobbies) }
            </div>

            <input
                data-testid="submit"
                type="button"
                value="Click me"
                onClick={() => callback({
                    firstName: form.formValue(TestForm.FirstName),
                    lastName: form.formValue(TestForm.LastName),
                    country: form.formValue(TestForm.Country),
                    gender: form.formValue(TestForm.Gender),
                    hobbies: form.formValue(TestForm.Hobbies),
                })}
            />
        </div>
    );
}

const formFields = (): FormField<TestForm>[] => [
    {
        id        : TestForm.FirstName,
        label     : "First name",
        type      : FormFieldType.TEXT,
        valid     : (text: FormValue) => [ /^[a-zA-Z\s]{3,20}$/.test(text as string), "Wrong first name, pal!" ],
        initial   : "",
        disabled  : false,
    },
    {
        id        : TestForm.LastName,
        label     : "First name",
        type      : FormFieldType.TEXT,
        valid     : (text: FormValue) => [ /^[a-zA-Z\s]{3,20}$/.test(text as string), "Wrong first name, pal!" ],
        initial   : "",
        disabled  : false,
    },
    {
        id        : TestForm.Country,
        label     : "Country",
        type      : FormFieldType.SELECT,
        valid     : (chosenCountry: FormValue) => [ chosenCountry > 0, "Choose a country!" ],
        initial   : 0,
        disabled  : false,
        options   : { selectOptions: ["Choose a country", "Brazil", "Germany"]  }
    },
    {
        id        : TestForm.Gender,
        label     : "Gender",
        type      : FormFieldType.RADIO,
        valid     : (chosenGender: FormValue) => [ chosenGender > -1, "Choose a gender!" ],
        initial   : -1,
        disabled  : false,
        options   : { radioOptions: ["Male", "Female"]  }
    },
    {
        id        : TestForm.Hobbies,
        label     : "Hobbies",
        type      : FormFieldType.CHECKBOX,
        valid     : (chosenHobbies: FormValue) => [ parseCheckboxFormValue(chosenHobbies as string).length > 0, "Please choose at least one hobby." ],
        initial   : "",
        disabled  : false,
        options   : { checkboxOptions: ["Soccer", "Movies", "Music", "Books"]  }
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

export const getTestComponent = () =>
    withForm(
        "test_form",
        fieldCollection,
        formFields,
        TestComponent,
        { errorMessagesVisible: false }
    )

const fillFormWithValidFields = (change, click, clickNth) => () => {
    change("#field-first-name input[type=text]", "My first name");

    change("#field-last-name input[type=text]", "My last name");

    change("#field-country select", "2");

    clickNth("#field-gender input[type=radio]", 1);

    clickNth("#field-hobbies input[type=checkbox]", 1);

    clickNth("#field-hobbies input[type=checkbox]", 2);

    click("[data-testid=submit]")
}

export const renderTestForm = () => {
    const Component = getTestComponent()

    let form = null

    const getForm = (formProps) => {
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
