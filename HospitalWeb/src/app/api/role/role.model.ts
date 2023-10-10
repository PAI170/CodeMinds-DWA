export class Role {
   public id: number;
   public name: string;

   constructor(data: any = null) {
      data = data ? JSON.parse(JSON.stringify(data)) : {};

      this.id = data.id != null ? Number(data.id) : null;
      this.name = data.name != null ? String(data.name) : null;
   }
}