import { Role } from "@api/role/role.model";
import { User } from "./user.model";

export class InsertUpdateUserDTO {
    public readonly id: number;
    public readonly email: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly roleId: number;
    public readonly newPassword: string;

    constructor(data: User, password: string) {
        this.id = data.id;
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.roleId = data.role.id;
        this.newPassword = password;
    }
}

export class UpdateSelfUserDTO {
    public readonly email: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly newPassword: string;

    constructor(data: User, password: string) {
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.newPassword = password;
    }
}

export class FilterUserDTO {
    public email: string;
    public firstName: string;
    public lastName: string;
    public role: Role;

    constructor(data: any = null) {
        data = data ? JSON.parse(JSON.stringify(data)) : {};

        this.email = data.email != null ? String(data.email) : null;
        this.firstName = data.firstName != null ? String(data.firstName) : null;
        this.lastName = data.lastName != null ? String(data.lastName) : null;
        this.role = new Role(data.role);
    }
}