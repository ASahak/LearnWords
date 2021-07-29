const ifFormIsValid = (keys: any[], formValues: { [x: string]: any }, errors: any) => {
    return keys.every((e: string) => formValues[e] && formValues[e] !== '' && !errors.hasOwnProperty(e))
}

export {
    ifFormIsValid,
}
