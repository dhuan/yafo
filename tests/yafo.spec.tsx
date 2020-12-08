import '@testing-library/jest-dom'
import React from "react"
import renderer from 'react-test-renderer';
import {fireEvent, screen} from '@testing-library/react'
import { renderTestForm, getTestComponent, TestForm } from './utils';

test("renders", () => {
    const Component = getTestComponent()

    expect(renderer.create(<Component callback={jest.fn()} />)).toMatchSnapshot();
})

test("get values", async () => {
    const { change, click, clickNth, spy } = renderTestForm()

    change("#field-first-name input[type=text]", "My first name");

    change("#field-last-name input[type=text]", "My last name");

    change("#field-country select", "2");

    clickNth("#field-gender input[type=radio]", 1);

    clickNth("#field-hobbies input[type=checkbox]", 1);

    clickNth("#field-hobbies input[type=checkbox]", 2);

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
})
