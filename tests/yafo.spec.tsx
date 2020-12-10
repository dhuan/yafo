import '@testing-library/jest-dom'
import React from "react"
import renderer from 'react-test-renderer';
import {fireEvent, screen, act} from '@testing-library/react'
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
})
