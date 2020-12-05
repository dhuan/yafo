import '@testing-library/jest-dom'
import React from "react"
import renderer from 'react-test-renderer';
import { withForm, FormFieldType, FormProps, fieldCollection, FormField, FormValue } from "../src/yafo"
import {render, fireEvent, screen} from '@testing-library/react'

enum TestForm { FirstName, LastName, Country }

const TestComponent = ({ form, callback }: { form: FormProps<TestForm>, callback: Function }) => {
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

            <input
                data-testid="submit"
                type="button"
                value="Click me"
                onClick={() => callback({
                    firstName: form.formValue(TestForm.FirstName),
                    lastName: form.formValue(TestForm.LastName),
                    country: form.formValue(TestForm.Country),
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
        valid     : (text: FormValue) => [ /[a-zA-Z{3,10}]/.test(text as string), "Wrong first name, pal!" ],
        initial   : "",
        disabled  : false,
    },
    {
        id        : TestForm.LastName,
        label     : "First name",
        type      : FormFieldType.TEXT,
        valid     : (text: FormValue) => [ /[a-zA-Z{3,10}]/.test(text as string), "Wrong first name, pal!" ],
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
]

test("renders", () => {
    const Component = withForm(
        "foobar",
        fieldCollection,
        formFields,
        TestComponent,
        { errorMessagesVisible: false }
    )

    expect(renderer.create(<Component callback={jest.fn()} />)).toMatchSnapshot();
})

test("get values", async () => {
    const Component = withForm(
        "foobar",
        fieldCollection,
        formFields,
        TestComponent,
        { errorMessagesVisible: false }
    )

    const spy = jest.fn()

    const { container } = render(<Component callback={spy} />)

    fireEvent.change(container.querySelector("#field-first-name input[type=text]"), {
        target: { value: "My first name" }
    });

    fireEvent.change(container.querySelector("#field-last-name input[type=text]"), {
        target: { value: "My last name" }
    });

    fireEvent.change(container.querySelector("#field-country select"), {
        target: { value: "2" }
    });

    fireEvent.click(screen.getByTestId("submit"))

    expect(spy).toHaveBeenCalledWith({
        firstName: "My first name",
        lastName: "My last name",
        country: 2,
    })
})
