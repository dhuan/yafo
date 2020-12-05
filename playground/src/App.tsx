import React from 'react';
import './App.css';
import { withForm, fieldCollection, FormFieldType, FormValue, FormField, FormProps } from './yafo/yafo.js';

enum PlaygroundForm { FirstName, LastName, Country }

const countryOptions = ["Choose a country", "Brazil", "Germany"]

const formFields = (): FormField<PlaygroundForm>[] => [
    {
        id        : PlaygroundForm.FirstName,
        label     : "First name",
        type      : FormFieldType.TEXT,
        valid     : (text: FormValue) => [ /[a-zA-Z{3,10}]/.test(text as string), "Invalid first name!" ],
        initial   : "",
        disabled  : false,
    },
    {
        id        : PlaygroundForm.LastName,
        label     : "Last name",
        type      : FormFieldType.TEXT,
        valid     : (text: FormValue) => [ /[a-zA-Z{3,10}]/.test(text as string), "Invalid last name!" ],
        initial   : "",
        disabled  : false,
    },
    {
        id        : PlaygroundForm.Country,
        label     : "Country",
        type      : FormFieldType.SELECT,
        valid     : (chosenCountry: FormValue) => [ chosenCountry > 0, "Choose a country!" ],
        initial   : 0,
        disabled  : false,
        options   : { selectOptions: countryOptions }
    },
]

const FormComponentBase = ({ form, callback }: { form: FormProps<PlaygroundForm>, callback: Function }) => {
    return (
        <div>
            <h1>Playground Form</h1>

            <div id="field-first-name">
                { form.fieldComponents.get(PlaygroundForm.FirstName) }
            </div>

            <div id="field-last-name">
                { form.fieldComponents.get(PlaygroundForm.LastName) }
            </div>

            <div id="field-country">
                { form.fieldComponents.get(PlaygroundForm.Country) }
            </div>

            <input
                data-testid="submit"
                type="button"
                value="Submit Form"
                onClick={() => {
                    form.showFormErrorMessages(true)

                    if (!form.formIsValid)
                        return

                    callback({
                        firstName: form.formValue(PlaygroundForm.FirstName),
                        lastName: form.formValue(PlaygroundForm.LastName),
                        country: countryOptions[form.formValue(PlaygroundForm.Country) as number],
                    })
                }}
            />
        </div>
    );
}

const FormComponent: any = withForm(
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
