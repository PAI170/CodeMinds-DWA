USE HospitalDB;
GO

IF NOT EXISTS (SELECT * FROM [User] WHERE IsSuperAdmin = 1)
BEGIN
	DECLARE @AdministradorId INT;
	SELECT TOP 1 @AdministradorId = Id FROM [Role] WHERE Name = 'Administrador';
	INSERT INTO [User] (Email, Password, PasswordSalt, FirstName, LastName, RoleId, IsSuperAdmin) 
		VALUES ('[EMAIL]',
			0x[HEX_BYTES_PASSWORD],
			0x[HEX_BYTES_PASSWORD_SALT],
			'[SUPER]', 
			'[ADMIN]', 
			@AdministradorId,
			1);
END