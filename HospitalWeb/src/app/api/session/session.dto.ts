export class LoginSessionDTO {
   public email: string;
   public password: string;

   constructor(email: string, password: string) {
      this.email = email;
      this.password = password;
   }
}

export class FilterSessionDTO {
   public addressIssued: string;
   public addressRefreshed: string;
   public dateFrom: Date;
   public dateTo: Date;

   constructor(data: any = null) {
      data = data ? JSON.parse(JSON.stringify(data)) : {};

      this.addressIssued = data.addressIssued != null ? String(data.addressIssued) : null;
      this.addressRefreshed = data.addressRefreshed != null ? String(data.addressRefreshed) : null;
      this.dateFrom = data.dateFrom != null ? new Date(data.dateFrom) : null;
      this.dateTo = data.dateTo != null ? new Date(data.dateTo) : null;
   }
}