import { Role } from "@api/role/role.model";
import { UserRole } from "@utils/enums";

export class User {
    public id: number;
    public email: string;
    public firstName: string;
    public lastName: string;
    public role: Role;
    public isSuperAdmin: boolean;

    constructor(data: any = null) {
        data = data ? JSON.parse(JSON.stringify(data)) : {};

        this.id = data.id != null ? Number(data.id) : null;
        this.email = data.email != null ? String(data.email) : null;
        this.firstName = data.firstName != null ? String(data.firstName) : null;
        this.lastName = data.lastName != null ? String(data.lastName) : null;
        this.role = new Role(data.role);
        this.isSuperAdmin = data.isSuperAdmin != null ? Boolean(data.isSuperAdmin) : null;
    }

    public hasRoles(roles: UserRole[]): boolean {
        return roles.includes(this.role.id);
    }
}