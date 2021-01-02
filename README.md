# Yet Another Form Library for React

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dhuan/yafo/Test?logo=github&style=for-the-badge)](https://github.com/dhuan/yafo/actions?query=workflow%3AGo)

## Getting Started

Yafo is available through your favorite Node package manager:

```sh
npm install yafo
```

Yafo provides an interface for creating forms in a declarative way. Define your
form fields once in a simple structure describing what each field is, then at
the UI code, you place one-line rendered components, without having to hassle
with callbacks and props and all kinds of custom logic for each field.

[Check this example in CodeSandbox.](https://codesandbox.io/s/yafo-example-yomb9)

```sh
import { withForm, fieldCollection, FieldType, Field, Props, regexValidator } from "yafo";

enum MyForm { FirstName, LastName }

const formFields = (): Field<MyForm>[] => [
    {
        id        : MyForm.FirstName,
        label     : "First name",
        type      : FieldType.Text,
        valid     : regexValidator(/[a-zA-Z{3,10}]/, "Invalid first name!"),
    },
    {
        id        : MyForm.LastName,
        label     : "Last name",
        type      : FieldType.Text,
        valid     : regexValidator(/[a-zA-Z{3,10}]/, "Invalid last name!"),
    },
    // Other fields...
]

const MyFormPage = ({ form }: { form: Props<MyForm> }) => (
    <div>
        <div>
            { form.field(MyForm.FirstName) }
            <br />
            { form.field(MyForm.LastName) }
            <br />
            <input type="submit" onClick={doSomething()} />
        </div>
        <br />
        <br />
        <div>
            Your full name is { form.value(MyForm.FirstName) } { form.value(MyForm.LastName) }
        </div>
    </div>
)

export default withForm(
    "my_form",
    fieldCollection,
    formFields,
    MyFormPage
)
```

## Playground

The little project inside the `playground` folder provides a exemplary
`create-react-app` based app showing Yafo in action. It's useful if you want to
quickly try out Yafo and play around with its features without having to
install it anywhere. The following commands need to be run in order to set up
the playground:

```sh
npm run playground:build
npm run playground:start
```

With that, you should be able to try out Yafo by accessing localhost:3000.

## FAQ

### How is Yafo different than the countless other form libraries out there?

There are a number of good form abstractions for React out there, with many
more features than I hope to add to Yafo. I wanted to build form pages where I
wouldn't have to write `<TextField /* a bunch of props and callbacks */ />` and
then `<ErrorMessage /*more props*/ />` at each field. I just wanted to write a
placeholder where a field would be located, and move on. If there is one such
library that gives me this, I admit I didn't search deeply enough.

### In what circumstance would Yafo not be appropriate?

Yafo plays well if your form page consists of form fields that consistently
follow the same UI style. For example, if two text fields don't look the same
in your app, you're better off using something else probably.

### The built-in Field Collections are very simplistic and don't meet my requirements, what can I do?

Read about Field Collections. You can either build your own Field Collection
satisfying your design's requirements or install an existing one.

### I've built my form with Yafo, but in the end I didn't end up with fewer lines of code than if I used another form library. Why is that?

More lines of code isn't necessarily bad. Yafo separates declarative form
definitions from UI/React logic. In the end you may have a large structure
describing your form fields, but the actual UI/React logic is very simplistic,
allowing you to just write a placeholder where a form field should be located.
That data structure that makes your code large is more manageable than a bunch
of component/props/callback logic.
