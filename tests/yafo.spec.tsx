import '@testing-library/jest-dom'
import React from "react"
import renderer from "react-test-renderer";
import {act} from "@testing-library/react"
import { renderTestForm, getTestComponent, TestForm, callValidator } from "./utils";
import { validate } from "../src/yafo"
import loginForm, { LoginForm } from "./forms/login"

test("renders", () => {
    const Component = getTestComponent() as any

    expect(renderer.create(<Component callback={jest.fn()} />)).toMatchSnapshot();
})

test("get values", async () => {
    const { click, spy, fillFormWithValidFields } = renderTestForm()

    fillFormWithValidFields()

    click("[data-testid=submit]")

    expect(spy()).toHaveBeenCalledWith({
        firstName: "My first name",
        lastName: "My last name",
        country: 2,
        gender: 1,
        hobbies: "1,2",
    })
})

describe("Form Properties", () => {
    test("form.dirty", async () => {
        const { form, change } = renderTestForm()

        expect(form().dirty).toEqual(false);

        change("#field-first-name input[type=text]", "My first name")

        expect(form().dirty).toEqual(true);
    })

    test("form.value", async () => {
        const { form, change } = renderTestForm()

        expect(form().value(TestForm.FirstName)).toEqual("");

        change("#field-first-name input[type=text]", "My first name")

        expect(form().value(TestForm.FirstName)).toEqual("My first name");
    })

    test("form.valid", async () => {
        const { form, fillFormWithValidFields } = renderTestForm()

        expect(form().valid).toEqual(false)

        fillFormWithValidFields()

        expect(form().valid).toEqual(true)
    })
})

describe("Form Methods", () => {
    describe("form.field", () => {
        test("retrieving component", async () => {
            const { form, container } = renderTestForm()

            expect(form().field(TestForm.FirstName)).toMatchSnapshot()
        })

        test("attempting to retrieve unexisting component", async () => {
            const { form, container } = renderTestForm()

            expect(() => form().field(TestForm.Unused)).toThrowError("Could not find field component")
        })
    })

    test("form.setValues", async () => {
        const { form, container } = renderTestForm()

        const FIRST_NAME_INPUT_ELEMENT_SELECTOR = "#test_form_field_0"
        const LAST_NAME_INPUT_ELEMENT_SELECTOR = "#test_form_field_1"

        expect(container.querySelector<HTMLInputElement>(FIRST_NAME_INPUT_ELEMENT_SELECTOR)!.value).toEqual("")

        expect(container.querySelector<HTMLInputElement>(LAST_NAME_INPUT_ELEMENT_SELECTOR)!.value).toEqual("")

        act(() => {
            form().setValues(new Map([
                [ TestForm.FirstName, "Some first name" ],
                [ TestForm.LastName, "Some last name" ],
            ]))
        })

        expect(container.querySelector<HTMLInputElement>(FIRST_NAME_INPUT_ELEMENT_SELECTOR)!.value).toEqual("Some first name")

        expect(container.querySelector<HTMLInputElement>(LAST_NAME_INPUT_ELEMENT_SELECTOR)!.value).toEqual("Some last name")
    })

    test("form.enable and form.disable", async () => {
        const FIRST_NAME_INPUT_ELEMENT_SELECTOR = "#test_form_field_0"

        const { form, container } = renderTestForm()

        expect(container.querySelector<HTMLInputElement>(FIRST_NAME_INPUT_ELEMENT_SELECTOR)!.disabled).toEqual(false)

        act(() => {
            form().disable()
        })

        expect(container.querySelector<HTMLInputElement>(FIRST_NAME_INPUT_ELEMENT_SELECTOR)!.disabled).toEqual(true)

        act(() => {
            form().enable()
        })

        expect(container.querySelector<HTMLInputElement>(FIRST_NAME_INPUT_ELEMENT_SELECTOR)!.disabled).toEqual(false)
    })

    test("form.showErrorMessages and form.hideErrorMessages", async () => {
        const { form, container } = renderTestForm()

        const FIRST_NAME_ERROR_ELEMENT_SELECTOR = "div#error_message_test_form_field_1"

        expect(container.querySelectorAll(FIRST_NAME_ERROR_ELEMENT_SELECTOR).length).toEqual(0)

        act(() => {
            form().showErrorMessages()
        })

        expect(container.querySelectorAll(FIRST_NAME_ERROR_ELEMENT_SELECTOR).length).toEqual(1)

        act(() => {
            form().hideErrorMessages()
        })

        expect(container.querySelectorAll(FIRST_NAME_ERROR_ELEMENT_SELECTOR).length).toEqual(0)
    })

    test("form.getInvalidFields", async () => {
        const { form, change } = renderTestForm()

        expect(form().getInvalidFields()).toEqual([
            TestForm.FirstName,
            TestForm.LastName,
            TestForm.Country,
            TestForm.Gender,
            TestForm.Hobbies,
        ])

        change("#field-first-name input[type=text]", "Some invalid name 123")

        expect(form().getInvalidFields().indexOf(TestForm.FirstName)).toBeGreaterThan(-1)

        change("#field-first-name input[type=text]", "First Name")

        expect(form().getInvalidFields().indexOf(TestForm.FirstName)).toEqual(-1)
    })
})

describe("Utilities", () => {
    describe("validate", () => {
        test("validate.regex", () => {
            const validator = validate.regex(/^[a-z]{6}$/, "Invalid!")

            const callTestValidator = callValidator(validator)

            expect(callTestValidator("foobar")).toEqual([ true, "" ])

            expect(callTestValidator("foobar!")).toEqual([ false, "Invalid!" ])
        })

        test("validate.minLength", () => {
            const validator = validate.minLength(5, "Invalid!")

            const callTestValidator = callValidator(validator)

            expect(callTestValidator("1234")).toEqual([ false, "Invalid!" ])

            expect(callTestValidator("12345")).toEqual([ true, "" ])

            expect(callTestValidator("123456")).toEqual([ true, "" ])
        })

        test("validate.maxLength", () => {
            const validator = validate.maxLength(5, "Invalid!")

            const callTestValidator = callValidator(validator)

            expect(callTestValidator("1234")).toEqual([ true, "" ])

            expect(callTestValidator("12345")).toEqual([ true, "" ])

            expect(callTestValidator("123456")).toEqual([ false, "Invalid!" ])

            expect(callTestValidator("1234567")).toEqual([ false, "Invalid!" ])
        })

        test("validate.equalsField", () => {
            const { form, change } = renderTestForm({
                formComponent: loginForm.formComponent,
                formFields: loginForm.formFields,
            })

            change("#field-user input[type=text]", "some_user")

            change("#field-password input[type=text]", "some_password")

            expect(form().getInvalidFields().indexOf(LoginForm.Password)).toEqual(-1)

            act(() => {
                form().validate()
            })

            expect(form().getInvalidFields().indexOf(LoginForm.PasswordRepeat)).toBeGreaterThan(-1)

            change("#field-password-repeat input[type=text]", "some_different_password")

            expect(form().getInvalidFields().indexOf(LoginForm.PasswordRepeat)).toBeGreaterThan(-1)

            change("#field-password-repeat input[type=text]", "some-password")

            expect(form().getInvalidFields().indexOf(LoginForm.PasswordRepeat)).toBeGreaterThan(-1)

            change("#field-password-repeat input[type=text]", "some_password")

            expect(form().getInvalidFields().indexOf(LoginForm.PasswordRepeat)).toEqual(-1)
        })

        test("validate.equals", () => {
            const validator = validate.equals("foobar", "Invalid!")

            const callTestValidator = callValidator(validator)

            expect(callTestValidator("123")).toEqual([ false, "Invalid!" ])

            expect(callTestValidator("hello")).toEqual([ false, "Invalid!" ])

            expect(callTestValidator("foobar")).toEqual([ true, "" ])
        })

        test("validate.checkbox.min", () => {
            // The hobbies checkbox field is only valid if 2 hobbies are selected

            const { form, clickNth } = renderTestForm()

            // No hobbies selected: invalid
            expect(form().getInvalidFields().indexOf(TestForm.Hobbies)).toBeGreaterThan(-1)

            clickNth("input[type=checkbox]", 0)

            // Only one hobby selected: invalid
            expect(form().getInvalidFields().indexOf(TestForm.Hobbies)).toBeGreaterThan(-1)

            clickNth("input[type=checkbox]", 1)

            // 2 hobbies selected: valid
            expect(form().getInvalidFields().indexOf(TestForm.Hobbies)).toEqual(-1)

            clickNth("input[type=checkbox]", 2)

            // 3 hobbies selected: valid
            expect(form().getInvalidFields().indexOf(TestForm.Hobbies)).toEqual(-1)
        })

        test("validate.all", () => {
            const validator = validate.all([
                validate.minLength(5, "Need more!"),
                validate.maxLength(7, "Need less!"),
            ])

            const callTestValidator = callValidator(validator)

            expect(callTestValidator("123")).toEqual([ false, "Need more!" ])

            expect(callTestValidator("1234")).toEqual([ false, "Need more!" ])

            expect(callTestValidator("12345")).toEqual([ true, "" ])

            expect(callTestValidator("123456")).toEqual([ true, "" ])

            expect(callTestValidator("1234567")).toEqual([ true, "" ])

            expect(callTestValidator("12345678")).toEqual([ false, "Need less!" ])

            expect(callTestValidator("123456789")).toEqual([ false, "Need less!" ])
        })

        test("validate.none", () => {
            const validator = validate.none

            const callTestValidator = callValidator(validator)

            expect(callTestValidator("123")).toEqual([ true, "" ])

            expect(callTestValidator("1234")).toEqual([ true, "" ])
        })
    })
})
