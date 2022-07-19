export class FullName {
    id: string;
    firstName: string;
    otherName: string;
    lastName: string;
    fullName: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.firstName = obj.firstName;
        this.otherName = obj.otherName;
        this.lastName = obj.lastName;
        this.fullName = obj.fullName;
    }
}
