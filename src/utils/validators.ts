import {
    VALIDATORS,
} from './constants';

const validators = {
    GROUP_NAME_VALIDATOR: {
        required: 'Please complete this mandatory field',
        pattern: {
            value: VALIDATORS.GROUP_NAME_PATTERN,
            message: 'Please write group name for example: Family',
        }
    },
    FULL_NAME_VALIDATOR: {
        required: 'Please complete this mandatory field',
        pattern: {
            value: VALIDATORS.UPPERCASE_LOWERCASE_PATTERN,
            message: 'Please write your name in format: John Doe',
        }
    },
    EMAIL_VALIDATOR : {
        required: 'Please complete this mandatory field',
        pattern: {
            value: VALIDATORS.EMAIL_PATTERN,
            message: 'Please write in this format: john.doe@example.com',
        }
    },
    PASSWORD_VALIDATOR : {
        required: 'Please complete this mandatory field',
        minLength: {
            value: 8,
            message: 'Use at least 8 characters',
        },
        maxLength: {
            value: 20,
            message: 'Use max 20 characters',
        },
        validate: {},
    }
}
export default {
    ...validators,
};
