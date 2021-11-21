export function format(str: string, ...val: Object[]): string {
    for (let index = 0; index < val.length; index++) {
        str = str.replace(`{${index}}`, val[index].toString);
    }
    return str;
}