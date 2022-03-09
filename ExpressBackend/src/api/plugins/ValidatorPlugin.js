// Validator class
class Validator {
    constructor(value, field) {
        this.value = value;
        this.field = field;
        this.errors = [];
    }

    isRequired() {
        if (this.value.trim() === '') {
            this.errors.push(`${this.field} is required`);
        }

        return this;
    }

    isEmail() {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(this.value)) {
            this.errors.push(`${this.field} is not a valid email`);
        }

        return this;
    }

    maxLenght(max) {
        if (this.value.length > max) {
            this.errors.push(`${this.field} must be less than ${max} characters`);
        }

        return this;
    }

    minLenght(min) {
        if (this.value.length < min) {
            this.errors.push(`${this.field} must be more than ${min} characters`);
        }

        return this;
    }

    isNumeric() {
        if (isNaN(this.value)) {
            this.errors.push(`${this.field} must be a number`);
        }

        return this;
    }

    maxValue(max) {
        if (this.value > max) {
            this.errors.push(`${this.field} must be less than ${max}`);
        }

        return this;
    }

    minValue(min) {
        if (this.value < min) {
            this.errors.push(`${this.field} must be more than ${min}`);
        }

        return this;
    }
}

module.exports = Validator;