import React from 'react';
import './App.css';
import { withForm, fieldCollection, FieldType, Value, Field, Props, parseCheckboxFormValue, validate } from './yafo/yafo.js';

enum PlaygroundForm { FirstName, LastName, Country, Gender, Hobbies }

const countryOptions = ["Choose a country", "Brazil", "Germany"]
const genderOptions = ["Male", "Female"]
const hobbyOptions = ["Soccer", "Movies", "Music", "Books"]

const mapIndexToValue = <T extends unknown>(list: T[], indexList: number[]): T[] =>
    indexList.map(index => list[index])

const formFields = (): Field<PlaygroundForm>[] => [
    {
        id        : PlaygroundForm.FirstName,
        label     : "First name",
        type      : FieldType.Text,
        valid     : validate.regex(/^[a-zA-Z]{3,10}$/, "Invalid first name!"),
        initial   : "",
        disabled  : false,
    },
    {
        id        : PlaygroundForm.LastName,
        label     : "Last name",
        type      : FieldType.Text,
        valid     : validate.regex(/^[a-zA-Z]{3,10}$/, "Invalid last name!"),
        initial   : "",
        disabled  : false,
    },
    {
        id        : PlaygroundForm.Country,
        label     : "Country",
        type      : FieldType.Select,
        valid     : (chosenCountry: Value) => [ chosenCountry > 0, "Choose a country!" ],
        initial   : 0,
        disabled  : false,
        options   : countryOptions,
    },
    {
        id        : PlaygroundForm.Gender,
        label     : "Gender",
        type      : FieldType.Radio,
        valid     : (chosenGender: Value) => [ chosenGender > -1, "Please chose a gender." ],
        initial   : -1,
        disabled  : false,
        options   : genderOptions,
    },
    {
        id        : PlaygroundForm.Hobbies,
        label     : "Hobbies",
        type      : FieldType.Checkbox,
        valid     : validate.checkbox.min(1, "Please choose at least one hobby."),
        initial   : "",
        disabled  : false,
        options   : hobbyOptions,
    },
]

type PlaygroundFormProps = {
     form      : Props<PlaygroundForm>
     callback  : Function 
}

const FormComponentBase = ({ form, callback }: PlaygroundFormProps) => {
    return (
        <div>
            <h1>Playground Form</h1>

            <div id="field-first-name">
                { form.field(PlaygroundForm.FirstName) }
            </div>

            <div id="field-last-name">
                { form.field(PlaygroundForm.LastName) }
            </div>

            <div id="field-country">
                { form.field(PlaygroundForm.Country) }
            </div>

            <div id="field-gender">
                { form.field(PlaygroundForm.Gender) }
            </div>

            <div id="field-hobbies">
                { form.field(PlaygroundForm.Hobbies) }
            </div>

            <input
                data-testid="submit"
                type="button"
                value="Submit Form"
                onClick={() => {
                    form.showErrorMessages()

                    if (!form.valid)
                        return

                    callback({
                        firstName: form.value(PlaygroundForm.FirstName),
                        lastName: form.value(PlaygroundForm.LastName),
                        country: countryOptions[form.value(PlaygroundForm.Country) as number],
                        gender: genderOptions[form.value(PlaygroundForm.Gender) as number],
                        hobbies: mapIndexToValue(hobbyOptions, parseCheckboxFormValue(form.value(PlaygroundForm.Hobbies) as string)).join(","),
                    })
                }}
            />
        </div>
    );
}

const FormComponent: any = withForm<PlaygroundForm, PlaygroundFormProps>(
    "playground_form",
    fieldCollection,
    formFields,
    FormComponentBase,
    { errorMessagesVisible: false }
)

function App() {
  const [ formValues, setFormValues ] = React.useState<any>({})

  const formHasBeenSubmitted = Object.keys(formValues).length > 0

  return (
    <div className="app">
        <div className="form">
            <FormComponent callback={setFormValues} />
        </div>
        <div className="result">
            <h3>Form Results:</h3>
            { formHasBeenSubmitted && (
                <div>
                    <div>First Name: { formValues.firstName }</div>
                    <div>Last Name: { formValues.lastName }</div>
                    <div>Country: { formValues.country }</div>
                    <div>Gender: { formValues.gender }</div>
                    <div>Hobbies: { formValues.hobbies }</div>
                </div>
            ) }

            { !formHasBeenSubmitted && (
                <span>
                    Once you submit the form, the results shall appear here.
                </span>
            ) }
        </div>
    </div>
  );
}

export default App;
