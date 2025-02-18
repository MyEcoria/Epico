export function isEpitechEmailRegex(email: string) {
    return /^[a-zA-Z0-9._%+-]+@epitech\.eu$/i.test(email);
}

export function isValidPassword(password: string) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    return regex.test(password);
}

export function isUUID(value: any) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(value);
}

export function isPositiveInteger(value: any) {
    return Number.isInteger(value) && value > 0;
}