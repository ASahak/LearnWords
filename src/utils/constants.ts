const VALIDATORS = {
    WEBSITE_PATTERN                 : /^(http(s)?(:\/\/))?(www\.)?[a-zA-Z0-9-_\.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_\+.~#?&//=]*)/,
    EMAIL_PATTERN                   : /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i,
    UPPERCASE_LOWERCASE_PATTERN     : /([a-z].*[A-Z])|([A-Z].*[a-z])/,
    GROUP_NAME_PATTERN              : /^[0-9a-zA-Z]*$/g,
    PHONE_INSTRUCTION_OTHER         : /^[\\-_a-z0-9\\s]+$/,
    PHONE_NUMBER_PATTERN            : /^[0-9]\\d*$/,
    DIGIT_PATTERN                   : /\d+/i,
    SYMBOL_PATTERN                  : /^(?=.*[!@#\\$%\\^&\\*\\-\\_\\?])/i,
    PASSWORD_VALIDATOR_PATTERN      : /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*\\-\\_\\?])(?=.{8,20})/,
}

export {
    VALIDATORS,
}
