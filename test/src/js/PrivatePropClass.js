export default class {
    #privateField = 5;

    constructor() {
        this.#privateMethod();
    }

    async #privateMethod() {
        await new Promise();
        return this.#privateField;
    }
}
