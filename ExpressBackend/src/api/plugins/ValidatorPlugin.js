// Validator class
class Validator {
    constructor(value, field, fieldName) {
        this.value = value;
        this.field = field;
        this.fieldName = fieldName;
        this.errors = [];
    }

    isRequired() {
        console.log(this.value);
        if (this.value === undefined || this.value === null || this.value.trim() === '') {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} est requis`
            });
        }

        return this;
    }

    isEmail() {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être un email valide`
            });
        }

        return this;
    }

    maxLenght(max) {
        if (this.value.length > max) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être inférieur à ${max}`
            });
        }

        return this;
    }

    minLenght(min) {
        if (this.value.length < min) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être supérieur à ${min}`
            });
        }

        return this;
    }

    isNumeric() {
        if (isNaN(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être numérique`
            });
        }

        return this;
    }

    maxValue(max) {
        if (this.value > max) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être inférieur à ${max}`
            });
        }

        return this;
    }

    minValue(min) {
        if (this.value < min) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être supérieur à ${min}`
            });
        }

        return this;
    }

    isAlpha() {
        const alphaRegex = /^[a-zA-Z]+$/;
        if (!alphaRegex.test(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être alphabétique`
            });
        }

        return this;
    }

    isAlphaNumeric() {
        const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphaNumericRegex.test(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être alphanumérique`
            });
        }

        return this;
    }

    isAlphaNumericSpace() {
        const alphaNumericSpaceRegex = /^[a-zA-Z0-9 ]+$/;
        if (!alphaNumericSpaceRegex.test(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être alphanumérique et contenir des espaces`
            });
        }

        return this;
    }

    isAlphaNumericSpaceUTF8() {
        const alphaNumericSpaceUTF8Regex = /^[a-zA-Z0-9\u00C0-\u00FF ]+$/;
        if (!alphaNumericSpaceUTF8Regex.test(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être alphanumérique, contenir des espaces et contenir des caractères accentués`
            });
        }

        return this;
    }

    isAlphaSpace() {
        const alphaSpaceRegex = /^[a-zA-Z ]+$/;
        if (!alphaSpaceRegex.test(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être alphabétique et contenir des espaces`
            });
        }

        return this;
    }

    isAlphaNumericSlashes() {
        const alphaNumericSpaceRegex = /^[a-zA-Z0-9\/]+$/;
        if (!alphaNumericSpaceRegex.test(this.value)) {
            this.errors.push({
                field: this.field,
                message: `${this.fieldName} doit être alphanumérique et contenir des slash`
            });
        }

        return this;
    }
}

module.exports = Validator;