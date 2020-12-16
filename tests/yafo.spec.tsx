import '@testing-library/jest-dom'
import React from "react"
import renderer from 'react-test-renderer';
import {act} from '@testing-library/react'
import { renderTestForm, getTestComponent, TestForm } from './utils';

test("renders", () => {
    const Component = getTestComponent()

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

describe("Form Props", () => {
    test("dirty", async () => {
        const { form, change } = renderTestForm()

        expect(form().dirty).toEqual(false);

        change("#field-first-name input[type=text]", "My first name")

        expect(form().dirty).toEqual(true);
    })

    test("formValue", async () => {
        const { form, change } = renderTestForm()

        expect(form().formValue(TestForm.FirstName)).toEqual("");

        change("#field-first-name input[type=text]", "My first name")

        expect(form().formValue(TestForm.FirstName)).toEqual("My first name");
    })

    test("getInvalidFields", async () => {
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

    test("formIsValid", async () => {
        const { form, fillFormWithValidFields } = renderTestForm()

        expect(form().formIsValid).toEqual(false)

        fillFormWithValidFields()

        expect(form().formIsValid).toEqual(true)
    })

    test("showFormErrorMessages", async () => {
        const { form, container } = renderTestForm()

        const FIRST_NAME_ERROR_ELEMENT_SELECTOR = "div#error_message_test_form_field_1"

        act(() => {
            expect(container.querySelectorAll(FIRST_NAME_ERROR_ELEMENT_SELECTOR).length).toEqual(0)

            form().showFormErrorMessages(true)
        })

        expect(container.querySelectorAll(FIRST_NAME_ERROR_ELEMENT_SELECTOR).length).toEqual(1)

        act(() => {
            form().showFormErrorMessages(false)
        })

        expect(container.querySelectorAll(FIRST_NAME_ERROR_ELEMENT_SELECTOR).length).toEqual(0)
    })

    test("enableForm and disableForm", async () => {
        const FIRST_NAME_INPUT_ELEMENT_SELECTOR = "#test_form_field_0"

        const { form, container } = renderTestForm()

        expect(container.querySelector(FIRST_NAME_INPUT_ELEMENT_SELECTOR).disabled).toEqual(false)

        act(() => {
            form().disableForm()
        })

        expect(container.querySelector(FIRST_NAME_INPUT_ELEMENT_SELECTOR).disabled).toEqual(true)

        act(() => {
            form().enableForm()
        })

        expect(container.querySelector(FIRST_NAME_INPUT_ELEMENT_SELECTOR).disabled).toEqual(false)
    })
})
